// js/main.js - Main application initialization and coordination

class ExpenseTrackerApp {
    constructor() {
        // Initialize managers
        this.expenseManager = new ExpenseManager();
        this.currencyConverter = new CurrencyConverter();
        this.chartManager = new ChartManager();
        this.storageManager = new StorageManager();
        
        // State
        this.currentBaseCurrency = 'USD';
        this.filters = {
            search: '',
            category: '',
            currency: ''
        };
        
        // Initialize the app
        this.init();
    }
    
    init() {
        // Set current year in footer
        document.getElementById('current-year').textContent = new Date().getFullYear();
        
        // Set today's date as default in form
        document.getElementById('expense-date').value = this.getTodayDate();
        
        // Load initial data
        this.loadAppData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize theme
        this.initTheme();
        
        // Initialize charts
        this.chartManager.init();
        
        console.log('Expense Tracker App initialized');
    }
    
    getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    loadAppData() {
        // Load expenses from storage
        const expenses = this.storageManager.loadExpenses();
        this.expenseManager.setExpenses(expenses);
        
        // Load settings
        const settings = this.storageManager.loadSettings();
        if (settings.baseCurrency) {
            this.currentBaseCurrency = settings.baseCurrency;
            document.getElementById('base-currency').value = this.currentBaseCurrency;
        }
        
        // Update UI with loaded data
        this.updateDashboard();
        this.renderExpenseTable();
        this.updateCurrencyRates();
    }
    
    setupEventListeners() {
        // Expense form submission
        document.getElementById('expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddExpense();
        });
        
        // Clear form button
        document.getElementById('clear-form').addEventListener('click', () => {
            this.clearExpenseForm();
        });
        
