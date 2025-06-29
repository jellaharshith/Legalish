import { useState } from 'react';
import { AnalysisService, AnalysisRequest, AnalysisResponse } from '@/services/analysisService';
import { useToast } from '@/hooks/use-toast';
import { useLegalTerms } from '@/context/LegalTermsContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { addSentryBreadcrumb, captureSentryException } from '@/lib/sentry';

export interface UseAnalysisReturn {
  isAnalyzing: boolean;
  analyze: (request: AnalysisRequest) => Promise<AnalysisResponse | null>;
  lastResult: AnalysisResponse | null;
}

export function useAnalysis(): UseAnalysisReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState<AnalysisResponse | null>(null);
  const { toast } = useToast();
  const { setSummary, setRedFlags, setLegalText } = useLegalTerms();
  const { user } = useAuth();

  const saveAnalysis = async (request: AnalysisRequest, result: AnalysisResponse) => {
    if (!user || !result.success || !result.data) return;

    try {
      const { error } = await supabase.from('analyses').insert({
        user_id: user.id,
        input_text: result.data.analysis_text,
        input_url: request.input_url || null,
        input_file_name: null, // You can extend this to handle files
        summary_data: result.data.summary,
        red_flags_data: result.data.red_flags,
        analysis_time_ms: result.data.processing_time_ms
      });

      if (error) throw error;
      addSentryBreadcrumb('Analysis saved to database', 'analysis');
    } catch (error) {
      console.error('Error saving analysis:', error);
      captureSentryException(error as Error, { context: 'saveAnalysis' });
      // Don't show error to user as this is not critical
    }
  };

  const analyze = async (request: AnalysisRequest): Promise<AnalysisResponse | null> => {
    // Validate request
    const validation = AnalysisService.validateRequest(request);
    if (!validation.isValid) {
      addSentryBreadcrumb('Analysis validation failed', 'analysis', 'error');
      toast({
        title: 'Invalid Input',
        description: validation.error,
        variant: 'destructive',
      });
      return null;
    }

    setIsAnalyzing(true);
    addSentryBreadcrumb('Analysis started', 'analysis');
    
    try {
      const result = await AnalysisService.analyzeLegalTerms(request);
      setLastResult(result);

      if (result.success && result.data) {
        // Update the context with real data
        setSummary(result.data.summary);
        setRedFlags(result.data.red_flags);
        setLegalText(result.data.analysis_text);

        // Save to database if user is logged in
        await saveAnalysis(request, result);

        addSentryBreadcrumb('Analysis completed successfully', 'analysis');
        toast({
          title: 'Analysis Complete',
          description: `Found ${result.data.red_flags.length} red flags in ${(result.data.processing_time_ms / 1000).toFixed(2)}s`,
        });
      } else {
        addSentryBreadcrumb('Analysis failed', 'analysis', 'error');
        toast({
          title: 'Analysis Failed',
          description: result.error || 'An error occurred during analysis',
          variant: 'destructive',
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      captureSentryException(error as Error, { 
        context: 'analysis',
        request: request 
      });
      
      toast({
        title: 'Analysis Error',
        description: errorMessage,
        variant: 'destructive',
      });

      const errorResult: AnalysisResponse = {
        success: false,
        error: errorMessage
      };
      
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    analyze,
    lastResult
  };
}