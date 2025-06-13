/*
  # RAG-Enhanced Legal Terms Analysis Edge Function

  This function uses Retrieval-Augmented Generation (RAG) to provide more accurate
  and context-aware legal document analysis by leveraging contract examples.

  ## Features:
  - RAG system using contract_chunks for context
  - OpenRouter integration for improved AI responses
  - Document type-specific analysis
  - Multiple tone options with enhanced prompting
  - Structured response parsing

  ## Environment Variables Required:
  - OPENROUTER_API_KEY
*/

interface AnalysisRequest {
  legal_terms?: string;
  input_url?: string;
  tone?: string;
  max_tokens?: number;
  temperature?: number;
  document_type?: string;
}

interface AnalysisResponse {
  success: boolean;
  data?: {
    summary: Array<{ title: string; description: string }>;
    red_flags: string[];
    analysis_text: string;
    tone_used: string;
    processing_time_ms: number;
    chunks_used: number;
  };
  error?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

const VALID_TONES = [
  'serious', 'sarcastic', 'meme', 'ominous', 
  'child', 'academic', 'authoritative', 'wizard'
];

const VALID_DOC_TYPES = ['general', 'lease', 'employment'];

const TONE_PROMPTS = {
  serious: "Speak in a calm, precise, and emotionally neutral tone. Deliver facts and observations with clarity and composure.",
  sarcastic: "Adopt a dry, witty tone that questions the logic of things. Layer your words with irony and a hint of disdain, but stay clever—not cruel.",
  meme: "Turn up the absurdity and exaggeration. Use over-the-top expressions, internet lingo, and break the fourth wall for comedic effect.",
  ominous: "Use a deep, chilling tone that builds suspense. Speak slowly, with gravity, as if something powerful or terrible is about to unfold.",
  child: "Use simple, cheerful language full of wonder and excitement. Be clear, repetitive, and encouraging—like you're teaching a new concept to a young learner.",
  academic: "Be formal, methodical, and intellectually rigorous. Structure ideas clearly, define key terms, and maintain an analytical perspective throughout.",
  authoritative: "Project strength and confidence. Use assertive language, direct commands, and minimal fluff—you're here to lead, not ask.",
  wizard: "Use grand, poetic language that suggests ancient knowledge and mystery. Speak with awe, depth, and rhythm, as if unveiling truths from another realm."
};

function validateInput(body: any): { isValid: boolean; error?: string; data?: AnalysisRequest } {
  // Check that exactly one input method is provided
  const hasText = body.legal_terms && typeof body.legal_terms === 'string' && body.legal_terms.trim().length > 0;
  const hasUrl = body.input_url && typeof body.input_url === 'string' && body.input_url.trim().length > 0;
  
  if (!hasText && !hasUrl) {
    return { isValid: false, error: 'Either legal_terms or input_url is required' };
  }
  
  if (hasText && hasUrl) {
    return { isValid: false, error: 'Provide either legal_terms or input_url, not both' };
  }

  // Validate text if provided
  if (hasText) {
    if (body.legal_terms.length < 10) {
      return { isValid: false, error: 'legal_terms must be at least 10 characters long' };
    }

    if (body.legal_terms.length > 2800) {
      return { isValid: false, error: 'legal_terms must be less than 2,800 characters' };
    }
  }

  // Validate URL if provided
  if (hasUrl) {
    try {
      new URL(body.input_url);
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }

  const tone = body.tone || 'serious';
  if (!VALID_TONES.includes(tone)) {
    return { isValid: false, error: `Invalid tone. Must be one of: ${VALID_TONES.join(', ')}` };
  }

  const document_type = body.document_type || 'general';
  if (!VALID_DOC_TYPES.includes(document_type)) {
    return { isValid: false, error: `Invalid document_type. Must be one of: ${VALID_DOC_TYPES.join(', ')}` };
  }

  const max_tokens = body.max_tokens || 2000;
  if (typeof max_tokens !== 'number' || max_tokens < 100 || max_tokens > 4000) {
    return { isValid: false, error: 'max_tokens must be a number between 100 and 4000' };
  }

  const temperature = body.temperature || 0.7;
  if (typeof temperature !== 'number' || temperature < 0 || temperature > 2) {
    return { isValid: false, error: 'temperature must be a number between 0 and 2' };
  }

  return {
    isValid: true,
    data: {
      legal_terms: hasText ? body.legal_terms.trim() : undefined,
      input_url: hasUrl ? body.input_url.trim() : undefined,
      tone,
      max_tokens,
      temperature,
      document_type
    }
  };
}

async function fetchUrlContent(url: string): Promise<string> {
  console.log('Fetching content from URL:', url);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VOLT-Legal-Analyzer/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: AbortSignal.timeout(30000), // 30 seconds
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    let text = await response.text();

    // Basic HTML text extraction
    if (contentType.includes('text/html')) {
      text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      text = text.replace(/<[^>]+>/g, ' ');
      text = text.replace(/&nbsp;/g, ' ');
      text = text.replace(/&/g, '&');
      text = text.replace(/</g, '<');
      text = text.replace(/>/g, '>');
      text = text.replace(/"/g, '"');
      text = text.replace(/&#39;/g, "'");
      text = text.replace(/\s+/g, ' ').trim();
    }

    const maxLength = 2800;
    if (text.length > maxLength) {
      console.log(`Content too long (${text.length} chars), truncating to ${maxLength}`);
      text = text.substring(0, maxLength) + '\n\n[Content truncated due to length...]';
    }

    if (text.length < 10) {
      throw new Error('Extracted text is too short (less than 10 characters)');
    }

    return text;

  } catch (error) {
    console.error('Error fetching URL content:', error);
    
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        throw new Error('Request timeout: The URL took too long to respond');
      }
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
    
    throw new Error('Failed to fetch URL: Unknown error occurred');
  }
}

async function fetchContractChunks(docType: string, supabaseUrl: string, supabaseKey: string): Promise<string[]> {
  console.log('Fetching contract chunks for doc type:', docType);
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/contract_chunks?doc_type=eq.${docType}&order=chunk_index.asc&limit=5`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch chunks: ${response.status} ${response.statusText}`);
    }

