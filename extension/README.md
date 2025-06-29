# Legalish Web Extension

A powerful browser extension that brings Legalish's AI-powered legal document analysis directly to your browser. Analyze terms of service, privacy policies, and contracts on any webpage with instant summaries and red flag detection.

## Features

### 🔍 Smart Text Detection
- **Automatic Legal Page Detection**: Identifies legal documents and terms of service pages
- **Text Selection Analysis**: Analyze any selected text on a webpage
- **Full Page Analysis**: Process entire legal documents with one click
- **Context Menu Integration**: Right-click to analyze selected text or pages

### 🧠 AI-Powered Analysis
- **RAG-Enhanced Processing**: Uses the same AI system as the main Legalish app
- **Multiple Analysis Tones**: Choose from 8 different personality voices
- **Red Flag Detection**: Automatically identifies concerning clauses
- **Document Type Recognition**: Specialized analysis for different contract types

### 🎧 Audio Features
- **Text-to-Speech**: Listen to summaries with premium AI voices
- **Multiple Voice Personalities**: From serious to sarcastic to wizard tones
- **ElevenLabs Integration**: High-quality voice synthesis

### 🔐 Seamless Integration
- **Supabase Authentication**: Sign in with your existing Legalish account
- **Analysis History**: Access your saved analyses from the main app
- **Pro Features**: Unlock premium voices and unlimited analyses
- **Cross-Platform Sync**: Analysis data syncs with your Legalish dashboard

## Installation

### For Development

1. **Clone the repository** and navigate to the extension directory:
   ```bash
   cd extension
   ```

2. **Load the extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `extension` directory

3. **Test the extension**:
   - Visit any webpage with legal content (terms of service, privacy policy)
   - Click the Legalish extension icon in the toolbar
   - Select text on the page and use the analyze feature

### For Production

The extension will be published to the Chrome Web Store and other browser extension stores.

## Usage

### Getting Started

1. **Install the extension** from your browser's extension store
2. **Sign in** to your Legalish account (or create one)
3. **Visit any webpage** with legal content
4. **Click the extension icon** or use the context menu to analyze

### Analysis Methods

#### 1. Text Selection
- Select any text on a webpage
- Right-click and choose "Analyze with Legalish"
- Or use the extension popup's "Selection" tab

#### 2. Full Page Analysis
- Visit a legal document page (terms of service, privacy policy)
- Click the extension icon (it will show a badge on legal pages)
- Use the "Page" tab to analyze the entire document

#### 3. Manual Text Input
- Click the extension icon
- Use the "Paste" tab to input text directly
- Paste any legal text for analysis

### Features

#### Smart Detection
- The extension automatically detects legal pages and shows a notification badge
- Selected text that appears to be legal content triggers analysis suggestions
- Context menu options appear when you right-click on selected text

#### Analysis Options
- **Tone Selection**: Choose how the AI should analyze the document
  - 😐 Serious (Free)
  - 😏 Sarcastic (Free)
  - 🤪 Meme (Free)
  - 😈 Ominous (Free)
  - 👶 Child (Pro)
  - 🎓 Academic (Pro)
  - 👔 Authoritative (Pro)
  - 🧙 Wizard (Pro)

#### Results Display
- **Summary Tab**: Key points explained in plain English
- **Red Flags Tab**: Concerning clauses highlighted with explanations
- **Audio Playback**: Listen to the summary with AI-generated voices
- **Full App Integration**: Open results in the main Legalish app for more features

## Technical Architecture

### Extension Structure
```
extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup interface
├── popup.css              # Popup styling
├── popup.js               # Popup functionality
├── content.js             # Content script for page interaction
├── content.css            # Content script styles
├── background.js          # Background service worker
├── icons/                 # Extension icons
└── README.md              # This file
```

### Key Components

#### Manifest (manifest.json)
- Defines extension permissions and structure
- Configures content scripts and background workers
- Sets up icons and popup interface

#### Popup Interface (popup.html/css/js)
- Main user interface when clicking the extension icon
- Handles authentication and analysis requests
- Displays results and provides audio playback

#### Content Script (content.js/css)
- Runs on all web pages
- Detects text selection and legal content
- Shows contextual analysis prompts
- Handles page-level legal document detection

#### Background Script (background.js)
- Manages extension lifecycle and storage
- Handles communication between components
- Provides context menu functionality
- Manages authentication state

### API Integration

The extension integrates with the same Supabase backend as the main Legalish application:

- **Authentication**: Uses Supabase Auth for user management
- **Analysis**: Calls the `analyze-legal-terms-rag` Edge Function
- **Voice Synthesis**: Uses the `synthesize-speech` Edge Function
- **Data Storage**: Syncs with user's analysis history

### Security & Privacy

- **Minimal Permissions**: Only requests necessary permissions
- **Secure Communication**: All API calls use HTTPS and authentication tokens
- **Local Storage**: Temporary data is automatically cleaned up
- **No Data Collection**: Extension doesn't collect or store personal data beyond what's needed for functionality

## Development

### Prerequisites
- Chrome browser (for development)
- Access to Legalish Supabase backend
- Basic knowledge of JavaScript and web extensions

### Setup
1. Clone the main Legalish repository
2. Navigate to the `extension` directory
3. Load the extension in Chrome developer mode
4. Make changes and reload the extension to test

### Testing
- Test on various legal document websites
- Verify text selection functionality
- Check authentication flow
- Test audio playback features
- Validate error handling

### Building for Production
1. Update version in `manifest.json`
2. Test thoroughly across different websites
3. Create extension package for store submission
4. Submit to Chrome Web Store and other browser stores

## Browser Compatibility

### Supported Browsers
- **Chrome**: Full support (Manifest V3)
- **Edge**: Full support (Chromium-based)
- **Firefox**: Planned (requires Manifest V2 adaptation)
- **Safari**: Planned (requires Safari Web Extension format)

### Feature Support
- All modern browsers support the core functionality
- Audio features require Web Audio API support
- Some advanced features may vary by browser

## Troubleshooting

### Common Issues

#### Extension Not Loading
- Check that developer mode is enabled
- Verify all files are present in the extension directory
- Check browser console for error messages

#### Authentication Problems
- Ensure you're signed in to Legalish in the same browser
- Clear extension storage and try signing in again
- Check that popup blockers aren't interfering

#### Analysis Not Working
- Verify internet connection
- Check that the selected text is substantial enough (>10 characters)
- Ensure you're signed in to a Legalish account

#### Audio Not Playing
- Check browser audio permissions
- Verify that the analysis completed successfully
- Try a different voice tone

### Getting Help
- Check the main Legalish documentation
- Report issues on the GitHub repository
- Contact support through the main Legalish website

## Contributing

We welcome contributions to improve the extension! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Follow existing code style and patterns
- Add comments for complex functionality
- Test on multiple websites and browsers
- Update documentation as needed

## License

This extension is part of the Legalish project and follows the same licensing terms as the main application.

---

**Built with ❤️ to make legal documents accessible to everyone, everywhere.**