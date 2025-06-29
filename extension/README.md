# Legalish Chrome Extension

A powerful Chrome extension that brings AI-powered legal document analysis directly to your browser. Detect and analyze terms of service, privacy policies, and contracts on any webpage.

## Features

### 🔍 Smart Legal Content Detection
- Automatically detects legal documents on webpages
- Identifies terms of service, privacy policies, and contracts
- Visual indicators when legal content is found
- Context-aware analysis suggestions

### ⚡ Multiple Analysis Methods
- **Full Page Analysis**: Analyze entire legal documents
- **Text Selection**: Analyze specific clauses or sections
- **Manual Input**: Paste text directly into the extension
- **URL Analysis**: Extract and analyze content from legal document URLs

### 🎭 Multiple Analysis Tones
- **Serious**: Professional, neutral analysis
- **Sarcastic**: Witty, questioning tone
- **Meme**: Internet culture vibes
- **Ominous**: Dark, foreboding warnings
- **Child-friendly**: Simple, easy-to-understand language
- **Academic**: Scholarly, formal analysis
- **Authoritative**: Commanding, official tone
- **Wizard**: Mystical, wise interpretations

### 🚩 Red Flag Detection
- AI-powered identification of concerning clauses
- Highlights hidden fees, one-sided terms, and unfair conditions
- Clear explanations of potential issues
- Risk assessment for each clause

### 🔊 Audio Features (Pro)
- Text-to-speech synthesis of analysis results
- Premium AI voices with different personalities
- ElevenLabs integration for high-quality audio
- Playback controls within the extension

### 🔐 Account Integration
- Sign in with your Legalish account
- Sync analysis history across devices
- Access Pro features and unlimited analyses
- Save and organize your legal document reviews

## Installation

### From Chrome Web Store (Recommended)
1. Visit the [Legalish Extension page](https://chrome.google.com/webstore) on Chrome Web Store
2. Click "Add to Chrome"
3. Confirm the installation
4. The extension icon will appear in your browser toolbar

### Developer Mode (For Testing)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `extension` folder
5. The extension will be loaded and ready to use

## How to Use

### Basic Usage
1. **Browse any website** with legal content
2. **Look for the Legalish indicator** when legal documents are detected
3. **Click the extension icon** in your toolbar to open the popup
4. **Choose your analysis method**:
   - Current Page: Analyze the entire webpage
   - Selected Text: Highlight text first, then analyze
   - Manual Input: Paste text directly
5. **Select your preferred tone** for the analysis
6. **Click "Analyze Document"** to get instant results

### Advanced Features
- **Right-click context menu**: Right-click on selected text for quick analysis
- **Floating analysis widget**: Get results without leaving the page
- **Audio playback**: Listen to analysis results (Pro feature)
- **Save analyses**: Keep a history of your document reviews
- **Full app integration**: Open complete results in the main Legalish application

## Permissions Explained

The extension requests the following permissions:

- **activeTab**: Read content from the current tab for analysis
- **storage**: Save your preferences and analysis history locally
- **scripting**: Inject content scripts to detect legal content and show analysis widgets
- **host_permissions**: Communicate with Legalish servers for AI analysis

## Privacy & Security

- **Local Processing**: Text selection and page scanning happen locally
- **Secure Communication**: All API calls use HTTPS encryption
- **No Tracking**: We don't collect personal browsing data
- **Optional Account**: Sign in only if you want to save analysis history
- **Data Control**: You can clear stored data anytime from the extension

## Troubleshooting

### Extension Not Working
1. Refresh the webpage and try again
2. Check if the extension is enabled in `chrome://extensions/`
3. Ensure you have an internet connection for AI analysis
4. Try disabling other extensions that might conflict

### Analysis Fails
1. Make sure the selected text is at least 10 characters long
2. Check your internet connection
3. Sign in to your account if using Pro features
4. Try a different analysis tone or method

### Audio Not Playing
1. Ensure you're signed in to a Pro account
2. Check your browser's audio permissions
3. Try refreshing the page and analyzing again
4. Verify your internet connection is stable

## Support

- **Help Center**: Visit [help.legalish.com](https://help.legalish.com)
- **Contact Support**: Email support@legalish.com
- **Feature Requests**: Submit ideas through the main app
- **Bug Reports**: Use the feedback option in the extension

## Pro Features

Upgrade to Legalish Pro to unlock:
- **Unlimited Analyses**: No monthly limits
- **Premium AI Voices**: Celebrity and character voices
- **Advanced Analysis**: Deeper insights and comparisons
- **Priority Support**: Faster response times
- **Early Access**: New features before general release

[Upgrade to Pro →](https://legalish.com/upgrade)

## Version History

### v1.0.0 (Current)
- Initial release
- Smart legal content detection
- Multiple analysis methods and tones
- Red flag identification
- Account integration
- Audio features for Pro users
- Context menu integration
- Floating analysis widgets

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Minimum Chrome Version**: 88+
- **File Size**: ~2MB
- **Languages**: English (more coming soon)
- **API Integration**: Supabase + OpenAI + ElevenLabs

## Contributing

This extension is part of the larger Legalish project. For development contributions:

1. Fork the main repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Copyright © 2024 Legalish. All rights reserved.

This extension is proprietary software. Unauthorized copying, distribution, or modification is prohibited.

---

**Made with ❤️ by the Legalish team**

Transform legal jargon into plain English, one document at a time.