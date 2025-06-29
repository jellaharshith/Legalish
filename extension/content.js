// Content script for Legalish extension
// This script runs on all web pages and handles text selection

let lastSelectedText = '';

// Listen for text selection changes
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText !== lastSelectedText && selectedText.length > 0) {
    lastSelectedText = selectedText;
    
    // Send selected text to popup
    chrome.runtime.sendMessage({
      type: 'TEXT_SELECTED',
      text: selectedText,
      url: window.location.href
    });
    
    // Show selection indicator for legal-looking text
    if (isLegalText(selectedText)) {
      showSelectionIndicator(selection);
    }
  }
});

// Check if text looks like legal content
function isLegalText(text) {
  const legalKeywords = [
    'terms', 'conditions', 'agreement', 'license', 'privacy', 'policy',
    'shall', 'hereby', 'whereas', 'liability', 'indemnify', 'warranty',
    'breach', 'terminate', 'governing law', 'jurisdiction', 'arbitration',
    'intellectual property', 'confidential', 'proprietary'
  ];
  
  const textLower = text.toLowerCase();
  const keywordCount = legalKeywords.filter(keyword => textLower.includes(keyword)).length;
  
  // Consider it legal text if it has multiple legal keywords and is substantial
  return keywordCount >= 2 && text.length >= 50;
}

// Show visual indicator for legal text selection
function showSelectionIndicator(selection) {
  // Remove any existing indicators
  removeSelectionIndicators();
  
  if (selection.rangeCount === 0) return;
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  // Create indicator element
  const indicator = document.createElement('div');
  indicator.id = 'legalish-selection-indicator';
  indicator.innerHTML = `
    <div class="legalish-indicator-content">
      <img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="Legalish">
      <span>Legal text detected</span>
      <button id="legalish-analyze-btn">Analyze</button>
    </div>
  `;
  
  // Position indicator
  indicator.style.cssText = `
    position: fixed;
    top: ${rect.bottom + window.scrollY + 10}px;
    left: ${rect.left + window.scrollX}px;
    z-index: 10000;
    background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: legalishFadeIn 0.3s ease;
  `;
  
  document.body.appendChild(indicator);
  
  // Add click handler for analyze button
  document.getElementById('legalish-analyze-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'ANALYZE_SELECTION',
      text: lastSelectedText
    });
    removeSelectionIndicators();
  });
  
  // Auto-remove after 5 seconds
  setTimeout(removeSelectionIndicators, 5000);
}

function removeSelectionIndicators() {
  const existing = document.getElementById('legalish-selection-indicator');
  if (existing) {
    existing.remove();
  }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes legalishFadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  #legalish-selection-indicator .legalish-indicator-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  #legalish-selection-indicator img {
    width: 16px;
    height: 16px;
  }
  
  #legalish-analyze-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  #legalish-analyze-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;
document.head.appendChild(style);

// Listen for clicks outside selection to hide indicator
document.addEventListener('click', (e) => {
  if (!e.target.closest('#legalish-selection-indicator')) {
    removeSelectionIndicators();
  }
});

// Auto-detect legal pages and show page-level suggestions
function detectLegalPage() {
  const title = document.title.toLowerCase();
  const url = window.location.href.toLowerCase();
  const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent.toLowerCase());
  
  const legalPageIndicators = [
    'terms of service', 'privacy policy', 'user agreement', 'license agreement',
    'terms and conditions', 'end user license', 'service agreement', 'legal notice',
    'cookie policy', 'data protection', 'acceptable use'
  ];
  
  const isLegalPage = legalPageIndicators.some(indicator => 
    title.includes(indicator) || 
    url.includes(indicator.replace(/\s+/g, '-')) ||
    headings.some(heading => heading.includes(indicator))
  );
  
  if (isLegalPage) {
    showPageAnalysisPrompt();
  }
}

function showPageAnalysisPrompt() {
  // Don't show if already shown
  if (document.getElementById('legalish-page-prompt')) return;
  
  const prompt = document.createElement('div');
  prompt.id = 'legalish-page-prompt';
  prompt.innerHTML = `
    <div class="legalish-prompt-content">
      <img src="${chrome.runtime.getURL('icons/icon32.png')}" alt="Legalish">
      <div class="legalish-prompt-text">
        <strong>Legal document detected!</strong>
        <p>Analyze this page with Legalish for instant summaries and red flag detection.</p>
      </div>
      <div class="legalish-prompt-actions">
        <button id="legalish-analyze-page">Analyze Page</button>
        <button id="legalish-dismiss">Dismiss</button>
      </div>
    </div>
  `;
  
  prompt.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: white;
    border: 2px solid #a855f7;
    border-radius: 12px;
    padding: 16px;
    max-width: 320px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: legalishSlideIn 0.5s ease;
  `;
  
  document.body.appendChild(prompt);
  
  // Add event listeners
  document.getElementById('legalish-analyze-page').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'ANALYZE_PAGE' });
    prompt.remove();
  });
  
  document.getElementById('legalish-dismiss').addEventListener('click', () => {
    prompt.remove();
  });
  
  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (document.getElementById('legalish-page-prompt')) {
      prompt.remove();
    }
  }, 10000);
}

// Add additional CSS for page prompt
const pagePromptStyle = document.createElement('style');
pagePromptStyle.textContent = `
  @keyframes legalishSlideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  #legalish-page-prompt .legalish-prompt-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  #legalish-page-prompt img {
    width: 32px;
    height: 32px;
    align-self: flex-start;
  }
  
  #legalish-page-prompt .legalish-prompt-text {
    color: #333;
  }
  
  #legalish-page-prompt .legalish-prompt-text strong {
    color: #a855f7;
    font-size: 14px;
  }
  
  #legalish-page-prompt .legalish-prompt-text p {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: #666;
    line-height: 1.4;
  }
  
  #legalish-page-prompt .legalish-prompt-actions {
    display: flex;
    gap: 8px;
  }
  
  #legalish-page-prompt button {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  #legalish-analyze-page {
    background: #a855f7;
    color: white;
  }
  
  #legalish-analyze-page:hover {
    background: #9333ea;
  }
  
  #legalish-dismiss {
    background: #f3f4f6;
    color: #6b7280;
  }
  
  #legalish-dismiss:hover {
    background: #e5e7eb;
  }
`;
document.head.appendChild(pagePromptStyle);

// Run page detection after DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', detectLegalPage);
} else {
  detectLegalPage();
}