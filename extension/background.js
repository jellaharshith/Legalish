// Background script for Legalish Chrome Extension
// Handles extension lifecycle, context menus, and communication between components

class LegalishBackground {
    constructor() {
        this.init();
    }

    init() {
        this.setupMessageHandlers();
        this.setupTabHandlers();
        this.setupStorageCleanup();
        
        // Set up context menus when extension is installed or started
        chrome.runtime.onInstalled.addListener(() => {
            this.setupContextMenus();
        });
        
        // Also try to set up context menus on startup
        this.setupContextMenus();
    }

    setupContextMenus() {
        try {
            // Check if contextMenus API is available
            if (!chrome.contextMenus) {
                console.log('Context menus API not available');
                return;
            }

            // Clear existing menus safely
            chrome.contextMenus.removeAll(() => {
                if (chrome.runtime.lastError) {
                    console.log('No existing context menus to remove');
                }
                
                try {
                    // Main analyze option - FREE VERSION
                    chrome.contextMenus.create({
                        id: 'analyze-selection',
                        title: 'Analyze with Legalish',
                        contexts: ['selection'],
                        documentUrlPatterns: ['http://*/*', 'https://*/*']
                    });

                    // Analyze page option - FREE VERSION
                    chrome.contextMenus.create({
                        id: 'analyze-page',
                        title: 'Analyze page for legal content',
                        contexts: ['page'],
                        documentUrlPatterns: ['http://*/*', 'https://*/*']
                    });

                    // Separator
                    chrome.contextMenus.create({
                        id: 'separator1',
                        type: 'separator',
                        contexts: ['selection', 'page']
                    });

                    // Quick actions submenu
                    chrome.contextMenus.create({
                        id: 'quick-actions',
                        title: 'Quick Actions',
                        contexts: ['selection', 'page']
                    });

                    chrome.contextMenus.create({
                        id: 'open-legalish',
                        parentId: 'quick-actions',
                        title: 'Open Legalish App',
                        contexts: ['selection', 'page']
                    });

                    chrome.contextMenus.create({
                        id: 'view-history',
                        parentId: 'quick-actions',
                        title: 'View Analysis History',
                        contexts: ['selection', 'page']
                    });
                    
                    chrome.contextMenus.create({
                        id: 'upgrade-to-pro',
                        parentId: 'quick-actions',
                        title: 'Upgrade to Pro',
                        contexts: ['selection', 'page']
                    });

                    console.log('Context menus created successfully');
                } catch (error) {
                    console.error('Error creating context menus:', error);
                }
            });

            // Handle context menu clicks
            if (chrome.contextMenus.onClicked) {
                chrome.contextMenus.onClicked.addListener((info, tab) => {
                    this.handleContextMenuClick(info, tab);
                });
            }
        } catch (error) {
            console.error('Error setting up context menus:', error);
        }
    }

    async handleContextMenuClick(info, tab) {
        try {
            if (!tab || !tab.id) {
                console.error('Invalid tab information');
                return;
            }

            switch (info.menuItemId) {
                case 'analyze-selection':
                    // FREE VERSION - No restrictions
                    await this.analyzeSelection(tab, info.selectionText);
                    break;
                
                case 'analyze-page':
                    // FREE VERSION - No restrictions
                    await this.analyzePage(tab);
                    break;
                
                case 'open-legalish':
                    chrome.tabs.create({ url: 'https://legalish.site' });
                    break;
                
                case 'view-history':
                    chrome.tabs.create({ url: 'https://legalish.site/dashboard' });
                    break;
                    
                case 'upgrade-to-pro':
                    chrome.tabs.create({ url: 'https://legalish.site/upgrade' });
                    break;
            }
        } catch (error) {
            console.error('Error handling context menu click:', error);
        }
    }

    async analyzeSelection(tab, selectionText) {
        if (!selectionText || selectionText.length < 10) {
            this.showNotification('Please select more text to analyze (minimum 10 characters)');
            return;
        }

        // Send message to content script
        try {
            await chrome.tabs.sendMessage(tab.id, {
                action: 'analyzeSelection',
                text: selectionText
            });
        } catch (error) {
            console.error('Error sending message to content script:', error);
            this.showNotification('Analysis failed. Please try again.');
        }
    }

