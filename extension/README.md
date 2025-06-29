# Legalish Chrome Extension

A powerful Chrome extension that brings AI-powered legal document analysis directly to your browser. Detect and analyze terms of service, privacy policies, and contracts on any webpage.

## Setup Instructions

### 1. Configure API Endpoints

Before using the extension, you need to update the API endpoints in the code:

1. Open `extension/content.js` and `extension/popup.js`
2. Replace `https://your-project-id.supabase.co` with your actual Supabase project URL
3. Replace the placeholder authorization token with your actual Supabase anon key

### 2. Install the Extension

#### From Chrome Web Store (Recommended)
1. Visit the [Legalish Extension page](https://chrome.google.com/webstore) on Chrome Web Store
2. Click "Add to Chrome"
3. Confirm the installation
4. The extension icon will appear in your browser toolbar

#### Developer Mode (For Testing)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `extension` folder
5. The extension will be loaded and ready to use

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

### 🔐 Account Integration
- Sign in with your Legalish account
- Sync analysis history across devices
- Access Pro features and unlimited analyses
- Save and organize your legal document reviews

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
- **Save analyses**: Keep a history of your document reviews
- **Full app integration**: Open complete results in the main Legalish application

## Permissions Explained

The extension requests the following permissions:

- **activeTab**: Read content from the current tab for analysis
- **storage**: Save your preferences and analysis history locally
- **scripting**: Inject content scripts to detect legal content and show analysis widgets
- **notifications**: Show notifications for analysis results
- **alarms**: Clean up old data periodically
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
3. Verify the API endpoints are correctly configured
4. Try a different analysis tone or method

### Configuration Issues
1. Ensure you've updated the Supabase URL in both `content.js` and `popup.js`
2. Verify your Supabase anon key is correctly set
3. Check that your Supabase project has the required Edge Functions deployed

## Support

- **Help Center**: Visit [help.legalish.com](https://help.legalish.com)
- **Contact Support**: Email support@legalish.com
- **Feature Requests**: Submit ideas through the main app
- **Bug Reports**: Use the feedback option in the extension

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Minimum Chrome Version**: 88+
- **File Size**: ~2MB
- **Languages**: English (more coming soon)
- **API Integration**: Supabase + OpenAI

---

**Made with ❤️ by the Legalish team**

Transform legal jargon into plain English, one document at a time.