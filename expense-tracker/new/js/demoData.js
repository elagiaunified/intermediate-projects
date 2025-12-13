// js/demoData.js - Generate demo data for testing

class DemoDataGenerator {
    static generateExpenses(count = 20) {
        const categories = ['food', 'transport', 'shopping', 'entertainment', 'bills', 'health', 'education', 'other'];
        const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR'];
        const paymentMethods = ['cash', 'credit', 'debit', 'digital', 'other'];
        
        const expenses = [];
        const now = new Date();
        
        for (let i = 0; i < count; i++) {
            // Random date within last 90 days
            const daysAgo = Math.floor(Math.random() * 90);
            const date = new Date(now);
            date.setDate(date.getDate() - daysAgo);
            
            const category = categories[Math.floor(Math.random() * categories.length)];
            const currency = currencies[Math.floor(Math.random() * currencies.length)];
            
            // Generate realistic amounts based on category
            let amount;
            switch(category) {
                case 'food':
                    amount = (Math.random() * 50 + 5).toFixed(2); // $5-$55
                    break;
                case 'transport':
                    amount = (Math.random() * 100 + 10).toFixed(2); // $10-$110
                    break;
                case 'shopping':
                    amount = (Math.random() * 200 + 20).toFixed(2); // $20-$220
                    break;
                case 'bills':
                    amount = (Math.random() * 300 + 50).toFixed(2); // $50-$350
                    break;
                default:
                    amount = (Math.random() * 100 + 10).toFixed(2); // $10-$110
            }
            
            const expense = {
                id: i + 1,
                name: this.generateExpenseName(category),
                amount: parseFloat(amount),
                currency: currency,
                category: category,
                date: date.toISOString().split('T')[0],
                paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                notes: Math.random() > 0.7 ? 'Sample note for demo purposes' : '',
                createdAt: date.toISOString(),
                updatedAt: date.toISOString()
            };
            
            expenses.push(expense);
        }
        
        return expenses;
    }
    
    static generateExpenseName(category) {
        const names = {
            'food': ['Lunch at Restaurant', 'Coffee Shop', 'Grocery Shopping', 'Dinner Delivery', 'Fast Food'],
            'transport': ['Gas Station', 'Uber Ride', 'Public Transport', 'Car Maintenance', 'Parking Fee'],
            'shopping': ['Clothing Store', 'Electronics', 'Online Shopping', 'Bookstore', 'Gift Purchase'],
            'entertainment': ['Movie Tickets', 'Concert', 'Streaming Service', 'Museum Entry', 'Game Purchase'],
            'bills': ['Electricity Bill', 'Internet Bill', 'Phone Bill', 'Rent Payment', 'Insurance'],
            'health': ['Pharmacy', 'Doctor Visit', 'Gym Membership', 'Vitamins', 'Medical Supplies'],
            'education': ['Online Course', 'Books', 'Workshop', 'Software License', 'Conference'],
            'other': ['Miscellaneous', 'Gift', 'Donation', 'Repair', 'Service Fee']
        };
        
        const categoryNames = names[category] || ['Expense'];
        return categoryNames[Math.floor(Math.random() * categoryNames.length)];
    }
    
    static generateDemoData(app) {
        if (!confirm('Generate demo data? This will replace your current expenses.')) {
            return;
        }
        
        const expenses = this.generateExpenses(25);
        app.expenseManager.setExpenses(expenses);
        app.storageManager.saveExpenses(expenses);
        
        // Update UI
        app.updateDashboard();
        app.renderExpenseTable();
        app.updateCharts();
        
        app.showAlert('Demo data generated successfully!', 'success');
    }
}

// Add demo button to the UI
document.addEventListener('DOMContentLoaded', () => {
    // Add demo button to footer
    const footerLinks = document.querySelector('.footer-links');
    if (footerLinks) {
        const demoLink = document.createElement('a');
        demoLink.href = '#';
        demoLink.id = 'generate-demo';
        demoLink.innerHTML = '<i class="fas fa-magic"></i> Generate Demo Data';
        footerLinks.appendChild(demoLink);
        
        demoLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.app) {
                DemoDataGenerator.generateDemoData(window.app);
            }
        });
    }
});
