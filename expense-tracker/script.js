// Expense Tracker Application
class ExpenseTracker {
    constructor() {
        // Initialize data
        this.transactions = [];
        this.categories = [];
        this.budgets = [];
        this.currentDate = new Date();
        this.currentTheme = 'light';
        
        // Default categories with colors
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
        
        // Default budgets
        this.defaultBudgets = [
            { id: 1, categoryId: 1, amount: 500, period: 'monthly', spent: 0 },
            { id: 2, categoryId: 2, amount: 200, period: 'monthly', spent: 0 },
            { id: 3, categoryId: 3, amount: 300, period: 'monthly', spent: 0 },
            { id: 4, categoryId: 4, amount: 150, period: 'monthly', spent: 0 }
        ];
        
        // Demo transactions for initial display
        this.demoTransactions = [
            {
                id: 1,
                description: 'Grocery Shopping',
                amount: 85.50,
                type: 'expense',
                categoryId: 1,
                date: this.formatDate(new Date()),
                paymentMethod: 'Credit Card',
                notes: 'Weekly groceries'
            },
            {
                id: 2,
                description: 'Monthly Salary',
                amount: 3000,
                type: 'income',
                categoryId: 8,
                date: this.formatDate(new Date()),
                paymentMethod: 'Bank Transfer',
                notes: 'October salary'
            },
            {
                id: 3,
                description: 'Gas Station',
                amount: 45.25,
                type: 'expense',
                categoryId: 2,
                date: this.formatDate(new Date(Date.now() - 86400000)), // Yesterday
                paymentMethod: 'Debit Card',
                notes: 'Full tank'
            },
            {
                id: 4,
                description: 'Netflix Subscription',
                amount: 15.99,
                type: 'expense',
                categoryId: 4,
                date: this.formatDate(new Date(Date.now() - 172800000)), // 2 days ago
                paymentMethod: 'Credit Card',
                notes: 'Monthly subscription'
            },
            {
                id: 5,
                description: 'Freelance Project',
                amount: 800,
                type: 'income',
                categoryId: 9,
                date: this.formatDate(new Date(Date.now() - 259200000)), // 3 days ago
                paymentMethod: 'Digital Wallet',
                notes: 'Web design project'
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
            
            // Modals
            budgetModal: document.getElementById('budgetModal'),
            categoryModal: document.getElementById('categoryModal'),
            transactionModal: document.getElementById('transactionModal'),
            
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
    }
    
    // Save data to localStorage
    saveData() {
        localStorage.setItem('expenseCategories', JSON.stringify(this.categories));
        localStorage.setItem('expenseBudgets', JSON.stringify(this.budgets));
        localStorage.setItem('expenseTransactions', JSON.stringify(this.transactions));
        localStorage.setItem('expenseTheme', this.currentTheme);
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Date navigation
        this.elements.prevMonth.addEventListener('click', () => this.changeMonth(-1));
        this.elements.nextMonth.addEventListener('click', () => this.changeMonth(1));
        
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
    }
    
    // Setup categories dropdown
    setupCategories() {
        this.updateCategoryOptions();
        this.updateBudgetCategoryOptions();
    }
    
    // Update category options in dropdown
    updateCategoryOptions() {
        const categorySelect = this.elements.category;
        const currentType = document.querySelector('.type-btn.active').dataset.type;
        
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        
        this.categories
            .filter(cat => cat.type === currentType)
            .forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
    }
    
    // Update budget category options
    updateBudgetCategoryOptions() {
        const budgetCategory = document.getElementById('budgetCategory');
        if (!budgetCategory) return;
        
        budgetCategory.innerHTML = '<option value="">Select Category</option>';
        
        this.categories
            .filter(cat => cat.type === 'expense')
            .forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                budgetCategory.appendChild(option);
            });
    }
    
    // Setup date
    setupDate() {
        this.updateDateDisplay();
        this.elements.date.value = this.formatDate(new Date());
    }
    
