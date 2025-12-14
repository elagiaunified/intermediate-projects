// js/main.js - Main application

window.ExpenseTrackerApp = class ExpenseTrackerApp {
    constructor() {
        console.log('Creating ExpenseTrackerApp');
        
        try {
            this.expenseManager = new ExpenseManager();
            this.currencyConverter = new CurrencyConverter();
            this.chartManager = new ChartManager();
            this.storageManager = new StorageManager();
        } catch (error) {
            console.error('Failed to create managers:', error);
            return;
        }
        
        this.currentBaseCurrency = 'USD';
        this.filters = {
            search: '',
            category: '',
            currency: ''
        };
        
        this.init();
    }
    
    init() {
        console.log('Initializing app');
        
        // Set current year
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
        
        // Set today's date in form
        const dateInput = document.getElementById('expense-date');
        if (dateInput) {
            dateInput.value = this.getTodayDate();
        }
        
        // Load data
        this.loadAppData();
        
        // Setup events
        this.setupEventListeners();
        
        // Initialize theme
        this.initTheme();
        
        // Initialize charts
        if (this.chartManager) {
            this.chartManager.init();
        }
        
        console.log('App initialized successfully');
    }
    
    getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    loadAppData() {
        console.log('Loading app data');
        
        if (!this.storageManager) return;
        
        const expenses = this.storageManager.loadExpenses();
        if (this.expenseManager) {
            this.expenseManager.setExpenses(expenses);
        }
        
        const settings = this.storageManager.loadSettings();
        if (settings.baseCurrency) {
            this.currentBaseCurrency = settings.baseCurrency;
            const currencySelect = document.getElementById('base-currency');
            if (currencySelect) {
                currencySelect.value = this.currentBaseCurrency;
            }
        }
        
        this.updateDashboard();
        this.renderExpenseTable();
        this.updateCurrencyRates();
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Expense form
        const expenseForm = document.getElementById('expense-form');
        if (expenseForm) {
            expenseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddExpense();
            });
        }
        
        // Clear form
        const clearFormBtn = document.getElementById('clear-form');
        if (clearFormBtn) {
            clearFormBtn.addEventListener('click', () => {
                this.clearExpenseForm();
            });
        }
        
        // Base currency change
        const baseCurrencySelect = document.getElementById('base-currency');
        if (baseCurrencySelect) {
            baseCurrencySelect.addEventListener('change', (e) => {
                this.currentBaseCurrency = e.target.value;
                this.storageManager.saveSettings({ baseCurrency: this.currentBaseCurrency });
                this.updateCurrencyRates(true);
                this.updateDashboard();
                this.renderExpenseTable();
            });
        }
        
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // Search
        const searchInput = document.getElementById('search-expenses');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.renderExpenseTable();
            });
        }
        
        // Category filter
        const categoryFilter = document.getElementById('filter-category');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.renderExpenseTable();
            });
        }
        
        // Currency filter
        const currencyFilter = document.getElementById('filter-currency');
        if (currencyFilter) {
            currencyFilter.addEventListener('change', (e) => {
                this.filters.currency = e.target.value;
                this.renderExpenseTable();
            });
        }
        
        // Clear filters
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.filters = { search: '', category: '', currency: '' };
                if (searchInput) searchInput.value = '';
                if (categoryFilter) categoryFilter.value = '';
                if (currencyFilter) currencyFilter.value = '';
                this.renderExpenseTable();
            });
        }
        
        // Refresh rates
        const refreshRatesBtn = document.getElementById('refresh-rates');
        if (refreshRatesBtn) {
            refreshRatesBtn.addEventListener('click', () => {
                this.updateCurrencyRates(true);
            });
        }
        
        // Clear all data
        const clearAllBtn = document.getElementById('clear-all-data');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Clear all data?')) {
                    this.expenseManager.clearAllExpenses();
                    this.storageManager.clearAllData();
                    this.updateDashboard();
                    this.renderExpenseTable();
                    this.showAlert('Data cleared', 'success');
                }
            });
        }
    }
    
    initTheme() {
        const savedTheme = localStorage.getItem('expense-tracker-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('expense-tracker-theme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    updateThemeIcon(theme) {
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
    
    async handleAddExpense() {
        const nameInput = document.getElementById('expense-name');
        const amountInput = document.getElementById('expense-amount');
        
        if (!nameInput || !amountInput) return;
        
        const name = nameInput.value.trim();
        const amount = amountInput.value;
        
        if (!name || !amount) {
            this.showAlert('Please fill required fields', 'error');
            return;
        }
        
        const expenseData = {
            name: name,
            amount: parseFloat(amount),
            currency: document.getElementById('expense-currency').value,
            category: document.getElementById('expense-category').value,
            date: document.getElementById('expense-date').value || this.getTodayDate(),
            paymentMethod: document.getElementById('expense-payment').value,
            notes: document.getElementById('expense-notes').value || ''
        };
        
        const expense = this.expenseManager.addExpense(expenseData);
        this.storageManager.saveExpenses(this.expenseManager.getExpenses());
        
        this.updateDashboard();
        this.renderExpenseTable();
        this.clearExpenseForm();
        
        this.showAlert(`Added: ${expenseData.name}`, 'success');
    }
    
    clearExpenseForm() {
        const form = document.getElementById('expense-form');
        if (form) form.reset();
        
        const dateInput = document.getElementById('expense-date');
        if (dateInput) {
            dateInput.value = this.getTodayDate();
        }
    }
    
    async updateCurrencyRates(forceRefresh = false) {
        try {
            const ratesGrid = document.getElementById('rates-grid');
            if (ratesGrid) {
                ratesGrid.innerHTML = '<div class="loading">Loading rates...</div>';
            }
            
            const rates = await this.currencyConverter.getExchangeRates(
                this.currentBaseCurrency, 
                forceRefresh
            );
            
            if (rates && ratesGrid) {
                this.renderCurrencyRates(rates);
            }
        } catch (error) {
            console.error('Rates error:', error);
        }
    }
    
    renderCurrencyRates(rates) {
        const ratesGrid = document.getElementById('rates-grid');
        if (!ratesGrid) return;
        
        ratesGrid.innerHTML = '';
        
        const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR']
            .filter(currency => currency !== this.currentBaseCurrency);
        
        popularCurrencies.forEach(currency => {
            const rate = rates[currency];
            if (rate) {
                const rateItem = document.createElement('div');
                rateItem.className = 'rate-item';
                rateItem.innerHTML = `
                    <div class="currency">${currency}</div>
                    <div class="rate">${rate.toFixed(4)}</div>
                    <div class="change">1 ${this.currentBaseCurrency} = ${rate.toFixed(2)} ${currency}</div>
                `;
                ratesGrid.appendChild(rateItem);
            }
        });
        
        const updatedElement = document.getElementById('rates-updated');
        if (updatedElement) {
            updatedElement.textContent = new Date().toLocaleTimeString();
        }
        
        const baseElement = document.getElementById('current-base');
        if (baseElement) {
            baseElement.textContent = this.currentBaseCurrency;
        }
    }
    
    updateDashboard() {
        if (!this.expenseManager) return;
        
        const expenses = this.expenseManager.getExpenses();
        const baseCurrency = this.currentBaseCurrency;
        
        // Total balance
        const totalBalance = this.expenseManager.getTotalInBaseCurrency(baseCurrency);
        const totalElement = document.getElementById('total-balance');
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(totalBalance, baseCurrency);
        }
        
        // Monthly expense
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && 
                   expenseDate.getFullYear() === currentYear;
        });
        
        let monthlyTotal = 0;
        for (const expense of monthlyExpenses) {
            const converted = this.currencyConverter.convertToBase(
                expense.amount, 
                expense.currency, 
                baseCurrency
            );
            monthlyTotal += converted;
        }
        
        const monthlyElement = document.getElementById('monthly-expense');
        if (monthlyElement) {
            monthlyElement.textContent = this.formatCurrency(monthlyTotal, baseCurrency);
        }
        
        // Category count
        const categories = new Set(expenses.map(expense => expense.category));
        const categoryElement = document.getElementById('category-count');
        if (categoryElement) {
            categoryElement.textContent = categories.size;
        }
        
        // Currency count
        const currencies = new Set(expenses.map(expense => expense.currency));
        currencies.add(baseCurrency);
        const currencyElement = document.getElementById('currency-count');
        if (currencyElement) {
            currencyElement.textContent = currencies.size;
        }
    }
    
    renderExpenseTable() {
        const tableBody = document.getElementById('expense-table-body');
        if (!tableBody || !this.expenseManager) return;
        
        const expenses = this.expenseManager.getExpenses();
        const baseCurrency = this.currentBaseCurrency;
        
        // Apply filters
        let filteredExpenses = [...expenses];
        
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filteredExpenses = filteredExpenses.filter(expense => 
                expense.name.toLowerCase().includes(searchTerm) ||
                (expense.notes && expense.notes.toLowerCase().includes(searchTerm))
            );
        }
        
        if (this.filters.category) {
            filteredExpenses = filteredExpenses.filter(expense => 
                expense.category === this.filters.category
            );
        }
        
        if (this.filters.currency) {
            filteredExpenses = filteredExpenses.filter(expense => 
                expense.currency === this.filters.currency
            );
        }
        
        // Sort by date
        filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Clear table
        tableBody.innerHTML = '';
        
        if (filteredExpenses.length === 0) {
            tableBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="6">No expenses found</td>
                </tr>
            `;
        } else {
            filteredExpenses.forEach(expense => {
                const baseAmount = this.currencyConverter.convertToBase(
                    expense.amount, 
                    expense.currency, 
                    baseCurrency
                );
                
                const categoryInfo = this.expenseManager.getCategoryInfo(expense.category);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${this.formatDate(expense.date)}</td>
                    <td>
                        <div class="expense-name">${expense.name}</div>
                        ${expense.notes ? `<small>${expense.notes}</small>` : ''}
                    </td>
                    <td>
                        <span class="category-tag ${expense.category}">
                            ${categoryInfo.name}
                        </span>
                    </td>
                    <td>
                        <div class="original-amount">
                            ${this.formatCurrency(expense.amount, expense.currency)}
                        </div>
                    </td>
                    <td>${this.formatCurrency(baseAmount, baseCurrency)}</td>
                    <td>
                        <button class="btn-icon edit-expense" data-id="${expense.id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-expense" data-id="${expense.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
            
            this.addExpenseRowEventListeners();
        }
        
        this.updateTableSummary(filteredExpenses);
    }
    
    addExpenseRowEventListeners() {
        document.querySelectorAll('.edit-expense').forEach(button => {
            button.addEventListener('click', (e) => {
                const expenseId = e.currentTarget.getAttribute('data-id');
                this.handleEditExpense(expenseId);
            });
        });
        
        document.querySelectorAll('.delete-expense').forEach(button => {
            button.addEventListener('click', (e) => {
                const expenseId = e.currentTarget.getAttribute('data-id');
                this.handleDeleteExpense(expenseId);
            });
        });
    }
    
    handleEditExpense(expenseId) {
        const expense = this.expenseManager.getExpense(expenseId);
        if (!expense) return;
        
        document.getElementById('expense-name').value = expense.name;
        document.getElementById('expense-amount').value = expense.amount;
        document.getElementById('expense-currency').value = expense.currency;
        document.getElementById('expense-category').value = expense.category;
        document.getElementById('expense-date').value = expense.date;
        document.getElementById('expense-payment').value = expense.paymentMethod;
        document.getElementById('expense-notes').value = expense.notes || '';
        
        const submitButton = document.querySelector('#expense-form button[type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-edit"></i> Update Expense';
            submitButton.setAttribute('data-edit-id', expenseId);
        }
    }
    
    handleDeleteExpense(expenseId) {
        if (confirm('Delete this expense?')) {
            const success = this.expenseManager.deleteExpense(expenseId);
            
            if (success) {
                this.storageManager.saveExpenses(this.expenseManager.getExpenses());
                this.updateDashboard();
                this.renderExpenseTable();
                this.showAlert('Expense deleted', 'success');
            }
        }
    }
    
    updateTableSummary(filteredExpenses) {
        const baseCurrency = this.currentBaseCurrency;
        
        let filteredTotal = 0;
        for (const expense of filteredExpenses) {
            const converted = this.currencyConverter.convertToBase(
                expense.amount, 
                expense.currency, 
                baseCurrency
            );
            filteredTotal += converted;
        }
        
        const showingElement = document.getElementById('showing-count');
        if (showingElement) {
            showingElement.textContent = filteredExpenses.length;
        }
        
        const totalElement = document.getElementById('total-count');
        if (totalElement && this.expenseManager) {
            totalElement.textContent = this.expenseManager.getExpenses().length;
        }
        
        const filteredTotalElement = document.getElementById('filtered-total');
        if (filteredTotalElement) {
            filteredTotalElement.textContent = this.formatCurrency(filteredTotal, baseCurrency);
        }
    }
    
    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Create alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span>${message}</span>
            <button class="alert-close"><i class="fas fa-times"></i></button>
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 300);
        }, 3000);
        
        alert.querySelector('.alert-close').addEventListener('click', () => {
            alert.classList.remove('show');
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 300);
        });
    }
    
    formatCurrency(amount, currencyCode) {
    // Validate amount
    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
        console.warn('Invalid amount for formatting:', amount);
        amount = 0;
    }
    
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    } catch (error) {
        console.warn('Intl.NumberFormat failed, using fallback:', error);
        
        // Fallback formatting
        try {
            const symbol = this.currencyConverter.getCurrencySymbol(currencyCode);
            return `${symbol}${amount.toFixed(2)}`;
        } catch (fallbackError) {
            console.error('Fallback formatting also failed:', fallbackError);
            return `₹${amount.toFixed(2)}`; // Hardcoded fallback
        }
    }
}
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Initialize app
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting app...');
    
    // Check if required classes are defined
    if (typeof StorageManager === 'undefined') {
        console.error('StorageManager is not defined!');
        return;
    }
    
    if (typeof ExpenseManager === 'undefined') {
        console.error('ExpenseManager is not defined!');
        return;
    }
    
    if (typeof CurrencyConverter === 'undefined') {
        console.error('CurrencyConverter is not defined!');
        return;
    }
    
    if (typeof ChartManager === 'undefined') {
        console.error('ChartManager is not defined!');
        return;
    }
    
    if (typeof ExpenseTrackerApp === 'undefined') {
        console.error('ExpenseTrackerApp is not defined!');
        return;
    }
    
    try {
        window.app = new ExpenseTrackerApp();
        console.log('App created successfully');
    } catch (error) {
        console.error('Failed to create app:', error);
    }
});
