// Background script for Legalish extension
// Handles extension lifecycle, storage, and communication

// Extension installation and updates
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Legalish extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    // First time installation
    chrome.tabs.create({ 
      url: 'https://legalish.site/summary?welcome=extension' 
    });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'ANALYZE_SELECTION':
      handleAnalyzeSelection(message.text, sender.tab);
      break;
      
    case 'ANALYZE_PAGE':
      handleAnalyzePage(sender.tab);
      break;
      
    case 'GET_AUTH_STATUS':
      getAuthStatus().then(sendResponse);
      return true; // Keep message channel open for async response
      
    case 'STORE_AUTH_DATA':
      storeAuthData(message.data).then(sendResponse);
      return true;
      
    case 'CLEAR_AUTH_DATA':
      clearAuthData().then(sendResponse);
      return true;
      
    default:
      console.log('Unknown message type:', message.type);
  }
});

// Handle text selection analysis
async function handleAnalyzeSelection(text, tab) {
  try {
    // Open popup with selected text
    chrome.action.openPopup();
    
    // Store selected text for popup to access
    await chrome.storage.local.set({
      selected_text: text,
      selected_from_tab: tab.id,
      selection_timestamp: Date.now()
    });
    
    // Notify popup about new selection
    chrome.runtime.sendMessage({
      type: 'TEXT_SELECTED',
      text: text,
      tabId: tab.id
    });
  } catch (error) {
    console.error('Error handling text selection:', error);
  }
}

// Handle page analysis
async function handleAnalyzePage(tab) {
  try {
    // Extract page content
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractPageContent
    });
    
    const pageContent = results[0].result;
    
    if (pageContent.length < 50) {
      console.log('No substantial legal content found on page');
      return;
    }
    
    // Open popup with page content
    chrome.action.openPopup();
    
    // Store page content for popup to access
    await chrome.storage.local.set({
      page_content: pageContent,
      page_url: tab.url,
      page_title: tab.title,
      page_timestamp: Date.now()
    });
    
    // Notify popup about page content
    chrome.runtime.sendMessage({
      type: 'PAGE_CONTENT_READY',
      content: pageContent,
      url: tab.url,
      title: tab.title
    });
  } catch (error) {
    console.error('Error handling page analysis:', error);
  }
}

// Function to inject into page for content extraction
function extractPageContent() {
  // Look for common legal document containers
  const selectors = [
    'main',
    '[role="main"]',
    '.content',
    '#content',
    '.legal-content',
    '.terms-content',
    '.privacy-content',
    '.policy-content',
    'article',
    '.document-content'
  ];
  
  let content = '';
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      content = element.innerText;
      break;
    }
  }
  
  // Fallback to body if no specific container found
  if (!content) {
    content = document.body.innerText;
  }
  
  // Clean up content
  content = content
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .trim();
  
  // Limit content length for API constraints
  return content.slice(0, 2800);
}

// Authentication management
async function getAuthStatus() {
  try {
    const { supabase_session } = await chrome.storage.local.get(['supabase_session']);
    return {
      isAuthenticated: !!supabase_session,
      user: supabase_session?.user || null,
      session: supabase_session || null
    };
  } catch (error) {
    console.error('Error getting auth status:', error);
    return { isAuthenticated: false, user: null, session: null };
  }
}

async function storeAuthData(authData) {
  try {
    await chrome.storage.local.set({
      supabase_session: authData.session,
      auth_timestamp: Date.now()
    });
    
    console.log('Auth data stored successfully');
    return { success: true };
  } catch (error) {
    console.error('Error storing auth data:', error);
    return { success: false, error: error.message };
  }
}

async function clearAuthData() {
  try {
    await chrome.storage.local.remove([
      'supabase_session',
      'auth_timestamp',
      'selected_text',
      'page_content'
    ]);
    
    console.log('Auth data cleared successfully');
    return { success: true };
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return { success: false, error: error.message };
  }
}

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for selected text
  chrome.contextMenus.create({
    id: 'analyze-selection',
    title: 'Analyze with Legalish',
    contexts: ['selection']
  });
  
  // Create context menu for page
  chrome.contextMenus.create({
    id: 'analyze-page',
    title: 'Analyze page for legal terms',
    contexts: ['page']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  switch (info.menuItemId) {
    case 'analyze-selection':
      if (info.selectionText) {
        await handleAnalyzeSelection(info.selectionText, tab);
      }
      break;
      
    case 'analyze-page':
      await handleAnalyzePage(tab);
      break;
  }
});

// Handle tab updates to detect legal pages
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if this looks like a legal page
    const legalPagePatterns = [
      /terms.*service/i,
      /privacy.*policy/i,
      /user.*agreement/i,
      /license.*agreement/i,
      /terms.*conditions/i,
      /legal.*notice/i,
      /cookie.*policy/i,
      /data.*protection/i
    ];
    
    const isLegalPage = legalPagePatterns.some(pattern => 
      pattern.test(tab.title || '') || pattern.test(tab.url)
    );
    
    if (isLegalPage) {
      // Show page action badge
      chrome.action.setBadgeText({
        tabId: tabId,
        text: '!'
      });
      
      chrome.action.setBadgeBackgroundColor({
        tabId: tabId,
        color: '#a855f7'
      });
      
      chrome.action.setTitle({
        tabId: tabId,
        title: 'Legal document detected - Click to analyze with Legalish'
      });
    } else {
      // Clear badge
      chrome.action.setBadgeText({
        tabId: tabId,
        text: ''
      });
      
      chrome.action.setTitle({
        tabId: tabId,
        title: 'Legalish - Legal Terms Analyzer'
      });
    }
  }
});

// Cleanup old data periodically
chrome.alarms.create('cleanup', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'cleanup') {
    try {
      const data = await chrome.storage.local.get();
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      // Remove old temporary data
      const keysToRemove = [];
      
      Object.keys(data).forEach(key => {
        if (key.includes('_timestamp')) {
          const timestamp = data[key];
          if (now - timestamp > oneHour) {
            keysToRemove.push(key);
            // Also remove associated data
            const baseKey = key.replace('_timestamp', '');
            if (data[baseKey]) {
              keysToRemove.push(baseKey);
            }
          }
        }
      });
      
      if (keysToRemove.length > 0) {
        await chrome.storage.local.remove(keysToRemove);
        console.log('Cleaned up old data:', keysToRemove);
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  // This will open the popup, but we can also add additional logic here
  console.log('Extension icon clicked on tab:', tab.url);
});

// Monitor storage changes for debugging
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('Storage changed:', changes, 'in namespace:', namespace);
});