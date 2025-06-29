import { supabase } from '../lib/supabase';
import { captureException, addBreadcrumb, startTransaction } from '@/lib/sentry';

export interface AnalysisRequest {
  legal_terms?: string;
  input_url?: string;
  tone?: string;
  max_tokens?: number;
  temperature?: number;
  document_type?: string;
}

export interface AnalysisResponse {
  success: boolean;
  data?: {
    summary: Array<{ title: string; description: string }>;
    red_flags: string[];
    analysis_text: string;
    tone_used: string;
    processing_time_ms: number;
  };
  error?: string;
}

export class AnalysisService {
  private static readonly FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-legal-terms-rag`;
  private static readonly SYNTHESIZE_SPEECH_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/synthesize-speech`;

  static async analyzeLegalTerms(request: AnalysisRequest): Promise<AnalysisResponse> {
    const transaction = startTransaction({
      name: 'Legal Terms Analysis',
      op: 'analysis',
    });

    try {
      addBreadcrumb({
        message: 'Starting legal terms analysis',
        category: 'analysis',
        level: 'info',
        data: {
          hasText: !!request.legal_terms,
          hasUrl: !!request.input_url,
          tone: request.tone,
          documentType: request.document_type,
        },
      });

      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Always include Authorization header - use access token if authenticated, otherwise use anon key
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      } else {
        headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;
      }

      const response = await fetch(this.FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: AnalysisResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      addBreadcrumb({
        message: 'Legal terms analysis completed successfully',
        category: 'analysis',
        level: 'info',
        data: {
          processingTime: result.data?.processing_time_ms,
          redFlagsCount: result.data?.red_flags.length,
          summaryCount: result.data?.summary.length,
        },
      });

      transaction.setStatus('ok');
      return result;
    } catch (error) {
      console.error('Error calling analysis service:', error);
      
      captureException(error, {
        tags: { 
          component: 'analysis-service',
          action: 'analyzeLegalTerms'
        },
        extra: {
          request: {
            hasText: !!request.legal_terms,
            hasUrl: !!request.input_url,
            tone: request.tone,
            documentType: request.document_type,
          },
        },
      });

      transaction.setStatus('internal_error');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    } finally {
      transaction.finish();
    }
  }

  static async synthesizeSpeech(text: string, voiceId: string): Promise<{ success: boolean; audio?: string; error?: string }> {
    const transaction = startTransaction({
      name: 'Speech Synthesis',
      op: 'synthesis',
    });

    try {
      addBreadcrumb({
        message: 'Starting speech synthesis',
        category: 'synthesis',
        level: 'info',
        data: {
          textLength: text.length,
          voiceId,
        },
      });

      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      } else {
        headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;
      }

      const response = await fetch(this.SYNTHESIZE_SPEECH_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text, voice_id: voiceId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Speech synthesis failed');
      }

      addBreadcrumb({
        message: 'Speech synthesis completed successfully',
        category: 'synthesis',
        level: 'info',
      });

      transaction.setStatus('ok');
      return { success: true, audio: result.audio };
    } catch (error) {
      console.error('Error calling speech synthesis service:', error);
      
      captureException(error, {
        tags: { 
          component: 'analysis-service',
          action: 'synthesizeSpeech'
        },
        extra: {
          textLength: text.length,
          voiceId,
        },
      });

      transaction.setStatus('internal_error');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    } finally {
      transaction.finish();
    }
  }

  static validateRequest(request: AnalysisRequest): { isValid: boolean; error?: string } {
    // Check that exactly one input method is provided
    const hasText = request.legal_terms && request.legal_terms.trim().length > 0;
    const hasUrl = request.input_url && request.input_url.trim().length > 0;
    
    if (!hasText && !hasUrl) {
      return { isValid: false, error: 'Either legal_terms or input_url is required' };
    }
    
    if (hasText && hasUrl) {
      return { isValid: false, error: 'Provide either legal_terms or input_url, not both' };
    }

    // Validate text if provided
    if (hasText) {
      if (request.legal_terms!.length < 10) {
        return { isValid: false, error: 'Legal terms must be at least 10 characters long' };
      }

      if (request.legal_terms!.length > 2800) {
        return { isValid: false, error: 'Legal terms must be less than 2,800 characters' };
      }
    }

    // Validate URL if provided
    if (hasUrl) {
      try {
        new URL(request.input_url!);
      } catch {
        return { isValid: false, error: 'Invalid URL format' };
      }
    }

    const validTones = ['serious', 'sarcastic', 'meme', 'ominous', 'child', 'academic', 'authoritative', 'wizard'];
    if (request.tone && !validTones.includes(request.tone)) {
      return { isValid: false, error: `Invalid tone. Must be one of: ${validTones.join(', ')}` };
    }

    const validDocumentTypes = ['general', 'lease', 'employment'];
    if (request.document_type && !validDocumentTypes.includes(request.document_type)) {
      return { isValid: false, error: `Invalid document type. Must be one of: ${validDocumentTypes.join(', ')}` };
    }

    if (request.max_tokens && (typeof request.max_tokens !== 'number' || request.max_tokens < 100 || request.max_tokens > 4000)) {
      return { isValid: false, error: 'max_tokens must be a number between 100 and 4000' };
    }

    if (request.temperature && (typeof request.temperature !== 'number' || request.temperature < 0 || request.temperature > 2)) {
      return { isValid: false, error: 'temperature must be a number between 0 and 2' };
    }

    return { isValid: true };
  }
}