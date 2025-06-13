# Chat with Document Edge Function

This Supabase Edge Function enables multi-turn conversations about legal documents using OpenAI GPT-4 via the Pica API.

## Features

- **Multi-turn Conversations**: Maintains conversation context across multiple exchanges
- **Document Context**: References the analyzed legal document in all responses
- **Tone Support**: Supports 8 different response tones (serious, sarcastic, meme, etc.)
- **Error Handling**: Comprehensive error handling with meaningful messages
- **CORS Support**: Supports cross-origin requests

## Environment Variables

Set these environment variables in your Supabase project:

```bash
PICA_SECRET_KEY=your_pica_secret_key
PICA_OPENAI_CONNECTION_KEY=your_pica_openai_connection_key
```

## API Endpoint

```
POST /functions/v1/chat-with-document
```

## Request Body

```json
{
  "document_text": "string (required, the legal document text)",
  "conversation_history": "array (required, previous chat messages)",
  "user_question": "string (required, max 500 characters)",
  "tone": "string (optional, default: 'serious')"
}
```

### Conversation History Format

```json
[
  {
    "id": "string",
    "role": "user" | "assistant",
    "content": "string",
    "timestamp": "string"
  }
]
```

### Available Tones

- `serious`: Professional, neutral responses
- `sarcastic`: Witty, slightly condescending tone
- `meme`: Overreactive, internet culture style
- `ominous`: Dark, foreboding tone
- `child`: Simple, cheerful language
- `academic`: Scholarly, formal responses
- `authoritative`: Commanding, official tone
- `wizard`: Mystical, wise tone

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "response": "The AI's response to the user's question"
}
```

### Error Response (400/500)

```json
{
  "success": false,
  "error": "Error description"
}
```

## Usage Example

```javascript
const response = await fetch('/functions/v1/chat-with-document', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseAnonKey}`
  },
  body: JSON.stringify({
    document_text: "Your legal document text here...",
    conversation_history: [
      {
        id: "1",
        role: "assistant",
        content: "Hi! I've analyzed your document. What would you like to know?",
        timestamp: "2024-01-01T12:00:00Z"
      }
    ],
    user_question: "What are the termination clauses?",
    tone: "serious"
  })
});

const result = await response.json();
if (result.success) {
  console.log('AI Response:', result.response);
} else {
  console.error('Error:', result.error);
}
```

## Integration with Frontend

This function is designed to work with the ChatBot component in the V.O.L.T application. The chatbot:

1. Maintains conversation history in React state
2. Sends the full document text with each request
3. Preserves context across multiple questions
4. Supports different tone selections

## Error Handling

The function handles various error scenarios:

- Invalid JSON in request body
- Missing required fields
- Invalid tone selection
- API communication errors
- OpenAI API response parsing errors

All errors return appropriate HTTP status codes and descriptive error messages.

## Rate Limiting

Consider implementing rate limiting in your client application to avoid overwhelming the OpenAI API and to manage costs effectively.

## Security

- Input validation prevents injection attacks
- Environment variables protect API keys
- CORS headers allow controlled access
- No sensitive data is logged
- Request size limits prevent abuse

## Model Configuration

The function uses GPT-4 with the following settings:
- **Model**: `gpt-4`
- **Max Tokens**: 1000
- **Temperature**: 0.7
- **Top P**: 1
- **Frequency Penalty**: 0
- **Presence Penalty**: 0

These settings provide a good balance between creativity and consistency for legal document analysis.