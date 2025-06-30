// Popup script for Legalish Chrome Extension
// Handles the main popup interface, authentication, and analysis features

class LegalishPopup {
    constructor() {
        this.isAnalyzing = false;
        this.currentMethod = 'page';
        this.userInfo = null;
        this.subscriptionTier = 'free';
        this.authToken = null;
        
        this.init();
    }

    async init() {
        try {
            // Load stored data first
            await this.loadStoredData();
            
            // Initialize UI
            this.setupEventListeners();
            this.updateUI();
            
            // Check authentication status
            await this.checkAuthenticationStatus();
            
            // Detect page content
            await this.detectPageContent();
            
            console.log('Popup initialized successfully');
        } catch (error) {
            console.error('Error initializing popup:', error);
        }
    }

    async loadStoredData() {
        try {
            const data = await chrome.storage.local.get([
                'authToken', 
                'userInfo', 
                'subscription_tier',
                'authTimestamp'
            ]);
            
            this.authToken = data.authToken || null;
            this.userInfo = data.userInfo || null;
            this.subscriptionTier = data.subscription_tier || 'free';
            
            console.log('Loaded stored data:', {
                hasAuthToken: !!this.authToken,
                hasUserInfo: !!this.userInfo,
                subscriptionTier: this.subscriptionTier,
                userEmail: this.userInfo?.email
            });
        } catch (error) {
            console.error('Error loading stored data:', error);
        }
    }

    async checkAuthenticationStatus() {
        try {
            // First check if we have stored auth data
            if (this.authToken && this.userInfo) {
                console.log('Found stored auth data, verifying...');
                
                // Verify the token is still valid by making an API call
                const isValid = await this.verifyAuthToken();
                if (isValid) {
                    console.log('Stored auth token is valid');
                    await this.fetchLatestSubscriptionStatus();
                    this.updateUI();
                    return;
                } else {
                    console.log('Stored auth token is invalid, clearing...');
                    await this.clearAuthData();
                }
            }

            // Try to detect authentication from the current tab
            console.log('Attempting to detect auth from current tab...');
            await this.detectAuthFromCurrentTab();
            
        } catch (error) {
            console.error('Error checking authentication status:', error);
        }
    }

