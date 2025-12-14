# Expense Tracker with Multi-Currency Support

A modern, responsive expense tracking application that supports multiple currencies with real-time conversion. Built with HTML, CSS, and JavaScript.

![Expense Tracker Preview](https://img.shields.io/badge/Status-Complete-success) ![GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-blue)

## Features

### 🪙 Multi-Currency Support
- Add transactions in 7 different currencies (USD, EUR, GBP, JPY, CAD, AUD, INR)
- Real-time conversion to your selected base currency
- Automatic exchange rate calculations

### 📊 Comprehensive Tracking
- Track both expenses and income
- Categorize transactions (Food, Transport, Shopping, etc.)
- Visual expense breakdown by category
- Real-time statistics dashboard

### 💾 Data Persistence
- All data stored locally in browser
- Transactions persist between sessions
- No account or login required

### 🎨 Modern UI/UX
- Clean, responsive design
- Intuitive form with validation
- Visual feedback for all actions
- Mobile-friendly interface

### 🔧 Additional Features
- Add, edit, and delete transactions
- Clear all data with confirmation
- Expense visualization charts
- Date-based transaction sorting

## Live Demo

[View Live Demo on GitHub Pages](https://elagiaunified.github.io/intermediate-projects/expense-tracker/)

## Screenshot

![Expense Tracker Screenshot](screenshot.png)

## Project Structure
- expense-tracker/
- ├── index.html # Main HTML file
- ├── style.css # All CSS styles
- ├── script.js # All JavaScript functionality
- └── README.md # Project documentation

## Installation & Usage

1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Visit `https://yourusername.github.io/intermediate-projects/expense-tracker/`

#### How to Use
Adding a Transaction
- Select your base currency (top right)
- Fill in the transaction details:
- Description
- Amount and currency
- Category
- Date
- Type (Expense or Income)
- Click "Add Transaction"

Managing Transactions
- Edit: Click the edit button (pencil icon) next to any transaction
- Delete: Click the delete button (trash icon)
- Clear All: Use the "Clear All Transactions" button (with confirmation)

Viewing Statistics
- Total Expenses: Sum of all expense transactions (converted to base currency)
- Total Income: Sum of all income transactions
- Balance: Income minus expenses
- Category Breakdown: Visual chart showing spending by category

#### Technical Details
Technologies Used
- HTML5: Semantic markup and structure
- CSS3: Modern styling with CSS Grid, Flexbox, and custom properties
- JavaScript (ES6): Object-oriented approach with class-based structure
- LocalStorage: Client-side data persistence
- Font Awesome: Icon library for UI elements

#### Currency Conversion
- Uses pre-defined exchange rates (simulated)
- In a production app, this would connect to a currency API
- Conversion formula: amount * exchangeRate[from][to]

#### Data Storage
- Transactions stored as JSON in localStorage
- Base currency preference saved separately
- Data persists even after browser restart

#### Code Structure
- The application follows a modular, class-based structure:
- ExpenseTracker class manages all application logic
- Separate methods for rendering, calculations, and event handling
- Clean separation of concerns between HTML, CSS, and JS

#### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Opera 47+

## Future Enhancements
- Planned features for future versions:
- Real currency API integration for live exchange rates
- Data export/import (CSV, JSON)
- Recurring transactions setup
- Budget planning with alerts
- Dark/light theme toggle
- Transaction search and filtering
- Multiple accounts/wallets support
- Data backup to cloud services

## Contributing
- Contributions are welcome! Here's how you can help:

- Fork the repository
- Create a feature branch: git checkout -b feature-name
- Commit your changes: git commit -m 'Add some feature'
- Push to the branch: git push origin feature-name
- Submit a pull request

## License
- This project is licensed under the MIT License

Acknowledgments
- Icons by Font Awesome
- Color palette from Coolors
- Inspired by popular finance apps like Mint and YNAB
- Part of the Intermediate Projects portfolio series

## Built with ❤️ for the developer portfolio.
