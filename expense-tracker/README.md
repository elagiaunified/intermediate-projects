## 💰 Smart Expense Tracker
A comprehensive multi-currency expense tracking application with real-time exchange rates, interactive charts, and budget management. Track your finances across 50+ currencies with automatic currency detection.

![Expense Tracker Preview](https://img.shields.io/badge/Status-Complete-success) ![Technology](https://img.shields.io/badge/Tech-HTML/CSS/JS-blue) ![API](https://img.shields.io/badge/API-ExchangeRate--API-orange) ![Multi-Currency](https://img.shields.io/badge/Features-Multi--Currency/Charts/Budgeting-green)

## LIVE DEMO!
| [View Demo](https://elagiaunified.github.io/intermediate-projects/expense-tracker/new/) |

## ✨ Features
## 🌍 Multi-Currency Support
- Automatic Currency Detection: Detects user's currency based on location/browser
- 50+ World Currencies: USD, EUR, GBP, JPY, CAD, AUD, CNY, INR, BRL, ZAR, and more
- Real-time Exchange Rates: Live rates from ExchangeRate-API
- Automatic Conversion: All transactions converted to your base currency
- Built-in Currency Converter: Instant conversion between any currencies

## 📊 Financial Tracking
- Expense & Income Tracking: Log transactions in any currency
- Smart Categorization: 10+ categories with custom icons
- Recurring Transactions: Set daily, weekly, monthly, or yearly recurrences
- Tag System: Add custom tags for better organization
- Search & Filter: Find transactions by date, category, or description

## 📈 Data Visualization
- Balance Trend Chart: Visualize your financial progress over time
- Expense Categories: Doughnut chart showing spending distribution
- Income vs Expenses: Bar chart comparing earnings and spending
- Budget Progress Bars: Visual indicators for budget tracking

## 💡 Budget Management
- Category-based Budgets: Set budgets for specific spending categories
- Progress Tracking: Visual progress bars with color-coded warnings
- Budget Periods: Monthly, weekly, or yearly budget cycles
- Overspending Alerts: Notifications when approaching budget limits

## 🔧 Advanced Features
- Financial Insights: AI-generated insights based on your spending patterns
- Data Export: Export to CSV, JSON, or generate PDF reports
- LocalStorage Persistence: Your data is saved locally in your browser
- Responsive Design: Perfect experience on desktop, tablet, and mobile
- Dark/Light Theme: Professional color scheme with great contrast

## 🎯 How to Use
### Getting Started
- Visit the live demo or open index.html locally
- Currency will auto-detect based on your location
- Or manually select your preferred base currency
- Start adding transactions in any currency

### Adding Transactions
- Click "Add New Transaction" section
- Select Type: Expense (red) or Income (green)
- Enter Amount in your chosen currency
- Choose Category (Food, Transport, Shopping, etc.)
- Add Description and optional tags
- Click "Add Transaction" to save

### Managing Budgets
- Click "Add Budget" in Budget Management section
- Select Category you want to budget for
- Set Amount in your base currency
- Choose Period (Monthly, Weekly, Yearly)
- Track progress with visual indicators

### Using Charts & Analytics
- Toggle Time Range: Change view (Week, Month, Quarter, Year, All Time)
- Hover Charts: See detailed values on hover
- Filter Categories: Click on chart segments to filter transactions
- Export Data: Download your financial data for analysis

### Currency Features
- Auto-detect: App automatically suggests your local currency
- Converter Tool: Convert between any currencies instantly
- Exchange Rates: View live rates for popular currencies
- Update Rates: Manually refresh exchange rates

## 🏗️ Project Structure
```
expense-tracker/
├── index.html          # Main application interface
├── style.css           # Styling, layouts, animations
├── script.js           # Core logic, API calls, features
└── README.md           # This documentation
```
## 🔧 Technical Implementation
API Integration
- Uses ExchangeRate-API (free tier, no API key required for basic usage):

- Endpoint	Purpose	Rate Limits
- https://api.exchangerate-api.com/v4/latest/{base}	Get exchange rates for base currency	1,500 requests/month (free)
- Local Fallback: Hardcoded rates when API unavailable	Backup data	Always available
- Key Features Implementation

Multi-Currency System
```javascript
// Currency conversion logic
convertToBaseCurrency(amount, fromCurrency) {
    if (!this.exchangeRates[fromCurrency]) return amount;
    const rate = this.exchangeRates[this.baseCurrency] / this.exchangeRates[fromCurrency];
    return amount * rate;
}

// Automatic currency detection
async detectUserCurrency() {
    const browserLocale = navigator.language;
    const countryCode = browserLocale.split('-')[1];
    const currencyMap = { 'US': 'USD', 'GB': 'GBP', 'EU': 'EUR', /* ... */ };
    return currencyMap[countryCode] || this.DEFAULT_CURRENCY;
}
Chart.js Integration
javascript
// Setup interactive charts
setupCharts() {
    this.charts.balance = new Chart(this.elements.balanceChart, {
        type: 'line',
        data: { /* ... */ },
        options: { /* ... */ }
    });
    
    this.charts.category = new Chart(this.elements.categoryChart, {
        type: 'doughnut',
        data: { /* ... */ },
        options: { /* ... */ }
    });
}
```
Budget Management Algorithm
```javascript
updateBudgets() {
    this.budgets.forEach(budget => {
        const spent = this.transactions
            .filter(t => t.type === 'expense' && t.category === budget.category)
            .reduce((sum, t) => sum + this.convertToBaseCurrency(t.amount, t.originalCurrency), 0);
        
        const percentage = (spent / budget.amount) * 100;
        // Update UI with color-coded warnings
    });
}
Data Management Architecture
Transaction Object Structure
javascript
{
    id: "timestamp_random",
    type: "expense", // or "income"
    amount: 49.99,
    originalCurrency: "EUR",
    category: "food",
    date: "2023-12-15",
    description: "Grocery shopping at supermarket",
    recurring: "none", // or "daily", "weekly", "monthly", "yearly"
    tags: ["groceries", "essential"],
    createdAt: "2023-12-15T10:30:00Z"
}
```
Budget Object Structure
```javascript
{
    category: "food",
    amount: 500, // in base currency
    period: "monthly" // or "weekly", "yearly"
}
```

## 💱 Supported Currencies
The application supports all major world currencies:

- Currency	Code	Symbol	Region
- US Dollar	USD	$	United States
- Euro	EUR	€	European Union
- British Pound	GBP	£	United Kingdom
- Japanese Yen	JPY	¥	Japan
- Canadian Dollar	CAD	C$	Canada
- Australian Dollar	AUD	A$	Australia
- Swiss Franc	CHF	CHF	Switzerland
- Chinese Yuan	CNY	¥	China
- Indian Rupee	INR	₹	India
- Brazilian Real	BRL	R$	Brazil
- South African Rand	ZAR	R	South Africa

- Total: 50+ currencies supported via ExchangeRate-API

## 📱 Responsive Design
Breakpoints & Layouts
- Desktop (≥1200px): Full dashboard with side-by-side charts
- Tablet (768px-1199px): Adaptive grid, optimized touch targets
- Mobile (<768px): Vertical stacking, simplified navigation

Performance Optimizations
- Lazy Loading: Charts load on demand
- Local Caching: Exchange rates cached for 1 hour
- Efficient DOM Updates: Minimal re-renders
- Optimized Assets: Compressed images and CSS

Accessibility Features
- Keyboard Navigation: Full tab navigation support
- Screen Reader Ready: ARIA labels and semantic HTML
- High Contrast: WCAG AA compliant color scheme
- Focus Indicators: Clear visual focus states

## 🧪 Testing
Test Coverage
- ✅ Currency conversion accuracy
- ✅ Exchange rate API integration
- ✅ Chart rendering and interactivity
- ✅ Budget calculation algorithms
- ✅ LocalStorage operations (save/load)
- ✅ Form validation and error handling
- ✅ Responsive design across devices
- ✅ Accessibility compliance

Browser Compatibility
- Chrome 60+ ✅
- Firefox 55+ ✅
- Safari 11+ ✅
- Edge 79+ ✅
- Mobile browsers ✅
- Tablet browsers ✅

Edge Cases Handled
- Offline mode (cached data)
- API failure (fallback rates)
- Invalid user input
- LocalStorage quota exceeded
- Timezone differences
- Daylight saving time

## 📝 Code Architecture
Main Application Class
```javascript
class ExpenseTracker {
    constructor() {
        this.EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest';
        this.transactions = [];
        this.budgets = [];
        this.exchangeRates = {};
        this.baseCurrency = 'USD';
        this.userCurrency = 'USD';
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        await this.detectUserCurrency();
        await this.loadExchangeRates();
        this.setupCharts();
        this.updateDashboard();
    }
}
```

Modular Component Structure
- Currency Manager: Handles all currency operations
- Transaction Manager: CRUD operations for transactions
- Chart Manager: Data visualization with Chart.js
- Budget Manager: Budget calculations and tracking
- Storage Manager: LocalStorage operations
- UI Manager: DOM updates and event handling

## 🔄 Future Enhancements
Planned Features
- Bank Integration: Connect to bank accounts via Plaid API
- Receipt Scanning: OCR for automatic expense logging
- Investment Tracking: Stocks, crypto, and portfolio tracking
- Tax Reporting: Generate tax reports and summaries
- Multi-User Support: Family or team expense sharing
- Bill Reminders: Payment due date notifications
- Goal Setting: Savings goals with progress tracking
- Expense Sharing: Split bills with friends/family

Technical Improvements
- Service Workers: Offline functionality and push notifications
- IndexedDB: Larger storage capacity for transaction history
- WebAssembly: Faster currency calculations for large datasets
- PWA Support: Install as native app on mobile devices
- WebSocket: Real-time exchange rate updates
- Unit Tests: Comprehensive test suite with Jest
- CI/CD Pipeline: Automated testing and deployment
- Internationalization: Multiple language support

API Enhancements
- Historical Rates: View exchange rate history
- Multiple API Fallbacks: Redundant exchange rate sources
- Cryptocurrency Support: BTC, ETH, and other crypto rates
- Currency Forecasts: Predictive exchange rate analytics

## 📚 What I Learned
Financial Technology
- Exchange Rate APIs: Consuming and caching financial data
- Currency Conversion: Accurate multi-currency calculations
- Financial Visualization: Best practices for money-related charts
- Budget Algorithms: Smart budget tracking and alerts

Advanced JavaScript
- Async/Await Patterns: Handling multiple API calls efficiently
- LocalStorage Optimization: Efficient data storage strategies
- Chart.js Integration: Dynamic data visualization
- Modular Architecture: Clean separation of concerns

UI/UX Design
- Financial UI Patterns: Designing intuitive money management interfaces
- Data Visualization: Presenting financial data clearly
- Responsive Financial Apps: Mobile-first expense tracking
- Accessibility in Finance: Making financial tools accessible to all

Performance Optimization
- API Rate Limiting: Managing free tier API constraints
- Caching Strategies: Smart caching for exchange rates
- DOM Optimization: Efficient updates for financial data
- Bundle Optimization: Minimal footprint for faster loading

## 🤝 Contributing
We welcome contributions from the community! Here's how you can help:

Areas Needing Contribution
Additional currency support
- Improved chart visualizations
- More budget categories
- Export format enhancements
- Performance optimizations
- Test coverage improvements

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

- Third-Party Licenses
- Chart.js: MIT License
- ExchangeRate-API: Free for non-commercial use
- Font Awesome: CC BY 4.0 License
- Google Fonts: Open Font License

## 👨‍💻 Author
GitHub: @elagiaunified
Portfolio: [Coming Soon]

## 🙏 Acknowledgments
- APIs & Services
- ExchangeRate-API for providing free currency exchange rates
- Chart.js for powerful and flexible charting library
- Font Awesome for beautiful financial icons
- Google Fonts for typography

Inspiration
- Mint.com for personal finance management concepts
- Splitwise for expense sharing ideas
- YNAB for budget philosophy
- Various open-source finance tools

Contributors
- Thanks to all contributors who have helped improve this project
- Special thanks to beta testers for valuable feedback

## ⭐ Support
If you find this expense tracker useful, please:
- Star the repository on GitHub
- Share with friends who might find it useful
- Report issues you encounter
- Contribute features or improvements
- Follow the author for more projects

## 📞 Support & Questions
For support or questions:
- Check the Issues for existing discussions
- Create a new issue for bugs or feature requests
- Email the author for direct inquiries

## 💡 Pro Tip: Use this expense tracker consistently for 30 days to get meaningful insights into your spending habits!
- Part of the Intermediate Web Development Projects collection. Building real-world applications to level up your skills.