        // Base currency change
        document.getElementById('base-currency').addEventListener('change', (e) => {
            this.handleBaseCurrencyChange(e.target.value);
        });
        
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Search input
        document.getElementById('search-expenses').addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.renderExpenseTable();
        });
        
        // Category filter
        document.getElementById('filter-category').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.renderExpenseTable();
        });
        
        // Currency filter
        document.getElementById('filter-currency').addEventListener('change', (e) => {
            this.filters.currency = e.target.value;
            this.renderExpenseTable();
        });
        
        // Clear filters
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });
        
        // Refresh rates
        document.getElementById('refresh-rates').addEventListener('click', () => {
            this.updateCurrencyRates(true);
        });
        
        // Clear all data
        document.getElementById('clear-all-data').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleClearAllData();
        });
        
        // Backup data
        document.getElementById('backup-data').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleBackupData();
        });
        
        // Restore data
        document.getElementById('restore-data').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleRestoreData();
        });
        
        // Export data
        document.getElementById('export-data').addEventListener('click', () => {
            this.handleExportData();
        });
        
        // Import data
        document.getElementById('import-data').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        
        // File import
        document.getElementById('import-file').addEventListener('change', (e) => {
            this.handleImportData(e);
        });
        
        // Chart view controls
        document.getElementById('view-monthly').addEventListener('click', () => {
            this.setActiveChartView('monthly');
        });
        
        document.getElementById('view-yearly').addEventListener('click', () => {
            this.setActiveChartView('yearly');
        });
        
        // Export chart
        document.getElementById('export-chart').addEventListener('click', () => {
            this.chartManager.exportChart();
        });
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
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    handleAddExpense() {
        const expenseData = this.getExpenseFormData();
        
        if (!expenseData.name || !expenseData.amount) {
            this.showAlert('Please fill in required fields', 'error');
            return;
        }
        
        // Convert amount to number
        expenseData.amount = parseFloat(expenseData.amount);
        
        // Add the expense
        const expense = this.expenseManager.addExpense(expenseData);
        
        // Save to storage
        this.storageManager.saveExpenses(this.expenseManager.getExpenses());
        
        // Update UI
        this.updateDashboard();
        this.renderExpenseTable();
        this.clearExpenseForm();
        
        // Show success message
        this.showAlert(`Added expense: ${expenseData.name}`, 'success');
        
        // Update chart
        this.updateCharts();
    }
    
    getExpenseFormData() {
        return {
            name: document.getElementById('expense-name').value.trim(),
            amount: document.getElementById('expense-amount').value,
            currency: document.getElementById('expense-currency').value,
            category: document.getElementById('expense-category').value,
            date: document.getElementById('expense-date').value || this.getTodayDate(),
            paymentMethod: document.getElementById('expense-payment').value,
            notes: document.getElementById('expense-notes').value.trim()
        };
    }
    
    clearExpenseForm() {
        document.getElementById('expense-form').reset();
        document.getElementById('expense-date').value = this.getTodayDate();
    }
    
    async handleBaseCurrencyChange(newCurrency) {
        this.currentBaseCurrency = newCurrency;
        
        // Save setting
        this.storageManager.saveSettings({ baseCurrency: newCurrency });
        
        // Update currency rates
        await this.updateCurrencyRates(true);
        
        // Update all displays
        this.updateDashboard();
        this.renderExpenseTable();
        this.updateCharts();
    }
    
    async updateCurrencyRates(forceRefresh = false) {
        try {
            const rates = await this.currencyConverter.getExchangeRates(
                this.currentBaseCurrency, 
                forceRefresh
            );
            
            if (rates) {
                this.renderCurrencyRates(rates);
            }
        } catch (error) {
            console.error('Failed to update currency rates:', error);
        }
    }
    
    renderCurrencyRates(rates) {
        const ratesGrid = document.getElementById('rates-grid');
        const baseCurrency = this.currentBaseCurrency;
        
        // Clear loading state
        ratesGrid.innerHTML = '';
        
        // Get popular currencies to display
        const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR']
            .filter(currency => currency !== baseCurrency);
        
        // Add rate items
        popularCurrencies.forEach(currency => {
            const rate = rates[currency];
            if (rate) {
                const rateItem = document.createElement('div');
                rateItem.className = 'rate-item';
                rateItem.innerHTML = `
                    <div class="currency">${currency}</div>
                    <div class="rate">${rate.toFixed(4)}</div>
                    <div class="change">1 ${baseCurrency} = ${rate.toFixed(2)} ${currency}</div>
                `;
                ratesGrid.appendChild(rateItem);
            }
        });
        
        // Update timestamp
        document.getElementById('rates-updated').textContent = new Date().toLocaleTimeString();
        document.getElementById('current-base').textContent = baseCurrency;
    }
    
    updateDashboard() {
        const expenses = this.expenseManager.getExpenses();
        const baseCurrency = this.currentBaseCurrency;
        
        // Calculate total balance (negative for expenses)
        const totalBalance = this.expenseManager.getTotalInBaseCurrency(baseCurrency);
        document.getElementById('total-balance').textContent = 
            this.formatCurrency(totalBalance, baseCurrency);
        
        // Calculate monthly expense
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && 
                   expenseDate.getFullYear() === currentYear;
        });
        
        const monthlyTotal = monthlyExpenses.reduce((sum, expense) => {
            return sum + this.currencyConverter.convertToBase(
                expense.amount, 
                expense.currency, 
                baseCurrency
            );
        }, 0);
        
        document.getElementById('monthly-expense').textContent = 
            this.formatCurrency(monthlyTotal, baseCurrency);
        
        // Count unique categories
        const categories = new Set(expenses.map(expense => expense.category));
        document.getElementById('category-count').textContent = categories.size;
        
        // Count unique currencies
        const currencies = new Set(expenses.map(expense => expense.currency));
        currencies.add(baseCurrency);
        document.getElementById('currency-count').textContent = currencies.size;
    }
    
    renderExpenseTable() {
        const tableBody = document.getElementById('expense-table-body');
        const expenses = this.expenseManager.getExpenses();
        const baseCurrency = this.currentBaseCurrency;
        
        // Apply filters
        let filteredExpenses = [...expenses];
        
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filteredExpenses = filteredExpenses.filter(expense => 
                expense.name.toLowerCase().includes(searchTerm) ||
                expense.notes.toLowerCase().includes(searchTerm)
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
        
        // Sort by date (newest first)
        filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Clear table
        tableBody.innerHTML = '';
        
        if (filteredExpenses.length === 0) {
            tableBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="6">No expenses found. Try adjusting your filters.</td>
                </tr>
            `;
        } else {
            // Add expense rows
            filteredExpenses.forEach(expense => {
                const baseAmount = this.currencyConverter.convertToBase(
                    expense.amount, 
                    expense.currency, 
                    baseCurrency
                );
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${this.formatDate(expense.date)}</td>
                    <td>
                        <div class="expense-name">${expense.name}</div>
                        ${expense.notes ? `<small>${expense.notes}</small>` : ''}
                    </td>
                    <td>
                        <span class="category-tag ${expense.category}">
                            ${this.getCategoryLabel(expense.category)}
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
            
            // Add event listeners for edit/delete buttons
            this.addExpenseRowEventListeners();
        }
        
        // Update summary
        this.updateTableSummary(filteredExpenses);
    }
    
    addExpenseRowEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-expense').forEach(button => {
            button.addEventListener('click', (e) => {
                const expenseId = e.currentTarget.getAttribute('data-id');
                this.handleEditExpense(expenseId);
            });
        });
        
        // Delete buttons
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
        
        // Populate form with expense data
        document.getElementById('expense-name').value = expense.name;
        document.getElementById('expense-amount').value = expense.amount;
        document.getElementById('expense-currency').value = expense.currency;
        document.getElementById('expense-category').value = expense.category;
        document.getElementById('expense-date').value = expense.date;
        document.getElementById('expense-payment').value = expense.paymentMethod;
        document.getElementById('expense-notes').value = expense.notes || '';
        
        // Change form button to "Update"
        const submitButton = document.querySelector('#expense-form button[type="submit"]');
        submitButton.innerHTML = '<i class="fas fa-edit"></i> Update Expense';
        submitButton.setAttribute('data-edit-id', expenseId);
        
        // Scroll to form
        document.querySelector('.add-expense-form').scrollIntoView({ behavior: 'smooth' });
        
        // Change form submission to update
        const form = document.getElementById('expense-form');
        const originalSubmit = form.onsubmit;
        
        form.onsubmit = (e) => {
            e.preventDefault();
            this.handleUpdateExpense(expenseId);
        };
    }
    
    handleUpdateExpense(expenseId) {
        const expenseData = this.getExpenseFormData();
        expenseData.amount = parseFloat(expenseData.amount);
        
        const success = this.expenseManager.updateExpense(expenseId, expenseData);
        
        if (success) {
            // Save to storage
            this.storageManager.saveExpenses(this.expenseManager.getExpenses());
            
            // Update UI
            this.updateDashboard();
            this.renderExpenseTable();
            this.clearExpenseForm();
            
            // Reset form button
            const submitButton = document.querySelector('#expense-form button[type="submit"]');
            submitButton.innerHTML = '<i class="fas fa-save"></i> Add Expense';
            submitButton.removeAttribute('data-edit-id');
            
            // Reset form submission
            document.getElementById('expense-form').onsubmit = (e) => {
                e.preventDefault();
                this.handleAddExpense();
            };
            
            this.showAlert('Expense updated successfully!', 'success');
            this.updateCharts();
        }
    }
    
    handleDeleteExpense(expenseId) {
        if (confirm('Are you sure you want to delete this expense?')) {
            const success = this.expenseManager.deleteExpense(expenseId);
            
            if (success) {
                // Save to storage
                this.storageManager.saveExpenses(this.expenseManager.getExpenses());
                
                // Update UI
                this.updateDashboard();
                this.renderExpenseTable();
                
                this.showAlert('Expense deleted successfully!', 'success');
                this.updateCharts();
            }
        }
    }
    
    updateTableSummary(filteredExpenses) {
        const baseCurrency = this.currentBaseCurrency;
        
        // Calculate filtered total
        const filteredTotal = filteredExpenses.reduce((sum, expense) => {
            return sum + this.currencyConverter.convertToBase(
                expense.amount, 
                expense.currency, 
                baseCurrency
            );
        }, 0);
        
        // Update counts
        document.getElementById('showing-count').textContent = filteredExpenses.length;
        document.getElementById('total-count').textContent = this.expenseManager.getExpenses().length;
        document.getElementById('filtered-total').textContent = 
            this.formatCurrency(filteredTotal, baseCurrency);
    }
    
    clearFilters() {
        this.filters = {
            search: '',
            category: '',
            currency: ''
        };
        
        document.getElementById('search-expenses').value = '';
        document.getElementById('filter-category').value = '';
        document.getElementById('filter-currency').value = '';
        
        this.renderExpenseTable();
    }
    
    updateCharts() {
        const expenses = this.expenseManager.getExpenses();
        const baseCurrency = this.currentBaseCurrency;
        
        // Prepare data for charts
        const chartData = this.prepareChartData(expenses, baseCurrency);
        this.chartManager.updateCharts(chartData);
    }
    
    prepareChartData(expenses, baseCurrency) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Category data
        const categoryTotals = {};
        expenses.forEach(expense => {
            const baseAmount = this.currencyConverter.convertToBase(
                expense.amount, 
                expense.currency, 
                baseCurrency
            );
            
            if (!categoryTotals[expense.category]) {
                categoryTotals[expense.category] = 0;
            }
            categoryTotals[expense.category] += baseAmount;
        });
        
        // Monthly data (last 6 months)
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - i, 1);
            const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            
            const monthExpenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === date.getMonth() && 
                       expenseDate.getFullYear() === date.getFullYear();
            });
            
            const monthTotal = monthExpenses.reduce((sum, expense) => {
                return sum + this.currencyConverter.convertToBase(
                    expense.amount, 
                    expense.currency, 
                    baseCurrency
                );
            }, 0);
            
            monthlyData.push({
                month: monthYear,
                total: monthTotal
            });
        }
        
        return {
            categories: categoryTotals,
            monthly: monthlyData
        };
    }
    
    setActiveChartView(view) {
        const monthlyBtn = document.getElementById('view-monthly');
        const yearlyBtn = document.getElementById('view-yearly');
        
        if (view === 'monthly') {
            monthlyBtn.classList.add('active');
            yearlyBtn.classList.remove('active');
        } else {
            yearlyBtn.classList.remove('active');
            monthlyBtn.classList.add('active');
        }
        
        // Update chart view
        this.chartManager.setView(view);
    }
    
    async handleExportData() {
        const expenses = this.expenseManager.getExpenses();
        const settings = this.storageManager.loadSettings();
        
        const data = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            expenses: expenses,
            settings: settings
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showAlert('Data exported successfully!', 'success');
    }
    
    async handleImportData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate data structure
                if (!data.expenses || !Array.isArray(data.expenses)) {
                    throw new Error('Invalid data format');
                }
                
                // Import expenses
                this.expenseManager.setExpenses(data.expenses);
                
                // Import settings if available
                if (data.settings) {
                    this.storageManager.saveSettings(data.settings);
                    if (data.settings.baseCurrency) {
                        this.currentBaseCurrency = data.settings.baseCurrency;
                        document.getElementById('base-currency').value = this.currentBaseCurrency;
                    }
                }
                
                // Save to storage
                this.storageManager.saveExpenses(this.expenseManager.getExpenses());
                
                // Update UI
                this.updateDashboard();
                this.renderExpenseTable();
                this.updateCharts();
                
                // Clear file input
                event.target.value = '';
                
                this.showAlert('Data imported successfully!', 'success');
            } catch (error) {
                console.error('Import error:', error);
                this.showAlert('Failed to import data. Please check the file format.', 'error');
            }
        };
        
        reader.readAsText(file);
    }
    
    handleBackupData() {
        this.handleExportData();
    }
    
    handleRestoreData() {
        document.getElementById('import-file').click();
    }
    
    handleClearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            // Clear all data
            this.expenseManager.clearAllExpenses();
            this.storageManager.clearAllData();
            
            // Reset UI
            this.updateDashboard();
            this.renderExpenseTable();
            this.updateCharts();
            
            this.showAlert('All data cleared successfully!', 'success');
        }
    }
    
    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span>${message}</span>
            <button class="alert-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add to page
        document.body.appendChild(alert);
        
        // Show alert
        setTimeout(() => {
            alert.classList.add('show');
        }, 10);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 300);
        }, 5000);
        
        // Close button
        alert.querySelector('.alert-close').addEventListener('click', () => {
            alert.classList.remove('show');
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 300);
        });
    }
    
    getCategoryLabel(category) {
        const labels = {
            'food': 'Food & Dining',
            'transport': 'Transportation',
            'shopping': 'Shopping',
            'entertainment': 'Entertainment',
            'bills': 'Bills & Utilities',
            'health': 'Health & Medical',
            'education': 'Education',
            'other': 'Other'
        };
        return labels[category] || category;
    }
    
    formatCurrency(amount, currencyCode) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2
        }).format(amount);
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

// Add alert styles dynamically
const alertStyles = document.createElement('style');
alertStyles.textContent = `
    .alert {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        min-width: 300px;
        max-width: 400px;
        transform: translateX(100%);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .alert.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .alert-success {
        background: linear-gradient(135deg, #2ecc71, #27ae60);
    }
    
    .alert-error {
        background: linear-gradient(135deg, #e74c3c, #c0392b);
    }
    
    .alert-info {
        background: linear-gradient(135deg, #3498db, #2980b9);
    }
    
    .alert-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.25rem;
        font-size: 1rem;
        opacity: 0.8;
        transition: opacity 0.2s;
    }
    
    .alert-close:hover {
        opacity: 1;
    }
    
    .category-tag {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 500;
        background: var(--bg-color);
        color: var(--text-color);
    }
    
    .category-tag.food { background: #ffebee; color: #c62828; }
    .category-tag.transport { background: #e3f2fd; color: #1565c0; }
    .category-tag.shopping { background: #f3e5f5; color: #7b1fa2; }
    .category-tag.entertainment { background: #fff3e0; color: #ef6c00; }
    .category-tag.bills { background: #e8f5e9; color: #2e7d32; }
    .category-tag.health { background: #e0f7fa; color: #006064; }
    .category-tag.education { background: #fff8e1; color: #ff8f00; }
    .category-tag.other { background: #f5f5f5; color: #424242; }
`;
document.head.appendChild(alertStyles);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ExpenseTrackerApp();
});