    const chunks = await response.json();
    console.log(`Fetched ${chunks.length} chunks for ${docType}`);
    
    return chunks.map((chunk: any) => chunk.chunk_text);
  } catch (error) {
    console.error('Error fetching contract chunks:', error);
    // Return empty array if chunks can't be fetched - system will still work
    return [];
  }
}

function buildRAGPrompt(legalTerms: string, tone: string, docType: string, chunks: string[]): string {
  const toneInstruction = TONE_PROMPTS[tone as keyof typeof TONE_PROMPTS];
  
  const examplesSection = chunks.length > 0 
    ? `Use the following examples for context and structure:
${chunks.map((chunk, i) => `Example ${i+1}: ${chunk}`).join("\n\n")}

Based on these examples, `
    : '';

  return `You are a legal expert specializing in analyzing ${docType} contracts. ${toneInstruction}

${examplesSection}analyze the following legal terms and provide:

1. A comprehensive summary paragraph that covers all key points, including the main clauses, rights, and obligations relevant to this type of contract.
2. A list of potential red flags or concerning clauses specific to this contract type. A minimum of one red flag should be identified.
3. An overall assessment of the contract's fairness, clarity, and any areas that may require further negotiation or legal review.

Legal terms to analyze:
${legalTerms}

Please structure your response as follows:
SUMMARY:
[Write a single comprehensive paragraph that explains the main clauses, obligations, and important aspects of the contract in plain language. Focus on what the terms mean for the parties involved.]

RED FLAGS:
- [Red flag 1]
- [etc (add more points as needed)]

OVERALL ASSESSMENT:
[Provide an overall assessment of the contract, including its strengths, weaknesses, and whether it is balanced and fair. Suggest if any terms should be negotiated or clarified.]

Remember to maintain the ${tone} tone throughout your analysis.`;
}

