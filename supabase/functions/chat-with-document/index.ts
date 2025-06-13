/*
  # Chat with Document Edge Function

  This function enables multi-turn conversations about legal documents using OpenAI GPT-4.
  It maintains conversation context and provides follow-up Q&A capabilities.

  ## Features:
  - Multi-turn conversation support with context retention
  - Integration with OpenAI GPT-4 via Pica API
  - Tone-aware responses (serious, sarcastic, etc.)
  - Document context preservation
  - General legal questions support
  - Error handling and CORS support

  ## Environment Variables Required:
  - PICA_SECRET_KEY
  - PICA_OPENAI_CONNECTION_KEY
*/

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatRequest {
  document_text: string;
  conversation_history: ChatMessage[];
  user_question: string;
  tone?: string;
}

interface ChatResponse {
  success: boolean;
  response?: string;
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

const TONE_INSTRUCTIONS = {
  serious: "Respond in a calm, precise, and emotionally neutral tone. Deliver facts and observations with clarity and composure.",
  sarcastic: "Adopt a dry, witty tone that questions the logic of things. Layer your words with irony and a hint of disdain, but stay clever—not cruel.",
  meme: "Turn up the absurdity and exaggeration. Use over-the-top expressions, internet lingo, and break the fourth wall for comedic effect.",
  ominous: "Use a deep, chilling tone that builds suspense. Speak slowly, with gravity, as if something powerful or terrible is about to unfold.",
  child: "Use simple, cheerful language full of wonder and excitement. Be clear, repetitive, and encouraging—like you're teaching a new concept to a young learner.",
  academic: "Be formal, methodical, and intellectually rigorous. Structure ideas clearly, define key terms, and maintain an analytical perspective throughout.",
  authoritative: "Project strength and confidence. Use assertive language, direct commands, and minimal fluff—you're here to lead, not ask.",
  wizard: "Use grand, poetic language that suggests ancient knowledge and mystery. Speak with awe, depth, and rhythm, as if unveiling truths from another realm."
};

function validateChatRequest(body: any): { isValid: boolean; error?: string; data?: ChatRequest } {
  if (!body.document_text || typeof body.document_text !== 'string') {
    return { isValid: false, error: 'document_text is required and must be a string' };
  }

  if (!body.user_question || typeof body.user_question !== 'string') {
    return { isValid: false, error: 'user_question is required and must be a string' };
  }

  if (body.user_question.length > 500) {
    return { isValid: false, error: 'user_question must be less than 500 characters' };
  }

  if (!Array.isArray(body.conversation_history)) {
    return { isValid: false, error: 'conversation_history must be an array' };
  }

  const tone = body.tone || 'serious';
  if (!VALID_TONES.includes(tone)) {
    return { isValid: false, error: `Invalid tone. Must be one of: ${VALID_TONES.join(', ')}` };
  }

  return {
    isValid: true,
    data: {
      document_text: body.document_text.trim(),
      conversation_history: body.conversation_history,
      user_question: body.user_question.trim(),
      tone
    }
  };
}

function buildChatMessages(documentText: string, conversationHistory: ChatMessage[], userQuestion: string, tone: string): any[] {
  const toneInstruction = TONE_INSTRUCTIONS[tone as keyof typeof TONE_INSTRUCTIONS];
  
  // Check if this is a general question (no specific document)
  const isGeneralQuestion = documentText.includes("No specific document provided");
  
  let systemMessage;
  
  if (isGeneralQuestion) {
    systemMessage = {
      role: "system",
      content: `You are a knowledgeable legal assistant chatbot. ${toneInstruction}

Your task is to answer general legal questions and provide helpful legal information. You should:
- Provide accurate, helpful legal information
- Explain legal concepts in plain language
- Suggest when someone should consult with a lawyer
- Clarify that you're providing general information, not legal advice
- Be helpful while maintaining appropriate disclaimers

Please provide helpful responses that directly address the user's questions. Keep your responses concise but informative, and maintain the ${tone} tone throughout.

Important: Always remind users that this is general information and not legal advice, and they should consult with a qualified attorney for specific legal matters.`
    };
  } else {
    systemMessage = {
      role: "system",
      content: `You are a legal assistant chatbot specializing in analyzing and explaining legal documents. ${toneInstruction}

Your task is to answer questions about the following legal document. Provide helpful, accurate information while maintaining the specified tone.

Document to reference:
${documentText}

Please provide helpful responses that directly address the user's questions about the document. Keep your responses concise but informative, and maintain the ${tone} tone throughout.`
    };
  }

  const messages = [systemMessage];

  // Add conversation history (limit to last 10 messages to stay within token limits)
  const recentHistory = conversationHistory.slice(-10);
  recentHistory.forEach(msg => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    });
  });

  // Add current user question
  messages.push({
    role: "user",
    content: userQuestion
  });

  return messages;
}

async function callOpenAIAPI(messages: any[]): Promise<string> {
  const PICA_SECRET_KEY = Deno.env.get('PICA_SECRET_KEY');
  const PICA_OPENAI_CONNECTION_KEY = Deno.env.get('PICA_OPENAI_CONNECTION_KEY');

  console.log('Environment check:', {
    hasSecretKey: !!PICA_SECRET_KEY,
    hasOpenAIKey: !!PICA_OPENAI_CONNECTION_KEY,
    secretKeyLength: PICA_SECRET_KEY?.length || 0,
    openaiKeyLength: PICA_OPENAI_CONNECTION_KEY?.length || 0
  });

  if (!PICA_SECRET_KEY || !PICA_OPENAI_CONNECTION_KEY) {
    throw new Error('Missing required environment variables: PICA_SECRET_KEY or PICA_OPENAI_CONNECTION_KEY');
  }

  const requestBody = {
    model: 'gpt-4',
    messages: messages,
    max_tokens: 1000,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  };

  console.log('Making request to OpenAI API via Pica:', {
    url: 'https://api.picaos.com/v1/passthrough/chat/completions',
    messagesCount: messages.length,
    bodySize: JSON.stringify(requestBody).length
  });

  try {
    const response = await fetch('https://api.picaos.com/v1/passthrough/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pica-secret': PICA_SECRET_KEY,
        'x-pica-connection-key': PICA_OPENAI_CONNECTION_KEY,
        'x-pica-action-id': 'conn_mod_def::GDzgIxPFYP0::2bW4lQ29TAuimPnr1tYXww'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI API success response:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length || 0,
      hasMessage: !!(data.choices?.[0]?.message?.content)
    });
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid OpenAI API response format:', data);
      throw new Error('Invalid response format from OpenAI API');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error in callOpenAIAPI:', error);
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

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
      console.log('Request body received:', {
        hasDocumentText: !!body.document_text,
        hasUserQuestion: !!body.user_question,
        documentTextLength: body.document_text?.length || 0,
        userQuestion: body.user_question,
        conversationHistoryLength: body.conversation_history?.length || 0,
        tone: body.tone,
        isGeneralQuestion: body.document_text?.includes("No specific document provided")
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

    const validation = validateChatRequest(body);
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

    const { document_text, conversation_history, user_question, tone } = validation.data!;

    // Build the chat messages
    const messages = buildChatMessages(document_text, conversation_history, user_question, tone!);
    console.log('Built messages for OpenAI, count:', messages.length);

    // Call the OpenAI API
    let responseText: string;
    try {
      responseText = await callOpenAIAPI(messages);
      console.log('OpenAI API call successful, response length:', responseText.length);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
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

    const response: ChatResponse = {
      success: true,
      response: responseText
    };

    console.log('Sending successful chat response');

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Unexpected error in chat-with-document function:', error);
    
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