// js/currencyConverter.js - Handles currency conversion and exchange rates

class CurrencyConverter {
    constructor() {
        // Use a free API key or demo key
        this.apiKey = '54e45e46382c7741d4b731af'; // Demo key
        this.apiUrl = 'https://api.exchangerate-api.com/v4/latest/';
        this.cacheKey = 'expense-tracker-currency-rates';
        this.cacheDuration = 3600000; // 1 hour
        
        // Fallback rates
        this.fallbackRates = {
            USD: { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150.50, CAD: 1.35, AUD: 1.52, INR: 83.25 },
            EUR: { USD: 1.09, EUR: 1, GBP: 0.86, JPY: 163.50, CAD: 1.47, AUD: 1.65, INR: 90.50 },
            GBP: { USD: 1.27, EUR: 1.16, GBP: 1, JPY: 190.25, CAD: 1.71, AUD: 1.92, INR: 105.25 }
        };
        
        this.supportedCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR'];
    }
    
    async getExchangeRates(baseCurrency = 'USD', forceRefresh = false) {
        // Check cache first
        if (!forceRefresh) {
            const cached = this.getCachedRates(baseCurrency);
            if (cached) {
                return cached;
            }
        }
        
        try {
            const response = await fetch(`${this.apiUrl}${baseCurrency}`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.rates) {
                this.cacheRates(baseCurrency, data.rates);
                return data.rates;
            } else {
                throw new Error('Invalid API response');
            }
        } catch (error) {
            console.warn('Using fallback rates:', error.message);
            return this.fallbackRates[baseCurrency] || this.fallbackRates.USD;
        }
    }
    
    getCachedRates(baseCurrency) {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            const now = new Date().getTime();
            
            if (now - cacheData.timestamp > this.cacheDuration) {
                return null;
            }
            
            if (cacheData.base !== baseCurrency) {
                return null;
            }
            
            return cacheData.rates;
        } catch (error) {
            return null;
        }
    }
    
    cacheRates(baseCurrency, rates) {
        try {
            const cacheData = {
                timestamp: new Date().getTime(),
                base: baseCurrency,
                rates: rates
            };
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Failed to cache rates:', error);
        }
    }
    
    convert(amount, fromCurrency, toCurrency, rates = null) {
        if (fromCurrency === toCurrency) {
            return amount;
        }
        
        if (!rates) {
            rates = this.fallbackRates[fromCurrency] || this.fallbackRates.USD;
        }
        
        if (rates[toCurrency]) {
            return amount * rates[toCurrency];
        }
        
        console.warn(`No rate for ${fromCurrency} to ${toCurrency}`);
        return amount;
    }
    
    async convertToBase(amount, fromCurrency, baseCurrency) {
        if (fromCurrency === baseCurrency) {
            return amount;
        }
        
        const rates = await this.getExchangeRates(baseCurrency);
        return this.convert(amount, fromCurrency, baseCurrency, rates);
    }
    
    getCurrencySymbol(currencyCode) {
        const symbols = {
            'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥',
            'CAD': 'C$', 'AUD': 'A$', 'INR': '₹'
        };
        return symbols[currencyCode] || currencyCode;
    }
    
    formatCurrency(amount, currencyCode) {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2
            }).format(amount);
        } catch (error) {
            const symbol = this.getCurrencySymbol(currencyCode);
            return `${symbol}${amount.toFixed(2)}`;
        }
    }
}