async function callOpenRouter(prompt: string, maxTokens: number, temperature: number): Promise<string> {
  const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

  if (!OPENROUTER_API_KEY) {
    throw new Error('Missing required environment variable: OPENROUTER_API_KEY');
  }

  const requestBody = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'user', content: prompt }
    ],
    max_tokens: maxTokens,
    temperature: temperature,
  };

  console.log('Making request to OpenRouter API');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://volt-legal.com',
        'X-Title': 'V.O.L.T Legal Analysis'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`OpenRouter API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid OpenRouter API response format:', data);
      throw new Error('Invalid response format from OpenRouter API');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error in callOpenRouter:', error);
    throw error;
  }
}

function parseAnalysisResponse(text: string): { summary: Array<{ title: string; description: string }>; red_flags: string[] } {
  const summary: Array<{ title: string; description: string }> = [];
  const red_flags: string[] = [];

  console.log('Parsing analysis response, text length:', text.length);

  try {
    // Look for SUMMARY: section and extract the paragraph
    const summaryMatch = text.match(/SUMMARY:\s*(.*?)(?=RED FLAGS?:|OVERALL ASSESSMENT:|$)/is);
    if (summaryMatch) {
      const summaryText = summaryMatch[1].trim();
      
      let cleanSummary = summaryText
        .replace(/^[-•*]\s*/gm, '')
        .replace(/^\d+\.\s*/gm, '')
        .replace(/\n\s*\n/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanSummary.length > 0) {
        summary.push({
          title: "Overall Summary",
          description: cleanSummary
        });
      }
    }

    // Look for RED FLAGS section
    const redFlagsMatch = text.match(/RED FLAGS?:\s*(.*?)(?=OVERALL ASSESSMENT:|$)/is);
    if (redFlagsMatch) {
      const redFlagsText = redFlagsMatch[1].trim();
      
      const lines = redFlagsText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      for (const line of lines) {
        const bulletMatch = line.match(/^[-•*]\s*(.+)$/) || line.match(/^\d+\.\s*(.+)$/);
        if (bulletMatch) {
          const content = bulletMatch[1].trim();
          if (content.length > 0) {
            red_flags.push(content);
          }
        }
      }
    }

  } catch (error) {
    console.error('Error parsing analysis response:', error);
  }

  // Fallback if parsing fails
  if (summary.length === 0) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    if (sentences.length > 0) {
      const fallbackSummary = sentences.slice(0, 3).join('. ').trim() + '.';
      summary.push({
        title: "Overall Summary",
        description: fallbackSummary
      });
    } else {
      summary.push({
        title: "Overall Summary",
        description: "The legal terms have been analyzed. The document contains various clauses and provisions that users should be aware of before agreeing to the terms."
      });
    }
  }

  if (red_flags.length === 0) {
    red_flags.push("No specific red flags identified in the analysis");
  }

  return { summary, red_flags };
}

Deno.serve(async (req: Request): Promise<Response> => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const startTime = Date.now();

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const validation = validateInput(body);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { legal_terms, input_url, tone, max_tokens, temperature, document_type } = validation.data!;

    // Get the legal terms text
    let legalTermsText: string;
    if (input_url) {
      try {
        legalTermsText = await fetchUrlContent(input_url);
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to fetch content from URL: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      legalTermsText = legal_terms!;
    }

    // Fetch relevant contract chunks for RAG
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const chunks = await fetchContractChunks(document_type!, supabaseUrl, supabaseKey);
    console.log(`Using ${chunks.length} chunks for RAG context`);

    // Build the RAG-enhanced prompt
    const prompt = buildRAGPrompt(legalTermsText, tone!, document_type!, chunks);

    // Call OpenRouter API
    let analysisText: string;
    try {
      analysisText = await callOpenRouter(prompt, max_tokens!, temperature!);
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `API Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}` 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse the response into structured data
    const { summary, red_flags } = parseAnalysisResponse(analysisText);

    const processingTime = Date.now() - startTime;

    const response: AnalysisResponse = {
      success: true,
      data: {
        summary,
        red_flags,
        analysis_text: analysisText,
        tone_used: tone!,
        processing_time_ms: processingTime,
        chunks_used: chunks.length
      }
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Unexpected error in analyze-legal-terms-rag function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Server Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}` 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});