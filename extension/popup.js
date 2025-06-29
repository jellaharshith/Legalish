// Configuration
const SUPABASE_URL = 'https://txwilhbitljeeihpvscr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4d2lsaGJpdGxqZWVpaHB2c2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MzE4NzQsImV4cCI6MjA0OTAwNzg3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

// State management
let currentUser = null;
let selectedText = '';
let analysisResult = null;

// DOM elements
const elements = {
  authSection: document.getElementById('authSection'),
  mainContent: document.getElementById('mainContent'),
  loadingSection: document.getElementById('loadingSection'),
  resultsSection: document.getElementById('resultsSection'),
  signInBtn: document.getElementById('signInBtn'),
  userInfo: document.getElementById('userInfo'),
  userEmail: document.getElementById('userEmail'),
  userTier: document.getElementById('userTier'),
  status: document.getElementById('status'),
  currentPageUrl: document.getElementById('currentPageUrl'),
  textInput: document.getElementById('textInput'),
  toneSelect: document.getElementById('toneSelect'),
  summaryText: document.getElementById('summaryText'),
  redFlagsList: document.getElementById('redFlagsList')
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await initializeAuth();
  setupEventListeners();
  await loadCurrentPageInfo();
  await checkForSelectedText();
});

// Authentication functions
async function initializeAuth() {
  try {
    const { data } = await chrome.storage.local.get(['supabase_session']);
    if (data.supabase_session) {
      currentUser = data.supabase_session.user;
      showMainContent();
      updateUserInfo();
    } else {
      showAuthSection();
    }
  } catch (error) {
    console.error('Auth initialization error:', error);
    showAuthSection();
  }
}

async function signIn() {
  try {
    // Open Legalish website for authentication
    const authUrl = 'https://legalish.site/summary?extension_auth=true';
    await chrome.tabs.create({ url: authUrl });
    
    // Listen for auth completion
    const checkAuth = setInterval(async () => {
      const { data } = await chrome.storage.local.get(['supabase_session']);
      if (data.supabase_session) {
        clearInterval(checkAuth);
        currentUser = data.supabase_session.user;
        showMainContent();
        updateUserInfo();
      }
    }, 1000);
    
    // Stop checking after 5 minutes
    setTimeout(() => clearInterval(checkAuth), 300000);
  } catch (error) {
    console.error('Sign in error:', error);
    updateStatus('Sign in failed', 'error');
  }
}

function showAuthSection() {
  elements.authSection.style.display = 'block';
  elements.mainContent.style.display = 'none';
  elements.loadingSection.style.display = 'none';
  elements.resultsSection.style.display = 'none';
}

function showMainContent() {
  elements.authSection.style.display = 'none';
  elements.mainContent.style.display = 'block';
  elements.loadingSection.style.display = 'none';
  elements.resultsSection.style.display = 'none';
}

function showLoading() {
  elements.authSection.style.display = 'none';
  elements.mainContent.style.display = 'none';
  elements.loadingSection.style.display = 'block';
  elements.resultsSection.style.display = 'none';
}

function showResults() {
  elements.authSection.style.display = 'none';
  elements.mainContent.style.display = 'none';
  elements.loadingSection.style.display = 'none';
  elements.resultsSection.style.display = 'block';
}

function updateUserInfo() {
  if (currentUser) {
    elements.userInfo.style.display = 'flex';
    elements.userEmail.textContent = currentUser.email;
    // You would get tier from user metadata or profile
    elements.userTier.textContent = 'Pro'; // Default for demo
  }
}

function updateStatus(message, type = 'ready') {
  const statusText = elements.status.querySelector('.status-text');
  const statusDot = elements.status.querySelector('.status-dot');
  
  statusText.textContent = message;
  
  statusDot.style.background = type === 'error' ? '#ef4444' : 
                              type === 'analyzing' ? '#f59e0b' : '#10b981';
}

