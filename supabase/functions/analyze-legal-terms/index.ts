/*
  # Legal Terms Analysis Edge Function

  This function analyzes legal documents using the Pica API with OpenAI integration.
  It supports different tones, URL scraping, and returns structured analysis data.

  ## Features:
  - Multiple tone options (serious, sarcastic, meme, ominous, child, academic, authoritative, wizard)
  - URL content fetching and text extraction
  - Input validation and sanitization
  - Structured response with summary and red flags
  - Error handling and logging
  - CORS support

  ## Environment Variables Required:
  - PICA_SECRET_KEY
  - PICA_OPENAI_CONNECTION_KEY
*/

interface AnalysisRequest {
  legal_terms?: string;
  input_url?: string;
  tone?: string;
  max_tokens?: number;
  temperature?: number;
}

interface AnalysisResponse {
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

const VALID_TONES = [
  'serious', 'sarcastic', 'meme', 'ominous', 
  'child', 'academic', 'authoritative', 'wizard'
];

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
      temperature
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
      // Set a reasonable timeout
      signal: AbortSignal.timeout(30000), // 30 seconds
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);

    let text = await response.text();
    console.log('Fetched content length:', text.length);

    // Basic HTML text extraction
    if (contentType.includes('text/html')) {
      // Remove script and style elements
      text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      
      // Remove HTML tags
      text = text.replace(/<[^>]+>/g, ' ');
      
      // Decode common HTML entities
      text = text.replace(/&nbsp;/g, ' ');
      text = text.replace(/&/g, '&');
      text = text.replace(/</g, '<');
      text = text.replace(/>/g, '>');
      text = text.replace(/"/g, '"');
      text = text.replace(/&#39;/g, "'");
      
      // Clean up whitespace
      text = text.replace(/\s+/g, ' ').trim();
    }

    // Truncate if too long (keep within AI model limits)
    const maxLength = 2800; // Reduced from 7500 to 2800
    if (text.length > maxLength) {
      console.log(`Content too long (${text.length} chars), truncating to ${maxLength}`);
      text = text.substring(0, maxLength) + '\n\n[Content truncated due to length...]';
    }

    if (text.length < 10) {
      throw new Error('Extracted text is too short (less than 10 characters)');
    }

    console.log('Final extracted text length:', text.length);
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

function buildAnalysisPrompt(legalTerms: string, tone: string): string {
  const toneInstruction = TONE_PROMPTS[tone as keyof typeof TONE_PROMPTS];
  return `You are a legal expert specializing in analyzing general contracts, lease agreements (such as apartment or vehicle leases), and employment contracts. ${toneInstruction}

Analyze the following legal terms and provide:

1. A comprehensive summary paragraph that covers all key points, including the main clauses, rights, and obligations relevant to this type of contract.
2. A list of potential red flags or concerning clauses specific to this contract type (e.g., payment terms, penalties, early termination, confidentiality, dispute resolution, etc). A minimum of one red flag should be flagged. 
3. An overall assessment of the contract’s fairness, clarity, and any areas that may require further negotiation or legal review.

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

Remember to maintain the ${tone} tone throughout your analysis.`;}

function parseAnalysisResponse(text: string): { summary: Array<{ title: string; description: string }>; red_flags: string[] } {
  const summary: Array<{ title: string; description: string }> = [];
  const red_flags: string[] = [];

  console.log('Parsing analysis response, text length:', text.length);
  console.log('First 500 chars:', text.substring(0, 500));

  try {
    // Look for SUMMARY: section and extract the paragraph
    const summaryMatch = text.match(/SUMMARY:\s*(.*?)(?=RED FLAGS?:|ASSESSMENT:|$)/is);
    if (summaryMatch) {
      const summaryText = summaryMatch[1].trim();
      console.log('Found summary section:', summaryText.substring(0, 200));
      
      // Clean up the summary text - remove any bullet points or formatting
      let cleanSummary = summaryText
        .replace(/^[-•*]\s*/gm, '') // Remove bullet points at start of lines
        .replace(/^\d+\.\s*/gm, '') // Remove numbered lists
        .replace(/\n\s*\n/g, ' ') // Replace double newlines with space
        .replace(/\n/g, ' ') // Replace single newlines with space
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      if (cleanSummary.length > 0) {
        summary.push({
          title: "Overall Summary",
          description: cleanSummary
        });
      }
    }

    // Look for RED FLAGS section
    const redFlagsMatch = text.match(/RED FLAGS?:\s*(.*?)(?=ASSESSMENT:|$)/is);
    if (redFlagsMatch) {
      const redFlagsText = redFlagsMatch[1].trim();
      console.log('Found red flags section:', redFlagsText.substring(0, 200));
      
      const lines = redFlagsText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      for (const line of lines) {
        // Look for various bullet point formats
        const bulletMatch = line.match(/^[-•*]\s*(.+)$/) || line.match(/^\d+\.\s*(.+)$/);
        if (bulletMatch) {
          const content = bulletMatch[1].trim();
          if (content.length > 0) {
            red_flags.push(content);
          }
        }
      }
    }

    console.log('Parsing results:', {
      summaryItems: summary.length,
      redFlagItems: red_flags.length,
      summaryDescription: summary[0]?.description?.substring(0, 100) + '...',
      redFlags: red_flags
    });

  } catch (error) {
    console.error('Error parsing analysis response:', error);
  }

  // Fallback if parsing fails or returns empty results
  if (summary.length === 0) {
    // Try to extract any meaningful content from the text
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
    // Look for concerning words in the text
    const concerningPhrases = [
      'unlimited liability', 'no warranty', 'at our discretion', 
      'without notice', 'may terminate', 'binding arbitration',
      'waive', 'indemnify', 'perpetual license'
    ];
    
    const foundConcerns = concerningPhrases.filter(phrase => 
      text.toLowerCase().includes(phrase.toLowerCase())
    );
    
    if (foundConcerns.length > 0) {
      red_flags.push(`Document contains concerning terms: ${foundConcerns.join(', ')}`);
    } else {
      red_flags.push("No specific red flags identified in the analysis");
    }
  }

  return { summary, red_flags };
}

async function callPicaAPI(prompt: string, maxTokens: number, temperature: number): Promise<string> {
  const PICA_SECRET_KEY = Deno.env.get('PICA_SECRET_KEY');
  const PICA_OPENAI_CONNECTION_KEY = Deno.env.get('PICA_OPENAI_CONNECTION_KEY');

  console.log('Environment check:', {
    hasSecretKey: !!PICA_SECRET_KEY,
    hasConnectionKey: !!PICA_OPENAI_CONNECTION_KEY,
    secretKeyLength: PICA_SECRET_KEY?.length || 0,
    connectionKeyLength: PICA_OPENAI_CONNECTION_KEY?.length || 0
  });

  if (!PICA_SECRET_KEY || !PICA_OPENAI_CONNECTION_KEY) {
    throw new Error('Missing required environment variables: PICA_SECRET_KEY or PICA_OPENAI_CONNECTION_KEY');
  }

  const requestBody = {
    model: 'gpt-3.5-turbo-instruct',
    prompt: prompt,
    max_tokens: maxTokens,
    temperature: temperature,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  };

  console.log('Making request to Pica API:', {
    url: 'https://api.picaos.com/v1/passthrough/completions',
    bodySize: JSON.stringify(requestBody).length,
    maxTokens,
    temperature
  });

  try {
    const response = await fetch('https://api.picaos.com/v1/passthrough/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pica-secret': PICA_SECRET_KEY,
        'x-pica-connection-key': PICA_OPENAI_CONNECTION_KEY,
        'x-pica-action-id': 'conn_mod_def::GDzgIxPFYP0::2bW4lQ29TAuimPnr1tYXww'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Pica API response status:', response.status);
    console.log('Pica API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pica API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Pica API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Pica API success response:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length || 0,
      hasText: !!(data.choices?.[0]?.text)
    });
    
    if (!data.choices || !data.choices[0] || !data.choices[0].text) {
      console.error('Invalid Pica API response format:', data);
      throw new Error('Invalid response format from Pica API');
    }

    return data.choices[0].text.trim();
  } catch (error) {
    console.error('Error in callPicaAPI:', error);
    throw error;
  }
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
    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method);
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
      console.log('Request body received:', {
        hasLegalTerms: !!body.legal_terms,
        hasInputUrl: !!body.input_url,
        legalTermsLength: body.legal_terms?.length || 0,
        inputUrl: body.input_url,
        tone: body.tone,
        maxTokens: body.max_tokens,
        temperature: body.temperature
      });
    } catch (error) {
      console.error('JSON parsing error:', error);
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
      console.log('Validation failed:', validation.error);
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { legal_terms, input_url, tone, max_tokens, temperature } = validation.data!;

    // Get the legal terms text
    let legalTermsText: string;
    if (input_url) {
      try {
        legalTermsText = await fetchUrlContent(input_url);
        console.log('Successfully fetched content from URL, length:', legalTermsText.length);
      } catch (error) {
        console.error('Error fetching URL content:', error);
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

    // Build the analysis prompt
    const prompt = buildAnalysisPrompt(legalTermsText, tone!);
    console.log('Built prompt, length:', prompt.length);

    // Call the Pica API
    let analysisText: string;
    try {
      analysisText = await callPicaAPI(prompt, max_tokens!, temperature!);
      console.log('Pica API call successful, response length:', analysisText.length);
      console.log('analysisText:', analysisText);
    } catch (error) {
      console.error('Error calling Pica API:', error);
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
    console.log('Parsed response:', {
      summaryCount: summary.length,
      redFlagsCount: red_flags.length
    });

    const processingTime = Date.now() - startTime;

    const response: AnalysisResponse = {
      success: true,
      data: {
        summary,
        red_flags,
        analysis_text: analysisText,
        tone_used: tone!,
        processing_time_ms: processingTime
      }
    };

    console.log('Sending successful response, processing time:', processingTime, 'ms');

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Unexpected error in analyze-legal-terms function:', error);
    
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