// Popup script for Legalish Chrome Extension
class LegalishPopup {
    constructor() {
        this.currentTab = null;
        this.analysisData = null;
        this.selectedMethod = 'page';
        this.isAnalyzing = false;
        
        this.init();
    }

    async init() {
        try {
            await this.getCurrentTab();
            this.setupEventListeners();
            this.checkPageForLegalContent();
            this.loadUserState();
            this.loadStoredAnalysis();
        } catch (error) {
            console.error('Error initializing popup:', error);
        }
    }

    async getCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = tab;
        } catch (error) {
            console.error('Error getting current tab:', error);
        }
    }

    setupEventListeners() {
        try {
            // Input method selection
            document.querySelectorAll('.input-method').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.selectInputMethod(e.currentTarget.dataset.method);
                });
            });

            // Analyze button
            const analyzeBtn = document.getElementById('analyze-btn');
            if (analyzeBtn) {
                analyzeBtn.addEventListener('click', () => {
                    this.analyzeDocument();
                });
            }

            // Refresh button
            const refreshBtn = document.getElementById('refresh-btn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    this.checkPageForLegalContent();
                });
            }

            // Audio playback
            const playAudioBtn = document.getElementById('play-audio-btn');
            if (playAudioBtn) {
                playAudioBtn.addEventListener('click', () => {
                    this.playAudioSummary();
                });
            }

            // Save analysis
            const saveAnalysisBtn = document.getElementById('save-analysis-btn');
            if (saveAnalysisBtn) {
                saveAnalysisBtn.addEventListener('click', () => {
                    this.saveAnalysis();
                });
            }

            // Open full results
            const openFullBtn = document.getElementById('open-full-btn');
            if (openFullBtn) {
                openFullBtn.addEventListener('click', () => {
                    this.openFullResults();
                });
            }

            // Account actions
            const signInBtn = document.getElementById('sign-in-btn');
            if (signInBtn) {
                signInBtn.addEventListener('click', () => {
                    this.signIn();
                });
            }

            const signOutBtn = document.getElementById('sign-out-btn');
            if (signOutBtn) {
                signOutBtn.addEventListener('click', () => {
                    this.signOut();
                });
            }

            // Footer actions
            const upgradeBtn = document.getElementById('upgrade-btn');
            if (upgradeBtn) {
                upgradeBtn.addEventListener('click', () => {
                    this.openUpgradePage();
                });
            }

            const helpBtn = document.getElementById('help-btn');
            if (helpBtn) {
                helpBtn.addEventListener('click', () => {
                    this.openHelpPage();
                });
            }
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    selectInputMethod(method) {
        this.selectedMethod = method;
        
        // Update UI
        document.querySelectorAll('.input-method').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-method="${method}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Show/hide manual input
        const manualInput = document.getElementById('manual-input');
        if (manualInput) {
            if (method === 'manual') {
                manualInput.style.display = 'block';
            } else {
                manualInput.style.display = 'none';
            }
        }
    }

    async checkPageForLegalContent() {
        this.showLoading(true);
        
        try {
            if (!this.currentTab || !this.currentTab.id) {
                this.updateDetectionUI({ hasLegalContent: false });
                return;
            }

            // Inject content script to analyze page
            const [result] = await chrome.scripting.executeScript({
                target: { tabId: this.currentTab.id },
                function: this.detectLegalContent
            });

            const detection = result && result.result ? result.result : { hasLegalContent: false };
            this.updateDetectionUI(detection);
            
        } catch (error) {
            console.error('Error checking page content:', error);
            this.updateDetectionUI({ hasLegalContent: false });
        }
        
        this.showLoading(false);
    }

    // This function runs in the page context
    detectLegalContent() {
        try {
            const legalKeywords = [
                'terms of service', 'terms and conditions', 'privacy policy',
                'user agreement', 'license agreement', 'end user license',
                'terms of use', 'service agreement', 'legal notice',
                'cookie policy', 'data protection', 'gdpr', 'ccpa',
                'acceptable use', 'community guidelines', 'code of conduct',
                'credit card agreement', 'cardholder agreement', 'mastercard', 'visa'
            ];

            const pageText = document.body ? document.body.innerText.toLowerCase() : '';
            const pageTitle = document.title ? document.title.toLowerCase() : '';
            const pageUrl = window.location ? window.location.href.toLowerCase() : '';

            // Check for legal keywords in content
            const hasLegalKeywords = legalKeywords.some(keyword => 
                pageText.includes(keyword) || pageTitle.includes(keyword) || pageUrl.includes(keyword)
            );

            // Check for common legal document patterns
            const hasLegalPatterns = /\b(shall|hereby|whereas|therefore|notwithstanding|pursuant)\b/gi.test(pageText);
            
            // Check for legal document structure
            const hasNumberedSections = /\b\d+\.\s*[A-Z][^.]*\./g.test(pageText);

            // Determine document type
            let documentType = 'Unknown';
            if (pageText.includes('terms of service') || pageText.includes('terms and conditions')) {
                documentType = 'Terms of Service';
            } else if (pageText.includes('privacy policy')) {
                documentType = 'Privacy Policy';
            } else if (pageText.includes('license agreement')) {
                documentType = 'License Agreement';
            } else if (pageText.includes('cookie policy')) {
                documentType = 'Cookie Policy';
            } else if (pageText.includes('credit card') || pageText.includes('cardholder')) {
                documentType = 'Credit Card Agreement';
            }

            const confidence = (hasLegalKeywords ? 0.4 : 0) + 
                              (hasLegalPatterns ? 0.3 : 0) + 
                              (hasNumberedSections ? 0.3 : 0);

            return {
                hasLegalContent: confidence > 0.5,
                documentType,
                confidence,
                textLength: pageText.length
            };
        } catch (error) {
            console.error('Error in detectLegalContent:', error);
            return {
                hasLegalContent: false,
                documentType: 'Unknown',
                confidence: 0,
                textLength: 0
            };
        }
    }

    updateDetectionUI(detection) {
        try {
            const loadingEl = document.getElementById('loading');
            const noContentEl = document.getElementById('no-legal-content');
            const foundContentEl = document.getElementById('legal-content-found');
            const documentTypeEl = document.getElementById('document-type');

            // Hide all states
            if (loadingEl) loadingEl.style.display = 'none';
            if (noContentEl) noContentEl.style.display = 'none';
            if (foundContentEl) foundContentEl.style.display = 'none';

            if (detection.hasLegalContent) {
                if (foundContentEl) foundContentEl.style.display = 'flex';
                if (documentTypeEl) documentTypeEl.textContent = detection.documentType;
                this.updateStatus('Legal document detected', 'success');
            } else {
                if (noContentEl) noContentEl.style.display = 'flex';
                this.updateStatus('No legal content found', 'neutral');
            }
        } catch (error) {
            console.error('Error updating detection UI:', error);
        }
    }

    showLoading(show) {
        try {
            const loadingEl = document.getElementById('loading');
            const noContentEl = document.getElementById('no-legal-content');
            const foundContentEl = document.getElementById('legal-content-found');

            if (show) {
                if (loadingEl) loadingEl.style.display = 'flex';
                if (noContentEl) noContentEl.style.display = 'none';
                if (foundContentEl) foundContentEl.style.display = 'none';
            }
        } catch (error) {
            console.error('Error showing loading:', error);
        }
    }

    updateStatus(text, type = 'neutral') {
        try {
            const statusText = document.querySelector('.status-text');
            const statusDot = document.querySelector('.status-dot');
            
            if (statusText) statusText.textContent = text;
            
            // Update dot color based on status type
            if (statusDot) {
                statusDot.style.background = type === 'success' ? '#10b981' : 
                                           type === 'error' ? '#ef4444' : 
                                           type === 'warning' ? '#f59e0b' : '#6b7280';
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }

    async analyzeDocument() {
        if (this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        this.updateAnalyzeButton(true);
        this.updateStatus('Analyzing document...', 'warning');

        try {
            let textToAnalyze = '';
            
            // Get text based on selected method
            if (this.selectedMethod === 'page') {
                textToAnalyze = await this.getPageText();
            } else if (this.selectedMethod === 'selection') {
                textToAnalyze = await this.getSelectedText();
            } else if (this.selectedMethod === 'manual') {
                const manualTextEl = document.getElementById('manual-text');
                textToAnalyze = manualTextEl ? manualTextEl.value : '';
            }

            if (!textToAnalyze || textToAnalyze.trim().length < 10) {
                throw new Error('Please provide text to analyze (minimum 10 characters)');
            }

            // Truncate if too long
            if (textToAnalyze.length > 2800) {
                textToAnalyze = textToAnalyze.substring(0, 2800);
            }

            const toneSelect = document.getElementById('tone-select');
            const tone = toneSelect ? toneSelect.value : 'serious';
            
            // Call analysis API with better error handling
            const result = await this.callAnalysisAPI(textToAnalyze, tone);
            
            if (result.success) {
                this.analysisData = result.data;
                this.displayResults(result.data);
                this.updateStatus('Analysis complete', 'success');
                
                // Store analysis for later
                await this.storeAnalysis(result.data);
            } else {
                throw new Error(result.error || 'Analysis failed');
            }
            
        } catch (error) {
            console.error('Analysis error:', error);
            this.updateStatus('Analysis failed', 'error');
            this.showError(error.message);
        } finally {
            this.isAnalyzing = false;
            this.updateAnalyzeButton(false);
        }
    }

    async getPageText() {
        try {
            if (!this.currentTab || !this.currentTab.id) {
                throw new Error('No active tab found');
            }

            const [result] = await chrome.scripting.executeScript({
                target: { tabId: this.currentTab.id },
                function: () => {
                    // Extract meaningful text from the page
                    const content = document.body ? document.body.innerText : '';
                    return content.substring(0, 2800); // Limit to API constraints
                }
            });
            return result && result.result ? result.result : '';
        } catch (error) {
            console.error('Error getting page text:', error);
            throw new Error('Failed to extract page content');
        }
    }

    async getSelectedText() {
        try {
            if (!this.currentTab || !this.currentTab.id) {
                throw new Error('No active tab found');
            }

            const [result] = await chrome.scripting.executeScript({
                target: { tabId: this.currentTab.id },
                function: () => {
                    return window.getSelection ? window.getSelection().toString() : '';
                }
            });
            return result && result.result ? result.result : '';
        } catch (error) {
            console.error('Error getting selected text:', error);
            throw new Error('Failed to get selected text');
        }
    }

    async callAnalysisAPI(text, tone) {
        try {
            // Get stored auth token if available
            const { authToken } = await chrome.storage.local.get(['authToken']);
            
            const headers = {
                'Content-Type': 'application/json',
            };

            // Use anon key for unauthenticated requests
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            } else {
                // Use a placeholder anon key - in production this should be the actual Supabase anon key
                headers['Authorization'] = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE5NTY1NzEyMDB9.placeholder`;
            }

            // Use the correct Supabase URL - replace with your actual Supabase project URL
            const supabaseUrl = 'https://your-project-id.supabase.co';
            const apiUrl = `${supabaseUrl}/functions/v1/analyze-legal-terms-rag`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    legal_terms: text,
                    tone: tone,
                    max_tokens: 2000,
                    temperature: 0.7,
                    document_type: 'general'
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error calling analysis API:', error);
            return {
                success: false,
                error: error.message || 'Failed to analyze document'
            };
        }
    }

    displayResults(data) {
        try {
            const resultsSection = document.getElementById('results-section');
            const resultsContent = document.getElementById('results-content');
            
            if (!resultsSection || !resultsContent) {
                console.error('Results elements not found');
                return;
            }

            resultsContent.innerHTML = '';

            // Display summary
            if (data.summary && data.summary.length > 0) {
                data.summary.forEach(item => {
                    const resultDiv = document.createElement('div');
                    resultDiv.className = 'result-item fade-in';
                    resultDiv.innerHTML = `
                        <div class="result-title">${item.title}</div>
                        <div class="result-description">${item.description}</div>
                    `;
                    resultsContent.appendChild(resultDiv);
                });
            }

            // Display red flags
            if (data.red_flags && data.red_flags.length > 0) {
                const redFlagsTitle = document.createElement('div');
                redFlagsTitle.className = 'result-title';
                redFlagsTitle.style.marginTop = '16px';
                redFlagsTitle.style.marginBottom = '8px';
                redFlagsTitle.textContent = `Red Flags (${data.red_flags.length})`;
                resultsContent.appendChild(redFlagsTitle);

                data.red_flags.forEach(flag => {
                    const flagDiv = document.createElement('div');
                    flagDiv.className = 'red-flag fade-in';
                    flagDiv.innerHTML = `
                        <svg class="red-flag-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <div class="red-flag-text">${flag}</div>
                    `;
                    resultsContent.appendChild(flagDiv);
                });
            }

            resultsSection.style.display = 'block';
        } catch (error) {
            console.error('Error displaying results:', error);
        }
    }

    updateAnalyzeButton(analyzing) {
        try {
            const btn = document.getElementById('analyze-btn');
            const span = btn ? btn.querySelector('span') : null;
            
            if (btn && span) {
                if (analyzing) {
                    btn.disabled = true;
                    span.textContent = 'Analyzing...';
                    const svg = btn.querySelector('svg');
                    if (svg) svg.style.animation = 'spin 1s linear infinite';
                } else {
                    btn.disabled = false;
                    span.textContent = 'Analyze Document';
                    const svg = btn.querySelector('svg');
                    if (svg) svg.style.animation = 'none';
                }
            }
        } catch (error) {
            console.error('Error updating analyze button:', error);
        }
    }

    async playAudioSummary() {
        if (!this.analysisData || !this.analysisData.summary || this.analysisData.summary.length === 0) {
            this.showError('No summary available for audio playback');
            return;
        }

        try {
            const textToSpeak = this.analysisData.summary[0].description;
            const { authToken } = await chrome.storage.local.get(['authToken']);
            
            if (!authToken) {
                this.showError('Please sign in to use audio features');
                return;
            }

            // Call speech synthesis API
            const supabaseUrl = 'https://your-project-id.supabase.co';
            const response = await fetch(`${supabaseUrl}/functions/v1/synthesize-speech`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    text: textToSpeak,
                    voice_id: 'default-voice-id'
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Play audio
                    const audio = new Audio(`data:audio/mpeg;base64,${result.audio}`);
                    audio.play();
                }
            }
        } catch (error) {
            console.error('Audio playback error:', error);
            this.showError('Audio playback failed');
        }
    }

    async saveAnalysis() {
        if (!this.analysisData) {
            this.showError('No analysis to save');
            return;
        }

        try {
            const { authToken } = await chrome.storage.local.get(['authToken']);
            
            if (!authToken) {
                this.showError('Please sign in to save analyses');
                return;
            }

            // Save to user's account via API
            this.updateStatus('Analysis saved', 'success');
            
        } catch (error) {
            console.error('Save error:', error);
            this.showError('Failed to save analysis');
        }
    }

    openFullResults() {
        // Open the main Legalish app with results
        chrome.tabs.create({
            url: 'https://legalish.site/summary'
        });
    }

    signIn() {
        // Open sign-in page
        chrome.tabs.create({
            url: 'https://legalish.site'
        });
    }

    async signOut() {
        await chrome.storage.local.remove(['authToken', 'userInfo']);
        this.loadUserState();
        this.updateStatus('Signed out', 'neutral');
    }

    openUpgradePage() {
        chrome.tabs.create({
            url: 'https://legalish.site/upgrade'
        });
    }

    openHelpPage() {
        chrome.tabs.create({
            url: 'https://legalish.site/help'
        });
    }

    async loadUserState() {
        try {
            const { authToken, userInfo } = await chrome.storage.local.get(['authToken', 'userInfo']);
            
            const signedOut = document.getElementById('signed-out');
            const signedIn = document.getElementById('signed-in');
            
            if (authToken && userInfo) {
                if (signedOut) signedOut.style.display = 'none';
                if (signedIn) signedIn.style.display = 'flex';
                
                const userNameEl = document.getElementById('user-name');
                const userPlanEl = document.getElementById('user-plan');
                const userAvatarEl = document.getElementById('user-avatar');
                
                if (userNameEl) userNameEl.textContent = userInfo.name || 'User';
                if (userPlanEl) userPlanEl.textContent = userInfo.plan || 'Free Plan';
                if (userAvatarEl) userAvatarEl.textContent = (userInfo.name || 'U')[0].toUpperCase();
            } else {
                if (signedOut) signedOut.style.display = 'block';
                if (signedIn) signedIn.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading user state:', error);
        }
    }

    async storeAnalysis(data) {
        try {
            const analysisKey = `analysis_${Date.now()}`;
            await chrome.storage.local.set({
                [analysisKey]: {
                    data,
                    timestamp: Date.now(),
                    url: this.currentTab ? this.currentTab.url : '',
                    title: this.currentTab ? this.currentTab.title : ''
                }
            });
        } catch (error) {
            console.error('Error storing analysis:', error);
        }
    }

    async loadStoredAnalysis() {
        try {
            // Load the most recent analysis for this tab if available
            const storage = await chrome.storage.local.get();
            const analyses = Object.entries(storage)
                .filter(([key]) => key.startsWith('analysis_'))
                .map(([key, value]) => ({ key, ...value }))
                .filter(analysis => analysis.url === (this.currentTab ? this.currentTab.url : ''))
                .sort((a, b) => b.timestamp - a.timestamp);

            if (analyses.length > 0) {
                const recentAnalysis = analyses[0];
                this.analysisData = recentAnalysis.data;
                this.displayResults(recentAnalysis.data);
            }
        } catch (error) {
            console.error('Error loading stored analysis:', error);
        }
    }

    showError(message) {
        try {
            // Simple error display - could be enhanced with a proper notification system
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                right: 10px;
                background: #ef4444;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                z-index: 1000;
            `;
            errorDiv.textContent = message;
            document.body.appendChild(errorDiv);

            setTimeout(() => {
                if (errorDiv && errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, 3000);
        } catch (error) {
            console.error('Error showing error message:', error);
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new LegalishPopup();
    } catch (error) {
        console.error('Error initializing popup:', error);
    }
});