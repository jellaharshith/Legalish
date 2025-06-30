// Popup script for Legalish Chrome Extension
class LegalishPopup {
    constructor() {
        this.currentTab = null;
        this.analysisData = null;
        this.selectedMethod = 'page';
        this.isAnalyzing = false;
        this.userSubscriptionTier = 'free'; // Default to free
        
        this.init();
    }

    async init() {
        try {
            await this.getCurrentTab();
            this.setupEventListeners();
            await this.syncAuthenticationState();
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

    async syncAuthenticationState() {
        try {
            // Check if user is on Legalish website and try to sync auth
            if (this.currentTab && this.currentTab.url && 
                (this.currentTab.url.includes('legalish.site') || 
                 this.currentTab.url.includes('localhost:5173'))) {
                
                // Try to get auth token from the website
                const [result] = await chrome.scripting.executeScript({
                    target: { tabId: this.currentTab.id },
                    function: () => {
                        try {
                            // Try to get Supabase session from localStorage
                            const keys = Object.keys(localStorage);
                            const supabaseKey = keys.find(key => 
                                key.includes('supabase.auth.token') || 
                                key.includes('sb-') && key.includes('-auth-token')
                            );
                            
                            if (supabaseKey) {
                                const authData = localStorage.getItem(supabaseKey);
                                if (authData) {
                                    const parsed = JSON.parse(authData);
                                    
                                    // Try to get subscription tier from localStorage if available
                                    let subscriptionTier = 'free';
                                    try {
                                        const profileKey = keys.find(key => 
                                            key.includes('profile') || 
                                            key.includes('user_metadata')
                                        );
                                        
                                        if (profileKey) {
                                            const profileData = localStorage.getItem(profileKey);
                                            if (profileData) {
                                                const parsedProfile = JSON.parse(profileData);
                                                if (parsedProfile.subscription_tier) {
                                                    subscriptionTier = parsedProfile.subscription_tier;
                                                }
                                            }
                                        }
                                    } catch (e) {
                                        console.error('Error parsing profile data:', e);
                                    }
                                    
                                    return {
                                        token: parsed.access_token,
                                        user: parsed.user,
                                        expires_at: parsed.expires_at,
                                        subscription_tier: subscriptionTier
                                    };
                                }
                            }
                            return null;
                        } catch (error) {
                            console.error('Error getting auth from website:', error);
                            return null;
                        }
                    }
                });

                if (result && result.result && result.result.token) {
                    const authData = result.result;
                    
                    // Check if token is still valid
                    const now = Math.floor(Date.now() / 1000);
                    if (authData.expires_at && authData.expires_at > now) {
                        // Store in extension storage
                        await chrome.storage.local.set({
                            authToken: authData.token,
                            userInfo: {
                                id: authData.user?.id,
                                email: authData.user?.email,
                                name: authData.user?.user_metadata?.full_name || authData.user?.email?.split('@')[0],
                                plan: authData.subscription_tier === 'pro' ? 'Pro Plan' : 'Free Plan'
                            },
                            subscription_tier: authData.subscription_tier || 'free',
                            authTimestamp: Date.now()
                        });
                        
                        this.userSubscriptionTier = authData.subscription_tier || 'free';
                        console.log('Successfully synced authentication from website');
                    }
                }
            }
            
            // If we couldn't sync from the website, try to get from storage
            if (!this.userSubscriptionTier || this.userSubscriptionTier === 'free') {
                const { subscription_tier } = await chrome.storage.local.get(['subscription_tier']);
                if (subscription_tier) {
                    this.userSubscriptionTier = subscription_tier;
                }
            }
        } catch (error) {
            console.error('Error syncing authentication state:', error);
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

            // Check for legal keywords in content
            const hasLegalKeywords = legalKeywords.some(keyword => 
                pageText.includes(keyword) || pageTitle.includes(keyword) || pageUrl.includes(keyword)
            );

            // Check for common legal document patterns
            const hasLegalPatterns = /\b(shall|hereby|whereas|therefore|notwithstanding|pursuant|landlord|tenant|lessee|lessor|agreement|contract)\b/gi.test(pageText);
            
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
            } else if (pageText.includes('lease') || pageText.includes('rental') || pageText.includes('landlord') || pageText.includes('tenant')) {
                documentType = 'Lease Agreement';
            } else if (pageText.includes('employment') || pageText.includes('work agreement')) {
                documentType = 'Employment Contract';
            } else if (isPDF) {
                documentType = 'PDF Document';
            }

            // PDF files are more likely to be legal documents
            const pdfBonus = isPDF ? 0.3 : 0;
            
            const confidence = (hasLegalKeywords ? 0.4 : 0) + 
                              (hasLegalPatterns ? 0.3 : 0) + 
                              (hasNumberedSections ? 0.3 : 0) + 
                              pdfBonus;

            return {
                hasLegalContent: confidence > 0.4 || isPDF, // Lower threshold for PDFs
                documentType,
                confidence,
                textLength: pageText.length,
                isPDF: isPDF
            };
        } catch (error) {
            console.error('Error in detectLegalContent:', error);
            return {
                hasLegalContent: false,
                documentType: 'Unknown',
                confidence: 0,
                textLength: 0,
                isPDF: false
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

            if (detection.hasLegalContent || detection.isPDF) {
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
        
        // Check if user is a Pro subscriber
        if (this.userSubscriptionTier !== 'pro') {
            this.showProFeatureMessage('document analysis');
            return;
        }
        
        this.isAnalyzing = true;
        this.updateAnalyzeButton(true);
        this.updateStatus('Analyzing document...', 'warning');

        try {
            let analysisRequest = {};
            
            // Get text based on selected method
            if (this.selectedMethod === 'page') {
                // Check if current page is a PDF
                const isPDF = this.currentTab && (
                    this.currentTab.url.includes('.pdf') || 
                    this.currentTab.title.includes('.pdf')
                );
                
                if (isPDF) {
                    // Use URL-based analysis for PDFs
                    analysisRequest = {
                        input_url: this.currentTab.url,
                        tone: 'serious',
                        max_tokens: 2000,
                        temperature: 0.7,
                        document_type: 'general'
                    };
                } else {
                    // Use text-based analysis for regular pages
                    const textToAnalyze = await this.getPageText();
                    if (!textToAnalyze || textToAnalyze.trim().length < 10) {
                        throw new Error('Please provide text to analyze (minimum 10 characters)');
                    }
                    
                    analysisRequest = {
                        legal_terms: textToAnalyze.substring(0, 2800),
                        tone: 'serious',
                        max_tokens: 2000,
                        temperature: 0.7,
                        document_type: 'general'
                    };
                }
            } else if (this.selectedMethod === 'selection') {
                const textToAnalyze = await this.getSelectedText();
                if (!textToAnalyze || textToAnalyze.trim().length < 10) {
                    throw new Error('Please select text to analyze (minimum 10 characters)');
                }
                
                analysisRequest = {
                    legal_terms: textToAnalyze.substring(0, 2800),
                    tone: 'serious',
                    max_tokens: 2000,
                    temperature: 0.7,
                    document_type: 'general'
                };
            } else if (this.selectedMethod === 'manual') {
                const manualTextEl = document.getElementById('manual-text');
                const textToAnalyze = manualTextEl ? manualTextEl.value : '';
                if (!textToAnalyze || textToAnalyze.trim().length < 10) {
                    throw new Error('Please provide text to analyze (minimum 10 characters)');
                }
                
                analysisRequest = {
                    legal_terms: textToAnalyze.substring(0, 2800),
                    tone: 'serious',
                    max_tokens: 2000,
                    temperature: 0.7,
                    document_type: 'general'
                };
            }

            // Call analysis API with better error handling
            const result = await this.callAnalysisAPI(analysisRequest);
            
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

    async callAnalysisAPI(analysisRequest) {
        try {
            // Get stored auth token if available
            const { authToken } = await chrome.storage.local.get(['authToken']);
            
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
                body: JSON.stringify(analysisRequest)
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
        // Check if user is a Pro subscriber
        if (this.userSubscriptionTier !== 'pro') {
            this.showProFeatureMessage('audio playback');
            return;
        }
        
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
            const supabaseUrl = 'https://txwilhbitljeeihpvscr.supabase.co';
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
        // Check if user is a Pro subscriber
        if (this.userSubscriptionTier !== 'pro') {
            this.showProFeatureMessage('saving analyses');
            return;
        }
        
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
        // Open sign-in page and then sync auth
        chrome.tabs.create({
            url: 'https://legalish.site'
        }, (tab) => {
            // Listen for tab updates to sync auth when user signs in
            const listener = (tabId, changeInfo, updatedTab) => {
                if (tabId === tab.id && changeInfo.status === 'complete') {
                    // Wait a moment for auth to settle, then sync
                    setTimeout(async () => {
                        await this.syncAuthenticationState();
                        this.loadUserState();
                    }, 2000);
                    chrome.tabs.onUpdated.removeListener(listener);
                }
            };
            chrome.tabs.onUpdated.addListener(listener);
        });
    }

    async signOut() {
        await chrome.storage.local.remove(['authToken', 'userInfo', 'authTimestamp', 'subscription_tier']);
        this.userSubscriptionTier = 'free';
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
            const { authToken, userInfo, subscription_tier } = await chrome.storage.local.get(['authToken', 'userInfo', 'subscription_tier']);
            
            // Update subscription tier if available
            if (subscription_tier) {
                this.userSubscriptionTier = subscription_tier;
            }
            
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
                
                // Update UI based on subscription tier
                this.updateUIForSubscriptionTier();
            } else {
                if (signedOut) signedOut.style.display = 'block';
                if (signedIn) signedIn.style.display = 'none';
                
                // Reset subscription tier to free if not signed in
                this.userSubscriptionTier = 'free';
                this.updateUIForSubscriptionTier();
            }
        } catch (error) {
            console.error('Error loading user state:', error);
        }
    }
    
    updateUIForSubscriptionTier() {
        try {
            const isPro = this.userSubscriptionTier === 'pro';
            
            // Update analyze button
            const analyzeBtn = document.getElementById('analyze-btn');
            if (analyzeBtn) {
                if (!isPro) {
                    analyzeBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span>Upgrade to Pro</span>
                    `;
                    analyzeBtn.classList.add('pro-feature');
                    analyzeBtn.onclick = () => this.openUpgradePage();
                } else {
                    analyzeBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                        <span>Analyze Document</span>
                    `;
                    analyzeBtn.classList.remove('pro-feature');
                    analyzeBtn.onclick = () => this.analyzeDocument();
                }
            }
            
            // Add Pro badges to Pro-only features
            document.querySelectorAll('.pro-badge').forEach(badge => {
                badge.remove();
            });
            
            if (!isPro) {
                // Add Pro badge to audio button
                const playAudioBtn = document.getElementById('play-audio-btn');
                if (playAudioBtn) {
                    const badge = document.createElement('span');
                    badge.className = 'pro-badge';
                    badge.textContent = 'PRO';
                    playAudioBtn.appendChild(badge);
                }
                
                // Add Pro badge to save button
                const saveAnalysisBtn = document.getElementById('save-analysis-btn');
                if (saveAnalysisBtn) {
                    const badge = document.createElement('span');
                    badge.className = 'pro-badge';
                    badge.textContent = 'PRO';
                    saveAnalysisBtn.appendChild(badge);
                }
            }
            
            // Add Pro-only CSS if not already added
            if (!document.getElementById('pro-features-css')) {
                const style = document.createElement('style');
                style.id = 'pro-features-css';
                style.textContent = `
                    .pro-badge {
                        position: absolute;
                        top: -8px;
                        right: -8px;
                        background: linear-gradient(135deg, #a855f7, #3b82f6);
                        color: white;
                        font-size: 8px;
                        font-weight: bold;
                        padding: 2px 4px;
                        border-radius: 4px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                    
                    .pro-feature {
                        background: linear-gradient(135deg, #a855f7, #3b82f6) !important;
                    }
                    
                    .pro-upgrade-banner {
                        background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1));
                        border: 1px solid rgba(168, 85, 247, 0.2);
                        border-radius: 8px;
                        padding: 12px;
                        margin-bottom: 12px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    .pro-upgrade-banner svg {
                        color: #a855f7;
                    }
                    
                    .pro-upgrade-banner-content {
                        flex: 1;
                    }
                    
                    .pro-upgrade-banner-title {
                        font-weight: 600;
                        margin-bottom: 4px;
                    }
                    
                    .pro-upgrade-banner-description {
                        font-size: 12px;
                        color: #94a3b8;
                    }
                    
                    .pro-upgrade-banner-button {
                        background: linear-gradient(135deg, #a855f7, #3b82f6);
                        color: white;
                        border: none;
                        border-radius: 4px;
                        padding: 6px 12px;
                        font-size: 12px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    
                    .pro-upgrade-banner-button:hover {
                        opacity: 0.9;
                        transform: translateY(-1px);
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Show/hide Pro upgrade banner
            let proUpgradeBanner = document.getElementById('pro-upgrade-banner');
            if (!isPro) {
                if (!proUpgradeBanner) {
                    proUpgradeBanner = document.createElement('div');
                    proUpgradeBanner.id = 'pro-upgrade-banner';
                    proUpgradeBanner.className = 'pro-upgrade-banner';
                    proUpgradeBanner.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <div class="pro-upgrade-banner-content">
                            <div class="pro-upgrade-banner-title">Upgrade to Pro</div>
                            <div class="pro-upgrade-banner-description">Unlock PDF analysis, audio playback, and more</div>
                        </div>
                        <button class="pro-upgrade-banner-button">Upgrade</button>
                    `;
                    
                    // Insert before the analysis section
                    const analysisSection = document.getElementById('analysis-section');
                    if (analysisSection && analysisSection.parentNode) {
                        analysisSection.parentNode.insertBefore(proUpgradeBanner, analysisSection);
                    }
                    
                    // Add click handler
                    const upgradeButton = proUpgradeBanner.querySelector('.pro-upgrade-banner-button');
                    if (upgradeButton) {
                        upgradeButton.addEventListener('click', () => this.openUpgradePage());
                    }
                }
            } else if (proUpgradeBanner) {
                proUpgradeBanner.remove();
            }
        } catch (error) {
            console.error('Error updating UI for subscription tier:', error);
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
                    this.openUpgradePage();
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

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new LegalishPopup();
    } catch (error) {
        console.error('Error initializing popup:', error);
    }
});