    // Update date display
    updateDateDisplay() {
        const options = { year: 'numeric', month: 'long' };
        this.elements.currentMonth.textContent = this.currentDate.toLocaleDateString('en-US', options);
    }
    
    // Change month
    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.updateDateDisplay();
        this.updateUI();
    }
    
    // Toggle theme
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeButton();
        this.saveData();
    }
    
    // Update theme button
    updateThemeButton() {
        const icon = this.elements.themeToggle.querySelector('i');
        const text = this.elements.themeToggle.querySelector('span');
        
        if (this.currentTheme === 'dark') {
            icon.className = 'fas fa-sun';
            text.textContent = 'Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            text.textContent = 'Dark Mode';
        }
    }
    
    // Add transaction
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
            id: Date.now(), // Simple ID generation
            description,
            amount,
            type,
            categoryId,
            date,
            paymentMethod,
            notes,
            createdAt: new Date().toISOString()
        };
        
        // Add to transactions
        this.transactions.unshift(transaction);
        
        // Update budgets
        if (type === 'expense') {
            this.updateBudgetSpending(categoryId, amount);
        }
        
        // Save and update UI
        this.saveData();
        this.updateUI();
        this.clearForm();
        
        this.showToast(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');
    }
    
    // Update budget spending
    updateBudgetSpending(categoryId, amount) {
        const budget = this.budgets.find(b => b.categoryId === categoryId);
        if (budget) {
            budget.spent = (budget.spent || 0) + amount;
            this.saveData();
        }
    }
    
    // Clear form
    clearForm() {
        this.elements.transactionForm.reset();
        this.elements.date.value = this.formatDate(new Date());
        this.elements.typeButtons[0].click(); // Set to expense by default
    }
    
    // Update all UI elements
    updateUI() {
        this.updateQuickStats();
        this.updateTransactionsList();
        this.updateBudgets();
        this.updateAnalytics();
        this.updateCharts();
    }
    
    // Update quick stats
    updateQuickStats() {
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        
        // Filter transactions for current month
        const monthTransactions = this.transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate.getMonth() === currentMonth && 
                   transDate.getFullYear() === currentYear;
        });
        
        // Calculate totals
        const totalIncome = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const currentBalance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (currentBalance / totalIncome * 100) : 0;
        
        // Update DOM
        this.elements.totalIncome.textContent = this.formatCurrency(totalIncome);
        this.elements.totalExpenses.textContent = this.formatCurrency(totalExpenses);
        this.elements.currentBalance.textContent = this.formatCurrency(currentBalance);
        
        // Update budget progress
        const totalBudget = this.budgets.reduce((sum, b) => sum + b.amount, 0);
        const budgetSpent = this.budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
        const budgetProgress = totalBudget > 0 ? (budgetSpent / totalBudget * 100) : 0;
        
        this.elements.budgetProgress.textContent = `${budgetProgress.toFixed(1)}%`;
        this.elements.budgetFill.style.width = `${Math.min(budgetProgress, 100)}%`;
        
        // Update change indicators (simplified for demo)
        this.updateChangeIndicators();
    }
    
    // Update change indicators
    updateChangeIndicators() {
        // Simplified - in real app, compare with previous month
        const changeElements = document.querySelectorAll('.stat-change');
        changeElements.forEach(el => {
            const arrow = el.querySelector('i');
            const text = el.querySelector('span');
            
            // Random change for demo
            const change = (Math.random() * 20 - 10).toFixed(1);
            const isPositive = parseFloat(change) > 0;
            
            arrow.className = isPositive ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
            arrow.style.color = isPositive ? '#2ecc71' : '#e74c3c';
            text.textContent = `${Math.abs(change)}% from last month`;
        });
    }
    
    // Update transactions list
    updateTransactionsList() {
        const filter = this.elements.transactionFilter.value;
        let filteredTransactions = [...this.transactions];
        
        // Apply filters
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
    
    // Display transactions in list
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
    
    // Create transaction element
    createTransactionElement(transaction, category) {
        const div = document.createElement('div');
        div.className = `transaction-item ${transaction.type}`;
        div.dataset.id = transaction.id;
        
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
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
            </div>
        `;
        
        // Add click event to show details
        div.addEventListener('click', () => this.showTransactionDetails(transaction.id));
        
        return div;
    }
    
    // Show all transactions
    showAllTransactions() {
        this.displayTransactions(this.transactions);
        this.elements.shownCount.textContent = this.transactions.length;
        this.showToast('Showing all transactions', 'info');
    }
    
    // Show transaction details
    showTransactionDetails(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction) return;
        
        const category = this.categories.find(c => c.id === transaction.categoryId);
        const modal = this.elements.transactionModal;
        const detailEl = document.getElementById('transactionDetail');
        
        detailEl.innerHTML = `
            <div class="transaction-detail">
                <div class="detail-header">
                    <h4>${transaction.description}</h4>
                    <div class="detail-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
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
    
    // Edit transaction
    editTransaction(id) {
        // For now, just show a message
        this.showToast('Edit feature coming soon!', 'info');
        this.closeAllModals();
    }
    
    // Delete transaction
    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            const transaction = this.transactions.find(t => t.id === id);
            if (transaction) {
                // Remove from transactions
                this.transactions = this.transactions.filter(t => t.id !== id);
                
                // Update budget spending
                if (transaction.type === 'expense') {
                    const budget = this.budgets.find(b => b.categoryId === transaction.categoryId);
                    if (budget) {
                        budget.spent = Math.max(0, (budget.spent || 0) - transaction.amount);
                    }
                }
                
                // Save and update
                this.saveData();
                this.updateUI();
                this.closeAllModals();
                
                this.showToast('Transaction deleted successfully', 'success');
            }
        }
    }
    
    // Setup charts
    setupCharts() {
        this.createIncomeExpenseChart();
        this.createCategoryChart();
        this.createSpendingTrendChart();
    }
    
    // Create income vs expense chart
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
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        this.incomeExpenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    label: 'Amount ($)',
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
                            label: (context) => `$${context.raw.toFixed(2)}`
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
                            callback: (value) => `$${value}`
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
    
    // Create category breakdown chart
    createCategoryChart() {
        const ctx = this.elements.categoryChart.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.categoryChart) {
            this.categoryChart.destroy();
        }
        
        // Get expense categories data
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        
        const monthExpenses = this.transactions.filter(t => {
            const transDate = new Date(t.date);
            return t.type === 'expense' &&
                   transDate.getMonth() === currentMonth && 
                   transDate.getFullYear() === currentYear;
        });
        
        // Group by category
        const categoryData = {};
        monthExpenses.forEach(expense => {
            const category = this.categories.find(c => c.id === expense.categoryId);
            if (category) {
                if (!categoryData[category.name]) {
                    categoryData[category.name] = {
                        amount: 0,
                        color: category.color
                    };
                }
                categoryData[category.name].amount += expense.amount;
            }
        });
        
        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData).map(d => d.amount);
        const colors = Object.values(categoryData).map(d => d.color);
        
        if (labels.length === 0) {
            // Show empty state
            this.categoryChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        data: [1],
                        backgroundColor: ['rgba(149, 165, 166, 0.3)']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    }
                }
            });
            return;
        }
        
        this.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: 'var(--bg-card)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            color: 'var(--text-primary)'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: $${context.raw.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }
    
    // Create spending trend chart
    createSpendingTrendChart() {
        const ctx = this.elements.spendingTrendChart.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.spendingTrendChart) {
            this.spendingTrendChart.destroy();
        }
        
        // Generate demo data for last 6 months
        const labels = [];
        const data = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
            
            // Generate random spending data for demo
            data.push(Math.floor(Math.random() * 2000) + 500);
        }
        
        this.spendingTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Monthly Spending',
                    data: data,
                    borderColor: 'rgb(52, 152, 219)',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(52, 152, 219)',
                    pointBorderColor: 'white',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
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
                            label: (context) => `$${context.raw.toFixed(2)}`
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
                            callback: (value) => `$${value}`
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }
    
    // Update all charts
    updateCharts() {
        this.createIncomeExpenseChart();
        this.createCategoryChart();
        // Spending trend chart updates with analytics
    }
    
    // Update budgets display
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
            budgetEl.innerHTML = `
                <div class="budget-header">
                    <div class="budget-category">
                        <div class="category-color" style="background-color: ${category.color}"></div>
                        <h4>${category.name}</h4>
                    </div>
                    <div class="budget-amount">${this.formatCurrency(budget.amount)}/${budget.period}</div>
                </div>
                <div class="budget-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(progress, 100)}%; 
                             background: ${progress > 100 ? '#e74c3c' : '#2ecc71'}"></div>
                    </div>
                </div>
                <div class="budget-stats">
                    <span>Spent: <strong>${this.formatCurrency(spent)}</strong></span>
                    <span>Remaining: <strong>${this.formatCurrency(remaining)}</strong></span>
                    <span>Progress: <strong>${progress.toFixed(1)}%</strong></span>
                </div>
            `;
            
            list.appendChild(budgetEl);
        });
    }
    
    // Update analytics
    updateAnalytics() {
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        
        const monthTransactions = this.transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate.getMonth() === currentMonth && 
                   transDate.getFullYear() === currentYear;
        });
        
        const monthExpenses = monthTransactions.filter(t => t.type === 'expense');
        
        // Calculate analytics
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
        
        // Update DOM
        this.elements.avgDailySpend.textContent = this.formatCurrency(avgDailySpend);
        this.elements.mostExpensiveDay.textContent = mostExpensiveDay;
        this.elements.transactionsCount.textContent = monthTransactions.length;
        this.elements.largestExpense.textContent = this.formatCurrency(largestExpense);
        
        // Update savings
        this.updateSavingsProgress();
        
        // Generate insights
        this.generateInsights();
    }
    
    // Update savings progress
    updateSavingsProgress() {
        const savingsGoal = 5000; // Demo goal
        const saved = 1200; // Demo saved amount
        const progress = (saved / savingsGoal) * 100;
        
        this.elements.savingsGoal.textContent = this.formatCurrency(savingsGoal);
        this.elements.savedAmount.textContent = this.formatCurrency(saved);
        this.elements.savingsFill.style.width = `${progress}%`;
        
        // Update stats
        const monthlyGoal = (savingsGoal - saved) / 12;
        const remaining = savingsGoal - saved;
        
        const stats = document.querySelectorAll('.savings-stats .stat strong');
        if (stats.length >= 3) {
            stats[0].textContent = this.formatCurrency(monthlyGoal);
            stats[1].textContent = this.formatCurrency(remaining);
            stats[2].textContent = '12 months';
        }
    }
    
    // Generate financial insights
    generateInsights() {
        const insights = [
            {
                icon: 'fa-lightbulb',
                text: 'Try cooking at home more often to reduce food expenses.'
            },
            {
                icon: 'fa-chart-line',
                text: 'Your transportation costs are 15% lower than last month. Great job!'
            },
            {
                icon: 'fa-piggy-bank',
                text: 'You could save $50/month by reviewing your subscriptions.'
            },
            {
                icon: 'fa-bullseye',
                text: 'You\'re on track to meet your savings goal this month.'
            }
        ];
        
        const insightsList = this.elements.insightsList;
        insightsList.innerHTML = '';
        
        insights.forEach(insight => {
            const insightEl = document.createElement('div');
            insightEl.className = 'insight';
            insightEl.innerHTML = `
                <i class="fas ${insight.icon}"></i>
                <p>${insight.text}</p>
            `;
            insightsList.appendChild(insightEl);
        });
    }
    
    // Show category modal
    showCategoryModal() {
        const modal = this.elements.categoryModal;
        const list = document.getElementById('categoriesList');
        
        list.innerHTML = '';
        
        this.categories.forEach(category => {
            const categoryEl = document.createElement('div');
            categoryEl.className = 'category-item';
            categoryEl.innerHTML = `
                <div class="category-info">
                    <div class="category-color" style="background-color: ${category.color}"></div>
                    <span>${category.name}</span>
                    <small class="category-type">${category.type}</small>
                </div>
                <div class="category-actions">
                    <button class="edit-category" data-id="${category.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-category" data-id="${category.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            list.appendChild(categoryEl);
        });
        
        // Add event listeners for category actions
        document.querySelectorAll('.edit-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('button').dataset.id);
                this.editCategory(id);
            });
        });
        
        document.querySelectorAll('.delete-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('button').dataset.id);
                this.deleteCategory(id);
            });
        });
        
        modal.style.display = 'flex';
    }
    
    // Edit category
    editCategory(id) {
        this.showToast('Edit category feature coming soon!', 'info');
    }
    
    // Delete category
    deleteCategory(id) {
        // Prevent deleting default categories
        if (id <= 12) {
            this.showToast('Cannot delete default categories', 'warning');
            return;
        }
        
        if (confirm('Are you sure you want to delete this category?')) {
            this.categories = this.categories.filter(c => c.id !== id);
            this.saveData();
            this.updateCategoryOptions();
            this.showCategoryModal(); // Refresh modal
            this.showToast('Category deleted', 'success');
        }
    }
    
    // Add category
    addCategory(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('newCategoryName');
        const colorInput = document.getElementById('newCategoryColor');
        
        const name = nameInput.value.trim();
        const color = colorInput.value;
        const type = 'expense'; // Default to expense for new categories
        
        if (!name) {
            this.showToast('Please enter a category name', 'warning');
            return;
        }
        
        // Check if category already exists
        if (this.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            this.showToast('Category already exists', 'warning');
            return;
        }
        
        // Create new category
        const newCategory = {
            id: Date.now(),
            name,
            color,
            type,
            icon: 'fa-tag'
        };
        
        this.categories.push(newCategory);
        this.saveData();
        this.updateCategoryOptions();
        this.updateBudgetCategoryOptions();
        
        // Reset form
        nameInput.value = '';
        colorInput.value = '#3498db';
        
        this.showToast('Category added successfully!', 'success');
        this.showCategoryModal(); // Refresh modal
    }
    
    // Show budget modal
    showBudgetModal() {
        const modal = this.elements.budgetModal;
        modal.style.display = 'flex';
    }
    
    // Save budget
    saveBudget(e) {
        e.preventDefault();
        
        const categoryId = parseInt(document.getElementById('budgetCategory').value);
        const amount = parseFloat(document.getElementById('budgetAmount').value);
        const period = document.getElementById('budgetPeriod').value;
        
        if (!categoryId || !amount) {
            this.showToast('Please fill in all fields', 'warning');
            return;
        }
        
        if (amount <= 0) {
            this.showToast('Amount must be greater than 0', 'warning');
            return;
        }
        
        // Check if budget already exists for this category
        const existingIndex = this.budgets.findIndex(b => b.categoryId === categoryId);
        
        if (existingIndex !== -1) {
            // Update existing budget
            this.budgets[existingIndex].amount = amount;
            this.budgets[existingIndex].period = period;
        } else {
            // Add new budget
            const newBudget = {
                id: Date.now(),
                categoryId,
                amount,
                period,
                spent: 0
            };
            this.budgets.push(newBudget);
        }
        
        this.saveData();
        this.updateBudgets();
        this.updateUI();
        this.closeAllModals();
        
        this.showToast('Budget saved successfully!', 'success');
    }
    
    // Export to CSV
    exportToCSV() {
        if (this.transactions.length === 0) {
            this.showToast('No transactions to export', 'warning');
            return;
        }
        
        // Create CSV content
        const headers = ['Date', 'Description', 'Type', 'Category', 'Amount', 'Payment Method', 'Notes'];
        const rows = this.transactions.map(t => {
            const category = this.categories.find(c => c.id === t.categoryId);
            return [
                t.date,
                `"${t.description}"`,
                t.type,
                category?.name || 'Uncategorized',
                t.amount,
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
    
    // Generate report
    generateReport() {
        this.showToast('Monthly report generated!', 'success');
        // In a full implementation, this would generate a PDF report
    }
    
    // Print summary
    printSummary() {
        window.print();
    }
    
    // Backup data
    backupData() {
        const backup = {
            transactions: this.transactions,
            categories: this.categories,
            budgets: this.budgets,
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
    
    // Close all modals
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
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
    
    // Utility: Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
}

// Add CSS for toast animation
const style = document.createElement('style');
style.textContent = `
    @keyframes toastSlideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .transaction-detail {
        padding: 10px;
    }
    
    .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid var(--border-color);
    }
    
    .detail-header h4 {
        font-size: 1.4rem;
        font-weight: 600;
    }
    
    .detail-amount {
        font-size: 1.8rem;
        font-weight: 700;
        font-family: 'Space Grotesk', sans-serif;
    }
    
    .detail-amount.income {
        color: #2ecc71;
    }
    
    .detail-amount.expense {
        color: #e74c3c;
    }
    
    .detail-info {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--border-color);
    }
    
    .info-row:last-child {
        border-bottom: none;
    }
    
    .info-row .label {
        color: var(--text-secondary);
        font-weight: 500;
    }
    
    .info-row .value {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
    }
    
    .info-row .value.income {
        color: #2ecc71;
    }
    
    .info-row .value.expense {
        color: #e74c3c;
    }
    
    .modal-actions {
        display: flex;
        gap: 15px;
        padding: 20px 30px;
        border-top: 1px solid var(--border-color);
    }
    
    .action-btn {
        flex: 1;
        padding: 15px;
        border-radius: 10px;
        border: 2px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        transition: all 0.3s;
    }
    
    .action-btn:hover {
        border-color: var(--secondary-color);
        transform: translateY(-2px);
    }
    
    .action-btn.delete {
        border-color: #e74c3c;
        color: #e74c3c;
    }
    
    .action-btn.delete:hover {
        background: #e74c3c;
        color: white;
    }
    
    .categories-list {
        max-height: 300px;
        overflow-y: auto;
        margin-bottom: 25px;
    }
    
    .category-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: var(--bg-secondary);
        border-radius: 10px;
        margin-bottom: 10px;
        border: 1px solid var(--border-color);
    }
    
    .category-info {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .category-color {
        width: 20px;
        height: 20px;
        border-radius: 50%;
    }
    
    .category-type {
        background: var(--border-color);
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        color: var(--text-secondary);
    }
    
    .category-actions {
        display: flex;
        gap: 10px;
    }
    
    .category-actions button {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 8px;
        border-radius: 6px;
        transition: all 0.3s;
    }
    
    .category-actions button:hover {
        background: var(--border-color);
        color: var(--text-primary);
    }
    
    #addCategoryForm {
        display: flex;
        gap: 15px;
        align-items: center;
    }
    
    #addCategoryForm .form-group {
        flex: 1;
        display: flex;
        gap: 10px;
        margin-bottom: 0;
    }
    
    #newCategoryName {
        flex: 1;
    }
    
    #newCategoryColor {
        width: 50px;
        height: 50px;
        padding: 5px;
        border-radius: 8px;
        cursor: pointer;
    }
    
    .add-btn {
        background: var(--secondary-color);
        color: white;
        border: none;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.3s;
    }
    
    .add-btn:hover {
        background: var(--primary-color);
        transform: translateY(-2px);
    }
    
    .cancel-btn {
        background: var(--border-color);
        color: var(--text-secondary);
        border: none;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .cancel-btn:hover {
        background: #e2e8f0;
    }
`;
document.head.appendChild(style);

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.expenseTracker = new ExpenseTracker();
});
