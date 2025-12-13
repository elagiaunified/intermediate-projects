// js/expenseManager.js - Enhanced with advanced features

class ExpenseManager {
    constructor() {
        this.expenses = [];
        this.nextId = 1;
        this.categories = {
            'food': { name: 'Food & Dining', color: '#FF6384', icon: '🍕' },
            'transport': { name: 'Transportation', color: '#36A2EB', icon: '🚗' },
            'shopping': { name: 'Shopping', color: '#FFCE56', icon: '🛍️' },
            'entertainment': { name: 'Entertainment', color: '#4BC0C0', icon: '🎬' },
            'bills': { name: 'Bills & Utilities', color: '#9966FF', icon: '💡' },
            'health': { name: 'Health & Medical', color: '#FF9F40', icon: '🏥' },
            'education': { name: 'Education', color: '#FF6384', icon: '📚' },
            'travel': { name: 'Travel', color: '#C9CBCF', icon: '✈️' },
            'groceries': { name: 'Groceries', color: '#2ecc71', icon: '🛒' },
            'other': { name: 'Other', color: '#95a5a6', icon: '📦' }
        };
    }
    
    setExpenses(expenses) {
        this.expenses = expenses || [];
        // Calculate next available ID
        const maxId = this.expenses.reduce((max, expense) => 
            Math.max(max, expense.id || 0), 0);
        this.nextId = maxId + 1;
        
        // Validate and fix expense data
        this.expenses = this.expenses.map(expense => this.validateExpense(expense));
    }
    