// Event listeners
function setupEventListeners() {
  // Auth
  elements.signInBtn.addEventListener('click', signIn);
  
  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      switchTab(tabName);
    });
  });
  
  // Analysis buttons
  document.getElementById('analyzeSelectionBtn').addEventListener('click', () => analyzeText(selectedText));
  document.getElementById('analyzePasteBtn').addEventListener('click', () => analyzeText(elements.textInput.value));
  document.getElementById('analyzePageBtn').addEventListener('click', analyzeCurrentPage);
  
  // Results buttons
  document.getElementById('newAnalysisBtn').addEventListener('click', showMainContent);
  document.getElementById('openFullBtn').addEventListener('click', openInLegalish);
  document.getElementById('playAudioBtn').addEventListener('click', playAudio);
  
  // Footer links
  document.getElementById('upgradeLink').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://legalish.site/upgrade' });
  });
  
  document.getElementById('dashboardLink').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://legalish.site/dashboard' });
  });
  
  // Text input changes
  elements.textInput.addEventListener('input', (e) => {
    const btn = document.getElementById('analyzePasteBtn');
    btn.disabled = e.target.value.trim().length < 10;
  });
}

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}Tab` || content.id === `${tabName}Results`);
  });
}

// Page interaction functions
async function loadCurrentPageInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    elements.currentPageUrl.textContent = new URL(tab.url).hostname;
  } catch (error) {
    elements.currentPageUrl.textContent = 'Unknown page';
  }
}

async function checkForSelectedText() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => window.getSelection().toString().trim()
    });
    
    selectedText = results[0].result;
    const btn = document.getElementById('analyzeSelectionBtn');
    btn.disabled = selectedText.length < 10;
    
    if (selectedText.length >= 10) {
      updateStatus(`${selectedText.length} characters selected`);
    }
  } catch (error) {
    console.error('Error checking selected text:', error);
  }
}

async function analyzeCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractPageText
    });
    
    const pageText = results[0].result;
    if (pageText.length < 10) {
      updateStatus('No legal text found on page', 'error');
      return;
    }
    
    await analyzeText(pageText);
  } catch (error) {
    console.error('Error analyzing page:', error);
    updateStatus('Failed to analyze page', 'error');
  }
}

function extractPageText() {
  // Look for common legal document indicators
  const legalKeywords = [
    'terms of service', 'privacy policy', 'user agreement', 'license agreement',
    'terms and conditions', 'end user license', 'service agreement', 'legal notice'
  ];
  
  const pageText = document.body.innerText.toLowerCase();
  const hasLegalContent = legalKeywords.some(keyword => pageText.includes(keyword));
  
  if (hasLegalContent) {
    // Extract main content, avoiding navigation and footer
    const main = document.querySelector('main') || 
                 document.querySelector('[role="main"]') || 
                 document.querySelector('.content') ||
                 document.querySelector('#content') ||
                 document.body;
    
    return main.innerText.slice(0, 2800); // Limit to API constraints
  }
  
  return '';
}

// Analysis functions
async function analyzeText(text) {
  if (!text || text.trim().length < 10) {
    updateStatus('Text too short for analysis', 'error');
    return;
  }
  
  if (!currentUser) {
    updateStatus('Please sign in to analyze', 'error');
    return;
  }
  
  showLoading();
  updateStatus('Analyzing...', 'analyzing');
  
  try {
    const { data: session } = await chrome.storage.local.get(['supabase_session']);
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-legal-terms-rag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.supabase_session.access_token}`
      },
      body: JSON.stringify({
        legal_terms: text.slice(0, 2800),
        tone: elements.toneSelect.value,
        document_type: 'general',
        max_tokens: 2000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status}`);
    }
    
    analysisResult = await response.json();
    
    if (analysisResult.success) {
      displayResults(analysisResult.data);
      showResults();
      updateStatus('Analysis complete');
    } else {
      throw new Error(analysisResult.error || 'Analysis failed');
    }
  } catch (error) {
    console.error('Analysis error:', error);
    updateStatus('Analysis failed', 'error');
    showMainContent();
  }
}

function displayResults(data) {
  // Display summary
  if (data.summary && data.summary.length > 0) {
    elements.summaryText.textContent = data.summary[0].description;
  }
  
  // Display red flags
  elements.redFlagsList.innerHTML = '';
  if (data.red_flags && data.red_flags.length > 0) {
    data.red_flags.forEach(flag => {
      const flagElement = document.createElement('div');
      flagElement.className = 'red-flag-item';
      flagElement.innerHTML = `
        <svg class="red-flag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>${flag}</span>
      `;
      elements.redFlagsList.appendChild(flagElement);
    });
  } else {
    elements.redFlagsList.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6); padding: 20px;">No red flags detected</p>';
  }
}

async function openInLegalish() {
  if (analysisResult) {
    // Store analysis data for the main app
    await chrome.storage.local.set({ 
      extension_analysis: analysisResult,
      extension_timestamp: Date.now()
    });
    
    // Open Legalish with analysis data
    chrome.tabs.create({ url: 'https://legalish.site/summary?from_extension=true' });
  }
}

async function playAudio() {
  if (!analysisResult || !analysisResult.data.summary[0]) {
    updateStatus('No summary to play', 'error');
    return;
  }
  
  try {
    const { data: session } = await chrome.storage.local.get(['supabase_session']);
    
    // Get voice ID based on selected tone
    const voiceIds = {
      serious: 'fVEZmEO2dF9bNae3YBOh',
      sarcastic: 'UeDSHLMzdueVERuLQA8O',
      meme: 'B5wR8yZLTi6wn9mE00pD',
      ominous: 'qsNN3em0r2h3mSLj1mBw',
      child: '1ehM0LJPoYlTLKFMkKL2',
      academic: 'RWOpmSIBSHmk63ppkzqN',
      authoritative: 'ee96tsRT1AJLlkQuesbX',
      wizard: 'mewzbG3QpSxmuCBD4QKx'
    };
    
    const voiceId = voiceIds[elements.toneSelect.value] || voiceIds.serious;
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/synthesize-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.supabase_session.access_token}`
      },
      body: JSON.stringify({
        text: analysisResult.data.summary[0].description,
        voice_id: voiceId
      })
    });
    
    if (!response.ok) {
      throw new Error('Audio synthesis failed');
    }
    
    const audioData = await response.json();
    
    if (audioData.success) {
      // Play audio
      const audio = new Audio(`data:audio/mpeg;base64,${audioData.audio}`);
      audio.play();
      updateStatus('Playing audio...');
      
      audio.onended = () => {
        updateStatus('Audio complete');
      };
    } else {
      throw new Error(audioData.error || 'Audio synthesis failed');
    }
  } catch (error) {
    console.error('Audio playback error:', error);
    updateStatus('Audio playback failed', 'error');
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TEXT_SELECTED') {
    selectedText = message.text;
    const btn = document.getElementById('analyzeSelectionBtn');
    btn.disabled = selectedText.length < 10;
    
    if (selectedText.length >= 10) {
      updateStatus(`${selectedText.length} characters selected`);
    }
  }
});