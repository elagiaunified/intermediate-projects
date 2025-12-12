// Smart Expense Tracker with Multi-Currency Support
class ExpenseTracker {
    constructor() {
        // API Configuration
        this.EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest';
        this.DEFAULT_CURRENCY = 'USD';
        
        // Application State
        this.transactions = [];
        this.budgets = [];
        this.exchangeRates = {};
        this.baseCurrency = 'USD';
        this.userCurrency = 'USD';
        this.autoDetectEnabled = true;
        this.charts = {};
        
        // DOM Elements
        this.elements = {
            // Currency Elements
            baseCurrency: document.getElementById('baseCurrency'),
            autoDetectCurrency: document.getElementById('autoDetectCurrency'),
            detectedCurrency: document.getElementById('detectedCurrency'),
            detectedCurrencyCode: document.getElementById('detectedCurrencyCode'),
            exchangeRates: document.getElementById('exchangeRates'),
            currentCurrency: document.getElementById('currentCurrency'),
            currencySymbol: document.getElementById('currencySymbol'),
            
            // Transaction Form
            transactionType: document.querySelector('.type-btn[data-type="expense"]'),
            amount: document.getElementById('amount'),
            transactionCurrency: document.getElementById('transactionCurrency'),
            category: document.getElementById('category'),
            date: document.getElementById('date'),
            description: document.getElementById('description'),
            recurring: document.getElementById('recurring'),
            tagInput: document.getElementById('tagInput'),
            tagsContainer: document.getElementById('tagsContainer'),
            addTransaction: document.getElementById('addTransaction'),
            clearForm: document.getElementById('clearForm'),
            
            // Dashboard
            totalBalance: document.getElementById('totalBalance'),
            totalIncome: document.getElementById('totalIncome'),
            totalExpenses: document.getElementById('totalExpenses'),
            timeRange: document.getElementById('timeRange'),
            exportData: document.getElementById('exportData'),
            
            // Charts
            balanceChart: document.getElementById('balanceChart'),
            categoryChart: document.getElementById('categoryChart'),
            incomeExpenseChart: document.getElementById('incomeExpenseChart'),
            
            // Transactions Table
            transactionsBody: document.getElementById('transactionsBody'),
            searchTransactions: document.getElementById('searchTransactions'),
            filterButtons: document.querySelectorAll('.filter-btn'),
            totalTransactions: document.getElementById('totalTransactions'),
            monthTransactions: document.getElementById('monthTransactions'),
            averageExpense: document.getElementById('averageExpense'),
            transactionsPagination: document.getElementById('transactionsPagination'),
            
            // Budget Management
            budgetCategories: document.getElementById('budgetCategories'),
            addBudget: document.getElementById('addBudget'),
            insightsList: document.getElementById('insightsList'),
            
            // Currency Converter
            converterAmount: document.getElementById('converterAmount'),
            converterFrom: document.getElementById('converterFrom'),
            converterTo: document.getElementById('converterTo'),
            converterResult: document.getElementById('converterResult'),
            exchangeRateInfo: document.getElementById('exchangeRateInfo'),
            swapCurrencies: document.getElementById('swapCurrencies'),
            updateRates: document.getElementById('updateRates'),
            
            // Modals & Overlays
            budgetModal: document.getElementById('budgetModal'),
            exportModal: document.getElementById('exportModal'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            toastContainer: document.getElementById('toastContainer')
        };
        
        // Initialize
        this.init();
    }
    
    // Initialize the application
    async init() {
        this.setupEventListeners();
        this.loadFromLocalStorage();
        await this.detectUserCurrency();
        await this.loadExchangeRates();
        this.populateCurrencySelectors();
        this.setupCharts();
        this.updateDashboard();
        this.updateTransactionsTable();
        this.updateBudgets();
        this.updateInsights();
        
        // Set today's date as default
        this.elements.date.value = new Date().toISOString().split('T')[0];
        
        // Show welcome message
        setTimeout(() => {
            this.showToast(`Currency auto-detected: ${this.userCurrency}`, 'info');
        }, 1000);
    }
    
    // Setup all event listeners
    setupEventListeners() {
        // Currency Settings
        this.elements.baseCurrency.addEventListener('change', () => this.changeBaseCurrency());
        this.elements.autoDetectCurrency.addEventListener('change', () => this.toggleAutoDetect());
        
        // Transaction Form
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTransactionType(e.target));
        });
        
        this.elements.addTransaction.addEventListener('click', () => this.addNewTransaction());
        this.elements.clearForm.addEventListener('click', () => this.clearTransactionForm());
        this.elements.tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTag();
            }
        });
        
        // Dashboard Controls
        this.elements.timeRange.addEventListener('change', () => this.updateDashboard());
        this.elements.exportData.addEventListener('click', () => this.showExportModal());
        
        // Transactions Table
        this.elements.searchTransactions.addEventListener('input', () => this.updateTransactionsTable());
        this.elements.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.filterTransactions(e.target));
        });
        
        // Budget Management
        this.elements.addBudget.addEventListener('click', () => this.showBudgetModal());
        
        // Currency Converter
        this.elements.converterAmount.addEventListener('input', () => this.updateConverter());
        this.elements.converterFrom.addEventListener('change', () => this.updateConverter());
        this.elements.converterTo.addEventListener('change', () => this.updateConverter());
        this.elements.swapCurrencies.addEventListener('click', () => this.swapConverterCurrencies());
        this.elements.updateRates.addEventListener('click', () => this.updateExchangeRates());
        
        // Export Modal
        document.getElementById('exportCSV')?.addEventListener('click', () => this.exportToCSV());
        document.getElementById('exportPDF')?.addEventListener('click', () => this.exportToPDF());
        document.getElementById('exportJSON')?.addEventListener('click', () => this.exportToJSON());
        
        // Close modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
        
        // Click outside modal to close
        [this.elements.budgetModal, this.elements.exportModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });
    }
    
    // Detect user's currency based on location
    async detectUserCurrency() {
        if (!this.autoDetectEnabled) return;
        
        try {
            // First try to get from browser locale
            const browserLocale = navigator.language || navigator.userLanguage;
            const countryCode = browserLocale.split('-')[1] || browserLocale.split('_')[1];
            
            if (countryCode) {
                const currencyMap = {
                    'US': 'USD', 'GB': 'GBP', 'EU': 'EUR', 'JP': 'JPY',
                    'CA': 'CAD', 'AU': 'AUD', 'CH': 'CHF', 'CN': 'CNY',
                    'IN': 'INR', 'BR': 'BRL', 'ZA': 'ZAR', 'MX': 'MXN',
                    'RU': 'RUB', 'KR': 'KRW', 'SG': 'SGD', 'HK': 'HKD'
                };
                
                if (currencyMap[countryCode]) {
                    this.userCurrency = currencyMap[countryCode];
                    this.elements.detectedCurrencyCode.textContent = this.userCurrency;
                    this.updateCurrencySymbol();
                    return;
                }
            }
            
            // Fallback: Use IP geolocation (simulated)
            const simulatedCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
            const randomIndex = Math.floor(Math.random() * simulatedCurrencies.length);
            this.userCurrency = simulatedCurrencies[randomIndex];
            
            this.elements.detectedCurrencyCode.textContent = this.userCurrency;
            this.updateCurrencySymbol();
            
        } catch (error) {
            console.warn('Currency detection failed, using default:', error);
            this.userCurrency = this.DEFAULT_CURRENCY;
            this.elements.detectedCurrencyCode.textContent = 'USD (Default)';
        }
    }
    
    // Load exchange rates from API
    async loadExchangeRates() {
        this.showLoading(true);
        
        try {
            const response = await fetch(`${this.EXCHANGE_API}/${this.baseCurrency}`);
            const data = await response.json();
            
            this.exchangeRates = data.rates;
            this.exchangeRates[this.baseCurrency] = 1; // Add base currency
            
            // Update UI with exchange rates
            this.updateExchangeRatesDisplay();
            this.updateConverter();
            
            // Update all transactions with new rates
            this.updateAllTransactionConversions();
            
        } catch (error) {
            console.error('Failed to load exchange rates:', error);
            this.showToast('Failed to load exchange rates. Using default rates.', 'error');
            
            // Fallback: Use hardcoded rates
            this.exchangeRates = {
                USD: 1, EUR: 0.92, GBP: 0.79, JPY: 147.5,
                CAD: 1.35, AUD: 1.55, CHF: 0.88, CNY: 7.28,
                INR: 83.2, BRL: 4.92, ZAR: 18.75
            };
        } finally {
            this.showLoading(false);
        }
    }
    
    // Update exchange rates display
    updateExchangeRatesDisplay() {
        const ratesContainer = this.elements.exchangeRates;
        const popularCurrencies = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY'];
        
        let ratesHTML = '';
        
        popularCurrencies.forEach(currency => {
            if (this.exchangeRates[currency]) {
                const rate = this.exchangeRates[currency].toFixed(4);
                ratesHTML += `
                    <div class="rate-item">
                        <div class="currency">${currency}</div>
                        <div class="rate">${rate}</div>
                    </div>
                `;
            }
        });
        
        ratesContainer.innerHTML = ratesHTML;
    }
    
    // Populate all currency selectors
    populateCurrencySelectors() {
        const currencies = Object.keys(this.exchangeRates).sort();
        
        // Populate transaction currency selector
        this.elements.transactionCurrency.innerHTML = currencies.map(currency => 
            `<option value="${currency}" ${currency === this.userCurrency ? 'selected' : ''}>
                ${currency}
            </option>`
        ).join('');
        
        // Populate converter selectors
        this.elements.converterFrom.innerHTML = currencies.map(currency => 
            `<option value="${currency}" ${currency === this.userCurrency ? 'selected' : ''}>
                ${currency}
            </option>`
        ).join('');
        
        this.elements.converterTo.innerHTML = currencies.map(currency => 
            `<option value="${currency}" ${currency === this.baseCurrency ? 'selected' : ''}>
                ${currency}
            </option>`
        ).join('');
    }
    
    // Update currency symbol based on selected currency
    updateCurrencySymbol() {
        const symbols = {
            'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥',
            'CAD': 'C$', 'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥',
            'INR': '₹', 'BRL': 'R$', 'ZAR': 'R', 'MXN': '$'
        };
        
        const symbol = symbols[this.userCurrency] || '$';
        this.elements.currencySymbol.textContent = symbol;
        this.elements.currentCurrency.textContent = this.userCurrency;
    }
    
    // Change base currency
    async changeBaseCurrency() {
        this.baseCurrency = this.elements.baseCurrency.value;
        this.showToast(`Base currency changed to ${this.baseCurrency}`, 'info');
        await this.loadExchangeRates();
        this.updateDashboard();
        this.updateTransactionsTable();
    }
    
    // Toggle auto-detect currency
    toggleAutoDetect() {
        this.autoDetectEnabled = this.elements.autoDetectCurrency.checked;
        if (this.autoDetectEnabled) {
            this.detectUserCurrency();
            this.showToast('Auto-detect enabled', 'info');
        } else {
            this.showToast('Auto-detect disabled', 'warning');
        }
    }
    
    // Add new transaction
    addNewTransaction() {
        const type = document.querySelector('.type-btn.active').dataset.type;
        const amount = parseFloat(this.elements.amount.value);
        const currency = this.elements.transactionCurrency.value;
        const category = this.elements.category.value;
        const date = this.elements.date.value;
        const description = this.elements.description.value.trim();
        const recurring = this.elements.recurring.value;
        
        // Validation
        if (!amount || amount <= 0) {
            this.showToast('Please enter a valid amount', 'error');
            return;
        }
        
        if (!category) {
            this.showToast('Please select a category', 'error');
            return;
        }
        
        if (!description) {
            this.showToast('Please enter a description', 'error');
            return;
        }
        
        // Get tags
        const tags = Array.from(this.elements.tagsContainer.querySelectorAll('.tag'))
            .map(tag => tag.querySelector('.tag-text').textContent);
        
        // Create transaction object
        const transaction = {
            id: Date.now() + Math.random(),
            type: type,
            amount: amount,
            originalCurrency: currency,
            category: category,
            date: date,
            description: description,
            recurring: recurring,
            tags: tags,
            createdAt: new Date().toISOString()
        };
        
        // Add to transactions array
        this.transactions.unshift(transaction);
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Update UI
        this.updateDashboard();
        this.updateTransactionsTable();
        this.updateBudgets();
        this.updateInsights();
        
        // Clear form
        this.clearTransactionForm();
        
        // Show success message
        const typeText = type === 'income' ? 'Income' : 'Expense';
        this.showToast(`${typeText} added successfully!`, 'success');
    }
    
    // Clear transaction form
    clearTransactionForm() {
        this.elements.amount.value = '';
        this.elements.category.value = '';
        this.elements.description.value = '';
        this.elements.date.value = new Date().toISOString().split('T')[0];
        this.elements.recurring.value = 'none';
        this.elements.tagsContainer.innerHTML = '';
        this.elements.tagInput.value = '';
    }
    
    // Add tag to transaction
    addTag() {
        const tagInput = this.elements.tagInput;
        const tagText = tagInput.value.trim();
        
        if (tagText && !this.tagExists(tagText)) {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                <span class="tag-text">${tagText}</span>
                <span class="remove">&times;</span>
            `;
            
            tagElement.querySelector('.remove').addEventListener('click', function() {
                this.parentElement.remove();
            });
            
            this.elements.tagsContainer.appendChild(tagElement);
            tagInput.value = '';
        }
    }
    
    // Check if tag already exists
    tagExists(tagText) {
        const existingTags = Array.from(this.elements.tagsContainer.querySelectorAll('.tag-text'))
            .map(tag => tag.textContent.toLowerCase());
        return existingTags.includes(tagText.toLowerCase());
    }
    
    // Switch transaction type (income/expense)
    switchTransactionType(button) {
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    }
    
    // Update all dashboard elements
    updateDashboard() {
        this.updateSummaryStats();
        this.updateCharts();
    }
    
    // Update summary statistics
    updateSummaryStats() {
        const filteredTransactions = this.filterTransactionsByTimeRange();
        
        let totalIncome = 0;
        let totalExpenses = 0;
        
        filteredTransactions.forEach(transaction => {
            const amountInBase = this.convertToBaseCurrency(
                transaction.amount,
                transaction.originalCurrency
            );
            
            if (transaction.type === 'income') {
                totalIncome += amountInBase;
            } else {
                totalExpenses += amountInBase;
            }
        });
        
        const totalBalance = totalIncome - totalExpenses;
        
        // Update UI
        this.elements.totalBalance.textContent = this.formatCurrency(totalBalance, this.baseCurrency);
        this.elements.totalIncome.textContent = this.formatCurrency(totalIncome, this.baseCurrency);
        this.elements.totalExpenses.textContent = this.formatCurrency(totalExpenses, this.baseCurrency);
        
        // Update transaction counts
        this.elements.totalTransactions.textContent = this.transactions.length;
        this.elements.monthTransactions.textContent = this.getCurrentMonthTransactions().length;
        
        // Update average expense
        const expenses = filteredTransactions.filter(t => t.type === 'expense');
        const averageExpense = expenses.length > 0 
            ? expenses.reduce((sum, t) => sum + this.convertToBaseCurrency(t.amount, t.originalCurrency), 0) / expenses.length
            : 0;
        this.elements.averageExpense.textContent = this.formatCurrency(averageExpense, this.baseCurrency);
    }
    
    // Setup charts
    setupCharts() {
        // Balance Trend Chart
        this.charts.balance = new Chart(this.elements.balanceChart, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Balance',
                    data: [],
                    borderColor: '#00b09b',
                    backgroundColor: 'rgba(0, 176, 155, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    x: {
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    }
                }
            }
        });
        
        // Category Chart
        this.charts.category = new Chart(this.elements.categoryChart, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#8AC926', '#1982C4',
                        '#6A4C93', '#FF595E'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 20 }
                    }
                }
            }
        });
        
        // Income vs Expense Chart
        this.charts.incomeExpense = new Chart(this.elements.incomeExpenseChart, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Income',
                        data: [],
                        backgroundColor: '#00b09b',
                        borderRadius: 6
                    },
                    {
                        label: 'Expenses',
                        data: [],
                        backgroundColor: '#ff416c',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { padding: 20 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    x: {
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    }
                }
            }
        });
        
        this.updateCharts();
    }
    
    // Update all charts
    updateCharts() {
        this.updateBalanceChart();
        this.updateCategoryChart();
        this.updateIncomeExpenseChart();
    }
    
    // Update balance trend chart
    updateBalanceChart() {
        const timeRange = this.elements.timeRange.value;
        let labels = [];
        let data = [];
        
        // Generate labels based on time range
        switch(timeRange) {
            case 'week':
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                break;
            case 'month':
                labels = Array.from({length: 30}, (_, i) => `Day ${i + 1}`);
                break;
            case 'quarter':
                labels = ['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'];
                break;
            case 'year':
                labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                break;
            default:
                labels = ['All Time'];
        }
        
        // For demo, generate random data
        data = labels.map(() => Math.random() * 1000);
        
        this.charts.balance.data.labels = labels;
        this.charts.balance.data.datasets[0].data = data;
        this.charts.balance.update();
    }
    
    // Update category chart
    updateCategoryChart() {
        const categories = {
            'food': 'Food & Dining',
            'transport': 'Transportation',
            'shopping': 'Shopping',
            'entertainment': 'Entertainment',
            'housing': 'Housing',
            'utilities': 'Utilities',
            'health': 'Health',
            'education': 'Education',
            'travel': 'Travel',
            'other': 'Other'
        };
        
        const categoryTotals = {};
        Object.keys(categories).forEach(cat => categoryTotals[cat] = 0);
        
        // Calculate totals for each category
        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(transaction => {
                if (categoryTotals.hasOwnProperty(transaction.category)) {
                    const amountInBase = this.convertToBaseCurrency(
                        transaction.amount,
                        transaction.originalCurrency
                    );
                    categoryTotals[transaction.category] += amountInBase;
                }
            });
        
        // Filter out zero totals
        const labels = [];
        const data = [];
        
        Object.entries(categoryTotals).forEach(([key, value]) => {
            if (value > 0) {
                labels.push(categories[key]);
                data.push(value);
            }
        });
        
        // If no data, show placeholder
        if (data.length === 0) {
            labels.push('No expenses yet');
            data.push(1);
        }
        
        this.charts.category.data.labels = labels;
        this.charts.category.data.datasets[0].data = data;
        this.charts.category.update();
    }
    
    // Update income vs expense chart
    updateIncomeExpenseChart() {
        const timeRange = this.elements.timeRange.value;
        let labels = [];
        let incomeData = [];
        let expenseData = [];
        
        // Generate sample data based on time range
        switch(timeRange) {
            case 'month':
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                incomeData = [1200, 1500, 1300, 1600];
                expenseData = [800, 900, 850, 950];
                break;
            case 'quarter':
                labels = ['Month 1', 'Month 2', 'Month 3'];
                incomeData = [5000, 5200, 5100];
                expenseData = [3500, 3600, 3550];
                break;
            default:
                labels = ['Total'];
                incomeData = [this.calculateTotalIncome()];
                expenseData = [this.calculateTotalExpenses()];
        }
        
        this.charts.incomeExpense.data.labels = labels;
        this.charts.incomeExpense.data.datasets[0].data = incomeData;
        this.charts.incomeExpense.data.datasets[1].data = expenseData;
        this.charts.incomeExpense.update();
    }
    
    // Update transactions table
    updateTransactionsTable() {
        const searchTerm = this.elements.searchTransactions.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        
        // Filter transactions
        let filteredTransactions = this.transactions.filter(transaction => {
            // Search filter
            const matchesSearch = transaction.description.toLowerCase().includes(searchTerm) ||
                                 transaction.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            
            // Type filter
            const matchesType = activeFilter === 'all' || transaction.type === activeFilter;
            
            return matchesSearch && matchesType;
        });
        
        // Update table
        this.renderTransactionsTable(filteredTransactions);
        
        // Update pagination
        this.setupTransactionsPagination(filteredTransactions);
    }
    
    // Render transactions table
    renderTransactionsTable(transactions) {
        const tbody = this.elements.transactionsBody;
        
        if (transactions.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="7">
                        <div class="empty-transactions">
                            <i class="fas fa-receipt"></i>
                            <p>No transactions found</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        let tableHTML = '';
        
        transactions.forEach(transaction => {
            const amountInBase = this.convertToBaseCurrency(
                transaction.amount,
                transaction.originalCurrency
            );
            
            const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            
            const categoryIcons = {
                'food': '🍕', 'transport': '🚗', 'shopping': '🛍️',
                'entertainment': '🎬', 'housing': '🏠', 'utilities': '💡',
                'health': '🏥', 'education': '📚', 'travel': '✈️', 'other': '📦'
            };
            
            tableHTML += `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${transaction.description}</td>
                    <td>
                        <div class="category-cell">
                            <div class="category-icon ${transaction.category}">
                                ${categoryIcons[transaction.category] || '📦'}
                            </div>
                            <span>${this.getCategoryName(transaction.category)}</span>
                        </div>
                    </td>
                    <td class="amount-cell ${transaction.type}">
                        ${transaction.type === 'expense' ? '-' : '+'}
                        ${this.formatCurrency(transaction.amount, transaction.originalCurrency)}
                    </td>
                    <td>
                        <span class="currency-cell">${transaction.originalCurrency}</span>
                    </td>
                    <td class="converted-cell">
                        ${this.formatCurrency(amountInBase, this.baseCurrency)}
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" data-id="${transaction.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" data-id="${transaction.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = tableHTML;
        
        // Add event listeners for action buttons
        tbody.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.editTransaction(id);
            });
        });
        
        tbody.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.deleteTransaction(id);
            });
        });
    }
    
    // Setup transactions pagination
    setupTransactionsPagination(transactions) {
        // For simplicity, we're not implementing full pagination
        // In a real app, you would split transactions into pages
    }
    
    // Filter transactions by active filter button
    filterTransactions(button) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        this.updateTransactionsTable();
    }
    
    // Update budgets display
    updateBudgets() {
        const budgetsContainer = this.elements.budgetCategories;
        
        if (this.budgets.length === 0) {
            budgetsContainer.innerHTML = `
                <div class="empty-budgets">
                    <i class="fas fa-chart-pie"></i>
                    <p>No budgets set. Create budgets to track your spending!</p>
                </div>
            `;
            return;
        }
        
        let budgetsHTML = '';
        
        this.budgets.forEach(budget => {
            // Calculate spent amount for this category
            const spent = this.transactions
                .filter(t => t.type === 'expense' && t.category === budget.category)
                .reduce((sum, t) => sum + this.convertToBaseCurrency(t.amount, t.originalCurrency), 0);
            
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            const statusClass = percentage > 90 ? 'warning' : percentage > 70 ? 'caution' : 'good';
            
            budgetsHTML += `
                <div class="budget-item ${statusClass}">
                    <div class="budget-header-row">
                        <div class="budget-category">
                            <i class="fas fa-${this.getCategoryIcon(budget.category)}"></i>
                            <span>${this.getCategoryName(budget.category)}</span>
                        </div>
                        <div class="budget-amount">
                            ${this.formatCurrency(budget.amount, this.baseCurrency)}
                        </div>
                    </div>
                    <div class="budget-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                    <div class="budget-stats">
                        <span>Spent: ${this.formatCurrency(spent, this.baseCurrency)}</span>
                        <span>${percentage.toFixed(1)}% of budget</span>
                    </div>
                </div>
            `;
        });
        
        budgetsContainer.innerHTML = budgetsHTML;
    }
    
    // Update financial insights
    updateInsights() {
        const insightsContainer = this.elements.insightsList;
        
        if (this.transactions.length === 0) {
            insightsContainer.innerHTML = `
                <div class="insight-item">
                    <i class="fas fa-info-circle"></i>
                    <p>Add transactions to get personalized insights</p>
                </div>
            `;
            return;
        }
        
        // Generate insights based on transaction data
        const insights = this.generateInsights();
        
        let insightsHTML = '';
        insights.forEach(insight => {
            insightsHTML += `
                <div class="insight-item">
                    <i class="fas fa-${insight.icon}"></i>
                    <p>${insight.text}</p>
                </div>
            `;
        });
        
        insightsContainer.innerHTML = insightsHTML;
    }
    
    // Generate insights based on transaction data
    generateInsights() {
        const insights = [];
        
        // Calculate total expenses by category
        const categoryExpenses = {};
        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(transaction => {
                const amount = this.convertToBaseCurrency(
                    transaction.amount,
                    transaction.originalCurrency
                );
                
                if (!categoryExpenses[transaction.category]) {
                    categoryExpenses[transaction.category] = 0;
                }
                categoryExpenses[transaction.category] += amount;
            });
        
        // Find highest spending category
        let highestCategory = null;
        let highestAmount = 0;
        
        Object.entries(categoryExpenses).forEach(([category, amount]) => {
            if (amount > highestAmount) {
                highestAmount = amount;
                highestCategory = category;
            }
        });
        
        if (highestCategory) {
            insights.push({
                icon: 'chart-bar',
                text: `Your highest spending is on ${this.getCategoryName(highestCategory)}: ${this.formatCurrency(highestAmount, this.baseCurrency)}`
            });
        }
        
        // Check if spending is increasing
        const recentTransactions = this.getRecentTransactions(7); // Last 7 days
        const olderTransactions = this.getRecentTransactions(14, 7); // 8-14 days ago
        
        const recentTotal = recentTransactions.reduce((sum, t) => 
            sum + (t.type === 'expense' ? this.convertToBaseCurrency(t.amount, t.originalCurrency) : 0), 0);
        const olderTotal = olderTransactions.reduce((sum, t) => 
            sum + (t.type === 'expense' ? this.convertToBaseCurrency(t.amount, t.originalCurrency) : 0), 0);
        
        if (recentTotal > olderTotal * 1.2) {
            insights.push({
                icon: 'exclamation-triangle',
                text: 'Your spending has increased by 20% compared to last week'
            });
        }
        
        // Add budget insights
        this.budgets.forEach(budget => {
            const spent = this.transactions
                .filter(t => t.type === 'expense' && t.category === budget.category)
                .reduce((sum, t) => sum + this.convertToBaseCurrency(t.amount, t.originalCurrency), 0);
            
            const percentage = (spent / budget.amount) * 100;
            
            if (percentage > 90) {
                insights.push({
                    icon: 'bullhorn',
                    text: `You've used ${percentage.toFixed(0)}% of your ${this.getCategoryName(budget.category)} budget`
                });
            }
        });
        
        // Default insight if none generated
        if (insights.length === 0) {
            insights.push({
                icon: 'lightbulb',
                text: 'Keep tracking your expenses to get more insights!'
            });
        }
        
        return insights.slice(0, 3); // Return top 3 insights
    }
    
    // Update currency converter
    updateConverter() {
        const amount = parseFloat(this.elements.converterAmount.value) || 0;
        const fromCurrency = this.elements.converterFrom.value;
        const toCurrency = this.elements.converterTo.value;
        
        if (this.exchangeRates[fromCurrency] && this.exchangeRates[toCurrency]) {
            const rate = this.exchangeRates[toCurrency] / this.exchangeRates[fromCurrency];
            const result = amount * rate;
            
            this.elements.converterResult.value = result.toFixed(4);
            this.elements.exchangeRateInfo.textContent = 
                `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
        }
    }
    
    // Swap converter currencies
    swapConverterCurrencies() {
        const fromCurrency = this.elements.converterFrom.value;
        const toCurrency = this.elements.converterTo.value;
        
        this.elements.converterFrom.value = toCurrency;
        this.elements.converterTo.value = fromCurrency;
        this.updateConverter();
    }
    
    // Update exchange rates manually
    async updateExchangeRates() {
        this.showToast('Updating exchange rates...', 'info');
        await this.loadExchangeRates();
        this.showToast('Exchange rates updated!', 'success');
    }
    
    // Show budget modal
    showBudgetModal() {
        const modalBody = this.elements.budgetModal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <form id="budgetForm" class="budget-form">
                <div class="form-group">
                    <label for="budgetCategory">Category</label>
                    <select id="budgetCategory" class="category-select" required>
                        <option value="">Select Category</option>
                        <option value="food">Food & Dining</option>
                        <option value="transport">Transportation</option>
                        <option value="shopping">Shopping</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="housing">Housing</option>
                        <option value="utilities">Utilities</option>
                        <option value="health">Health & Medical</option>
                        <option value="education">Education</option>
                        <option value="travel">Travel</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="budgetAmount">Budget Amount (${this.baseCurrency})</label>
                    <input type="number" id="budgetAmount" step="0.01" min="0" required>
                </div>
                
                <div class="form-group">
                    <label for="budgetPeriod">Period</label>
                    <select id="budgetPeriod">
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="add-btn">
                        <i class="fas fa-check"></i> Set Budget
                    </button>
                    <button type="button" class="clear-btn cancel-budget">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </form>
        `;
        
        // Add form submit handler
        modalBody.querySelector('#budgetForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBudget();
        });
        
        // Add cancel handler
        modalBody.querySelector('.cancel-budget').addEventListener('click', () => {
            this.closeAllModals();
        });
        
        this.elements.budgetModal.style.display = 'flex';
    }
    
    // Save budget
    saveBudget() {
        const category = document.getElementById('budgetCategory').value;
        const amount = parseFloat(document.getElementById('budgetAmount').value);
        const period = document.getElementById('budgetPeriod').value;
        
        if (!category || !amount || amount <= 0) {
            this.showToast('Please fill all fields correctly', 'error');
            return;
        }
        
        // Check if budget already exists for this category
        const existingIndex = this.budgets.findIndex(b => b.category === category);
        
        if (existingIndex !== -1) {
            // Update existing budget
            this.budgets[existingIndex] = { category, amount, period };
            this.showToast('Budget updated successfully!', 'success');
        } else {
            // Add new budget
            this.budgets.push({ category, amount, period });
            this.showToast('Budget created successfully!', 'success');
        }
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Update UI
        this.updateBudgets();
        this.updateInsights();
        
        // Close modal
        this.closeAllModals();
    }
    
    // Show export modal
    showExportModal() {
        this.elements.exportModal.style.display = 'flex';
    }
    
    // Export to CSV
    exportToCSV() {
        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Currency', 'Converted Amount', 'Base Currency'];
        const rows = this.transactions.map(t => [
            t.date,
            t.type.charAt(0).toUpperCase() + t.type.slice(1),
            this.getCategoryName(t.category),
            t.description,
            t.amount,
            t.originalCurrency,
            this.convertToBaseCurrency(t.amount, t.originalCurrency),
            this.baseCurrency
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        this.showToast('CSV exported successfully!', 'success');
        this.closeAllModals();
    }
    
    // Export to PDF (simulated)
    exportToPDF() {
        // In a real implementation, use jsPDF library
        this.showToast('PDF export would generate a detailed report', 'info');
        this.closeAllModals();
    }
    
    // Export to JSON
    exportToJSON() {
        const data = {
            metadata: {
                exportedAt: new Date().toISOString(),
                baseCurrency: this.baseCurrency,
                totalTransactions: this.transactions.length
            },
            transactions: this.transactions,
            budgets: this.budgets,
            exchangeRates: this.exchangeRates
        };
        
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        this.showToast('JSON exported successfully!', 'success');
        this.closeAllModals();
    }
    
    // Close all modals
    closeAllModals() {
        this.elements.budgetModal.style.display = 'none';
        this.elements.exportModal.style.display = 'none';
    }
    
    // Edit transaction
    editTransaction(id) {
        this.showToast('Edit feature would open here', 'info');
    }
    
    // Delete transaction
    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveToLocalStorage();
            this.updateDashboard();
            this.updateTransactionsTable();
            this.updateBudgets();
            this.updateInsights();
            this.showToast('Transaction deleted', 'success');
        }
    }
    
    // Helper Methods
    
    // Convert amount to base currency
    convertToBaseCurrency(amount, fromCurrency) {
        if (!this.exchangeRates[fromCurrency] || !this.exchangeRates[this.baseCurrency]) {
            return amount; // Fallback
        }
        
        const rate = this.exchangeRates[this.baseCurrency] / this.exchangeRates[fromCurrency];
        return amount * rate;
    }
    
    // Format currency amount
    formatCurrency(amount, currency) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        return formatter.format(amount);
    }
    
    // Get category name
    getCategoryName(categoryKey) {
        const categories = {
            'food': 'Food & Dining',
            'transport': 'Transportation',
            'shopping': 'Shopping',
            'entertainment': 'Entertainment',
            'housing': 'Housing',
            'utilities': 'Utilities',
            'health': 'Health & Medical',
            'education': 'Education',
            'travel': 'Travel',
            'other': 'Other'
        };
        
        return categories[categoryKey] || 'Unknown';
    }
    
    // Get category icon
    getCategoryIcon(categoryKey) {
        const icons = {
            'food': 'utensils',
            'transport': 'car',
            'shopping': 'shopping-bag',
            'entertainment': 'film',
            'housing': 'home',
            'utilities': 'bolt',
            'health': 'heartbeat',
            'education': 'graduation-cap',
            'travel': 'plane',
            'other': 'box'
        };
        
        return icons[categoryKey] || 'question-circle';
    }
    
    // Filter transactions by time range
    filterTransactionsByTimeRange() {
        const timeRange = this.elements.timeRange.value;
        const now = new Date();
        
        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            
            switch(timeRange) {
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return transactionDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    return transactionDate >= monthAgo;
                case 'quarter':
                    const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                    return transactionDate >= quarterAgo;
                case 'year':
                    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                    return transactionDate >= yearAgo;
                default:
                    return true; // All time
            }
        });
    }
    
    // Get transactions for current month
    getCurrentMonthTransactions() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
        });
    }
    
    // Get recent transactions
    getRecentTransactions(days, offsetDays = 0) {
        const now = new Date();
        const startDate = new Date(now.getTime() - (days + offsetDays) * 24 * 60 * 60 * 1000);
        const endDate = offsetDays === 0 ? now : new Date(now.getTime() - offsetDays * 24 * 60 * 60 * 1000);
        
        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    }
    
    // Calculate total income
    calculateTotalIncome() {
        return this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + this.convertToBaseCurrency(t.amount, t.originalCurrency), 0);
    }
    
    // Calculate total expenses
    calculateTotalExpenses() {
        return this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + this.convertToBaseCurrency(t.amount, t.originalCurrency), 0);
    }
    
    // Update all transaction conversions
    updateAllTransactionConversions() {
        // This would update cached conversions if needed
        this.updateDashboard();
        this.updateTransactionsTable();
    }
    
    // Load data from localStorage
    loadFromLocalStorage() {
        try {
            const savedTransactions = localStorage.getItem('expenseTrackerTransactions');
            const savedBudgets = localStorage.getItem('expenseTrackerBudgets');
            const savedBaseCurrency = localStorage.getItem('expenseTrackerBaseCurrency');
            
            if (savedTransactions) {
                this.transactions = JSON.parse(savedTransactions);
            }
            
            if (savedBudgets) {
                this.budgets = JSON.parse(savedBudgets);
            }
            
            if (savedBaseCurrency) {
                this.baseCurrency = savedBaseCurrency;
                this.elements.baseCurrency.value = this.baseCurrency;
            }
            
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }
    
    // Save data to localStorage
    saveToLocalStorage() {
        try {
            localStorage.setItem('expenseTrackerTransactions', JSON.stringify(this.transactions));
            localStorage.setItem('expenseTrackerBudgets', JSON.stringify(this.budgets));
            localStorage.setItem('expenseTrackerBaseCurrency', this.baseCurrency);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
    
    // Show loading overlay
    showLoading(show) {
        this.elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    }
    
    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.elements.toastContainer.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Add CSS for toast animation
const style = document.createElement('style');
style.textContent = `
    @keyframes toastSlideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .budget-item.warning {
        border-left-color: #ff416c;
    }
    
    .budget-item.caution {
        border-left-color: #f39c12;
    }
    
    .budget-item.good {
        border-left-color: #00b09b;
    }
    
    .cancel-budget {
        background: #6c757d !important;
    }
    
    .cancel-budget:hover {
        background: #5a6268 !important;
    }
`;
document.head.appendChild(style);

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.expenseTracker = new ExpenseTracker();
});
