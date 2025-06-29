// Background script for Legalish Chrome Extension
// Handles extension lifecycle, context menus, and communication between components

class LegalishBackground {
    constructor() {
        this.init();
    }

    init() {
        this.setupContextMenus();
        this.setupMessageHandlers();
        this.setupTabHandlers();
        this.setupStorageCleanup();
    }

    setupContextMenus() {
        // Create context menu items
        chrome.runtime.onInstalled.addListener(() => {
            // Main analyze option
            chrome.contextMenus.create({
                id: 'analyze-selection',
                title: 'Analyze with Legalish',
                contexts: ['selection'],
                documentUrlPatterns: ['http://*/*', 'https://*/*']
            });

            // Analyze page option
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
        });

        // Handle context menu clicks
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleContextMenuClick(info, tab);
        });
    }

    async handleContextMenuClick(info, tab) {
        switch (info.menuItemId) {
            case 'analyze-selection':
                await this.analyzeSelection(tab, info.selectionText);
                break;
            
            case 'analyze-page':
                await this.analyzePage(tab);
                break;
            
            case 'open-legalish':
                chrome.tabs.create({ url: 'https://your-legalish-app.com' });
                break;
            
            case 'view-history':
                chrome.tabs.create({ url: 'https://your-legalish-app.com/dashboard' });
                break;
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
        switch (request.action) {
            case 'updateBadge':
                await this.updateBadge(sender.tab.id, request.text, request.color);
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
        }
    }

    async updateBadge(tabId, text, color = '#ef4444') {
        try {
            await chrome.action.setBadgeText({
                text: text,
                tabId: tabId
            });
            
            await chrome.action.setBadgeBackgroundColor({
                color: color,
                tabId: tabId
            });
        } catch (error) {
            console.error('Error updating badge:', error);
        }
    }

    async openPopup() {
        try {
            // Open the popup programmatically
            await chrome.action.openPopup();
        } catch (error) {
            console.error('Error opening popup:', error);
        }
    }

    showNotification(message, type = 'basic') {
        const notificationOptions = {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Legalish',
            message: message
        };

        chrome.notifications.create('', notificationOptions);
    }

    setupTabHandlers() {
        // Clear badge when tab is updated
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete') {
                chrome.action.setBadgeText({ text: '', tabId: tabId });
            }
        });

        // Clear badge when tab is activated
        chrome.tabs.onActivated.addListener((activeInfo) => {
            chrome.action.setBadgeText({ text: '', tabId: activeInfo.tabId });
        });
    }

    setupStorageCleanup() {
        // Clean up old data periodically
        chrome.alarms.create('cleanup', { periodInMinutes: 60 });
        
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'cleanup') {
                this.clearOldData();
            }
        });
    }

    async storeAnalysis(data) {
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
    }

    async getStoredAnalyses() {
        const storage = await chrome.storage.local.get();
        const analyses = Object.entries(storage)
            .filter(([key]) => key.startsWith('analysis_'))
            .map(([key, value]) => ({ key, ...value }))
            .sort((a, b) => b.timestamp - a.timestamp);

        return analyses;
    }

    async limitStoredAnalyses(maxCount) {
        const analyses = await this.getStoredAnalyses();
        
        if (analyses.length > maxCount) {
            const toDelete = analyses.slice(maxCount);
            const keysToDelete = toDelete.map(analysis => analysis.key);
            
            for (const key of keysToDelete) {
                await chrome.storage.local.remove(key);
            }
        }
    }

    async clearOldData() {
        const storage = await chrome.storage.local.get();
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

        const keysToDelete = [];

        for (const [key, value] of Object.entries(storage)) {
            if (key.startsWith('analysis_') && value.timestamp) {
                if (now - value.timestamp > maxAge) {
                    keysToDelete.push(key);
                }
            }
        }

        if (keysToDelete.length > 0) {
            await chrome.storage.local.remove(keysToDelete);
            console.log(`Cleaned up ${keysToDelete.length} old analysis records`);
        }
    }

    // Authentication helpers
    async setAuthToken(token, userInfo) {
        await chrome.storage.local.set({
            authToken: token,
            userInfo: userInfo,
            authTimestamp: Date.now()
        });
    }

    async getAuthToken() {
        const { authToken, authTimestamp } = await chrome.storage.local.get(['authToken', 'authTimestamp']);
        
        // Check if token is expired (24 hours)
        if (authToken && authTimestamp) {
            const now = Date.now();
            const tokenAge = now - authTimestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (tokenAge > maxAge) {
                await chrome.storage.local.remove(['authToken', 'userInfo', 'authTimestamp']);
                return null;
            }
        }
        
        return authToken;
    }

    async clearAuth() {
        await chrome.storage.local.remove(['authToken', 'userInfo', 'authTimestamp']);
    }

    // Analytics helpers (privacy-friendly)
    async trackUsage(event, data = {}) {
        const usage = await chrome.storage.local.get(['usage']) || { usage: {} };
        const today = new Date().toISOString().split('T')[0];
        
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
    }
}

// Initialize background script
new LegalishBackground();