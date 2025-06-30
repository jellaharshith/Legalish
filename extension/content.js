// Content script for Legalish Chrome Extension
// This script runs on all web pages to detect legal content and provide analysis features

class LegalishContentScript {
    constructor() {
        this.isInjected = false;
        this.selectedText = '';
        this.legalContentDetected = false;
        this.analysisWidget = null;
        this.userSubscriptionTier = 'free'; // Default to free
        
        this.init();
    }

    init() {
        // Avoid double injection
        if (window.legalishInjected) return;
        window.legalishInjected = true;

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupContentScript();
            });
        } else {
            this.setupContentScript();
        }
    }

    async setupContentScript() {
        try {
            // Check user subscription status first
            await this.checkUserSubscription();
            
            this.detectLegalContent();
            this.setupTextSelection();
            this.setupContextMenu();
            this.createAnalysisWidget();
            this.setupMessageListener();
        } catch (error) {
            console.error('Error setting up content script:', error);
        }
    }
    
    async checkUserSubscription() {
        try {
            if (chrome.storage && chrome.storage.local) {
                const { subscription_tier } = await chrome.storage.local.get(['subscription_tier']);
                if (subscription_tier) {
                    this.userSubscriptionTier = subscription_tier;
                }
            }
        } catch (error) {
            console.error('Error checking user subscription:', error);
        }
    }

    detectLegalContent() {
        try {
            const legalKeywords = [
                'terms of service', 'terms and conditions', 'privacy policy',
                'user agreement', 'license agreement', 'end user license',
                'terms of use', 'service agreement', 'legal notice',
                'cookie policy', 'data protection', 'gdpr', 'ccpa',
                'acceptable use', 'community guidelines', 'code of conduct',
                'credit card agreement', 'cardholder agreement', 'mastercard', 'visa',
                'lease agreement', 'rental agreement', 'residential lease',
                'employment agreement', 'employment contract', 'work agreement'
            ];

            const pageText = document.body ? document.body.innerText.toLowerCase() : '';
            const pageTitle = document.title ? document.title.toLowerCase() : '';
            const pageUrl = window.location ? window.location.href.toLowerCase() : '';

            // Special handling for PDF files
            const isPDF = pageUrl.includes('.pdf') || 
                         document.contentType === 'application/pdf' ||
                         pageTitle.includes('.pdf') ||
                         document.querySelector('embed[type="application/pdf"]') ||
                         document.querySelector('object[type="application/pdf"]');

            // Check for legal keywords
            const hasLegalKeywords = legalKeywords.some(keyword => 
                pageText.includes(keyword) || pageTitle.includes(keyword) || pageUrl.includes(keyword)
            );

            // Check for legal document patterns
            const hasLegalPatterns = /\b(shall|hereby|whereas|therefore|notwithstanding|pursuant|landlord|tenant|lessee|lessor|agreement|contract)\b/gi.test(pageText);
            
            // Check for numbered sections (common in legal docs)
            const hasNumberedSections = /\b\d+\.\s*[A-Z][^.]*\./g.test(pageText);
            
            // PDF files are more likely to be legal documents
            const pdfBonus = isPDF ? 0.3 : 0;
            
            const confidence = (hasLegalKeywords ? 0.4 : 0) + 
                              (hasLegalPatterns ? 0.3 : 0) + 
                              (hasNumberedSections ? 0.3 : 0) + 
                              pdfBonus;

            this.legalContentDetected = confidence > 0.4; // Lower threshold for PDFs

            if (this.legalContentDetected || isPDF) {
                this.showLegalContentIndicator(isPDF);
                this.updateExtensionBadge();
            }
        } catch (error) {
            console.error('Error detecting legal content:', error);
        }
    }

    showLegalContentIndicator(isPDF = false) {
        try {
            // Create a subtle indicator that legal content was detected
            const indicator = document.createElement('div');
            indicator.id = 'legalish-indicator';
            
            const message = isPDF ? 'PDF document detected' : 'Legal document detected';
            
            // Different button text based on subscription
            const buttonText = this.userSubscriptionTier === 'pro' ? 'Analyze' : 'Pro Feature';
            
            indicator.innerHTML = `
                <div class="legalish-indicator-content">
                    <img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="Legalish">
                    <span>${message}</span>
                    <button class="legalish-analyze-btn ${this.userSubscriptionTier !== 'pro' ? 'pro-btn' : ''}">
                        ${buttonText}
                        ${this.userSubscriptionTier !== 'pro' ? '<span class="pro-badge">PRO</span>' : ''}
                    </button>
                </div>
            `;
            
            if (document.body) {
                document.body.appendChild(indicator);

                // Add click handler
                const analyzeBtn = indicator.querySelector('.legalish-analyze-btn');
                if (analyzeBtn) {
                    analyzeBtn.addEventListener('click', () => {
                        if (this.userSubscriptionTier !== 'pro') {
                            this.showProFeatureMessage('document analysis');
                        } else if (isPDF) {
                            this.analyzePDFByURL();
                        } else {
                            this.openAnalysisPopup();
                        }
                    });
                }

                // Auto-hide after 8 seconds for PDFs (give more time to notice)
                setTimeout(() => {
                    if (indicator && indicator.parentNode) {
                        indicator.style.transform = 'translateY(-100%)';
                    }
                }, isPDF ? 8000 : 5000);
                
                // Add Pro-only CSS if not already added
                if (!document.getElementById('pro-features-css')) {
                    const style = document.createElement('style');
                    style.id = 'pro-features-css';
                    style.textContent = `
                        .pro-btn {
                            background: linear-gradient(135deg, #a855f7, #3b82f6) !important;
                            position: relative;
                        }
                        
                        .pro-badge {
                            position: absolute;
                            top: -8px;
                            right: -8px;
                            background: #ef4444;
                            color: white;
                            font-size: 8px;
                            font-weight: bold;
                            padding: 2px 4px;
                            border-radius: 4px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
        } catch (error) {
            console.error('Error showing legal content indicator:', error);
        }
    }

    async analyzePDFByURL() {
        // Check if user is a Pro subscriber
        if (this.userSubscriptionTier !== 'pro') {
            this.showProFeatureMessage('PDF analysis');
            return;
        }
        
        try {
            const currentUrl = window.location.href;
            
            // Show analysis widget
            this.showAnalysisWidget();
            
            // Perform URL-based analysis
            await this.performURLAnalysis(currentUrl);
        } catch (error) {
            console.error('Error analyzing PDF by URL:', error);
            this.showError('Failed to analyze PDF. Please try again.');
        }
    }

    async performURLAnalysis(url) {
        try {
            // Get auth token from storage
            let authToken = null;
            if (chrome.storage && chrome.storage.local) {
                const result = await chrome.storage.local.get(['authToken']);
                authToken = result.authToken;
            }
            
            const headers = {
                'Content-Type': 'application/json',
            };

            // Use your actual Supabase anon key
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            } else {
                // Updated with your actual Supabase anon key
                headers['Authorization'] = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4d2lsaGJpdGxqZWVpaHB2c2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODUzNjQsImV4cCI6MjA2NDY2MTM2NH0.EhFUUngApIPqLfpSHg_0ajRkgN6Krg9BmZd5RXEq6NQ`;
            }

            // Use your actual Supabase project URL
            const supabaseUrl = 'https://txwilhbitljeeihpvscr.supabase.co';
            const apiUrl = `${supabaseUrl}/functions/v1/analyze-legal-terms-rag`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    input_url: url,
                    tone: 'serious',
                    max_tokens: 1500,
                    temperature: 0.7,
                    document_type: 'general'
                })
            });

            if (!response.ok) {
                throw new Error(`Analysis failed: ${response.status} - ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.success) {
                this.displayAnalysisResults(result.data);
            } else {
                throw new Error(result.error || 'Analysis failed');
            }

        } catch (error) {
            console.error('URL Analysis error:', error);
            
            // Show a more helpful error message
            if (error.message.includes('Failed to fetch')) {
                this.showError('Network error. Please check your internet connection.');
            } else if (error.message.includes('404')) {
                this.showError('Analysis service not found. Please try again later.');
            } else if (error.message.includes('401') || error.message.includes('403')) {
                this.showError('Authentication required. Please sign in to the Legalish website first.');
            } else {
                this.showError('Analysis failed. Please try again.');
            }
        }
    }

    setupTextSelection() {
        let selectionTimeout;

        document.addEventListener('mouseup', () => {
            clearTimeout(selectionTimeout);
            selectionTimeout = setTimeout(() => {
                try {
                    const selection = window.getSelection();
                    const selectedText = selection ? selection.toString().trim() : '';
                    
                    if (selectedText.length > 50) {
                        this.selectedText = selectedText;
                        this.showSelectionWidget(selection);
                    } else {
                        this.hideSelectionWidget();
                    }
                } catch (error) {
                    console.error('Error handling text selection:', error);
                }
            }, 100);
        });

        document.addEventListener('mousedown', () => {
            this.hideSelectionWidget();
        });
    }

    showSelectionWidget(selection) {
        try {
            // Remove existing widget
            this.hideSelectionWidget();

            // Check if selected text looks legal
            const legalScore = this.calculateLegalScore(this.selectedText);
            if (legalScore < 0.3) return; // Not legal enough

            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            const widget = document.createElement('div');
            widget.id = 'legalish-selection-widget';
            
            // Different button text based on subscription
            const buttonText = this.userSubscriptionTier === 'pro' ? 'Analyze' : 'Pro Feature';
            
            widget.innerHTML = `
                <div class="legalish-widget-content">
                    <img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="Legalish">
                    <span>Analyze with Legalish</span>
                    <button class="legalish-widget-btn ${this.userSubscriptionTier !== 'pro' ? 'pro-btn' : ''}">
                        ${buttonText}
                        ${this.userSubscriptionTier !== 'pro' ? '<span class="pro-badge">PRO</span>' : ''}
                    </button>
                </div>
            `;

            // Position widget near selection
            widget.style.left = `${rect.left + window.scrollX}px`;
            widget.style.top = `${rect.bottom + window.scrollY + 10}px`;

            if (document.body) {
                document.body.appendChild(widget);

                // Add click handler
                const analyzeBtn = widget.querySelector('.legalish-widget-btn');
                if (analyzeBtn) {
                    analyzeBtn.addEventListener('click', () => {
                        if (this.userSubscriptionTier !== 'pro') {
                            this.showProFeatureMessage('text selection analysis');
                        } else {
                            this.analyzeSelectedText();
                        }
                    });
                }

                // Auto-hide after 10 seconds
                setTimeout(() => {
                    this.hideSelectionWidget();
                }, 10000);
                
                // Add Pro-only CSS if not already added
                if (!document.getElementById('pro-features-css')) {
                    const style = document.createElement('style');
                    style.id = 'pro-features-css';
                    style.textContent = `
                        .pro-btn {
                            background: linear-gradient(135deg, #a855f7, #3b82f6) !important;
                            position: relative;
                        }
                        
                        .pro-badge {
                            position: absolute;
                            top: -8px;
                            right: -8px;
                            background: #ef4444;
                            color: white;
                            font-size: 8px;
                            font-weight: bold;
                            padding: 2px 4px;
                            border-radius: 4px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
        } catch (error) {
            console.error('Error showing selection widget:', error);
        }
    }

    hideSelectionWidget() {
        try {
            const widget = document.getElementById('legalish-selection-widget');
            if (widget) {
                widget.remove();
            }
        } catch (error) {
            console.error('Error hiding selection widget:', error);
        }
    }

    calculateLegalScore(text) {
        try {
            const legalTerms = [
                'agreement', 'contract', 'terms', 'conditions', 'policy', 'license',
                'shall', 'hereby', 'whereas', 'therefore', 'pursuant', 'notwithstanding',
                'liability', 'damages', 'indemnify', 'warranty', 'disclaimer',
                'intellectual property', 'confidential', 'proprietary', 'terminate',
                'landlord', 'tenant', 'lessee', 'lessor', 'rent', 'lease', 'deposit'
            ];

            const words = text.toLowerCase().split(/\s+/);
            const legalWordCount = words.filter(word => 
                legalTerms.some(term => word.includes(term))
            ).length;

            return legalWordCount / words.length;
        } catch (error) {
            console.error('Error calculating legal score:', error);
            return 0;
        }
    }

    setupContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            try {
                const selection = window.getSelection();
                const selectedText = selection ? selection.toString().trim() : '';
                if (selectedText.length > 20) {
                    // Store selection for context menu action
                    if (chrome.storage && chrome.storage.local) {
                        chrome.storage.local.set({ 
                            contextSelection: selectedText,
                            contextUrl: window.location.href 
                        });
                    }
                }
            } catch (error) {
                console.error('Error setting up context menu:', error);
            }
        });
    }

    createAnalysisWidget() {
        try {
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

            if (document.body) {
                document.body.appendChild(this.analysisWidget);

                // Add close handler
                const closeBtn = this.analysisWidget.querySelector('.legalish-close-btn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        this.hideAnalysisWidget();
                    });
                }
            }
        } catch (error) {
            console.error('Error creating analysis widget:', error);
        }
    }

    setupMessageListener() {
        if (chrome.runtime && chrome.runtime.onMessage) {
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                try {
                    if (request.action === 'analyzeSelection') {
                        // Check if user is a Pro subscriber
                        if (this.userSubscriptionTier !== 'pro') {
                            this.showProFeatureMessage('text selection analysis');
                            return;
                        }
                        this.analyzeSelectedText();
                    } else if (request.action === 'analyzePage') {
                        // Check if user is a Pro subscriber
                        if (this.userSubscriptionTier !== 'pro') {
                            this.showProFeatureMessage('page analysis');
                            return;
                        }
                        this.analyzePageContent();
                    } else if (request.action === 'getPageText') {
                        sendResponse({ text: document.body ? document.body.innerText : '' });
                    } else if (request.action === 'getSelection') {
                        const selection = window.getSelection();
                        sendResponse({ text: selection ? selection.toString() : '' });
                    } else if (request.action === 'updateSubscriptionTier') {
                        this.userSubscriptionTier = request.subscriptionTier || 'free';
                    } else if (request.action === 'showProFeatureMessage') {
                        this.showProFeatureMessage(request.featureName || 'this feature');
                    }
                } catch (error) {
                    console.error('Error handling message:', error);
                }
            });
        }
    }

    async analyzeSelectedText() {
        // Check if user is a Pro subscriber
        if (this.userSubscriptionTier !== 'pro') {
            this.showProFeatureMessage('text selection analysis');
            return;
        }
        
        try {
            if (!this.selectedText) {
                const selection = window.getSelection();
                this.selectedText = selection ? selection.toString().trim() : '';
            }

            if (this.selectedText.length < 10) {
                this.showError('Please select more text to analyze (minimum 10 characters)');
                return;
            }

            this.showAnalysisWidget();
            await this.performAnalysis(this.selectedText);
        } catch (error) {
            console.error('Error analyzing selected text:', error);
            this.showError('Analysis failed. Please try again.');
        }
    }

    async analyzePageContent() {
        // Check if user is a Pro subscriber
        if (this.userSubscriptionTier !== 'pro') {
            this.showProFeatureMessage('page analysis');
            return;
        }
        
        try {
            // Check if this is a PDF
            const isPDF = window.location.href.includes('.pdf') || 
                         document.contentType === 'application/pdf' ||
                         document.title.includes('.pdf');

            if (isPDF) {
                // For PDFs, use URL-based analysis
                await this.analyzePDFByURL();
                return;
            }

            // For regular pages, extract text content
            const pageText = document.body ? document.body.innerText : '';
            if (pageText.length < 100) {
                this.showError('Page content is too short to analyze');
                return;
            }

            this.showAnalysisWidget();
            await this.performAnalysis(pageText.substring(0, 2800));
        } catch (error) {
            console.error('Error analyzing page content:', error);
            this.showError('Analysis failed. Please try again.');
        }
    }

    async performAnalysis(text) {
        try {
            // Get auth token from storage
            let authToken = null;
            if (chrome.storage && chrome.storage.local) {
                const result = await chrome.storage.local.get(['authToken']);
                authToken = result.authToken;
            }
            
            const headers = {
                'Content-Type': 'application/json',
            };

            // Use your actual Supabase anon key
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            } else {
                // Updated with your actual Supabase anon key
                headers['Authorization'] = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4d2lsaGJpdGxqZWVpaHB2c2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODUzNjQsImV4cCI6MjA2NDY2MTM2NH0.EhFUUngApIPqLfpSHg_0ajRkgN6Krg9BmZd5RXEq6NQ`;
            }

            // Use your actual Supabase project URL
            const supabaseUrl = 'https://txwilhbitljeeihpvscr.supabase.co';
            const apiUrl = `${supabaseUrl}/functions/v1/analyze-legal-terms-rag`;

            const response = await fetch(apiUrl, {
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
                throw new Error(`Analysis failed: ${response.status} - ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.success) {
                this.displayAnalysisResults(result.data);
            } else {
                throw new Error(result.error || 'Analysis failed');
            }

        } catch (error) {
            console.error('Analysis error:', error);
            
            // Show a more helpful error message
            if (error.message.includes('Failed to fetch')) {
                this.showError('Network error. Please check your internet connection.');
            } else if (error.message.includes('404')) {
                this.showError('Analysis service not found. Please try again later.');
            } else if (error.message.includes('401') || error.message.includes('403')) {
                this.showError('Authentication required. Please sign in to the Legalish website first.');
            } else {
                this.showError('Analysis failed. Please try again.');
            }
        }
    }

    showAnalysisWidget() {
        if (this.analysisWidget) {
            this.analysisWidget.style.display = 'block';
            const loading = this.analysisWidget.querySelector('.legalish-loading');
            const results = this.analysisWidget.querySelector('.legalish-results');
            if (loading) loading.style.display = 'flex';
            if (results) results.style.display = 'none';
        }
    }

    hideAnalysisWidget() {
        if (this.analysisWidget) {
            this.analysisWidget.style.display = 'none';
        }
    }

    displayAnalysisResults(data) {
        try {
            if (!this.analysisWidget) return;

            const resultsDiv = this.analysisWidget.querySelector('.legalish-results');
            if (!resultsDiv) return;

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
                <button class="legalish-btn legalish-btn-primary" onclick="window.open('https://legalish.site/summary', '_blank')">
                    View Full Analysis
                </button>
                <button class="legalish-btn legalish-btn-secondary" onclick="this.closest('#legalish-analysis-widget').style.display='none'">
                    Close
                </button>
            `;
            resultsDiv.appendChild(actionsDiv);

            // Show results
            const loading = this.analysisWidget.querySelector('.legalish-loading');
            if (loading) loading.style.display = 'none';
            resultsDiv.style.display = 'block';
        } catch (error) {
            console.error('Error displaying analysis results:', error);
        }
    }

    openAnalysisPopup() {
        try {
            // Send message to background script to open popup
            if (chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({ action: 'openPopup' });
            }
        } catch (error) {
            console.error('Error opening analysis popup:', error);
        }
    }

    updateExtensionBadge() {
        try {
            if (chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({ 
                    action: 'updateBadge', 
                    text: '!',
                    color: '#ef4444'
                });
            }
        } catch (error) {
            console.error('Error updating extension badge:', error);
        }
    }

    showError(message) {
        try {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'legalish-error';
            errorDiv.textContent = message;
            if (document.body) {
                document.body.appendChild(errorDiv);

                setTimeout(() => {
                    if (errorDiv && errorDiv.parentNode) {
                        errorDiv.remove();
                    }
                }, 3000);
            }
        } catch (error) {
            console.error('Error showing error message:', error);
        }
    }
    
    showProFeatureMessage(featureName) {
        try {
            // Create a modal-like overlay for Pro feature message
            const modalOverlay = document.createElement('div');
            modalOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                backdrop-filter: blur(4px);
            `;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #581c87 100%);
                border-radius: 12px;
                padding: 24px;
                max-width: 320px;
                width: 100%;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                text-align: center;
                border: 1px solid rgba(255, 255, 255, 0.1);
            `;
            
            modalContent.innerHTML = `
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #a855f7, #3b82f6); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                </div>
                <h3 style="color: white; font-size: 18px; margin-bottom: 8px;">Pro Feature</h3>
                <p style="color: #e2e8f0; margin-bottom: 20px; font-size: 14px;">
                    ${featureName.charAt(0).toUpperCase() + featureName.slice(1)} is available exclusively for Pro subscribers.
                </p>
                <button id="upgrade-pro-btn" style="background: linear-gradient(135deg, #a855f7, #3b82f6); color: white; border: none; border-radius: 6px; padding: 10px 16px; font-weight: 600; cursor: pointer; width: 100%; margin-bottom: 12px;">
                    Upgrade to Pro
                </button>
                <button id="close-pro-modal" style="background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; padding: 8px 16px; font-weight: 500; cursor: pointer; width: 100%;">
                    Maybe Later
                </button>
            `;
            
            document.body.appendChild(modalOverlay);
            modalOverlay.appendChild(modalContent);
            
            // Add event listeners
            const upgradeBtn = document.getElementById('upgrade-pro-btn');
            const closeBtn = document.getElementById('close-pro-modal');
            
            if (upgradeBtn) {
                upgradeBtn.addEventListener('click', () => {
                    window.open('https://legalish.site/upgrade', '_blank');
                    modalOverlay.remove();
                });
            }
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modalOverlay.remove();
                });
            }
            
            // Auto-close after 10 seconds
            setTimeout(() => {
                if (modalOverlay && modalOverlay.parentNode) {
                    modalOverlay.remove();
                }
            }, 10000);
        } catch (error) {
            console.error('Error showing Pro feature message:', error);
        }
    }
}

// Initialize content script
try {
    new LegalishContentScript();
} catch (error) {
    console.error('Error initializing content script:', error);
}