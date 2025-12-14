// Currency conversion rates (simplified - in a real app, use an API)
const exchangeRates = {
    USD: { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 147.50, CAD: 1.36, AUD: 1.54, INR: 83.00 },
    EUR: { USD: 1.09, EUR: 1, GBP: 0.86, JPY: 160.33, CAD: 1.48, AUD: 1.67, INR: 90.22 },
    GBP: { USD: 1.27, EUR: 1.16, GBP: 1, JPY: 186.71, CAD: 1.72, AUD: 1.95, INR: 105.06 },
    JPY: { USD: 0.0068, EUR: 0.0062, GBP: 0.0054, JPY: 1, CAD: 0.0092, AUD: 0.0104, INR: 0.56 },
    CAD: { USD: 0.74, EUR: 0.68, GBP: 0.58, JPY: 108.82, CAD: 1, AUD: 1.13, INR: 61.03 },
    AUD: { USD: 0.65, EUR: 0.60, GBP: 0.51, JPY: 96.10, CAD: 0.88, AUD: 1, INR: 53.90 },
    INR: { USD: 0.012, EUR: 0.011, GBP: 0.0095, JPY: 1.79, CAD: 0.016, AUD: 0.019, INR: 1 }
};

// Application State
class ExpenseTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('expenseTrackerTransactions')) || [];
        this.baseCurrency = localStorage.getItem('expenseTrackerBaseCurrency') || 'USD';
        this.editingId = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.initApp();
    }

    initializeElements() {
        // Form elements
        this.expenseForm = document.getElementById('expense-form');
        this.descriptionInput = document.getElementById('description');
        this.amountInput = document.getElementById('amount');
        this.currencyInput = document.getElementById('currency');
        this.categoryInput = document.getElementById('category');
        this.dateInput = document.getElementById('date');
        this.typeInputs = document.querySelectorAll('input[name="type"]');
        
        // UI elements
        this.expensesList = document.getElementById('expenses-list');
        this.emptyState = document.getElementById('empty-state');
        this.totalExpensesEl = document.getElementById('total-expenses');
        this.totalIncomeEl = document.getElementById('total-income');
        this.balanceEl = document.getElementById('balance');
        this.baseCurrencySelect = document.getElementById('base-currency');
        this.clearAllBtn = document.getElementById('clear-all');
        this.clearFormBtn = document.getElementById('clear-form');
        this.chartContainer = document.getElementById('chart-container');
        this.noDataEl = document.getElementById('no-data');
        this.conversionText = document.getElementById('conversion-text');
        this.submitBtn = document.querySelector('button[type="submit"]');
    }

    setupEventListeners() {
        this.expenseForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.baseCurrencySelect.addEventListener('change', () => this.handleBaseCurrencyChange());
        this.clearAllBtn.addEventListener('click', () => this.clearAllTransactions());
        this.clearFormBtn.addEventListener('click', () => this.clearForm());
    }

    initApp() {
        // Set base currency from localStorage
        this.baseCurrencySelect.value = this.baseCurrency;
        this.updateConversionText();
        
        // Set today's date as default
        this.dateInput.valueAsDate = new Date();
        
        // Load transactions and update UI
        this.renderTransactions();
        this.updateStats();
        this.updateChart();
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const description = this.descriptionInput.value.trim();
        const amount = parseFloat(this.amountInput.value);
        const currency = this.currencyInput.value;
        const category = this.categoryInput.value;
        const date = this.dateInput.value;
        const type = document.querySelector('input[name="type"]:checked').value;
        
        // Validation
        if (!description) {
            this.showNotification('Please enter a description', 'danger');
            this.descriptionInput.focus();
            return;
        }
        
        if (isNaN(amount) || amount <= 0) {
            this.showNotification('Please enter a valid amount', 'danger');
            this.amountInput.focus();
            return;
        }
        
        if (this.editingId) {
            // Update existing transaction
            const index = this.transactions.findIndex(t => t.id === this.editingId);
            if (index !== -1) {
                this.transactions[index] = {
                    ...this.transactions[index],
                    description,
                    amount,
                    currency,
                    category,
                    date,
                    type
                };
                this.showNotification('Transaction updated successfully!', 'success');
            }
            this.editingId = null;
            this.submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Transaction';
        } else {
            // Add new transaction
            const transaction = {
                id: Date.now().toString(),
                description,
                amount,
                currency,
                category,
                date,
                type,
                createdAt: new Date().toISOString()
            };
            
            this.transactions.unshift(transaction);
            this.showNotification('Transaction added successfully!', 'success');
        }
        
        // Save and update UI
        this.saveTransactions();
        this.renderTransactions();
        this.updateStats();
        this.updateChart();
        this.clearForm();
    }

    renderTransactions() {
        if (this.transactions.length === 0) {
            this.emptyState.style.display = 'block';
            this.expensesList.innerHTML = '';
            this.expensesList.appendChild(this.emptyState);
            return;
        }
        
        this.emptyState.style.display = 'none';
        
        // Sort by date (newest first)
        const sortedTransactions = [...this.transactions].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        const transactionsHTML = sortedTransactions.map(transaction => {
            const convertedAmount = this.convertCurrency(
                transaction.amount, 
                transaction.currency, 
                this.baseCurrency
            );
            const isIncome = transaction.type === 'income';
            
            return `
                <div class="expense-item" data-id="${transaction.id}">
                    <div class="expense-desc">${transaction.description}</div>
                    <div class="expense-amount ${isIncome ? 'amount-income' : 'amount-expense'}">
                        ${transaction.currency} ${transaction.amount.toFixed(2)}
                        <div class="expense-converted">
                            ≈ ${this.baseCurrency} ${convertedAmount.toFixed(2)}
                        </div>
                    </div>
                    <div class="expense-category">${transaction.category}</div>
                    <div class="expense-date">${this.formatDate(transaction.date)}</div>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" onclick="expenseTracker.editTransaction('${transaction.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="expenseTracker.deleteTransaction('${transaction.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        this.expensesList.innerHTML = transactionsHTML;
    }

    editTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction) return;
        
        this.editingId = id;
        
        // Fill form with transaction data
        this.descriptionInput.value = transaction.description;
        this.amountInput.value = transaction.amount;
        this.currencyInput.value = transaction.currency;
        this.categoryInput.value = transaction.category;
        this.dateInput.value = transaction.date;
        
        // Set transaction type
        document.querySelector(`input[name="type"][value="${transaction.type}"]`).checked = true;
        
        // Update button text
        this.submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Transaction';
        
        // Scroll to form
        this.descriptionInput.focus();
    }

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveTransactions();
            this.renderTransactions();
            this.updateStats();
            this.updateChart();
            this.showNotification('Transaction deleted!', 'danger');
        }
    }

    clearAllTransactions() {
        if (this.transactions.length === 0) {
            this.showNotification('No transactions to clear', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to delete ALL transactions? This cannot be undone.')) {
            this.transactions = [];
            this.saveTransactions();
            this.renderTransactions();
            this.updateStats();
            this.updateChart();
            this.showNotification('All transactions cleared!', 'danger');
        }
    }

    clearForm() {
        this.expenseForm.reset();
        this.editingId = null;
        this.dateInput.valueAsDate = new Date();
        this.submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Transaction';
        this.descriptionInput.focus();
    }

    updateStats() {
        let totalExpenses = 0;
        let totalIncome = 0;
        
        this.transactions.forEach(transaction => {
            const convertedAmount = this.convertCurrency(
                transaction.amount, 
                transaction.currency, 
                this.baseCurrency
            );
            
            if (transaction.type === 'expense') {
                totalExpenses += convertedAmount;
            } else {
                totalIncome += convertedAmount;
            }
        });
        
        const balance = totalIncome - totalExpenses;
        
        this.totalExpensesEl.textContent = `${this.baseCurrency} ${totalExpenses.toFixed(2)}`;
        this.totalIncomeEl.textContent = `${this.baseCurrency} ${totalIncome.toFixed(2)}`;
        this.balanceEl.textContent = `${this.baseCurrency} ${balance.toFixed(2)}`;
        
        // Color balance based on value
        if (balance < 0) {
            this.balanceEl.style.color = 'var(--danger)';
        } else if (balance > 0) {
            this.balanceEl.style.color = 'var(--success)';
        } else {
            this.balanceEl.style.color = 'var(--primary)';
        }
    }

    updateChart() {
        // Filter expenses only (not income)
        const expenses = this.transactions.filter(t => t.type === 'expense');
        
        if (expenses.length === 0) {
            this.noDataEl.style.display = 'block';
            this.chartContainer.innerHTML = '';
            this.chartContainer.appendChild(this.noDataEl);
            return;
        }
        
        this.noDataEl.style.display = 'none';
        
        // Group expenses by category
        const categories = {};
        expenses.forEach(expense => {
            const convertedAmount = this.convertCurrency(
                expense.amount, 
                expense.currency, 
                this.baseCurrency
            );
            
            if (categories[expense.category]) {
                categories[expense.category] += convertedAmount;
            } else {
                categories[expense.category] = convertedAmount;
            }
        });
        
        // Find max for scaling
        const maxAmount = Math.max(...Object.values(categories));
        
        // Generate chart HTML
        let chartHTML = '';
        Object.keys(categories)
            .sort((a, b) => categories[b] - categories[a])
            .forEach(category => {
                const amount = categories[category];
                const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                
                chartHTML += `
                    <div class="category-bar">
                        <div class="category-name">${category}</div>
                        <div class="bar" style="width: ${percentage}%"></div>
                        <div class="category-amount">${this.baseCurrency} ${amount.toFixed(2)}</div>
                    </div>
                `;
            });
        
        this.chartContainer.innerHTML = chartHTML;
    }

    handleBaseCurrencyChange() {
        this.baseCurrency = this.baseCurrencySelect.value;
        localStorage.setItem('expenseTrackerBaseCurrency', this.baseCurrency);
        this.updateConversionText();
        this.renderTransactions();
        this.updateStats();
        this.updateChart();
        this.showNotification(`Base currency changed to ${this.baseCurrency}`, 'success');
    }

    updateConversionText() {
        // Show conversion rates for popular currencies
        const popularCurrencies = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR']
            .filter(currency => currency !== this.baseCurrency)
            .slice(0, 3);
        
        if (popularCurrencies.length === 0) {
            this.conversionText.textContent = `1 ${this.baseCurrency} = 1 ${this.baseCurrency}`;
            return;
        }
        
        let text = `1 ${this.baseCurrency} = `;
        text += popularCurrencies.map(currency => {
            const rate = exchangeRates[this.baseCurrency][currency];
            return `${rate.toFixed(2)} ${currency}`;
        }).join(', ');
        
        this.conversionText.textContent = text;
    }

    convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;
        
        if (!exchangeRates[fromCurrency] || !exchangeRates[fromCurrency][toCurrency]) {
            console.error(`Conversion rate not found: ${fromCurrency} to ${toCurrency}`);
            return amount;
        }
        
        const rate = exchangeRates[fromCurrency][toCurrency];
        return amount * rate;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Check if date is today
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        
        // Check if date is yesterday
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        
        // Otherwise format normally
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    }

    saveTransactions() {
        localStorage.setItem('expenseTrackerTransactions', JSON.stringify(this.transactions));
    }

    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                     type === 'danger' ? 'fa-exclamation-circle' : 'fa-info-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the Expense Tracker when DOM is loaded
let expenseTracker;
document.addEventListener('DOMContentLoaded', () => {
    expenseTracker = new ExpenseTracker();
});

// Add CSS for fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
`;
document.head.appendChild(style);
