// js/expenseManager.js - Handles expense CRUD operations

class ExpenseManager {
    constructor() {
        this.expenses = [];
        this.nextId = 1;
    }
    
    setExpenses(expenses) {
        this.expenses = expenses || [];
        // Calculate next available ID
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
        if (!window.app?.currencyConverter) {
            return 0;
        }
        
        return this.expenses.reduce((total, expense) => {
            return total + window.app.currencyConverter.convertToBase(
                expense.amount,
                expense.currency,
                baseCurrency
            );
        }, 0);
    }
    
    getExpensesByCategory(category) {
        return this.expenses.filter(expense => expense.category === category);
    }
    
    getExpensesByCurrency(currency) {
        return this.expenses.filter(expense => expense.currency === currency);
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
    
    getUniqueCategories() {
        return [...new Set(this.expenses.map(expense => expense.category))];
    }
    
    getUniqueCurrencies() {
        return [...new Set(this.expenses.map(expense => expense.currency))];
    }
    
    clearAllExpenses() {
        this.expenses = [];
        this.nextId = 1;
    }
}
