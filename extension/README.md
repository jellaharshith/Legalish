# Legalish Chrome Extension

A powerful Chrome extension that brings AI-powered legal document analysis directly to your browser. Detect and analyze terms of service, privacy policies, and contracts on any webpage.

## 🚀 Quick Setup

### 1. Get Your Supabase Anon Key

**CRITICAL**: You need to replace the placeholder token with your actual Supabase anon key:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `txwilhbitljeeihpvscr`
3. Go to **Settings** → **API**
4. Copy your **anon/public** key
5. Replace the placeholder token in both `popup.js` and `content.js`:

**In `popup.js` around line 300:**
```javascript
// Replace this line:
headers['Authorization'] = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4d2lsaGJpdGxqZWVpaHB2c2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMzQ0MDAsImV4cCI6MjA1MDkxMDQwMH0.YOUR_ACTUAL_SIGNATURE_HERE`;

// With your actual anon key:
headers['Authorization'] = `Bearer YOUR_ACTUAL_SUPABASE_ANON_KEY_HERE`;
```

**In `content.js` around line 200:**
```javascript
// Replace this line:
headers['Authorization'] = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4d2lsaGJpdGxqZWVpaHB2c2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMzQ0MDAsImV4cCI6MjA1MDkxMDQwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8`;

// With your actual anon key:
headers['Authorization'] = `Bearer YOUR_ACTUAL_SUPABASE_ANON_KEY_HERE`;
```

### 2. Install the Extension

#### Developer Mode (For Testing)
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `extension` folder
4. The extension will be loaded and ready to use

## ✨ Features

### 🔐 **NEW: Automatic Authentication Sync**
- **Smart Auth Detection**: Automatically detects when you're signed in to Legalish website
- **Seamless Sync**: Extension syncs your authentication state from the website
- **No Manual Setup**: Just sign in to the website and the extension will recognize you
- **Secure Token Management**: Safely stores and manages authentication tokens

### 🔍 Smart Legal Content Detection
- **PDF Support**: Automatically detects and analyzes PDF legal documents
- **Webpage Analysis**: Identifies terms of service, privacy policies, and contracts
- **Visual Indicators**: Shows notifications when legal content is found
- **Context-aware**: Suggests analysis for relevant content

### ⚡ Multiple Analysis Methods
- **Full Page Analysis**: Analyze entire legal documents (including PDFs)
- **Text Selection**: Analyze specific clauses or sections
- **Manual Input**: Paste text directly into the extension
- **URL Analysis**: Automatically handles PDF documents via URL

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
- **Auto-Sync**: Automatically syncs with your Legalish website account
- **Cross-Device**: Access your analysis history across all devices
- **Pro Features**: Unlock premium features when signed in
- **Secure**: Uses the same authentication as the main website

## 📖 How to Use

### Authentication Setup
1. **Sign in to Legalish**: Go to [legalish.site](https://legalish.site) and sign in
2. **Open Extension**: Click the Legalish extension icon
3. **Auto-Sync**: The extension will automatically detect your sign-in status
4. **Start Analyzing**: You're now ready to analyze documents with your account

### Basic Usage
1. **Browse any website** with legal content (including PDFs)
2. **Look for the Legalish indicator** when legal documents are detected
3. **Click the extension icon** in your toolbar to open the popup
4. **Choose your analysis method**:
   - Current Page: Analyze the entire webpage or PDF
   - Selected Text: Highlight text first, then analyze
   - Manual Input: Paste text directly
5. **Click "Analyze Document"** to get instant results

### PDF Analysis
The extension automatically detects PDF documents and uses URL-based analysis:
- **Automatic Detection**: PDFs are identified by URL, content type, or embedded objects
- **URL Analysis**: Sends the PDF URL to the backend for text extraction and analysis
- **Same Results**: Get the same quality analysis as regular web pages

### Advanced Features
- **Right-click context menu**: Right-click on selected text for quick analysis
- **Floating analysis widget**: Get results without leaving the page
- **Save analyses**: Keep a history of your document reviews (when signed in)
- **Full app integration**: Open complete results in the main Legalish application

## 🔧 Troubleshooting

### Extension Shows "Sign In Required" Even When Signed In
1. **Check Website Sign-In**: Make sure you're actually signed in to [legalish.site](https://legalish.site)
2. **Refresh Extension**: Close and reopen the extension popup
3. **Visit Legalish Site**: Go to the Legalish website in the same browser
4. **Wait for Sync**: The extension should automatically detect your sign-in status
5. **Manual Sync**: Click the "Sign In" button to open the website and sign in

### Extension Not Working
1. **Check Supabase Key**: Ensure you've replaced the placeholder token with your actual anon key
2. **Reload Extension**: Go to `chrome://extensions/` and click reload on the Legalish extension
3. **Refresh Page**: Refresh the webpage and try again
4. **Check Console**: Open Developer Tools (F12) and check for errors

### Analysis Fails with 401 Error
This means the authentication token is invalid:
1. **Get Real Anon Key**: Copy your actual Supabase anon key from the dashboard
2. **Replace in Both Files**: Update both `popup.js` and `content.js`
3. **Reload Extension**: Reload the extension in Chrome
4. **Try Again**: The analysis should now work

### PDF Analysis Not Working
1. **Check URL**: Ensure the PDF URL is accessible
2. **Network Connection**: Verify you have internet access
3. **Backend Status**: Check if the Supabase Edge Functions are deployed
4. **Try Text Method**: As a fallback, copy text from the PDF and use manual input

## 🔒 Permissions Explained

The extension requests the following permissions:

- **activeTab**: Read content from the current tab for analysis
- **storage**: Save your preferences and analysis history locally
- **scripting**: Inject content scripts to detect legal content and show analysis widgets
- **notifications**: Show notifications for analysis results
- **alarms**: Clean up old data periodically
- **host_permissions**: Communicate with Legalish servers for AI analysis

## 🛠️ Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Minimum Chrome Version**: 88+
- **API Integration**: Supabase + OpenAI RAG system
- **PDF Support**: URL-based analysis with server-side text extraction
- **Authentication**: Automatic sync with website authentication
- **File Size**: ~2MB
- **Languages**: English (more coming soon)

## 📞 Support

- **Help Center**: Visit [help.legalish.com](https://help.legalish.com)
- **Contact Support**: Email support@legalish.com
- **Feature Requests**: Submit ideas through the main app
- **Bug Reports**: Use the feedback option in the extension

---

**Made with ❤️ by the Legalish team**

Transform legal jargon into plain English, one document at a time.