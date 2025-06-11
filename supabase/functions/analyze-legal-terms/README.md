# Legal Terms Analysis Edge Function

This Supabase Edge Function analyzes legal documents using the Pica API with OpenAI integration. It provides structured analysis with different tone options.

## Features

- **Multiple Tone Options**: Choose from 8 different analysis tones (serious, sarcastic, meme, ominous, child, academic, authoritative, wizard)
- **Structured Output**: Returns organized summary points and red flags
- **Input Validation**: Validates request data and sanitizes inputs
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
POST /functions/v1/analyze-legal-terms
```

## Request Body

```json
{
  "legal_terms": "string (required, 10-100000 characters)",
  "tone": "string (optional, default: 'serious')",
  "max_tokens": "number (optional, 100-4000, default: 2000)",
  "temperature": "number (optional, 0-2, default: 0.7)"
}
```

### Available Tones

- `serious`: Professional, neutral analysis
- `sarcastic`: Witty, slightly condescending tone
- `meme`: Overreactive, internet culture style
- `ominous`: Dark, foreboding tone
- `child`: Simple, cheerful language
- `academic`: Scholarly, formal analysis
- `authoritative`: Commanding, official tone
- `wizard`: Mystical, wise tone

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "summary": [
      {
        "title": "Summary Point Title",
        "description": "Detailed description of the point"
      }
    ],
    "red_flags": [
      "Red flag description 1",
      "Red flag description 2"
    ],
    "analysis_text": "Full analysis text from AI",
    "tone_used": "serious",
    "processing_time_ms": 1234
  }
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
const response = await fetch('/functions/v1/analyze-legal-terms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseAnonKey}`
  },
  body: JSON.stringify({
    legal_terms: "Your terms of service text here...",
    tone: "sarcastic",
    max_tokens: 2000,
    temperature: 0.8
  })
});

const result = await response.json();
if (result.success) {
  console.log('Summary:', result.data.summary);
  console.log('Red Flags:', result.data.red_flags);
} else {
  console.error('Error:', result.error);
}
```

## Error Handling

The function handles various error scenarios:

- Invalid JSON in request body
- Missing or invalid `legal_terms`
- Invalid tone selection
- API communication errors
- Parsing errors

All errors return appropriate HTTP status codes and descriptive error messages.

## Rate Limiting

Consider implementing rate limiting in your client application to avoid overwhelming the Pica API.

## Security

- Input validation prevents injection attacks
- Environment variables protect API keys
- CORS headers allow controlled access
- No sensitive data is logged