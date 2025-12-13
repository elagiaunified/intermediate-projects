// js/storageManager.js - Handles data persistence using localStorage

class StorageManager {
    constructor() {
        this.storageKey = 'expense-tracker-data';
        this.settingsKey = 'expense-tracker-settings';
    }
    
    // Expense data methods
    saveExpenses(expenses) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(expenses));
            return true;
        } catch (error) {
            console.error('Failed to save expenses:', error);
            return false;
        }
    }
    
    loadExpenses() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load expenses:', error);
            return [];
        }
    }
    
    // Settings methods
    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }
    
    loadSettings() {
        try {
            const data = localStorage.getItem(this.settingsKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Failed to load settings:', error);
            return {};
        }
    }
    
    // Backup and restore
    exportData() {
        const data = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            expenses: this.loadExpenses(),
            settings: this.loadSettings()
        };
        return JSON.stringify(data, null, 2);
    }
    
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.expenses) {
                this.saveExpenses(data.expenses);
            }
            
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
    
    // Clear all data
    clearAllData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.settingsKey);
        localStorage.removeItem('expense-tracker-currency-rates');
        localStorage.removeItem('expense-tracker-theme');
    }
    
    // Check storage availability
    isStorageAvailable() {
        try {
            const testKey = 'test';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.error('localStorage is not available:', error);
            return false;
        }
    }
}
