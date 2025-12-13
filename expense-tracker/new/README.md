# Expense Tracker with Multi-Currency Support

A sophisticated web-based expense tracker that allows users to manage their expenses across multiple currencies with real-time exchange rates.

## Features

### 🎯 Core Features
- **Multi-Currency Support**: Add expenses in different currencies with automatic conversion
- **Real-time Exchange Rates**: Get updated currency rates from reliable APIs
- **Expense Management**: Add, edit, delete, and categorize expenses
- **Data Visualization**: Interactive charts for spending analysis
- **Data Persistence**: LocalStorage for saving your data
- **Export/Import**: Backup and restore your expense data

### 📱 User Interface
- Clean, modern design with dark/light theme
- Fully responsive layout
- Interactive charts and graphs
- Intuitive form controls
- Real-time calculations and updates

### 💾 Data Management
- LocalStorage for offline access
- JSON/CSV export capabilities
- Data backup and restore functionality
- Filter and search expenses

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Flexbox, Grid
- **JavaScript (ES6+)**: Modern JavaScript with modules
- **Chart.js**: Interactive data visualization
- **Font Awesome**: Icons
- **ExchangeRate-API**: Currency conversion rates

## Project Structure
- expense-tracker/
- ├── index.html # Main HTML file
- ├── css/
- │ ├── style.css # Main styles
- │ └── theme.css # Theme styles
- ├── js/
- │ ├── main.js # Application initialization
- │ ├── expenseManager.js # Expense CRUD operations
- │ ├── currencyConverter.js # Currency conversion logic
- │ ├── chartManager.js # Chart rendering
- │ └── storageManager.js # Data persistence
- ├── assets/
- │ └── icons/ # App icons
- └── README.md # Documentation

## Setup and Installation

1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. No additional installation required!

## How to Use

### Adding an Expense
1. Fill in the expense description
2. Enter the amount and select currency
3. Choose a category and date
4. Select payment method (optional)
5. Add notes if needed
6. Click "Add Expense"

### Changing Base Currency
1. Use the currency selector in the header
2. All expenses will be converted to the new base currency
3. Totals and charts update automatically

### Viewing Analytics
- **Category Chart**: Pie chart showing spending by category
- **Monthly/Yearly**: Toggle between monthly and yearly views
- **Currency Rates**: View current exchange rates

### Managing Data
- **Export**: Download your data as JSON or CSV
- **Import**: Restore from previously exported files
- **Clear**: Remove all data (with confirmation)

## API Integration

The app uses [ExchangeRate-API](https://www.exchangerate-api.com) for currency conversion rates. The free tier allows up to 1,500 requests per month.

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Currency icons by Font Awesome
- Chart.js for data visualization
- ExchangeRate-API for currency data
- Inspired by modern finance apps

## Live Demo

[View Live Demo on GitHub Pages](#) <!-- Add your GitHub Pages link here -->

---

**Note**: This application stores all data locally in your browser. Clearing browser data will delete your expenses.
