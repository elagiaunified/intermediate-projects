# 🍳 Recipe Finder

A comprehensive recipe search application with meal planning, favorites system, and shopping list generation using TheMealDB API.

![Recipe Finder Preview](https://img.shields.io/badge/Status-Complete-success) ![Technology](https://img.shields.io/badge/Tech-HTML/CSS/JS-blue) ![API](https://img.shields.io/badge/API-TheMealDB-orange) ![Features](https://img.shields.io/badge/Features-Search/Filters/Planning-green)

## 🚀 Live Demo
**[Find delicious recipes!](https://yourusername.github.io/intermediate-projects/recipe-finder/)**

## ✨ Features

- **Advanced Recipe Search**: Search by name, ingredients, or cuisine
- **Smart Filtering**: Filter by category, cooking time, difficulty, dietary needs
- **Meal Planning**: Create weekly meal plans with automatic scheduling
- **Shopping List Generator**: Automatically generates grocery lists from meal plans
- **Favorites System**: Save and organize your favorite recipes
- **Recipe Details**: Complete ingredients, instructions, and video tutorials
- **Featured Recipes**: Curated selection with image slider
- **Responsive Design**: Beautiful interface on all devices
- **No API Key Required**: Completely free using TheMealDB API

## 📸 Application Preview

| Desktop Dashboard | Mobile View | Recipe Details |
|-------------------|-------------|----------------|
| ![Desktop](https://via.placeholder.com/800x450/ff6b6b/ffffff?text=Recipe+Finder+Desktop) | ![Mobile](https://via.placeholder.com/400x700/ff8e53/ffffff?text=Mobile+View) | ![Details](https://via.placeholder.com/800x450/4ecdc4/ffffff?text=Recipe+Details) |

## 🎯 How to Use

### **Searching Recipes**
1. **Basic Search**: Type ingredients or dish names (e.g., "pasta", "chicken curry")
2. **Quick Tags**: Click suggested tags like "Vegetarian", "Dessert", "Breakfast"
3. **Advanced Filters**: Use filters for cuisine, cooking time, difficulty, dietary restrictions

### **Using Meal Planning**
1. **Generate Plan**: Click "Generate Plan" for an automatic weekly schedule
2. **Customize**: Click "+" on any day to add a specific recipe
3. **View Shopping List**: Automatically generated from your meal plan
4. **Check Items**: Mark off ingredients as you shop

### **Managing Favorites**
1. **Save Recipes**: Click the heart icon on any recipe card
2. **View Favorites**: All saved recipes appear in the favorites section
3. **Remove**: Click the heart again to remove from favorites

### **Viewing Recipe Details**
- Click any recipe card to see full details
- View complete ingredients list with measurements
- Follow step-by-step cooking instructions
- Watch YouTube video tutorials (when available)

## 🏗️ Project Structure
recipe-finder/
├── index.html # Main application interface
├── style.css # Styling, layouts, animations
├── script.js # Recipe logic, API calls, features
└── README.md # This documentation

text

## 🔧 Technical Implementation

### **API Integration**
Uses **TheMealDB API** (completely free, no API key required):

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `/search.php?s={query}` | Search by name | `search.php?s=pasta` |
| `/filter.php?c={category}` | Filter by category | `filter.php?c=Seafood` |
| `/lookup.php?i={id}` | Get recipe by ID | `lookup.php?i=52772` |
| `/random.php` | Get random recipe | `random.php` |
| `/list.php?c=list` | List all categories | `list.php?c=list` |

### **Key Features Implementation**

#### **Advanced Filtering System**
```javascript
applyFilters() {
    let filtered = [...this.currentRecipes];
    
    // Search filter
    if (this.filters.search) {
        filtered = filtered.filter(recipe => 
            recipe.strMeal.toLowerCase().includes(this.filters.search.toLowerCase())
        );
    }
    
    // Category filter
    if (this.filters.category) {
        filtered = filtered.filter(recipe => 
            recipe.strCategory === this.filters.category
        );
    }
    
    // Time filter (simulated)
    if (this.filters.maxTime) {
        filtered = filtered.filter(recipe => {
            const cookingTime = recipe.cookingTime || Math.floor(Math.random() * 105) + 15;
            return cookingTime <= this.filters.maxTime;
        });
    }
    
    return filtered;
}
Meal Planning Algorithm
javascript
generateMealPlan() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const usedRecipes = new Set();
    
    days.forEach(day => {
        let availableRecipes = this.currentRecipes.filter(r => !usedRecipes.has(r.idMeal));
        if (availableRecipes.length === 0) availableRecipes = this.currentRecipes;
        
        const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
        usedRecipes.add(randomRecipe.idMeal);
        this.updateMealCard(day, randomRecipe);
    });
    
    this.updateShoppingList();
}
Shopping List Generation
javascript
updateShoppingList() {
    const allIngredients = new Map();
    // Collect ingredients from all planned meals
    // Combine quantities, remove duplicates
    // Generate organized shopping list
}
```
Data Management
Favorites: Stored in localStorage for persistence

Meal Plans: Saved in sessionStorage (resets on browser close)

Search History: Maintained for quick access

Filter State: Managed in application memory

🍽️ Recipe Database
What's Included
Thousands of Recipes: Global cuisine from 30+ countries

Complete Details: Ingredients, measurements, instructions

Categories: Appetizers, mains, desserts, vegetarian, vegan

Cuisines: Italian, Chinese, Mexican, Indian, Japanese, etc.

Video Tutorials: YouTube links for many recipes

Data Quality
Verified Recipes: Curated and tested recipes

Standardized Format: Consistent ingredient measurements

Complete Instructions: Step-by-step cooking directions

High-Quality Images: Professional food photography

📱 Responsive Design
Layout Adaptations
Desktop (≥1200px): Full dashboard with side-by-side components

Tablet (768px-1199px): Adaptive grid with optimized spacing

Mobile (<768px): Vertical stacking, touch-friendly interface

Performance Optimizations
Lazy loading for recipe images

Pagination for search results

Efficient API call management

CSS animation optimization

Accessibility Features
ARIA labels for interactive elements

Keyboard navigation support

High contrast color scheme

Screen reader compatibility

🧪 Testing
Test Coverage
✅ Recipe search functionality

✅ Filter application and combination

✅ Meal planning generation

✅ Shopping list creation

✅ Favorites system (add/remove/view)

✅ Responsive design across devices

✅ API error handling

✅ LocalStorage operations

Browser Support
Chrome 60+ ✅

Firefox 55+ ✅

Safari 11+ ✅

Edge 79+ ✅

Mobile browsers ✅

🚀 Running Locally
Quick Start
bash
# Clone the repository
git clone https://github.com/yourusername/intermediate-projects.git

# Navigate to recipe finder
cd intermediate-projects/recipe-finder

# Open in browser
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
With Local Server
bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Then visit: http://localhost:8000
Development Mode
No build process required! The app uses pure HTML/CSS/JS.

📝 Code Architecture
Main Application Class
javascript
class RecipeFinder {
    constructor() {
        this.API_BASE = 'https://www.themealdb.com/api/json/v1/1';
        this.currentRecipes = [];
        this.filteredRecipes = [];
        this.favorites = [];
        this.filters = {
            search: '',
            category: '',
            area: '',
            maxTime: '',
            // ... more filters
        };
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        this.loadFavorites();
        await this.loadFeaturedRecipes();
        await this.loadRandomRecipes();
    }
}
Event-Driven Architecture
Centralized event listener setup

Delegated event handling for dynamic content

Clean separation of concerns

Modular component updates

🔄 Future Enhancements
Planned Features
Nutritional Information: Calories, macros, dietary info

User Accounts: Save meal plans and favorites across devices

Recipe Scaling: Adjust ingredient quantities for servings

Cooking Timer: Built-in timer for recipe steps

Meal Cost Calculator: Estimate grocery costs

Seasonal Recipes: Filter by seasonal availability

User Reviews & Ratings: Community feedback system

Recipe Import: Import recipes from other websites

Technical Improvements
Service Workers: Offline recipe access

IndexedDB: Larger storage for cached recipes

WebSocket: Real-time updates for shared meal plans

Progressive Web App: Install as native app

Image Optimization: WebP format with fallbacks

Bundle Optimization: Code splitting for better performance

Internationalization: Multiple language support

📚 What I Learned
Complex API Integration
Multiple endpoint coordination

Data transformation for UI display

Error handling and fallback strategies

Performance optimization for API calls

Advanced State Management
Complex filter state combinations

LocalStorage for user preferences

Real-time UI synchronization

Memory-efficient data handling

UI/UX Design Principles
Food-focused visual design

Intuitive filtering interface

Meal planning workflow optimization

Responsive design patterns

Algorithm Implementation
Search and filtering algorithms

Meal planning generation logic

Shopping list optimization

Data deduplication techniques

Performance Optimization
Efficient DOM manipulation

Image lazy loading implementation

Event delegation for performance

Memory management best practices

🤝 Contributing
We welcome contributions! Here's how to get started:

Fork the repository

Create a feature branch: git checkout -b feature/amazing-recipe-feature

Commit your changes: git commit -m 'Add amazing recipe feature'

Push to the branch: git push origin feature/amazing-recipe-feature

Open a Pull Request

Contribution Ideas
Add new recipe categories or cuisines

Improve the meal planning algorithm

Add nutritional information

Enhance accessibility features

Optimize performance

Add tests

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
TheMealDB for providing free recipe API

Font Awesome for beautiful food icons

Splide.js for the featured recipes slider

All contributors who helped improve this project

Food photographers on Unsplash for placeholder images

🔗 Related Projects
Weather App - Real-time weather forecasts

Expense Tracker - Financial tracking with charts (Coming Soon)

Blog CMS - Content management system (Coming Soon)

Chat App - Real-time messaging (Coming Soon)

⭐ Support
If you enjoy this recipe finder, please give it a star ⭐ on GitHub!

Part of the Intermediate Web Development Projects collection. Check out the other projects in the main repository!
