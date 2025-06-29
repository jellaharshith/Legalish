// Content script for Legalish Chrome Extension
// This script runs on all web pages to detect legal content and provide analysis features

class LegalishContentScript {
    constructor() {
        this.isInjected = false;
        this.selectedText = '';
        this.legalContentDetected = false;
        this.analysisWidget = null;
        
        this.init();
    }

    init() {
        // Avoid double injection
        if (window.legalishInjected) return;
        window.legalishInjected = true;

        this.detectLegalContent();
        this.setupTextSelection();
        this.setupContextMenu();
        this.createAnalysisWidget();
        this.setupMessageListener();
    }

    detectLegalContent() {
        const legalKeywords = [
            'terms of service', 'terms and conditions', 'privacy policy',
            'user agreement', 'license agreement', 'end user license',
            'terms of use', 'service agreement', 'legal notice',
            'cookie policy', 'data protection', 'gdpr', 'ccpa',
            'acceptable use', 'community guidelines', 'code of conduct'
        ];

        const pageText = document.body.innerText.toLowerCase();
        const pageTitle = document.title.toLowerCase();
        const pageUrl = window.location.href.toLowerCase();

        // Check for legal keywords
        const hasLegalKeywords = legalKeywords.some(keyword => 
            pageText.includes(keyword) || pageTitle.includes(keyword) || pageUrl.includes(keyword)
        );

        // Check for legal document patterns
        const hasLegalPatterns = /\b(shall|hereby|whereas|therefore|notwithstanding|pursuant)\b/gi.test(pageText);
        
        // Check for numbered sections (common in legal docs)
        const hasNumberedSections = /\b\d+\.\s*[A-Z][^.]*\./g.test(pageText);
        
        const confidence = (hasLegalKeywords ? 0.4 : 0) + 
                          (hasLegalPatterns ? 0.3 : 0) + 
                          (hasNumberedSections ? 0.3 : 0);

        this.legalContentDetected = confidence > 0.5;

        if (this.legalContentDetected) {
            this.showLegalContentIndicator();
            this.updateExtensionBadge();
        }
    }

    showLegalContentIndicator() {
        // Create a subtle indicator that legal content was detected
        const indicator = document.createElement('div');
        indicator.id = 'legalish-indicator';
        indicator.innerHTML = `
            <div class="legalish-indicator-content">
                <img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="Legalish">
                <span>Legal document detected</span>
                <button class="legalish-analyze-btn">Analyze</button>
            </div>
        `;
        
        document.body.appendChild(indicator);

        // Add click handler
        indicator.querySelector('.legalish-analyze-btn').addEventListener('click', () => {
            this.openAnalysisPopup();
        });

        // Auto-hide after 5 seconds
        setTimeout(() => {
            indicator.style.transform = 'translateY(-100%)';
        }, 5000);
    }

    setupTextSelection() {
        let selectionTimeout;

        document.addEventListener('mouseup', () => {
            clearTimeout(selectionTimeout);
            selectionTimeout = setTimeout(() => {
                const selection = window.getSelection();
                const selectedText = selection.toString().trim();
                
                if (selectedText.length > 50) {
                    this.selectedText = selectedText;
                    this.showSelectionWidget(selection);
                } else {
                    this.hideSelectionWidget();
                }
            }, 100);
        });

        document.addEventListener('mousedown', () => {
            this.hideSelectionWidget();
        });
    }

    showSelectionWidget(selection) {
        // Remove existing widget
        this.hideSelectionWidget();

        // Check if selected text looks legal
        const legalScore = this.calculateLegalScore(this.selectedText);
        if (legalScore < 0.3) return; // Not legal enough

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        const widget = document.createElement('div');
        widget.id = 'legalish-selection-widget';
        widget.innerHTML = `
            <div class="legalish-widget-content">
                <img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="Legalish">
                <span>Analyze with Legalish</span>
                <button class="legalish-widget-btn">Analyze</button>
            </div>
        `;

        // Position widget near selection
        widget.style.left = `${rect.left + window.scrollX}px`;
        widget.style.top = `${rect.bottom + window.scrollY + 10}px`;

        document.body.appendChild(widget);

        // Add click handler
        widget.querySelector('.legalish-widget-btn').addEventListener('click', () => {
            this.analyzeSelectedText();
        });

        // Auto-hide after 10 seconds
        setTimeout(() => {
            this.hideSelectionWidget();
        }, 10000);
    }

    hideSelectionWidget() {
        const widget = document.getElementById('legalish-selection-widget');
        if (widget) {
            widget.remove();
        }
    }

    calculateLegalScore(text) {
        const legalTerms = [
            'agreement', 'contract', 'terms', 'conditions', 'policy', 'license',
            'shall', 'hereby', 'whereas', 'therefore', 'pursuant', 'notwithstanding',
            'liability', 'damages', 'indemnify', 'warranty', 'disclaimer',
            'intellectual property', 'confidential', 'proprietary', 'terminate'
        ];

        const words = text.toLowerCase().split(/\s+/);
        const legalWordCount = words.filter(word => 
            legalTerms.some(term => word.includes(term))
        ).length;

        return legalWordCount / words.length;
    }

    setupContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            const selection = window.getSelection().toString().trim();
            if (selection.length > 20) {
                // Store selection for context menu action
                chrome.storage.local.set({ 
                    contextSelection: selection,
                    contextUrl: window.location.href 
                });
            }
        });
    }

    createAnalysisWidget() {
        // Create floating analysis widget (initially hidden)
        this.analysisWidget = document.createElement('div');
        this.analysisWidget.id = 'legalish-analysis-widget';
        this.analysisWidget.innerHTML = `
            <div class="legalish-widget-header">
                <img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="Legalish">
                <span>Legalish Analysis</span>
                <button class="legalish-close-btn">&times;</button>
            </div>
            <div class="legalish-widget-body">
                <div class="legalish-loading">
                    <div class="legalish-spinner"></div>
                    <span>Analyzing document...</span>
                </div>
                <div class="legalish-results" style="display: none;"></div>
            </div>
        `;

        document.body.appendChild(this.analysisWidget);

        // Add close handler
        this.analysisWidget.querySelector('.legalish-close-btn').addEventListener('click', () => {
            this.hideAnalysisWidget();
        });
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'analyzeSelection') {
                this.analyzeSelectedText();
            } else if (request.action === 'analyzePage') {
                this.analyzePageContent();
            } else if (request.action === 'getPageText') {
                sendResponse({ text: document.body.innerText });
            } else if (request.action === 'getSelection') {
                sendResponse({ text: window.getSelection().toString() });
            }
        });
    }

    async analyzeSelectedText() {
        if (!this.selectedText) {
            this.selectedText = window.getSelection().toString().trim();
        }

        if (this.selectedText.length < 10) {
            this.showError('Please select more text to analyze (minimum 10 characters)');
            return;
        }

        this.showAnalysisWidget();
        await this.performAnalysis(this.selectedText);
    }

    async analyzePageContent() {
        const pageText = document.body.innerText;
        if (pageText.length < 100) {
            this.showError('Page content is too short to analyze');
            return;
        }

        this.showAnalysisWidget();
        await this.performAnalysis(pageText.substring(0, 2800));
    }

    async performAnalysis(text) {
        try {
            // Get auth token from storage
            const { authToken } = await chrome.storage.local.get(['authToken']);
            
            const headers = {
                'Content-Type': 'application/json',
            };

            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch('https://your-supabase-url.supabase.co/functions/v1/analyze-legal-terms-rag', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    legal_terms: text,
                    tone: 'serious',
                    max_tokens: 1500,
                    temperature: 0.7,
                    document_type: 'general'
                })
            });

            if (!response.ok) {
                throw new Error(`Analysis failed: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                this.displayAnalysisResults(result.data);
            } else {
                throw new Error(result.error || 'Analysis failed');
            }

        } catch (error) {
            console.error('Analysis error:', error);
            this.showError('Analysis failed. Please try again.');
        }
    }

    showAnalysisWidget() {
        this.analysisWidget.style.display = 'block';
        this.analysisWidget.querySelector('.legalish-loading').style.display = 'flex';
        this.analysisWidget.querySelector('.legalish-results').style.display = 'none';
    }

    hideAnalysisWidget() {
        this.analysisWidget.style.display = 'none';
    }

    displayAnalysisResults(data) {
        const resultsDiv = this.analysisWidget.querySelector('.legalish-results');
        resultsDiv.innerHTML = '';

        // Display summary
        if (data.summary && data.summary.length > 0) {
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'legalish-summary';
            summaryDiv.innerHTML = `
                <h4>Summary</h4>
                <p>${data.summary[0].description}</p>
            `;
            resultsDiv.appendChild(summaryDiv);
        }

        // Display red flags
        if (data.red_flags && data.red_flags.length > 0) {
            const redFlagsDiv = document.createElement('div');
            redFlagsDiv.className = 'legalish-red-flags';
            redFlagsDiv.innerHTML = `
                <h4>Red Flags (${data.red_flags.length})</h4>
                ${data.red_flags.map(flag => `
                    <div class="legalish-red-flag">
                        <span class="legalish-flag-icon">⚠️</span>
                        <span>${flag}</span>
                    </div>
                `).join('')}
            `;
            resultsDiv.appendChild(redFlagsDiv);
        }

        // Add action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'legalish-actions';
        actionsDiv.innerHTML = `
            <button class="legalish-btn legalish-btn-primary" onclick="window.open('https://your-legalish-app.com/summary', '_blank')">
                View Full Analysis
            </button>
            <button class="legalish-btn legalish-btn-secondary" onclick="this.closest('#legalish-analysis-widget').style.display='none'">
                Close
            </button>
        `;
        resultsDiv.appendChild(actionsDiv);

        // Show results
        this.analysisWidget.querySelector('.legalish-loading').style.display = 'none';
        resultsDiv.style.display = 'block';
    }

    openAnalysisPopup() {
        // Send message to background script to open popup
        chrome.runtime.sendMessage({ action: 'openPopup' });
    }

    updateExtensionBadge() {
        chrome.runtime.sendMessage({ 
            action: 'updateBadge', 
            text: '!',
            color: '#ef4444'
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'legalish-error';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
}

// Initialize content script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LegalishContentScript();
    });
} else {
    new LegalishContentScript();
}