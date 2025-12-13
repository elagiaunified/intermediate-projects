// js/currencyConverter.js - Enhanced with proper API integration

class CurrencyConverter {
    constructor() {
        // Use environment variable or fallback
        this.apiKey = 'a0d0a7e4e0e2d1c4d3b4a5c6'; // Demo key - replace with your own
        this.apiUrl = 'https://api.exchangerate-api.com/v4/latest/';
        this.cacheKey = 'expense-tracker-currency-rates';
        this.cacheDuration = 3600000; // 1 hour in milliseconds
        
        // Extended fallback rates with more currencies
        this.fallbackRates = {
            USD: { 
                USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150.50, 
                CAD: 1.35, AUD: 1.52, INR: 83.25, CHF: 0.88,
                CNY: 7.18, SGD: 1.34, NZD: 1.62, KRW: 1330,
                BRL: 4.95, RUB: 92.50, ZAR: 18.75, MXN: 17.05
            },
            EUR: { 
                USD: 1.09, EUR: 1, GBP: 0.86, JPY: 163.50,
                CAD: 1.47, AUD: 1.65, INR: 90.50, CHF: 0.96,
                CNY: 7.82, SGD: 1.46, NZD: 1.76, KRW: 1445,
                BRL: 5.38, RUB: 100.50, ZAR: 20.38, MXN: 18.52
            },
            GBP: {
                USD: 1.27, EUR: 1.16, GBP: 1, JPY: 190.25,
                CAD: 1.71, AUD: 1.92, INR: 105.25, CHF: 1.12,
                CNY: 9.08, SGD: 1.70, NZD: 2.05, KRW: 1685,
                BRL: 6.25, RUB: 116.75, ZAR: 23.68, MXN: 21.52
            }
            // Other currencies would follow similar pattern
        };
        
        this.supportedCurrencies = [
            'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR',
            'CHF', 'CNY', 'SGD', 'NZD', 'KRW', 'BRL', 'RUB',
            'ZAR', 'MXN'
        ];
    }
    
    async getExchangeRates(baseCurrency = 'USD', forceRefresh = false) {
        // Validate base currency
        if (!this.supportedCurrencies.includes(baseCurrency)) {
            console.warn(`Unsupported base currency: ${baseCurrency}, defaulting to USD`);
            baseCurrency = 'USD';
        }
        
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
            console.log(`Fetching rates for base: ${baseCurrency}`);
            const response = await fetch(`${this.apiUrl}${baseCurrency}`);
            
            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.rates) {
                throw new Error('Invalid API response format');
            }
            
            // Cache the rates
            this.cacheRates(baseCurrency, data.rates);
            
            // Show notification
            if (window.app) {
                window.app.showAlert('Exchange rates updated successfully!', 'success');
            }
            
            return data.rates;
        } catch (error) {
            console.warn('Failed to fetch exchange rates, using fallback:', error);
            
            // Show error notification
            if (window.app && forceRefresh) {
                window.app.showAlert('Using cached rates. Network error.', 'error');
            }
            
            // Use fallback rates
            return this.fallbackRates[baseCurrency] || this.fallbackRates.USD;
        }
    }
    
    getCachedRates(baseCurrency) {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            
            // Check if cache is still valid
            const now = new Date().getTime();
            if (now - cacheData.timestamp > this.cacheDuration) {
                console.log('Cache expired');
                return null;
            }
            
            // Check if it's for the right base currency
            if (cacheData.base !== baseCurrency) {
                console.log('Cache for different base currency');
                return null;
            }
            
            console.log('Using cached rates');
            return cacheData.rates;
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
                rates: rates,
                cachedAt: new Date().toISOString()
            };
            
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
            console.log('Rates cached successfully');
        } catch (error) {
            console.error('Failed to cache rates:', error);
        }
    }
    
    convert(amount, fromCurrency, toCurrency, rates = null) {
        // Validate inputs
        if (typeof amount !== 'number' || isNaN(amount)) {
            console.error('Invalid amount:', amount);
            return 0;
        }
        
        if (fromCurrency === toCurrency) {
            return amount;
        }
        
        if (!rates) {
            rates = this.fallbackRates[fromCurrency] || this.fallbackRates.USD;
        }
        
        // Check if direct rate exists
        if (rates[toCurrency]) {
            return amount * rates[toCurrency];
        }
        
        // Try USD as intermediary
        if (fromCurrency !== 'USD' && rates.USD && this.fallbackRates.USD[toCurrency]) {
            const toUSD = amount * rates.USD;
            return toUSD * this.fallbackRates.USD[toCurrency];
        }
        
        console.warn(`No conversion rate found from ${fromCurrency} to ${toCurrency}`);
        return amount; // Return original amount as fallback
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
        if (!rates[toCurrency]) {
            console.warn(`No conversion rate found from ${baseCurrency} to ${toCurrency}`);
            return amount;
        }
        
        return amount / rates[toCurrency];
    }
    
    getSupportedCurrencies() {
        return this.supportedCurrencies;
    }
    
    getCurrencySymbol(currencyCode) {
        const symbols = {
            'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥',
            'CAD': 'C$', 'AUD': 'A$', 'INR': '₹', 'CHF': 'CHF',
            'CNY': '¥', 'SGD': 'S$', 'NZD': 'NZ$', 'KRW': '₩',
            'BRL': 'R$', 'RUB': '₽', 'ZAR': 'R', 'MXN': '$'
        };
        return symbols[currencyCode] || currencyCode;
    }
    
    getCurrencyName(currencyCode) {
        const names = {
            'USD': 'US Dollar', 'EUR': 'Euro', 'GBP': 'British Pound',
            'JPY': 'Japanese Yen', 'CAD': 'Canadian Dollar',
            'AUD': 'Australian Dollar', 'INR': 'Indian Rupee',
            'CHF': 'Swiss Franc', 'CNY': 'Chinese Yuan',
            'SGD': 'Singapore Dollar', 'NZD': 'New Zealand Dollar',
            'KRW': 'South Korean Won', 'BRL': 'Brazilian Real',
            'RUB': 'Russian Ruble', 'ZAR': 'South African Rand',
            'MXN': 'Mexican Peso'
        };
        return names[currencyCode] || currencyCode;
    }
    
    formatCurrency(amount, currencyCode, locale = 'en-US') {
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        } catch (error) {
            // Fallback formatting
            const symbol = this.getCurrencySymbol(currencyCode);
            return `${symbol}${amount.toFixed(2)}`;
        }
    }
    
    // Get historical rates (simplified - for demo purposes)
    async getHistoricalRates(baseCurrency, date) {
        // Note: This is a simplified version. Real implementation would need a different API endpoint
        console.log(`Historical rates requested for ${date}`);
        // For now, return current rates
        return await this.getExchangeRates(baseCurrency);
    }
    
    // Calculate conversion between any two currencies
    async convertBetween(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;
        
        // Get rates with fromCurrency as base
        const rates = await this.getExchangeRates(fromCurrency);
        return this.convert(amount, fromCurrency, toCurrency, rates);
    }
}