    async verifyAuthToken() {
        if (!this.authToken) return false;
        
        try {
            const response = await fetch(`https://txwilhbitljeeihpvscr.supabase.co/rest/v1/profiles?select=subscription_tier&limit=1`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4d2lsaGJpdGxqZWVpaHB2c2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODUzNjQsImV4cCI6MjA2NDY2MTM2NH0.EhFUUngApIPqLfpSHg_0ajRkgN6Krg9BmZd5RXEq6NQ',
                    'Content-Type': 'application/json'
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('Error verifying auth token:', error);
            return false;
        }
    }

    async fetchLatestSubscriptionStatus() {
        if (!this.authToken || !this.userInfo?.id) return;
        
        try {
            console.log('Fetching latest subscription status for user:', this.userInfo.id);
            
            const response = await fetch(`https://txwilhbitljeeihpvscr.supabase.co/rest/v1/profiles?id=eq.${this.userInfo.id}&select=subscription_tier,email,full_name`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4d2lsaGJpdGxqZWVpaHB2c2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODUzNjQsImV4cCI6MjA2NDY2MTM2NH0.EhFUUngApIPqLfpSHg_0ajRkgN6Krg9BmZd5RXEq6NQ',
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const profiles = await response.json();
                if (profiles && profiles.length > 0) {
                    const profile = profiles[0];
                    this.subscriptionTier = profile.subscription_tier || 'free';
                    
                    // Update user info
                    this.userInfo = {
                        ...this.userInfo,
                        email: profile.email,
                        full_name: profile.full_name,
                        plan: this.subscriptionTier === 'pro' ? 'Pro Plan' : 'Free Plan'
                    };
                    
                    // Store updated data
                    await chrome.storage.local.set({
                        subscription_tier: this.subscriptionTier,
                        userInfo: this.userInfo
                    });
                    
                    console.log('Updated subscription status:', this.subscriptionTier);
                    
                    // Notify background script
                    chrome.runtime.sendMessage({
                        action: 'updateSubscriptionTier',
                        subscriptionTier: this.subscriptionTier
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching subscription status:', error);
        }
    }

    async detectAuthFromCurrentTab() {
        try {
            // Get the current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab || !tab.url) {
                console.log('No active tab found');
                return;
            }
            
            console.log('Current tab URL:', tab.url);
            
            // Check if we're on the Legalish website
            if (tab.url.includes('legalish.site') || tab.url.includes('localhost')) {
                console.log('On Legalish website, attempting to extract auth data...');
                
                try {
                    // Try to execute script to get auth data from the page
                    const results = await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: () => {
                            try {
                                // Look for Supabase auth data in localStorage
                                const authKeys = Object.keys(localStorage).filter(key => 
                                    key.includes('supabase') && key.includes('auth-token')
                                );
                                
                                if (authKeys.length > 0) {
                                    const authData = JSON.parse(localStorage.getItem(authKeys[0]) || '{}');
                                    
                                    if (authData.access_token && authData.user) {
                                        return {
                                            success: true,
                                            authToken: authData.access_token,
                                            userInfo: {
                                                id: authData.user.id,
                                                email: authData.user.email,
                                                full_name: authData.user.user_metadata?.full_name || null
                                            }
                                        };
                                    }
                                }
                                
                                return { success: false, error: 'No auth data found' };
                            } catch (error) {
                                return { success: false, error: error.message };
                            }
                        }
                    });
                    
                    if (results && results[0] && results[0].result && results[0].result.success) {
                        const { authToken, userInfo } = results[0].result;
                        
                        console.log('Successfully extracted auth data from page');
                        
                        // Store the auth data
                        this.authToken = authToken;
                        this.userInfo = userInfo;
                        
                        await chrome.storage.local.set({
                            authToken: authToken,
                            userInfo: userInfo,
                            authTimestamp: Date.now()
                        });
                        
                        // Fetch subscription status
                        await this.fetchLatestSubscriptionStatus();
                        
                        console.log('Auth detection successful:', {
                            email: userInfo.email,
                            subscriptionTier: this.subscriptionTier
                        });
                        
                        this.updateUI();
                        return;
                    }
                } catch (scriptError) {
                    console.log('Could not execute script on tab:', scriptError.message);
                }
            }
            
            console.log('No authentication detected');
        } catch (error) {
            console.error('Error detecting auth from current tab:', error);
        }
    }

    async clearAuthData() {
        this.authToken = null;
        this.userInfo = null;
        this.subscriptionTier = 'free';
        
        await chrome.storage.local.remove([
            'authToken', 
            'userInfo', 
            'subscription_tier', 
            'authTimestamp'
        ]);
        
        console.log('Cleared auth data');
    }

    setupEventListeners() {
        // Input method selection
        document.querySelectorAll('.input-method').forEach(button => {
            button.addEventListener('click', () => {
                if (button.dataset.method) {
                    this.selectInputMethod(button.dataset.method);
                }
            });
        });

        // Analyze button
        const analyzeBtn = document.getElementById('analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.handleAnalyze());
        }

        // Sign in button
        const signInBtn = document.getElementById('sign-in-btn');
        if (signInBtn) {
            signInBtn.addEventListener('click', () => this.handleSignIn());
        }

        // Sign out button
        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => this.handleSignOut());
        }

        // Upgrade button
        const upgradeBtn = document.getElementById('upgrade-btn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => this.handleUpgrade());
        }

        // Help button
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.handleHelp());
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.detectPageContent());
        }

        // Audio controls
        const playAudioBtn = document.getElementById('play-audio-btn');
        if (playAudioBtn) {
            playAudioBtn.addEventListener('click', () => this.handlePlayAudio());
        }

        // Open full results button
        const openFullBtn = document.getElementById('open-full-btn');
        if (openFullBtn) {
            openFullBtn.addEventListener('click', () => this.handleOpenFull());
        }
    }

    selectInputMethod(method) {
        this.currentMethod = method;
        
        // Update UI
        document.querySelectorAll('.input-method').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const selectedBtn = document.querySelector(`[data-method="${method}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }

        // Show/hide manual input
        const manualInput = document.getElementById('manual-input');
        if (manualInput) {
            manualInput.style.display = method === 'manual' ? 'block' : 'none';
        }
    }

    updateUI() {
        console.log('Updating UI with auth status:', {
            hasAuth: !!this.authToken,
            subscriptionTier: this.subscriptionTier,
            userEmail: this.userInfo?.email
        });

        // Update authentication section
        const signedOut = document.getElementById('signed-out');
        const signedIn = document.getElementById('signed-in');
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        const userPlan = document.getElementById('user-plan');

        if (this.authToken && this.userInfo) {
            // User is signed in
            if (signedOut) signedOut.style.display = 'none';
            if (signedIn) signedIn.style.display = 'flex';
            
            if (userAvatar) {
                userAvatar.textContent = (this.userInfo.email || 'U').charAt(0).toUpperCase();
            }
            
            if (userName) {
                userName.textContent = this.userInfo.full_name || this.userInfo.email?.split('@')[0] || 'User';
            }
            
            if (userPlan) {
                userPlan.textContent = this.subscriptionTier === 'pro' ? 'Pro Plan' : 'Free Plan';
            }
        } else {
            // User is not signed in
            if (signedOut) signedOut.style.display = 'block';
            if (signedIn) signedIn.style.display = 'none';
        }

        // Update Pro upgrade banner visibility
        this.updateProBanner();
        
        // Update analyze button state
        this.updateAnalyzeButton();
    }

    updateProBanner() {
        // This would show/hide Pro upgrade banners based on subscription status
        const proUpgradeBanners = document.querySelectorAll('.pro-upgrade-banner');
        proUpgradeBanners.forEach(banner => {
            if (this.subscriptionTier === 'pro') {
                banner.style.display = 'none';
            } else {
                banner.style.display = 'block';
            }
        });
    }

    updateAnalyzeButton() {
        const analyzeBtn = document.getElementById('analyze-btn');
        if (!analyzeBtn) return;

        if (this.isAnalyzing) {
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = `
                <div class="spinner"></div>
                <span>Analyzing...</span>
            `;
        } else {
            analyzeBtn.disabled = false;
            
            if (this.subscriptionTier === 'pro') {
                analyzeBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                    <span>Analyze Document</span>
                `;
            } else {
                analyzeBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>Upgrade to Pro</span>
                `;
            }
        }
    }

    async detectPageContent() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) return;

            // Update detection UI
            const loading = document.getElementById('loading');
            const noLegalContent = document.getElementById('no-legal-content');
            const legalContentFound = document.getElementById('legal-content-found');

            if (loading) loading.style.display = 'flex';
            if (noLegalContent) noLegalContent.style.display = 'none';
            if (legalContentFound) legalContentFound.style.display = 'none';

            // Send message to content script to detect legal content
            try {
                const response = await chrome.tabs.sendMessage(tab.id, {
                    action: 'detectLegalContent'
                });

                setTimeout(() => {
                    if (loading) loading.style.display = 'none';
                    
                    if (response && response.hasLegalContent) {
                        if (legalContentFound) legalContentFound.style.display = 'flex';
                        const documentType = document.getElementById('document-type');
                        if (documentType) {
                            documentType.textContent = response.documentType || 'Legal Document';
                        }
                    } else {
                        if (noLegalContent) noLegalContent.style.display = 'flex';
                    }
                }, 1000);

            } catch (error) {
                console.log('Could not communicate with content script:', error);
                setTimeout(() => {
                    if (loading) loading.style.display = 'none';
                    if (noLegalContent) noLegalContent.style.display = 'flex';
                }, 1000);
            }

        } catch (error) {
            console.error('Error detecting page content:', error);
        }
    }

    async handleAnalyze() {
        if (this.isAnalyzing) return;

        // Check if user has Pro access for analysis
        if (this.subscriptionTier !== 'pro') {
            this.handleUpgrade();
            return;
        }

        this.isAnalyzing = true;
        this.updateAnalyzeButton();

        try {
            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) throw new Error('No active tab found');

            let analysisData = {};

            if (this.currentMethod === 'page') {
                // Analyze current page
                const response = await chrome.tabs.sendMessage(tab.id, {
                    action: 'analyzePage'
                });
                
                if (response && response.success) {
                    analysisData = response.data;
                } else {
                    throw new Error(response?.error || 'Failed to analyze page');
                }
            } else if (this.currentMethod === 'selection') {
                // Analyze selected text
                const response = await chrome.tabs.sendMessage(tab.id, {
                    action: 'analyzeSelection'
                });
                
                if (response && response.success) {
                    analysisData = response.data;
                } else {
                    throw new Error(response?.error || 'Failed to analyze selection');
                }
            } else if (this.currentMethod === 'manual') {
                // Analyze manual input
                const manualText = document.getElementById('manual-text')?.value;
                if (!manualText || manualText.trim().length < 10) {
                    throw new Error('Please enter at least 10 characters of text to analyze');
                }

                analysisData = await this.performAnalysis(manualText.trim());
            }

            // Show results
            this.displayResults(analysisData);

        } catch (error) {
            console.error('Analysis error:', error);
            this.showError(error.message);
        } finally {
            this.isAnalyzing = false;
            this.updateAnalyzeButton();
        }
    }

    async performAnalysis(text) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        } else {
            headers['Authorization'] = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4d2lsaGJpdGxqZWVpaHB2c2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODUzNjQsImV4cCI6MjA2NDY2MTM2NH0.EhFUUngApIPqLfpSHg_0ajRkgN6Krg9BmZd5RXEq6NQ`;
        }

        const response = await fetch('https://txwilhbitljeeihpvscr.supabase.co/functions/v1/analyze-legal-terms-rag', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                legal_terms: text,
                tone: document.getElementById('tone-select')?.value || 'serious',
                max_tokens: 1500,
                temperature: 0.7,
                document_type: 'general'
            })
        });

        if (!response.ok) {
            throw new Error(`Analysis failed: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Analysis failed');
        }

        return result.data;
    }

    displayResults(data) {
        // Hide loading and show results
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.style.display = 'block';
        }

        // Update results content
        const resultsContent = document.getElementById('results-content');
        if (resultsContent && data) {
            resultsContent.innerHTML = `
                <div class="result-item">
                    <div class="result-title">Analysis Complete</div>
                    <div class="result-description">
                        Found ${data.red_flags?.length || 0} red flags in ${(data.processing_time_ms / 1000).toFixed(2)} seconds
                    </div>
                </div>
            `;
        }
    }

    showError(message) {
        console.error('Showing error:', message);
        // You could implement a toast notification here
    }

    handleSignIn() {
        // Open Legalish website for sign in
        chrome.tabs.create({ url: 'https://legalish.site' });
    }

    async handleSignOut() {
        await this.clearAuthData();
        this.updateUI();
    }

    handleUpgrade() {
        chrome.tabs.create({ url: 'https://legalish.site/upgrade' });
    }

    handleHelp() {
        chrome.tabs.create({ url: 'https://legalish.site/help' });
    }

    handlePlayAudio() {
        // Implement audio playback
        console.log('Play audio clicked');
    }

    handleOpenFull() {
        chrome.tabs.create({ url: 'https://legalish.site/summary' });
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LegalishPopup();
});