    async analyzePage(tab) {
        try {
            await chrome.tabs.sendMessage(tab.id, {
                action: 'analyzePage'
            });
        } catch (error) {
            console.error('Error sending message to content script:', error);
            this.showNotification('Analysis failed. Please try again.');
        }
    }

    setupMessageHandlers() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'updateBadge':
                    if (sender.tab && sender.tab.id) {
                        await this.updateBadge(sender.tab.id, request.text, request.color);
                    }
                    break;
                
                case 'openPopup':
                    await this.openPopup();
                    break;
                
                case 'showNotification':
                    this.showNotification(request.message, request.type);
                    break;
                
                case 'storeAnalysis':
                    await this.storeAnalysis(request.data);
                    break;
                
                case 'getStoredAnalyses':
                    const analyses = await this.getStoredAnalyses();
                    sendResponse({ analyses });
                    break;
                
                case 'clearOldData':
                    await this.clearOldData();
                    break;
                    
                case 'updateSubscriptionTier':
                    await this.updateSubscriptionTier(request.subscriptionTier);
                    break;
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }
    
    async updateSubscriptionTier(tier) {
        try {
            await chrome.storage.local.set({ subscription_tier: tier });
            
            console.log('Background - Broadcasting subscription tier update:', tier);
            
            // Broadcast to all tabs
            const tabs = await chrome.tabs.query({});
            for (const tab of tabs) {
                try {
                    await chrome.tabs.sendMessage(tab.id, {
                        action: 'updateSubscriptionTier',
                        subscriptionTier: tier
                    });
                } catch (error) {
                    // Ignore errors for tabs that don't have our content script
                }
            }
        } catch (error) {
            console.error('Error updating subscription tier:', error);
        }
    }

    async updateBadge(tabId, text, color = '#ef4444') {
        try {
            if (chrome.action && chrome.action.setBadgeText) {
                await chrome.action.setBadgeText({
                    text: text,
                    tabId: tabId
                });
                
                await chrome.action.setBadgeBackgroundColor({
                    color: color,
                    tabId: tabId
                });
            }
        } catch (error) {
            console.error('Error updating badge:', error);
        }
    }

    async openPopup() {
        try {
            if (chrome.action && chrome.action.openPopup) {
                await chrome.action.openPopup();
            }
        } catch (error) {
            console.error('Error opening popup:', error);
        }
    }

    showNotification(message, type = 'basic') {
        try {
            if (chrome.notifications && chrome.notifications.create) {
                const notificationOptions = {
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: 'Legalish',
                    message: message
                };

                chrome.notifications.create('', notificationOptions);
            } else {
                console.log('Notification:', message);
            }
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }

    setupTabHandlers() {
        try {
            // Clear badge when tab is updated
            chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
                if (changeInfo.status === 'complete' && chrome.action) {
                    chrome.action.setBadgeText({ text: '', tabId: tabId });
                }
            });

            // Clear badge when tab is activated
            chrome.tabs.onActivated.addListener((activeInfo) => {
                if (chrome.action) {
                    chrome.action.setBadgeText({ text: '', tabId: activeInfo.tabId });
                }
            });
        } catch (error) {
            console.error('Error setting up tab handlers:', error);
        }
    }

    setupStorageCleanup() {
        try {
            if (chrome.alarms) {
                // Clean up old data periodically
                chrome.alarms.create('cleanup', { periodInMinutes: 60 });
                
                chrome.alarms.onAlarm.addListener((alarm) => {
                    if (alarm.name === 'cleanup') {
                        this.clearOldData();
                    }
                });
            }
        } catch (error) {
            console.error('Error setting up storage cleanup:', error);
        }
    }

    async storeAnalysis(data) {
        try {
            const analysisKey = `analysis_${Date.now()}`;
            const analysisData = {
                ...data,
                timestamp: Date.now(),
                id: analysisKey
            };

            await chrome.storage.local.set({
                [analysisKey]: analysisData
            });

            // Keep only the last 50 analyses
            await this.limitStoredAnalyses(50);
        } catch (error) {
            console.error('Error storing analysis:', error);
        }
    }

    async getStoredAnalyses() {
        try {
            const storage = await chrome.storage.local.get();
            const analyses = Object.entries(storage)
                .filter(([key]) => key.startsWith('analysis_'))
                .map(([key, value]) => ({ key, ...value }))
                .sort((a, b) => b.timestamp - a.timestamp);

            return analyses;
        } catch (error) {
            console.error('Error getting stored analyses:', error);
            return [];
        }
    }

    async limitStoredAnalyses(maxCount) {
        try {
            const analyses = await this.getStoredAnalyses();
            
            if (analyses.length > maxCount) {
                const toDelete = analyses.slice(maxCount);
                const keysToDelete = toDelete.map(analysis => analysis.key);
                
                for (const key of keysToDelete) {
                    await chrome.storage.local.remove(key);
                }
            }
        } catch (error) {
            console.error('Error limiting stored analyses:', error);
        }
    }

    async clearOldData() {
        try {
            const storage = await chrome.storage.local.get();
            const now = Date.now();
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

            const keysToDelete = [];

            for (const [key, value] of Object.entries(storage)) {
                if (key.startsWith('analysis_') && value && value.timestamp) {
                    if (now - value.timestamp > maxAge) {
                        keysToDelete.push(key);
                    }
                }
            }

            if (keysToDelete.length > 0) {
                await chrome.storage.local.remove(keysToDelete);
                console.log(`Cleaned up ${keysToDelete.length} old analysis records`);
            }
        } catch (error) {
            console.error('Error clearing old data:', error);
        }
    }

    // Authentication helpers
    async setAuthToken(token, userInfo, subscriptionTier = 'free') {
        try {
            await chrome.storage.local.set({
                authToken: token,
                userInfo: userInfo,
                subscription_tier: subscriptionTier,
                authTimestamp: Date.now()
            });
            
            // Update subscription tier in all tabs
            await this.updateSubscriptionTier(subscriptionTier);
        } catch (error) {
            console.error('Error setting auth token:', error);
        }
    }

    async getAuthToken() {
        try {
            const { authToken, authTimestamp } = await chrome.storage.local.get(['authToken', 'authTimestamp']);
            
            // Check if token is expired (24 hours)
            if (authToken && authTimestamp) {
                const now = Date.now();
                const tokenAge = now - authTimestamp;
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                
                if (tokenAge > maxAge) {
                    await chrome.storage.local.remove(['authToken', 'userInfo', 'authTimestamp', 'subscription_tier']);
                    await this.updateSubscriptionTier('free');
                    return null;
                }
            }
            
            return authToken;
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    }

    async clearAuth() {
        try {
            await chrome.storage.local.remove(['authToken', 'userInfo', 'authTimestamp', 'subscription_tier']);
            await this.updateSubscriptionTier('free');
        } catch (error) {
            console.error('Error clearing auth:', error);
        }
    }

    // Analytics helpers (privacy-friendly)
    async trackUsage(event, data = {}) {
        try {
            const usage = await chrome.storage.local.get(['usage']) || { usage: {} };
            const today = new Date().toISOString().split('T')[0];
            
            if (!usage.usage) {
                usage.usage = {};
            }
            
            if (!usage.usage[today]) {
                usage.usage[today] = {};
            }
            
            if (!usage.usage[today][event]) {
                usage.usage[today][event] = 0;
            }
            
            usage.usage[today][event]++;
            
            await chrome.storage.local.set({ usage: usage.usage });
            
            // Keep only last 30 days of usage data
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 30);
            const cutoffString = cutoffDate.toISOString().split('T')[0];
            
            for (const date in usage.usage) {
                if (date < cutoffString) {
                    delete usage.usage[date];
                }
            }
            
            await chrome.storage.local.set({ usage: usage.usage });
        } catch (error) {
            console.error('Error tracking usage:', error);
        }
    }
}

// Initialize background script
try {
    new LegalishBackground();
} catch (error) {
    console.error('Error initializing background script:', error);
}