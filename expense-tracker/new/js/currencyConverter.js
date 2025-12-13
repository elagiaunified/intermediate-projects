// js/currencyConverter.js - Handles currency conversion and exchange rates

class CurrencyConverter {
    constructor() {
        this.apiKey = 'YOUR_API_KEY'; // Replace with your API key
        this.apiUrl = 'https://api.exchangerate-api.com/v4/latest/';
        this.cacheKey = 'expense-tracker-currency-rates';
        this.cacheDuration = 3600000; // 1 hour in milliseconds
        
        // Fallback rates (static backup)
        this.fallbackRates = {
            USD: { USD: 1, EUR: 0.85, GBP: 0.73, JPY: 110, CAD: 1.25, AUD: 1.35, INR: 75 },
            EUR: { USD: 1.18, EUR: 1, GBP: 0.86, JPY: 129, CAD: 1.47, AUD: 1.59, INR: 88 },
            GBP: { USD: 1.37, EUR: 1.16, GBP: 1, JPY: 151, CAD: 1.72, AUD: 1.86, INR: 103 },
            JPY: { USD: 0.0091, EUR: 0.0078, GBP: 0.0066, JPY: 1, CAD: 0.011, AUD: 0.012, INR: 0.68 },
            CAD: { USD: 0.80, EUR: 0.68, GBP: 0.58, JPY: 91, CAD: 1, AUD: 1.08, INR: 60 },
            AUD: { USD: 0.74, EUR: 0.63, GBP: 0.54, JPY: 83, CAD: 0.93, AUD: 1, INR: 55 },
            INR: { USD: 0.013, EUR: 0.011, GBP: 0.0097, JPY: 1.47, CAD: 0.017, AUD: 0.018, INR: 1 }
        };
    }
    
    async getExchangeRates(baseCurrency = 'USD', forceRefresh = false) {
        // Check cache first
        if (!forceRefresh) {
            const cached = this.getCachedRates(baseCurrency);
            if (cached) {
                console.log('Using cached exchange rates');
                return cached;
            }
        }
        
        try {
            // Try to fetch from API
            const response = await fetch(`${this.apiUrl}${baseCurrency}`);
            
            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}`);
            }
            
            const data = await response.json();
            
            // Cache the rates
            this.cacheRates(baseCurrency, data.rates);
            
            return data.rates;
        } catch (error) {
            console.warn('Failed to fetch exchange rates, using fallback:', error);
            
            // Use fallback rates
            return this.fallbackRates[baseCurrency] || this.fallbackRates.USD;
        }
    }
    
    getCachedRates(baseCurrency) {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) return null;
            
            const { timestamp, base, rates } = JSON.parse(cached);
            
            // Check if cache is still valid
            const now = new Date().getTime();
            if (now - timestamp > this.cacheDuration) {
                return null; // Cache expired
            }
            
            // Check if it's for the right base currency
            if (base !== baseCurrency) {
                return null; // Wrong base currency
            }
            
            return rates;
        } catch (error) {
            console.error('Failed to read cached rates:', error);
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
        
        // If rates don't have the target currency, use USD as intermediary
        if (!rates[toCurrency] && fromCurrency !== 'USD') {
            const toUSD = this.convert(amount, fromCurrency, 'USD', rates);
            return this.convert(toUSD, 'USD', toCurrency);
        }
        
        const rate = rates[toCurrency];
        if (!rate) {
            console.warn(`No conversion rate found from ${fromCurrency} to ${toCurrency}`);
            return amount; // Return original amount as fallback
        }
        
        return amount * rate;
    }
    
    async convertToBase(amount, fromCurrency, baseCurrency) {
        if (fromCurrency === baseCurrency) {
            return amount;
        }
        
        const rates = await this.getExchangeRates(baseCurrency);
        return this.convert(amount, fromCurrency, baseCurrency, rates);
    }
    
    async convertFromBase(amount, baseCurrency, toCurrency) {
        if (baseCurrency === toCurrency) {
            return amount;
        }
        
        const rates = await this.getExchangeRates(baseCurrency);
        
        // For converting from base to another, we need the inverse rate
        // 1 base = X target, so target = amount * (1 / X)
        const rate = rates[toCurrency];
        if (!rate) {
            console.warn(`No conversion rate found from ${baseCurrency} to ${toCurrency}`);
            return amount;
        }
        
        return amount / rate;
    }
    
    getSupportedCurrencies() {
        return ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR'];
    }
    
    getCurrencySymbol(currencyCode) {
        const symbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥',
            'CAD': 'C$',
            'AUD': 'A$',
            'INR': '₹'
        };
        return symbols[currencyCode] || currencyCode;
    }
    
    formatCurrency(amount, currencyCode) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2
        }).format(amount);
    }
}
