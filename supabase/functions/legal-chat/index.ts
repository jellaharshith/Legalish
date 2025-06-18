/*
  # Legal Chat Edge Function

  This function provides conversational AI capabilities for legal document analysis.
  It uses the existing legal document context to answer user questions about their contracts.

  ## Features:
  - Context-aware responses using document analysis data
  - OpenAI integration for natural conversation
  - Structured input validation
  - CORS support

  ## Environment Variables Required:
  - OPENAI_API_KEY
*/

interface ChatRequest {
  question: string;
  context: {
    legal_text: string;
    summary: Array<{ title: string; description: string }>;
    red_flags: string[];
    document_type: string;
  };
}

interface ChatResponse {
  success: boolean;
  data?: {
    answer: string;
    chunks_used: number;
    processing_time_ms: number;
  };
  error?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

function validateChatRequest(body: any): { isValid: boolean; error?: string; data?: ChatRequest } {
  if (!body.question || typeof body.question !== 'string' || body.question.trim().length === 0) {
    return { isValid: false, error: 'Question is required and must be a non-empty string' };
  }

  if (body.question.length > 500) {
    return { isValid: false, error: 'Question must be less than 500 characters' };
  }

  if (!body.context || typeof body.context !== 'object') {
    return { isValid: false, error: 'Context object is required' };
  }

  const { context } = body;

  if (!context.legal_text || typeof context.legal_text !== 'string') {
    return { isValid: false, error: 'Context must include legal_text as a string' };
  }

  if (!Array.isArray(context.summary)) {
    return { isValid: false, error: 'Context must include summary as an array' };
  }

  if (!Array.isArray(context.red_flags)) {
    return { isValid: false, error: 'Context must include red_flags as an array' };
  }

  const document_type = context.document_type || 'general';
  if (typeof document_type !== 'string') {
    return { isValid: false, error: 'Document type must be a string' };
  }

  return {
    isValid: true,
    data: {
      question: body.question.trim(),
      context: {
        legal_text: context.legal_text,
        summary: context.summary,
        red_flags: context.red_flags,
        document_type
      }
    }
  };
}

function buildChatPrompt(question: string, context: ChatRequest['context']): string {
  const summaryText = context.summary.map(item => `${item.title}: ${item.description}`).join('\n');
  const redFlagsText = context.red_flags.join('\n- ');

  return `You are V.O.L.T Assistant, a helpful AI legal assistant specializing in contract analysis. You have already analyzed a ${context.document_type} document for the user.

DOCUMENT CONTEXT:
Document Type: ${context.document_type}

Summary of Key Points:
${summaryText}

Identified Red Flags:
- ${redFlagsText}

Original Legal Text (for reference):
${context.legal_text.substring(0, 1500)}${context.legal_text.length > 1500 ? '...' : ''}

USER QUESTION: ${question}

Please provide a helpful, accurate response based on the analyzed document. Be conversational but professional. If the question is about something not covered in the document, politely explain that you can only help with questions about the analyzed document. Keep your response concise but informative.

Response:`;
}

async function callOpenAI(prompt: string): Promise<string> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

  if (!OPENAI_API_KEY) {
    throw new Error('Missing required environment variable: OPENAI_API_KEY');
  }

  const requestBody = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'user', content: prompt }
    ],
    max_tokens: 500,
    temperature: 0.7,
  };

  console.log('Making request to OpenAI API for chat');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid OpenAI API response format:', data);
      throw new Error('Invalid response format from OpenAI API');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error in callOpenAI:', error);
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

    const validation = validateChatRequest(body);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { question, context } = validation.data!;

    // Build the chat prompt
    const prompt = buildChatPrompt(question, context);

    // Call OpenAI API
    let answer: string;
    try {
      answer = await callOpenAI(prompt);
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `AI Service Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}` 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const processingTime = Date.now() - startTime;

    const response: ChatResponse = {
      success: true,
      data: {
        answer,
        chunks_used: 0, // Not using RAG chunks in this simple chat function
        processing_time_ms: processingTime
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
    console.error('Unexpected error in legal-chat function:', error);
    
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