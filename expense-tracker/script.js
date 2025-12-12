// Expense Tracker Application with Multi-Currency Support
class ExpenseTracker {
    constructor() {
        // Initialize data
        this.transactions = [];
        this.categories = [];
        this.budgets = [];
        this.currentDate = new Date();
        this.currentTheme = 'light';
        
        // Currency settings
        this.baseCurrency = 'USD';
        this.currentCurrency = 'USD';
        this.exchangeRates = {};
        this.currencies = [
            { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
            { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
            { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
            { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
            { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
            { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
            { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
            { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
            { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
            { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
            { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
            { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
            { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
            { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', flag: '🇲🇽' },
            { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
            { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
            { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
            { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
            { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
            { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' }
        ];
        
        // Default categories with colors (same as before)
        this.defaultCategories = [
            { id: 1, name: 'Food & Dining', color: '#FF6B6B', type: 'expense', icon: 'fa-utensils' },
            { id: 2, name: 'Transportation', color: '#4ECDC4', type: 'expense', icon: 'fa-car' },
            { id: 3, name: 'Shopping', color: '#FFD166', type: 'expense', icon: 'fa-shopping-bag' },
            { id: 4, name: 'Entertainment', color: '#06D6A0', type: 'expense', icon: 'fa-film' },
            { id: 5, name: 'Bills & Utilities', color: '#118AB2', type: 'expense', icon: 'fa-bolt' },
            { id: 6, name: 'Healthcare', color: '#EF476F', type: 'expense', icon: 'fa-heartbeat' },
            { id: 7, name: 'Education', color: '#7209B7', type: 'expense', icon: 'fa-graduation-cap' },
            { id: 8, name: 'Salary', color: '#2ECC71', type: 'income', icon: 'fa-money-check' },
            { id: 9, name: 'Freelance', color: '#3498DB', type: 'income', icon: 'fa-laptop-code' },
            { id: 10, name: 'Investment', color: '#9B59B6', type: 'income', icon: 'fa-chart-line' },
            { id: 11, name: 'Other Income', color: '#1ABC9C', type: 'income', icon: 'fa-money-bill-wave' },
            { id: 12, name: 'Other Expense', color: '#95A5A6', type: 'expense', icon: 'fa-question-circle' }
        ];
        
        // Default budgets (in base currency - USD)
        this.defaultBudgets = [
            { id: 1, categoryId: 1, amount: 500, period: 'monthly', spent: 0 },
            { id: 2, categoryId: 2, amount: 200, period: 'monthly', spent: 0 },
            { id: 3, categoryId: 3, amount: 300, period: 'monthly', spent: 0 },
            { id: 4, categoryId: 4, amount: 150, period: 'monthly', spent: 0 }
        ];
        
        // Demo transactions (in base currency - USD)
        this.demoTransactions = [
            {
                id: 1,
                description: 'Grocery Shopping',
                amount: 85.50,
                type: 'expense',
                categoryId: 1,
                date: this.formatDate(new Date()),
                paymentMethod: 'Credit Card',
                notes: 'Weekly groceries',
                currency: 'USD'
            },
            {
                id: 2,
                description: 'Monthly Salary',
                amount: 3000,
                type: 'income',
                categoryId: 8,
                date: this.formatDate(new Date()),
                paymentMethod: 'Bank Transfer',
                notes: 'October salary',
                currency: 'USD'
            },
            {
                id: 3,
                description: 'Gas Station',
                amount: 45.25,
                type: 'expense',
                categoryId: 2,
                date: this.formatDate(new Date(Date.now() - 86400000)),
                paymentMethod: 'Debit Card',
                notes: 'Full tank',
                currency: 'USD'
            },
            {
                id: 4,
                description: 'Netflix Subscription',
                amount: 15.99,
                type: 'expense',
                categoryId: 4,
                date: this.formatDate(new Date(Date.now() - 172800000)),
                paymentMethod: 'Credit Card',
                notes: 'Monthly subscription',
                currency: 'USD'
            },
            {
                id: 5,
                description: 'Freelance Project',
                amount: 800,
                type: 'income',
                categoryId: 9,
                date: this.formatDate(new Date(Date.now() - 259200000)),
                paymentMethod: 'Digital Wallet',
                notes: 'Web design project',
                currency: 'USD'
            }
        ];
        
        // Chart instances
        this.incomeExpenseChart = null;
        this.categoryChart = null;
        this.spendingTrendChart = null;
        
        // DOM Elements
        this.elements = {
            // Header
            themeToggle: document.getElementById('themeToggle'),
            currentMonth: document.getElementById('currentMonth'),
            prevMonth: document.getElementById('prevMonth'),
            nextMonth: document.getElementById('nextMonth'),
            currencySelect: document.getElementById('currencySelect'),
            
            // Quick Stats
            totalIncome: document.getElementById('totalIncome'),
            totalExpenses: document.getElementById('totalExpenses'),
            currentBalance: document.getElementById('currentBalance'),
            budgetProgress: document.getElementById('budgetProgress'),
            budgetFill: document.getElementById('budgetFill'),
            
            // Add Transaction Form
            transactionForm: document.getElementById('transactionForm'),
            typeButtons: document.querySelectorAll('.type-btn'),
            description: document.getElementById('description'),
            amount: document.getElementById('amount'),
            category: document.getElementById('category'),
            date: document.getElementById('date'),
            paymentMethod: document.getElementById('paymentMethod'),
            notes: document.getElementById('notes'),
            clearForm: document.getElementById('clearForm'),
            
            // Recent Transactions
            transactionFilter: document.getElementById('transactionFilter'),
            transactionsList: document.getElementById('transactionsList'),
            shownCount: document.getElementById('shownCount'),
            totalCount: document.getElementById('totalCount'),
            viewAll: document.getElementById('viewAll'),
            
            // Charts
            chartPeriod: document.getElementById('chartPeriod'),
            incomeExpenseChart: document.getElementById('incomeExpenseChart'),
            categoryChart: document.getElementById('categoryChart'),
            spendingTrendChart: document.getElementById('spendingTrendChart'),
            
            // Budget
            manageCategories: document.getElementById('manageCategories'),
            setBudget: document.getElementById('setBudget'),
            budgetList: document.getElementById('budgetList'),
            
            // Analytics
            savingsGoal: document.getElementById('savingsGoal'),
            savedAmount: document.getElementById('savedAmount'),
            savingsFill: document.getElementById('savingsFill'),
            avgDailySpend: document.getElementById('avgDailySpend'),
            mostExpensiveDay: document.getElementById('mostExpensiveDay'),
            transactionsCount: document.getElementById('transactionsCount'),
            largestExpense: document.getElementById('largestExpense'),
            insightsList: document.getElementById('insightsList'),
            
            // Export
            exportCSV: document.getElementById('exportCSV'),
            generateReport: document.getElementById('generateReport'),
            printSummary: document.getElementById('printSummary'),
            backupData: document.getElementById('backupData'),
            currencySettings: document.getElementById('currencySettings'),
            
            // Modals
            budgetModal: document.getElementById('budgetModal'),
            categoryModal: document.getElementById('categoryModal'),
            transactionModal: document.getElementById('transactionModal'),
            currencyModal: null, // Will be created dynamically
            
            // Modal forms
            budgetForm: document.getElementById('budgetForm'),
            categoryForm: document.getElementById('addCategoryForm'),
            
            // Loading & Toast
            loadingOverlay: document.getElementById('loadingOverlay'),
            toastContainer: document.getElementById('toastContainer')
        };
        
        // Initialize
        this.init();
    }
    
    // Initialize the application
    async init() {
        this.loadData();
        this.setupEventListeners();
        this.setupCategories();
        this.setupDate();
        this.setupCurrencyDropdown();
        await this.fetchExchangeRates();
        this.updateUI();
        this.setupCharts();
        
        // Show welcome message
        setTimeout(() => {
            this.showToast('Welcome to Expense Tracker! 💰', 'info');
        }, 1000);
    }
    
    // Load data from localStorage
    loadData() {
        // Load categories
        const savedCategories = localStorage.getItem('expenseCategories');
        this.categories = savedCategories ? JSON.parse(savedCategories) : [...this.defaultCategories];
        
        // Load budgets
        const savedBudgets = localStorage.getItem('expenseBudgets');
        this.budgets = savedBudgets ? JSON.parse(savedBudgets) : [...this.defaultBudgets];
        
        // Load transactions
        const savedTransactions = localStorage.getItem('expenseTransactions');
        this.transactions = savedTransactions ? JSON.parse(savedTransactions) : [...this.demoTransactions];
        
        // Load theme
        const savedTheme = localStorage.getItem('expenseTheme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
            document.documentElement.setAttribute('data-theme', savedTheme);
            this.updateThemeButton();
        }
        
        // Load currency preference
        const savedCurrency = localStorage.getItem('expenseCurrency');
        if (savedCurrency) {
            this.currentCurrency = savedCurrency;
            if (this.elements.currencySelect) {
                this.elements.currencySelect.value = savedCurrency;
            }
        }
    }
    
    // Save data to localStorage
    saveData() {
        localStorage.setItem('expenseCategories', JSON.stringify(this.categories));
        localStorage.setItem('expenseBudgets', JSON.stringify(this.budgets));
        localStorage.setItem('expenseTransactions', JSON.stringify(this.transactions));
        localStorage.setItem('expenseTheme', this.currentTheme);
        localStorage.setItem('expenseCurrency', this.currentCurrency);
    }
    
    // Setup currency dropdown
    setupCurrencyDropdown() {
        const currencySelect = this.elements.currencySelect;
        if (!currencySelect) return;
        
        // Clear existing options
        currencySelect.innerHTML = '';
        
        // Add currency options
        this.currencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.code;
            option.textContent = `${currency.code} (${currency.symbol})`;
            if (currency.code === this.currentCurrency) {
                option.selected = true;
            }
            currencySelect.appendChild(option);
        });
    }
    
    // Fetch exchange rates from API
    async fetchExchangeRates() {
        try {
            this.showLoading(true);
            
            // Using free ExchangeRate-API (no API key required for basic usage)
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${this.baseCurrency}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch exchange rates');
            }
            
            const data = await response.json();
            this.exchangeRates = data.rates;
            
            // Add base currency with rate 1
            this.exchangeRates[this.baseCurrency] = 1;
            
            this.showToast('Exchange rates updated!', 'success');
            
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            
            // Fallback to demo rates if API fails
            this.setDemoExchangeRates();
            this.showToast('Using demo exchange rates', 'warning');
            
        } finally {
            this.showLoading(false);
        }
    }
    
    // Set demo exchange rates (fallback)
    setDemoExchangeRates() {
        this.exchangeRates = {
            USD: 1,
            EUR: 0.92,
            GBP: 0.79,
            JPY: 149.5,
            INR: 83.2,
            CAD: 1.37,
            AUD: 1.56,
            CNY: 7.29,
            CHF: 0.90,
            NZD: 1.69,
            KRW: 1334.5,
            BRL: 4.95,
            RUB: 96.8,
            MXN: 18.2,
            SGD: 1.36,
            HKD: 7.82,
            SEK: 10.9,
            NOK: 10.8,
            DKK: 6.96,
            ZAR: 18.9
        };
    }
    
    // Convert amount from base currency to current currency
    convertAmount(amount, fromCurrency = this.baseCurrency, toCurrency = this.currentCurrency) {
        if (fromCurrency === toCurrency) return amount;
        
        const rateFrom = this.exchangeRates[fromCurrency] || 1;
        const rateTo = this.exchangeRates[toCurrency] || 1;
        
        // Convert to USD first, then to target currency
        const amountInUSD = amount / rateFrom;
        return amountInUSD * rateTo;
    }
    
    // Convert amount from current currency to base currency
    convertToBaseCurrency(amount, fromCurrency = this.currentCurrency) {
        if (fromCurrency === this.baseCurrency) return amount;
        
        const rate = this.exchangeRates[fromCurrency] || 1;
        return amount / rate;
    }
    
    // Format currency with symbol
    formatCurrency(amount, currencyCode = this.currentCurrency) {
        const currency = this.currencies.find(c => c.code === currencyCode);
        const symbol = currency ? currency.symbol : '$';
        const convertedAmount = this.convertAmount(amount, this.baseCurrency, currencyCode);
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(convertedAmount);
    }
    
    // Format currency for display (simpler version)
    formatCurrencyDisplay(amount) {
        const currency = this.currencies.find(c => c.code === this.currentCurrency);
        const symbol = currency ? currency.symbol : '$';
        const convertedAmount = this.convertAmount(amount);
        
        // Format number with proper decimal places
        const formattedAmount = convertedAmount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        return `${symbol}${formattedAmount}`;
    }
    
    // Get current currency symbol
    getCurrencySymbol() {
        const currency = this.currencies.find(c => c.code === this.currentCurrency);
        return currency ? currency.symbol : '$';
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Date navigation
        this.elements.prevMonth.addEventListener('click', () => this.changeMonth(-1));
        this.elements.nextMonth.addEventListener('click', () => this.changeMonth(1));
        
        // Currency change
        if (this.elements.currencySelect) {
            this.elements.currencySelect.addEventListener('change', (e) => {
                this.currentCurrency = e.target.value;
                this.saveData();
                this.updateUI();
                this.showToast(`Currency changed to ${this.currentCurrency}`, 'success');
            });
        }
        
        // Currency settings
        if (this.elements.currencySettings) {
            this.elements.currencySettings.addEventListener('click', () => this.showCurrencyModal());
        }
        
        // Transaction type buttons
        this.elements.typeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.elements.typeButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateCategoryOptions();
            });
        });
        
        // Add transaction form
        this.elements.transactionForm.addEventListener('submit', (e) => this.addTransaction(e));
        this.elements.clearForm.addEventListener('click', () => this.clearForm());
        
        // Transaction filter
        this.elements.transactionFilter.addEventListener('change', () => this.updateTransactionsList());
        
        // View all transactions
        this.elements.viewAll.addEventListener('click', () => this.showAllTransactions());
        
        // Chart period
        this.elements.chartPeriod.addEventListener('change', () => this.updateCharts());
        
        // Budget actions
        this.elements.manageCategories.addEventListener('click', () => this.showCategoryModal());
        this.elements.setBudget.addEventListener('click', () => this.showBudgetModal());
        
        // Export buttons
        this.elements.exportCSV.addEventListener('click', () => this.exportToCSV());
        this.elements.generateReport.addEventListener('click', () => this.generateReport());
        this.elements.printSummary.addEventListener('click', () => this.printSummary());
        this.elements.backupData.addEventListener('click', () => this.backupData());
        
        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
        
        // Budget form
        this.elements.budgetForm.addEventListener('submit', (e) => this.saveBudget(e));
        
        // Category form
        this.elements.categoryForm.addEventListener('submit', (e) => this.addCategory(e));
        
        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        // Analytics period buttons
        document.querySelectorAll('.analytics-period .period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.analytics-period .period-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');
                this.updateAnalytics();
            });
        });
        
        // Update exchange rates button (will be added to currency modal)
        document.addEventListener('click', (e) => {
            if (e.target.id === 'updateRates') {
                this.fetchExchangeRates();
            }
        });
    }
    
    // Show currency modal
    showCurrencyModal() {
        // Create modal if it doesn't exist
        if (!this.elements.currencyModal) {
            this.createCurrencyModal();
        }
        
        const modal = this.elements.currencyModal;
        const currencyGrid = modal.querySelector('.currency-grid');
        const baseCurrencySelect = modal.querySelector('#baseCurrencySelect');
        
        // Clear and populate currency grid
        currencyGrid.innerHTML = '';
        
        this.currencies.forEach(currency => {
            const currencyOption = document.createElement('div');
            currencyOption.className = `currency-option ${currency.code === this.currentCurrency ? 'selected' : ''}`;
            currencyOption.dataset.code = currency.code;
            
            currencyOption.innerHTML = `
                <span class="currency-flag">${currency.flag}</span>
                <div>
                    <div class="currency-code">${currency.code}</div>
                    <div class="currency-name">${currency.name}</div>
                </div>
            `;
            
            currencyOption.addEventListener('click', () => {
                this.selectCurrency(currency.code);
            });
            
            currencyGrid.appendChild(currencyOption);
        });
        
        // Setup base currency selector
        baseCurrencySelect.innerHTML = '';
        this.currencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.code;
            option.textContent = `${currency.code} - ${currency.name}`;
            if (currency.code === this.baseCurrency) {
                option.selected = true;
            }
            baseCurrencySelect.appendChild(option);
        });
        
        // Update exchange rate display
        this.updateExchangeRateDisplay();
        
        modal.style.display = 'flex';
    }
    
    // Create currency modal
    createCurrencyModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'currencyModal';
        modal.innerHTML = `
            <div class="modal-content currency-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-globe"></i> Currency Settings</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label><i class="fas fa-dollar-sign"></i> Base Currency (for data storage)</label>
                        <select id="baseCurrencySelect" class="currency-dropdown">
                            <!-- Options will be populated -->
                        </select>
                        <small>All data is stored in this currency</small>
                    </div>
                    
                    <h4>Select Display Currency</h4>
                    <div class="currency-grid">
                        <!-- Currency options will be populated here -->
                    </div>
                    
                    <div class="exchange-rate-info">
                        <h4><i class="fas fa-chart-line"></i> Exchange Rates (vs ${this.baseCurrency})</h4>
                        <div id="exchangeRatesList">
                            <!-- Rates will be populated here -->
                        </div>
                        <button id="updateRates" class="update-btn">
                            <i class="fas fa-sync"></i> Update Exchange Rates
                        </button>
                        <small>Rates last updated: <span id="lastUpdated">Just now</span></small>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.elements.currencyModal = modal;
        
        // Add event listeners for modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.querySelector('#baseCurrencySelect').addEventListener('change', (e) => {
            this.changeBaseCurrency(e.target.value);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Select currency for display
    selectCurrency(currencyCode) {
        this.currentCurrency = currencyCode;
        this.saveData();
        
        // Update UI
        if (this.elements.currencySelect) {
            this.elements.currencySelect.value = currencyCode;
        }
        
        // Update modal selection
        const modal = this.elements.currencyModal;
        if (modal) {
            modal.querySelectorAll('.currency-option').forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.code === currencyCode) {
                    option.classList.add('selected');
                }
            });
        }
        
        this.updateUI();
        this.showToast(`Display currency changed to ${currencyCode}`, 'success');
    }
    
    // Change base currency (warning: this converts all existing data)
    changeBaseCurrency(newBaseCurrency) {
        if (newBaseCurrency === this.baseCurrency) return;
        
        if (confirm(`WARNING: Changing base currency will convert ALL existing amounts from ${this.baseCurrency} to ${newBaseCurrency}. This action cannot be undone. Continue?`)) {
            const oldBaseCurrency = this.baseCurrency;
            const conversionRate = this.exchangeRates[newBaseCurrency] / this.exchangeRates[oldBaseCurrency];
            
            // Convert all transactions
            this.transactions.forEach(transaction => {
                transaction.amount *= conversionRate;
            });
            
            // Convert all budgets
            this.budgets.forEach(budget => {
                budget.amount *= conversionRate;
                budget.spent *= conversionRate;
            });
            
            // Update base currency
            this.baseCurrency = newBaseCurrency;
            
            // Save and update
            this.saveData();
            this.updateUI();
            this.updateExchangeRateDisplay();
            
            this.showToast(`Base currency changed to ${newBaseCurrency}. All amounts converted.`, 'success');
        } else {
            // Reset selector to original value
            if (this.elements.currencyModal) {
                const select = this.elements.currencyModal.querySelector('#baseCurrencySelect');
                select.value = this.baseCurrency;
            }
        }
    }
    
    // Update exchange rate display
    updateExchangeRateDisplay() {
        if (!this.elements.currencyModal) return;
        
        const ratesList = this.elements.currencyModal.querySelector('#exchangeRatesList');
        if (!ratesList) return;
        
        // Show top 10 currencies
        const topCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL'];
        
        ratesList.innerHTML = '';
        
        topCurrencies.forEach(code => {
            if (code === this.baseCurrency) return;
            
            const rate = this.exchangeRates[code];
            if (!rate) return;
            
            const rateItem = document.createElement('div');
            rateItem.className = 'rate-item';
            rateItem.innerHTML = `
                <span>1 ${this.baseCurrency}</span>
                <span>= ${rate.toFixed(4)} ${code}</span>
            `;
            ratesList.appendChild(rateItem);
        });
    }
    
    // Update all UI elements with currency conversion
    updateUI() {
        this.updateQuickStats();
        this.updateTransactionsList();
        this.updateBudgets();
        this.updateAnalytics();
        this.updateCharts();
    }
    
    // Update quick stats with currency conversion
    updateQuickStats() {
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        
        // Filter transactions for current month
        const monthTransactions = this.transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate.getMonth() === currentMonth && 
                   transDate.getFullYear() === currentYear;
        });
        
        // Calculate totals in base currency
        const totalIncome = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const currentBalance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (currentBalance / totalIncome * 100) : 0;
        
        // Update DOM with converted amounts
        this.elements.totalIncome.textContent = this.formatCurrencyDisplay(totalIncome);
        this.elements.totalExpenses.textContent = this.formatCurrencyDisplay(totalExpenses);
        this.elements.currentBalance.textContent = this.formatCurrencyDisplay(currentBalance);
        
        // Update budget progress
        const totalBudget = this.budgets.reduce((sum, b) => sum + b.amount, 0);
        const budgetSpent = this.budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
        const budgetProgress = totalBudget > 0 ? (budgetSpent / totalBudget * 100) : 0;
        
        this.elements.budgetProgress.textContent = `${budgetProgress.toFixed(1)}%`;
        this.elements.budgetFill.style.width = `${Math.min(budgetProgress, 100)}%`;
        
        // Update change indicators
        this.updateChangeIndicators();
    }
    
    // Update transactions list with currency conversion
    updateTransactionsList() {
        const filter = this.elements.transactionFilter.value;
        let filteredTransactions = [...this.transactions];
        
        // Apply filters (same as before)
        const now = new Date();
        switch(filter) {
            case 'income':
                filteredTransactions = filteredTransactions.filter(t => t.type === 'income');
                break;
            case 'expense':
                filteredTransactions = filteredTransactions.filter(t => t.type === 'expense');
                break;
            case 'today':
                const today = this.formatDate(now);
                filteredTransactions = filteredTransactions.filter(t => t.date === today);
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 86400000);
                filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= weekAgo);
                break;
            case 'month':
                const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
                filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= monthAgo);
                break;
        }
        
        // Update counts
        this.elements.shownCount.textContent = Math.min(filteredTransactions.length, 10);
        this.elements.totalCount.textContent = filteredTransactions.length;
        
        // Display transactions
        this.displayTransactions(filteredTransactions.slice(0, 10));
    }
    
    // Display transactions with currency conversion
    displayTransactions(transactions) {
        const list = this.elements.transactionsList;
        
        if (transactions.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <h4>No transactions found</h4>
                    <p>Try changing your filters or add a new transaction</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = '';
        
        transactions.forEach(transaction => {
            const category = this.categories.find(c => c.id === transaction.categoryId);
            const transactionEl = this.createTransactionElement(transaction, category);
            list.appendChild(transactionEl);
        });
    }
    
    // Create transaction element with currency conversion
    createTransactionElement(transaction, category) {
        const div = document.createElement('div');
        div.className = `transaction-item ${transaction.type}`;
        div.dataset.id = transaction.id;
        
        // Convert amount to display currency
        const displayAmount = this.convertAmount(transaction.amount);
        const symbol = this.getCurrencySymbol();
        
        div.innerHTML = `
            <div class="transaction-info">
                <h4>${transaction.description}</h4>
                <div class="transaction-meta">
                    <span>
                        <i class="fas fa-tag"></i>
                        ${category ? category.name : 'Uncategorized'}
                    </span>
                    <span>
                        <i class="fas fa-calendar"></i>
                        ${this.formatDisplayDate(transaction.date)}
                    </span>
                    <span>
                        <i class="fas fa-credit-card"></i>
                        ${transaction.paymentMethod}
                    </span>
                    ${transaction.currency && transaction.currency !== this.baseCurrency ? `
                        <span>
                            <i class="fas fa-exchange-alt"></i>
                            ${transaction.currency}
                        </span>
                    ` : ''}
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${symbol}${displayAmount.toFixed(2)}
            </div>
        `;
        
        // Add click event to show details
        div.addEventListener('click', () => this.showTransactionDetails(transaction.id));
        
        return div;
    }
    
    // Add transaction with currency support
    addTransaction(e) {
        e.preventDefault();
        
        const type = document.querySelector('.type-btn.active').dataset.type;
        const description = this.elements.description.value.trim();
        const amount = parseFloat(this.elements.amount.value);
        const categoryId = parseInt(this.elements.category.value);
        const date = this.elements.date.value;
        const paymentMethod = this.elements.paymentMethod.value;
        const notes = this.elements.notes.value.trim();
        
        // Validation
        if (!description || !amount || !categoryId || !date) {
            this.showToast('Please fill in all required fields', 'warning');
            return;
        }
        
        if (amount <= 0) {
            this.showToast('Amount must be greater than 0', 'warning');
            return;
        }
        
        // Create transaction object
        const transaction = {
            id: Date.now(),
            description,
            amount: this.convertToBaseCurrency(amount), // Store in base currency
            type,
            categoryId,
            date,
            paymentMethod,
            notes,
            currency: this.currentCurrency, // Store original currency
            createdAt: new Date().toISOString()
        };
        
        // Add to transactions
        this.transactions.unshift(transaction);
        
        // Update budgets
        if (type === 'expense') {
            this.updateBudgetSpending(categoryId, transaction.amount);
        }
        
        // Save and update UI
        this.saveData();
        this.updateUI();
        this.clearForm();
        
        this.showToast(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');
    }
    
    // Update budgets with currency conversion
    updateBudgets() {
        const list = this.elements.budgetList;
        
        if (this.budgets.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-target"></i>
                    <h4>No budgets set</h4>
                    <p>Set your first budget to start tracking!</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = '';
        
        this.budgets.forEach(budget => {
            const category = this.categories.find(c => c.id === budget.categoryId);
            if (!category) return;
            
            const spent = budget.spent || 0;
            const progress = (spent / budget.amount) * 100;
            const remaining = Math.max(0, budget.amount - spent);
            
            const budgetEl = document.createElement('div');
            budgetEl.className = 'budget-item';
            
            // Convert amounts for display
            const displayBudget = this.convertAmount(budget.amount);
            const displaySpent = this.convertAmount(spent);
            const displayRemaining = this.convertAmount(remaining);
            const symbol = this.getCurrencySymbol();
            
            budgetEl.innerHTML = `
                <div class="budget-header">
                    <div class="budget-category">
                        <div class="category-color" style="background-color: ${category.color}"></div>
                        <h4>${category.name}</h4>
                    </div>
                    <div class="budget-amount">${symbol}${displayBudget.toFixed(2)}/${budget.period}</div>
                </div>
                <div class="budget-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(progress, 100)}%; 
                             background: ${progress > 100 ? '#e74c3c' : '#2ecc71'}"></div>
                    </div>
                </div>
                <div class="budget-stats">
                    <span>Spent: <strong>${symbol}${displaySpent.toFixed(2)}</strong></span>
                    <span>Remaining: <strong>${symbol}${displayRemaining.toFixed(2)}</strong></span>
                    <span>Progress: <strong>${progress.toFixed(1)}%</strong></span>
                </div>
            `;
            
            list.appendChild(budgetEl);
        });
    }
    
    // Update analytics with currency conversion
    updateAnalytics() {
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        
        const monthTransactions = this.transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate.getMonth() === currentMonth && 
                   transDate.getFullYear() === currentYear;
        });
        
        const monthExpenses = monthTransactions.filter(t => t.type === 'expense');
        
        // Calculate analytics in base currency
        const totalExpenses = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const avgDailySpend = totalExpenses / daysInMonth;
        
        // Find most expensive day
        const expensesByDay = {};
        monthExpenses.forEach(expense => {
            const day = expense.date;
            if (!expensesByDay[day]) {
                expensesByDay[day] = 0;
            }
            expensesByDay[day] += expense.amount;
        });
        
        let mostExpensiveDay = 'None';
        let maxExpense = 0;
        for (const [day, amount] of Object.entries(expensesByDay)) {
            if (amount > maxExpense) {
                maxExpense = amount;
                mostExpensiveDay = this.formatDisplayDate(day);
            }
        }
        
        // Find largest expense
        const largestExpense = monthExpenses.length > 0 ? 
            Math.max(...monthExpenses.map(e => e.amount)) : 0;
        
        // Update DOM with converted amounts
        const symbol = this.getCurrencySymbol();
        this.elements.avgDailySpend.textContent = `${symbol}${this.convertAmount(avgDailySpend).toFixed(2)}`;
        this.elements.mostExpensiveDay.textContent = mostExpensiveDay;
        this.elements.transactionsCount.textContent = monthTransactions.length;
        this.elements.largestExpense.textContent = `${symbol}${this.convertAmount(largestExpense).toFixed(2)}`;
        
        // Update savings (in display currency)
        this.updateSavingsProgress();
        
        // Generate insights
        this.generateInsights();
    }
    
    // Update savings progress with currency conversion
    updateSavingsProgress() {
        const savingsGoal = 5000; // Demo goal in base currency
        const saved = 1200; // Demo saved in base currency
        const progress = (saved / savingsGoal) * 100;
        
        const displayGoal = this.convertAmount(savingsGoal);
        const displaySaved = this.convertAmount(saved);
        const monthlyGoal = this.convertAmount((savingsGoal - saved) / 12);
        const displayRemaining = this.convertAmount(savingsGoal - saved);
        const symbol = this.getCurrencySymbol();
        
        this.elements.savingsGoal.textContent = `${symbol}${displayGoal.toFixed(2)}`;
        this.elements.savedAmount.textContent = `${symbol}${displaySaved.toFixed(2)}`;
        this.elements.savingsFill.style.width = `${progress}%`;
        
        // Update stats
        const stats = document.querySelectorAll('.savings-stats .stat strong');
        if (stats.length >= 3) {
            stats[0].textContent = `${symbol}${monthlyGoal.toFixed(2)}`;
            stats[1].textContent = `${symbol}${displayRemaining.toFixed(2)}`;
            stats[2].textContent = '12 months';
        }
    }
    
    // Update charts with currency conversion
    createIncomeExpenseChart() {
        const ctx = this.elements.incomeExpenseChart.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.incomeExpenseChart) {
            this.incomeExpenseChart.destroy();
        }
        
        // Get current month data
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        
        const monthTransactions = this.transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate.getMonth() === currentMonth && 
                   transDate.getFullYear() === currentYear;
        });
        
        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + this.convertAmount(t.amount), 0);
        
        const expenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + this.convertAmount(t.amount), 0);
        
        const symbol = this.getCurrencySymbol();
        
        this.incomeExpenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    label: `Amount (${this.currentCurrency})`,
                    data: [income, expenses],
                    backgroundColor: [
                        'rgba(46, 204, 113, 0.7)',
                        'rgba(231, 76, 60, 0.7)'
                    ],
                    borderColor: [
                        'rgb(46, 204, 113)',
                        'rgb(231, 76, 60)'
                    ],
                    borderWidth: 2,
                    borderRadius: 10,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${symbol}${context.raw.toFixed(2)}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            callback: (value) => `${symbol}${value}`
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Export to CSV with currency info
    exportToCSV() {
        if (this.transactions.length === 0) {
            this.showToast('No transactions to export', 'warning');
            return;
        }
        
        // Create CSV content with currency columns
        const headers = ['Date', 'Description', 'Type', 'Category', `Amount (${this.baseCurrency})`, 'Original Currency', 'Payment Method', 'Notes'];
        const rows = this.transactions.map(t => {
            const category = this.categories.find(c => c.id === t.categoryId);
            return [
                t.date,
                `"${t.description}"`,
                t.type,
                category?.name || 'Uncategorized',
                t.amount,
                t.currency || this.baseCurrency,
                t.paymentMethod,
                `"${t.notes || ''}"`
            ];
        });
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses_${this.formatDate(new Date())}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showToast('CSV exported successfully!', 'success');
    }
    
    // Backup data with currency settings
    backupData() {
        const backup = {
            transactions: this.transactions,
            categories: this.categories,
            budgets: this.budgets,
            baseCurrency: this.baseCurrency,
            displayCurrency: this.currentCurrency,
            exchangeRates: this.exchangeRates,
            exportedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(backup, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense_backup_${this.formatDate(new Date())}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showToast('Data backed up successfully!', 'success');
    }
    
    // Show transaction details with currency info
    showTransactionDetails(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction) return;
        
        const category = this.categories.find(c => c.id === transaction.categoryId);
        const modal = this.elements.transactionModal;
        const detailEl = document.getElementById('transactionDetail');
        
        // Convert amounts for display
        const displayAmount = this.convertAmount(transaction.amount);
        const baseAmount = transaction.amount;
        const symbol = this.getCurrencySymbol();
        
        detailEl.innerHTML = `
            <div class="transaction-detail">
                <div class="detail-header">
                    <h4>${transaction.description}</h4>
                    <div class="detail-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${symbol}${displayAmount.toFixed(2)}
                    </div>
                </div>
                
                <div class="detail-info">
                    <div class="info-row">
                        <span class="label">Type:</span>
                        <span class="value ${transaction.type}">
                            <i class="fas fa-${transaction.type === 'income' ? 'arrow-down' : 'arrow-up'}"></i>
                            ${transaction.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Amount in ${this.baseCurrency}:</span>
                        <span class="value">
                            <i class="fas fa-dollar-sign"></i>
                            ${baseAmount.toFixed(2)} ${this.baseCurrency}
                        </span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Display Amount:</span>
                        <span class="value">
                            <i class="fas fa-exchange-alt"></i>
                            ${symbol}${displayAmount.toFixed(2)} ${this.currentCurrency}
                        </span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Category:</span>
                        <span class="value">
                            <i class="fas ${category?.icon || 'fa-tag'}" style="color: ${category?.color || '#95A5A6'}"></i>
                            ${category?.name || 'Uncategorized'}
                        </span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Date:</span>
                        <span class="value">
                            <i class="fas fa-calendar"></i>
                            ${this.formatDisplayDate(transaction.date)}
                        </span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Payment Method:</span>
                        <span class="value">
                            <i class="fas fa-credit-card"></i>
                            ${transaction.paymentMethod}
                        </span>
                    </div>
                    
                    ${transaction.notes ? `
                        <div class="info-row">
                            <span class="label">Notes:</span>
                            <span class="value">${transaction.notes}</span>
                        </div>
                    ` : ''}
                    
                    <div class="info-row">
                        <span class="label">Added:</span>
                        <span class="value">
                            <i class="fas fa-clock"></i>
                            ${new Date(transaction.createdAt).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        `;
        
        // Update modal actions
        const editBtn = document.getElementById('editTransaction');
        const deleteBtn = document.getElementById('deleteTransaction');
        
        editBtn.onclick = () => this.editTransaction(id);
        deleteBtn.onclick = () => this.deleteTransaction(id);
        
        modal.style.display = 'flex';
    }
    
    // [The rest of the methods remain the same as before...]
    // Only the currency-related methods were added/modified above
    
    // Utility: Format date as YYYY-MM-DD
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    // Utility: Format date for display
    formatDisplayDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    }
    
    // Show loading overlay
    showLoading(show) {
        this.elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    }
    
    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        this.elements.toastContainer.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Close all modals
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    // [All other existing methods remain the same...]
}