    validateExpense(expense) {
        // Ensure required fields exist
        const defaultExpense = {
            id: expense.id || this.nextId++,
            name: 'Unnamed Expense',
            amount: 0,
            currency: 'USD',
            category: 'other',
            date: new Date().toISOString().split('T')[0],
            paymentMethod: 'cash',
            notes: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        return { ...defaultExpense, ...expense };
    }
    
    getExpenses() {
        return [...this.expenses];
    }
    
    getExpense(id) {
        return this.expenses.find(expense => expense.id === id);
    }
    
    addExpense(expenseData) {
        const expense = this.validateExpense({
            ...expenseData,
            id: this.nextId++
        });
        
        this.expenses.push(expense);
        return expense;
    }
    
    updateExpense(id, updatedData) {
        const index = this.expenses.findIndex(expense => expense.id === id);
        
        if (index === -1) {
            return false;
        }
        
        this.expenses[index] = this.validateExpense({
            ...this.expenses[index],
            ...updatedData,
            id: id // Ensure ID doesn't change
        });
        
        return true;
    }
    
    deleteExpense(id) {
        const initialLength = this.expenses.length;
        this.expenses = this.expenses.filter(expense => expense.id !== id);
        return this.expenses.length < initialLength;
    }
    
    // Advanced analytics methods
    getTotalInBaseCurrency(baseCurrency) {
        if (!window.app?.currencyConverter) {
            return 0;
        }
        
        return this.expenses.reduce((total, expense) => {
            const convertedAmount = window.app.currencyConverter.convertToBase(
                expense.amount,
                expense.currency,
                baseCurrency
            );
            return total + (convertedAmount || 0);
        }, 0);
    }
    
    getExpensesByTimePeriod(period = 'month') {
        const now = new Date();
        let startDate, endDate;
        
        switch (period) {
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                endDate = new Date();
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            default:
                return this.expenses;
        }
        
        return this.getExpensesByDateRange(startDate, endDate);
    }
    
    getExpensesByDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= start && expenseDate <= end;
        });
    }
    
    getMonthlyExpenses(year, month) {
        return this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getFullYear() === year && 
                   expenseDate.getMonth() === month;
        });
    }
    
    getYearlyExpenses(year) {
        return this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getFullYear() === year;
        });
    }
    
    getCategorySummary(baseCurrency) {
        const summary = {};
        
        this.expenses.forEach(expense => {
            if (!summary[expense.category]) {
                summary[expense.category] = {
                    count: 0,
                    total: 0,
                    totalInBase: 0
                };
            }
            
            summary[expense.category].count++;
            summary[expense.category].total += expense.amount;
            
            if (window.app?.currencyConverter) {
                const baseAmount = window.app.currencyConverter.convertToBase(
                    expense.amount,
                    expense.currency,
                    baseCurrency
                );
                summary[expense.category].totalInBase += baseAmount;
            }
        });
        
        return summary;
    }
    
    getCurrencySummary(baseCurrency) {
        const summary = {};
        
        this.expenses.forEach(expense => {
            if (!summary[expense.currency]) {
                summary[expense.currency] = {
                    count: 0,
                    total: 0,
                    totalInBase: 0
                };
            }
            
            summary[expense.currency].count++;
            summary[expense.currency].total += expense.amount;
            
            if (window.app?.currencyConverter) {
                const baseAmount = window.app.currencyConverter.convertToBase(
                    expense.amount,
                    expense.currency,
                    baseCurrency
                );
                summary[expense.currency].totalInBase += baseAmount;
            }
        });
        
        return summary;
    }
    
    getMonthlyTrend(baseCurrency, months = 6) {
        const trend = [];
        const now = new Date();
        
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthExpenses = this.getMonthlyExpenses(date.getFullYear(), date.getMonth());
            
            const total = monthExpenses.reduce((sum, expense) => {
                if (window.app?.currencyConverter) {
                    return sum + window.app.currencyConverter.convertToBase(
                        expense.amount,
                        expense.currency,
                        baseCurrency
                    );
                }
                return sum;
            }, 0);
            
            trend.push({
                month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                total: total,
                count: monthExpenses.length
            });
        }
        
        return trend;
    }
    
    getUniqueCategories() {
        return [...new Set(this.expenses.map(expense => expense.category))];
    }
    
    getUniqueCurrencies() {
        return [...new Set(this.expenses.map(expense => expense.currency))];
    }
    
    getCategoryInfo(category) {
        return this.categories[category] || { name: category, color: '#95a5a6', icon: '📦' };
    }
    
    addCustomCategory(categoryKey, categoryName, color, icon) {
        this.categories[categoryKey] = {
            name: categoryName,
            color: color,
            icon: icon
        };
    }
    
    searchExpenses(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.expenses.filter(expense => 
            expense.name.toLowerCase().includes(term) ||
            expense.notes.toLowerCase().includes(term) ||
            expense.category.toLowerCase().includes(term)
        );
    }
    
    clearAllExpenses() {
        this.expenses = [];
        this.nextId = 1;
    }
    
    // Statistics
    getStatistics(baseCurrency) {
        const expenses = this.expenses;
        if (expenses.length === 0) {
            return {
                totalExpenses: 0,
                averageExpense: 0,
                largestExpense: 0,
                smallestExpense: 0,
                mostCommonCategory: 'N/A',
                mostUsedCurrency: 'N/A'
            };
        }
        
        // Convert all to base currency for comparison
        const expensesInBase = expenses.map(expense => ({
            ...expense,
            amountInBase: window.app?.currencyConverter?.convertToBase(
                expense.amount,
                expense.currency,
                baseCurrency
            ) || expense.amount
        }));
        
        const total = expensesInBase.reduce((sum, exp) => sum + exp.amountInBase, 0);
        const average = total / expenses.length;
        
        const largest = Math.max(...expensesInBase.map(exp => exp.amountInBase));
        const smallest = Math.min(...expensesInBase.map(exp => exp.amountInBase));
        
        // Find most common category
        const categoryCounts = {};
        expenses.forEach(exp => {
            categoryCounts[exp.category] = (categoryCounts[exp.category] || 0) + 1;
        });
        const mostCommonCategory = Object.keys(categoryCounts).reduce((a, b) => 
            categoryCounts[a] > categoryCounts[b] ? a : b
        );
        
        // Find most used currency
        const currencyCounts = {};
        expenses.forEach(exp => {
            currencyCounts[exp.currency] = (currencyCounts[exp.currency] || 0) + 1;
        });
        const mostUsedCurrency = Object.keys(currencyCounts).reduce((a, b) => 
            currencyCounts[a] > categoryCounts[b] ? a : b
        );
        
        return {
            totalExpenses: expenses.length,
            totalAmount: total,
            averageExpense: average,
            largestExpense: largest,
            smallestExpense: smallest,
            mostCommonCategory: mostCommonCategory,
            mostUsedCurrency: mostUsedCurrency
        };
    }
}
