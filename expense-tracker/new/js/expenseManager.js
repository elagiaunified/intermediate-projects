// js/expenseManager.js - Handles expense CRUD operations

window.ExpenseManager = class ExpenseManager {
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
            'other': { name: 'Other', color: '#95a5a6', icon: '📦' }
        };
    }
    
    setExpenses(expenses) {
        this.expenses = expenses || [];
        const maxId = this.expenses.reduce((max, expense) => 
            Math.max(max, expense.id || 0), 0);
        this.nextId = maxId + 1;
    }
    
    getExpenses() {
        return [...this.expenses];
    }
    
    getExpense(id) {
        return this.expenses.find(expense => expense.id === id);
    }
    
    addExpense(expenseData) {
        const expense = {
            id: this.nextId++,
            ...expenseData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.expenses.push(expense);
        return expense;
    }
    
    updateExpense(id, updatedData) {
        const index = this.expenses.findIndex(expense => expense.id === id);
        
        if (index === -1) {
            return false;
        }
        
        this.expenses[index] = {
            ...this.expenses[index],
            ...updatedData,
            updatedAt: new Date().toISOString()
        };
        return true;
    }
    
    deleteExpense(id) {
        const initialLength = this.expenses.length;
        this.expenses = this.expenses.filter(expense => expense.id !== id);
        return this.expenses.length < initialLength;
    }
    
    getTotalInBaseCurrency(baseCurrency) {
        if (!window.app || !window.app.currencyConverter) {
            return 0;
        }
        
        let total = 0;
        for (const expense of this.expenses) {
            const converted = window.app.currencyConverter.convertToBase(
                expense.amount,
                expense.currency,
                baseCurrency
            );
            total += converted;
        }
        return total;
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
    
    clearAllExpenses() {
        this.expenses = [];
        this.nextId = 1;
    }
}
