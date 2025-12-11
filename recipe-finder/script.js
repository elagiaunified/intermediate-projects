// Recipe Finder Application
class RecipeFinder {
    constructor() {
        // API Configuration
        this.API_BASE = 'https://www.themealdb.com/api/json/v1/1';
        this.currentRecipes = [];
        this.filteredRecipes = [];
        this.favorites = [];
        this.currentPage = 1;
        this.recipesPerPage = 12;
        this.currentView = 'grid'; // 'grid' or 'list'
        this.filters = {
            search: '',
            category: '',
            area: '',
            maxTime: '',
            difficulty: '',
            vegetarian: false,
            vegan: false,
            glutenFree: false,
            ingredients: [],
            sortBy: 'name'
        };
        
        // DOM Elements
        this.elements = {
            // Search
            mainSearch: document.getElementById('mainSearch'),
            searchBtn: document.getElementById('searchBtn'),
            searchTags: document.querySelectorAll('.tag'),
            
            // Filters
            categoryFilter: document.getElementById('categoryFilter'),
            areaFilter: document.getElementById('areaFilter'),
            timeFilter: document.getElementById('timeFilter'),
            difficultyFilter: document.getElementById('difficultyFilter'),
            clearFilters: document.getElementById('clearFilters'),
            toggleAdvanced: document.getElementById('toggleAdvanced'),
            advancedFilters: document.getElementById('advancedFilters'),
            advancedIcon: document.getElementById('advancedIcon'),
            
            // Advanced filters
            vegetarian: document.getElementById('vegetarian'),
            vegan: document.getElementById('vegan'),
            glutenFree: document.getElementById('glutenFree'),
            ingredientsInput: document.getElementById('ingredientsInput'),
            addIngredient: document.getElementById('addIngredient'),
            ingredientsTags: document.getElementById('ingredientsTags'),
            sortFilter: document.getElementById('sortFilter'),
            
            // Results
            recipesGrid: document.getElementById('recipesGrid'),
            resultsCount: document.getElementById('resultsCount'),
            gridView: document.getElementById('gridView'),
            listView: document.getElementById('listView'),
            pagination: document.getElementById('pagination'),
            
            // Featured
            featuredSlider: document.getElementById('featuredSlider'),
            
            // Meal Planning
            generatePlan: document.getElementById('generatePlan'),
            addMealBtns: document.querySelectorAll('.add-meal'),
            clearList: document.getElementById('clearList'),
            shoppingList: document.getElementById('shoppingList'),
            
            // Favorites
            favoritesGrid: document.getElementById('favoritesGrid'),
            viewAllFavorites: document.getElementById('viewAllFavorites'),
            
            // Modals & Overlays
            recipeModal: document.getElementById('recipeModal'),
            modalBody: document.getElementById('modalBody'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            closeModal: document.querySelector('.close-modal'),
            
            // Toast
            toastContainer: document.getElementById('toastContainer')
        };
        
        // Initialize
        this.init();
    }
    
    // Initialize the application
    async init() {
        this.setupEventListeners();
        this.loadFavorites();
        this.setupImageSlider();
        
        // Load initial data
        await this.loadFeaturedRecipes();
        await this.loadRandomRecipes();
        
        // Setup featured slider
        this.setupFeaturedSlider();
        
        // Show welcome message
        setTimeout(() => {
            this.showToast('Welcome to Recipe Finder! 🍳', 'info');
        }, 1000);
    }
    
    // Setup all event listeners
    setupEventListeners() {
        // Search functionality
        this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.elements.mainSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        
        // Quick search tags
        this.elements.searchTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                const searchTerm = e.target.dataset.search;
                this.elements.mainSearch.value = searchTerm;
                this.handleSearch();
            });
        });
        
        // Filter changes
        this.elements.categoryFilter.addEventListener('change', () => this.applyFilters());
        this.elements.areaFilter.addEventListener('change', () => this.applyFilters());
        this.elements.timeFilter.addEventListener('change', () => this.applyFilters());
        this.elements.difficultyFilter.addEventListener('change', () => this.applyFilters());
        this.elements.sortFilter.addEventListener('change', () => this.applyFilters());
        
        // Clear filters
        this.elements.clearFilters.addEventListener('click', () => this.clearAllFilters());
        
        // Advanced filters toggle
        this.elements.toggleAdvanced.addEventListener('click', () => this.toggleAdvancedFilters());
        
        // Dietary filters
        this.elements.vegetarian.addEventListener('change', () => this.applyFilters());
        this.elements.vegan.addEventListener('change', () => this.applyFilters());
        this.elements.glutenFree.addEventListener('change', () => this.applyFilters());
        
        // Ingredients filter
        this.elements.addIngredient.addEventListener('click', () => this.addIngredient());
        this.elements.ingredientsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addIngredient();
        });
        
        // View toggle
        this.elements.gridView.addEventListener('click', () => this.switchView('grid'));
        this.elements.listView.addEventListener('click', () => this.switchView('list'));
        
        // Meal planning
        this.elements.generatePlan.addEventListener('click', () => this.generateMealPlan());
        this.elements.addMealBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const day = e.target.closest('.day-plan').dataset.day;
                this.showMealSelector(day);
            });
        });
        this.elements.clearList.addEventListener('click', () => this.clearShoppingList());
        
        // Favorites
        this.elements.viewAllFavorites.addEventListener('click', () => this.showAllFavorites());
        
        // Modal
        this.elements.closeModal.addEventListener('click', () => this.closeRecipeModal());
        this.elements.recipeModal.addEventListener('click', (e) => {
            if (e.target === this.elements.recipeModal) {
                this.closeRecipeModal();
            }
        });
    }
    
    // Handle search
    async handleSearch() {
        const searchTerm = this.elements.mainSearch.value.trim();
        
        if (!searchTerm) {
            this.showToast('Please enter a search term', 'warning');
            return;
        }
        
        this.filters.search = searchTerm;
        this.showLoading(true);
        
        try {
            // Search by name
            const response = await fetch(`${this.API_BASE}/search.php?s=${searchTerm}`);
            const data = await response.json();
            
            if (data.meals) {
                this.currentRecipes = data.meals;
                this.applyFilters();
                this.showToast(`Found ${data.meals.length} recipes for "${searchTerm}"`, 'success');
            } else {
                this.currentRecipes = [];
                this.showRecipes([]);
                this.showToast('No recipes found. Try a different search term.', 'warning');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showToast('Error searching for recipes', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    // Load random recipes for initial display
    async loadRandomRecipes() {
        try {
            // Get multiple random recipes
            const promises = [];
            for (let i = 0; i < 12; i++) {
                promises.push(fetch(`${this.API_BASE}/random.php`));
            }
            
            const responses = await Promise.all(promises);
            const dataPromises = responses.map(r => r.json());
            const dataArray = await Promise.all(dataPromises);
            
            this.currentRecipes = dataArray.map(d => d.meals[0]).filter(Boolean);
            this.applyFilters();
        } catch (error) {
            console.error('Error loading random recipes:', error);
        }
    }
    
    // Load featured recipes
    async loadFeaturedRecipes() {
        try {
            // Get recipes from different categories for featured section
            const categories = ['Seafood', 'Vegetarian', 'Dessert', 'Chicken'];
            const featuredPromises = categories.map(category => 
                fetch(`${this.API_BASE}/filter.php?c=${category}`)
            );
            
            const responses = await Promise.all(featuredPromises);
            const dataArray = await Promise.all(responses.map(r => r.json()));
            
            // Combine and get first 4 from each category
            let featuredRecipes = [];
            dataArray.forEach(data => {
                if (data.meals) {
                    featuredRecipes = [...featuredRecipes, ...data.meals.slice(0, 4)];
                }
            });
            
            // Shuffle and take 8 recipes
            featuredRecipes = this.shuffleArray(featuredRecipes).slice(0, 8);
            
            // Get full details for each featured recipe
            const detailPromises = featuredRecipes.map(recipe => 
                fetch(`${this.API_BASE}/lookup.php?i=${recipe.idMeal}`)
            );
            
            const detailResponses = await Promise.all(detailPromises);
            const detailData = await Promise.all(detailResponses.map(r => r.json()));
            
            const fullFeaturedRecipes = detailData.map(d => d.meals[0]).filter(Boolean);
            this.displayFeaturedRecipes(fullFeaturedRecipes);
            
        } catch (error) {
            console.error('Error loading featured recipes:', error);
        }
    }
    
    // Display featured recipes in slider
    displayFeaturedRecipes(recipes) {
        const slider = this.elements.featuredSlider;
        slider.innerHTML = '';
        
        recipes.forEach(recipe => {
            const slide = document.createElement('div');
            slide.className = 'splide__slide';
            slide.innerHTML = `
                <div class="featured-card">
                    <div class="featured-image" style="background-image: url('${recipe.strMealThumb}')"></div>
                    <div class="featured-content">
                        <h3>${recipe.strMeal}</h3>
                        <p class="recipe-meta">
                            <span class="meta-item">
                                <i class="fas fa-utensils"></i>
                                ${recipe.strCategory || 'Unknown'}
                            </span>
                            <span class="meta-item">
                                <i class="fas fa-globe"></i>
                                ${recipe.strArea || 'Unknown'}
                            </span>
                        </p>
                        <button class="view-recipe-btn" data-id="${recipe.idMeal}">
                            View Recipe
                        </button>
                    </div>
                </div>
            `;
            slider.appendChild(slide);
        });
        
        // Add event listeners to view recipe buttons
        setTimeout(() => {
            document.querySelectorAll('.view-recipe-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const recipeId = e.target.dataset.id;
                    this.showRecipeDetails(recipeId);
                });
            });
        }, 100);
    }
    
    // Setup featured slider
    setupFeaturedSlider() {
        setTimeout(() => {
            if (document.querySelector('.splide')) {
                new Splide('.splide', {
                    type: 'loop',
                    perPage: 4,
                    perMove: 1,
                    gap: '20px',
                    pagination: true,
                    arrows: true,
                    breakpoints: {
                        1200: { perPage: 3 },
                        768: { perPage: 2 },
                        480: { perPage: 1 }
                    }
                }).mount();
            }
        }, 500);
    }
    
    // Apply all filters
    applyFilters() {
        // Update filters object
        this.filters.category = this.elements.categoryFilter.value;
        this.filters.area = this.elements.areaFilter.value;
        this.filters.maxTime = this.elements.timeFilter.value;
        this.filters.difficulty = this.elements.difficultyFilter.value;
        this.filters.vegetarian = this.elements.vegetarian.checked;
        this.filters.vegan = this.elements.vegan.checked;
        this.filters.glutenFree = this.elements.glutenFree.checked;
        this.filters.sortBy = this.elements.sortFilter.value;
        
        // Filter recipes
        let filtered = [...this.currentRecipes];
        
        // Search filter
        if (this.filters.search) {
            const searchLower = this.filters.search.toLowerCase();
            filtered = filtered.filter(recipe => 
                recipe.strMeal.toLowerCase().includes(searchLower) ||
                (recipe.strInstructions && recipe.strInstructions.toLowerCase().includes(searchLower)) ||
                (recipe.strCategory && recipe.strCategory.toLowerCase().includes(searchLower))
            );
        }
        
        // Category filter
        if (this.filters.category) {
            filtered = filtered.filter(recipe => 
                recipe.strCategory === this.filters.category
            );
        }
        
        // Area filter
        if (this.filters.area) {
            filtered = filtered.filter(recipe => 
                recipe.strArea === this.filters.area
            );
        }
        
        // Time filter (simulated since API doesn't have time data)
        if (this.filters.maxTime) {
            const maxTime = parseInt(this.filters.maxTime);
            filtered = filtered.filter(recipe => {
                // Generate random cooking time for demo (15-120 minutes)
                const cookingTime = recipe.cookingTime || Math.floor(Math.random() * 105) + 15;
                recipe.cookingTime = cookingTime; // Store for display
                return cookingTime <= maxTime;
            });
        }
        
        // Difficulty filter (simulated)
        if (this.filters.difficulty) {
            filtered = filtered.filter(recipe => {
                // Generate random difficulty for demo
                const difficulties = ['easy', 'medium', 'hard'];
                const difficulty = recipe.difficulty || difficulties[Math.floor(Math.random() * 3)];
                recipe.difficulty = difficulty; // Store for display
                return difficulty === this.filters.difficulty;
            });
        }
        
        // Dietary filters (simulated)
        if (this.filters.vegetarian) {
            filtered = filtered.filter(recipe => {
                // Simple check for vegetarian (demo)
                const isVegetarian = recipe.strCategory === 'Vegetarian' || 
                                   recipe.strMeal.toLowerCase().includes('vegetarian');
                return isVegetarian;
            });
        }
        
        if (this.filters.vegan) {
            filtered = filtered.filter(recipe => {
                // Simple check for vegan (demo)
                const isVegan = recipe.strCategory === 'Vegan' || 
                               recipe.strMeal.toLowerCase().includes('vegan');
                return isVegan;
            });
        }
        
        // Ingredients filter
        if (this.filters.ingredients.length > 0) {
            filtered = filtered.filter(recipe => {
                // Check if recipe contains any of the filtered ingredients
                const ingredients = this.getRecipeIngredients(recipe);
                return this.filters.ingredients.some(ingredient => 
                    ingredients.toLowerCase().includes(ingredient.toLowerCase())
                );
            });
        }
        
        // Sort results
        filtered = this.sortRecipes(filtered, this.filters.sortBy);
        
        // Update filtered recipes
        this.filteredRecipes = filtered;
        this.currentPage = 1;
        
        // Display results
        this.showRecipes(filtered);
        
        // Update results count
        this.elements.resultsCount.textContent = filtered.length;
    }
    
    // Sort recipes based on criteria
    sortRecipes(recipes, sortBy) {
        const sorted = [...recipes];
        
        switch(sortBy) {
            case 'name':
                return sorted.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
            case 'name_desc':
                return sorted.sort((a, b) => b.strMeal.localeCompare(a.strMeal));
            case 'time':
                return sorted.sort((a, b) => (a.cookingTime || 0) - (b.cookingTime || 0));
            case 'popular':
                // For demo, use random "popularity"
                return sorted.sort(() => Math.random() - 0.5);
            case 'rating':
                // For demo, use random "ratings"
                return sorted.sort(() => Math.random() - 0.5);
            default:
                return sorted;
        }
    }
    
    // Show recipes in grid/list
    showRecipes(recipes) {
        const grid = this.elements.recipesGrid;
        
        if (recipes.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No recipes found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            this.elements.pagination.innerHTML = '';
            return;
        }
        
        // Calculate pagination
        const totalPages = Math.ceil(recipes.length / this.recipesPerPage);
        const startIndex = (this.currentPage - 1) * this.recipesPerPage;
        const endIndex = startIndex + this.recipesPerPage;
        const pageRecipes = recipes.slice(startIndex, endIndex);
        
        // Clear grid
        grid.innerHTML = '';
        
        // Add recipes
        pageRecipes.forEach(recipe => {
            const isFavorite = this.favorites.some(fav => fav.idMeal === recipe.idMeal);
            const card = this.createRecipeCard(recipe, isFavorite);
            grid.appendChild(card);
        });
        
        // Setup pagination
        this.setupPagination(totalPages);
        
        // Update view class
        grid.className = this.currentView === 'list' ? 'recipes-grid list-view' : 'recipes-grid';
    }
    
    // Create recipe card element
    createRecipeCard(recipe, isFavorite = false) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.dataset.id = recipe.idMeal;
        
        // Generate random cooking time and difficulty for demo
        const cookingTime = recipe.cookingTime || Math.floor(Math.random() * 105) + 15;
        const difficulties = ['Easy', 'Medium', 'Hard'];
        const difficulty = recipe.difficulty || difficulties[Math.floor(Math.random() * 3)];
        
        card.innerHTML = `
            <div class="recipe-image" style="background-image: url('${recipe.strMealThumb}')">
                <span class="recipe-badge">${recipe.strCategory || 'Food'}</span>
            </div>
            <div class="recipe-content">
                <div class="recipe-header">
                    <h3 class="recipe-title">${recipe.strMeal}</h3>
                    <button class="favorite-btn ${isFavorite ? 'favorited' : ''}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="recipe-meta">
                    <span class="meta-item">
                        <i class="fas fa-clock"></i>
                        ${cookingTime} min
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-signal"></i>
                        ${difficulty}
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-globe"></i>
                        ${recipe.strArea || 'Unknown'}
                    </span>
                </div>
                <p class="recipe-desc">
                    ${this.truncateText(recipe.strInstructions || 'No description available', 120)}
                </p>
                <div class="recipe-tags">
                    <span class="recipe-tag">${recipe.strCategory || 'General'}</span>
                    ${recipe.strTags ? recipe.strTags.split(',').map(tag => 
                        `<span class="recipe-tag">${tag.trim()}</span>`
                    ).join('') : ''}
                </div>
            </div>
        `;
        
        // Add event listeners
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-btn')) {
                this.showRecipeDetails(recipe.idMeal);
            }
        });
        
        const favoriteBtn = card.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorite(recipe);
            favoriteBtn.classList.toggle('favorited');
        });
        
        return card;
    }
    
    // Setup pagination
    setupPagination(totalPages) {
        const pagination = this.elements.pagination;
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class="page-btn prev" ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === this.currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        }
        
        // Next button
        paginationHTML += `
            <button class="page-btn next" ${this.currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
        
        // Add event listeners
        pagination.querySelectorAll('.page-btn').forEach(btn => {
            if (btn.classList.contains('prev')) {
                btn.addEventListener('click', () => {
                    if (this.currentPage > 1) {
                        this.currentPage--;
                        this.showRecipes(this.filteredRecipes);
                    }
                });
            } else if (btn.classList.contains('next')) {
                btn.addEventListener('click', () => {
                    if (this.currentPage < totalPages) {
                        this.currentPage++;
                        this.showRecipes(this.filteredRecipes);
                    }
                });
            } else if (!btn.classList.contains('active')) {
                btn.addEventListener('click', () => {
                    this.currentPage = parseInt(btn.textContent);
                    this.showRecipes(this.filteredRecipes);
                });
            }
        });
    }
    
    // Show recipe details in modal
    async showRecipeDetails(recipeId) {
        this.showLoading(true);
        
        try {
            const response = await fetch(`${this.API_BASE}/lookup.php?i=${recipeId}`);
            const data = await response.json();
            
            if (data.meals && data.meals[0]) {
                const recipe = data.meals[0];
                this.displayRecipeModal(recipe);
            } else {
                this.showToast('Recipe not found', 'error');
            }
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            this.showToast('Error loading recipe details', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    // Display recipe in modal
    displayRecipeModal(recipe) {
        const modalBody = this.elements.modalBody;
        const isFavorite = this.favorites.some(fav => fav.idMeal === recipe.idMeal);
        
        // Get ingredients list
        const ingredients = this.getIngredientsList(recipe);
        
        // Get instructions (split into steps)
        const instructions = recipe.strInstructions ? 
            recipe.strInstructions.split('\r\n').filter(step => step.trim()) : 
            ['No instructions available'];
        
        modalBody.innerHTML = `
            <div class="recipe-detail">
                <div class="detail-header">
                    <div class="detail-image" style="background-image: url('${recipe.strMealThumb}')"></div>
                    <div class="detail-info">
                        <h2>${recipe.strMeal}</h2>
                        <div class="detail-meta">
                            <span class="meta-item">
                                <i class="fas fa-utensils"></i>
                                ${recipe.strCategory || 'Unknown'}
                            </span>
                            <span class="meta-item">
                                <i class="fas fa-globe"></i>
                                ${recipe.strArea || 'Unknown'}
                            </span>
                            <span class="meta-item">
                                <i class="fas fa-users"></i>
                                Serves: ${recipe.strServes || '4'}
                            </span>
                        </div>
                        <div class="detail-actions">
                            <button class="action-btn favorite-action ${isFavorite ? 'favorited' : ''}">
                                <i class="fas fa-heart"></i>
                                ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                            </button>
                            <button class="action-btn add-to-plan">
                                <i class="fas fa-calendar-plus"></i>
                                Add to Meal Plan
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="detail-content">
                    <div class="ingredients-section">
                        <h3><i class="fas fa-carrot"></i> Ingredients</h3>
                        <ul class="ingredients-list">
                            ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="instructions-section">
                        <h3><i class="fas fa-list-ol"></i> Instructions</h3>
                        <ol class="instructions-list">
                            ${instructions.map((step, index) => `
                                <li>
                                    <strong>Step ${index + 1}:</strong>
                                    ${step}
                                </li>
                            `).join('')}
                        </ol>
                    </div>
                    
                    ${recipe.strYoutube ? `
                        <div class="video-section">
                            <h3><i class="fas fa-play-circle"></i> Video Tutorial</h3>
                            <p>
                                <a href="${recipe.strYoutube}" target="_blank" class="video-link">
                                    <i class="fab fa-youtube"></i> Watch on YouTube
                                </a>
                            </p>
                        </div>
                    ` : ''}
                    
                    ${recipe.strSource ? `
                        <div class="source-section">
                            <h3><i class="fas fa-external-link-alt"></i> Source</h3>
                            <p>
                                <a href="${recipe.strSource}" target="_blank" class="source-link">
                                    Original Recipe
                                </a>
                            </p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Add event listeners
        const favoriteAction = modalBody.querySelector('.favorite-action');
        favoriteAction.addEventListener('click', () => {
            this.toggleFavorite(recipe);
            favoriteAction.classList.toggle('favorited');
            favoriteAction.innerHTML = favoriteAction.classList.contains('favorited') ? 
                '<i class="fas fa-heart"></i> Remove from Favorites' : 
                '<i class="fas fa-heart"></i> Add to Favorites';
            this.updateFavoritesDisplay();
        });
        
        const addToPlanBtn = modalBody.querySelector('.add-to-plan');
        addToPlanBtn.addEventListener('click', () => {
            this.showMealSelector(null, recipe);
        });
        
        // Show modal
        this.elements.recipeModal.style.display = 'flex';
    }
    
    // Get ingredients list from recipe
    getIngredientsList(recipe) {
        const ingredients = [];
        
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            
            if (ingredient && ingredient.trim()) {
                ingredients.push(`${measure ? measure + ' ' : ''}${ingredient}`);
            }
        }
        
        return ingredients;
    }
    
    // Get ingredients as string for filtering
    getRecipeIngredients(recipe) {
        let ingredients = '';
        
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients += ingredient + ' ';
            }
        }
        
        return ingredients;
    }
    
    // Toggle favorite recipe
    toggleFavorite(recipe) {
        const index = this.favorites.findIndex(fav => fav.idMeal === recipe.idMeal);
        
        if (index === -1) {
            // Add to favorites
            this.favorites.push(recipe);
            localStorage.setItem('recipeFavorites', JSON.stringify(this.favorites));
            this.showToast('Added to favorites! ❤️', 'success');
        } else {
            // Remove from favorites
            this.favorites.splice(index, 1);
            localStorage.setItem('recipeFavorites', JSON.stringify(this.favorites));
            this.showToast('Removed from favorites', 'info');
        }
        
        this.updateFavoritesDisplay();
    }
    
    // Load favorites from localStorage
    loadFavorites() {
        const saved = localStorage.getItem('recipeFavorites');
        if (saved) {
            this.favorites = JSON.parse(saved);
            this.updateFavoritesDisplay();
        }
    }
    
    // Update favorites display
    updateFavoritesDisplay() {
        const grid = this.elements.favoritesGrid;
        
        if (this.favorites.length === 0) {
            grid.innerHTML = `
                <div class="empty-favorites">
                    <i class="fas fa-heart"></i>
                    <p>You haven't saved any favorites yet</p>
                    <small>Click the heart icon on any recipe to save it here</small>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = '';
        const displayFavorites = this.favorites.slice(0, 6); // Show first 6
        
        displayFavorites.forEach(recipe => {
            const card = this.createRecipeCard(recipe, true);
            grid.appendChild(card);
        });
        
        // Show "view all" message if there are more favorites
        if (this.favorites.length > 6) {
            const viewAll = document.createElement('div');
            viewAll.className = 'view-all-message';
            viewAll.innerHTML = `
                <p>And ${this.favorites.length - 6} more favorites...</p>
                <button class="view-all-btn">View All</button>
            `;
            grid.appendChild(viewAll);
            
            viewAll.querySelector('.view-all-btn').addEventListener('click', () => {
                this.showAllFavorites();
            });
        }
    }
    
    // Show all favorites
    showAllFavorites() {
        // For now, just search for favorites
        this.currentRecipes = this.favorites;
        this.filters.search = '';
        this.elements.mainSearch.value = '';
        this.applyFilters();
        
        // Scroll to results
        document.querySelector('.results-section').scrollIntoView({ behavior: 'smooth' });
        
        this.showToast('Showing all your favorite recipes!', 'info');
    }
    
    // Add ingredient to filter
    addIngredient() {
        const input = this.elements.ingredientsInput;
        const ingredient = input.value.trim();
        
        if (ingredient && !this.filters.ingredients.includes(ingredient)) {
            this.filters.ingredients.push(ingredient);
            input.value = '';
            this.updateIngredientsTags();
            this.applyFilters();
        }
    }
    
    // Update ingredients tags display
    updateIngredientsTags() {
        const container = this.elements.ingredientsTags;
        container.innerHTML = '';
        
        this.filters.ingredients.forEach((ingredient, index) => {
            const tag = document.createElement('div');
            tag.className = 'ingredient-tag';
            tag.innerHTML = `
                ${ingredient}
                <span class="remove" data-index="${index}">&times;</span>
            `;
            container.appendChild(tag);
        });
        
        // Add event listeners to remove buttons
        container.querySelectorAll('.remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.filters.ingredients.splice(index, 1);
                this.updateIngredientsTags();
                this.applyFilters();
            });
        });
    }
    
    // Clear all filters
    clearAllFilters() {
        // Reset filter elements
        this.elements.mainSearch.value = '';
        this.elements.categoryFilter.value = '';
        this.elements.areaFilter.value = '';
        this.elements.timeFilter.value = '';
        this.elements.difficultyFilter.value = '';
        this.elements.vegetarian.checked = false;
        this.elements.vegan.checked = false;
        this.elements.glutenFree.checked = false;
        this.elements.sortFilter.value = 'name';
        
        // Reset filter object
        this.filters = {
            search: '',
            category: '',
            area: '',
            maxTime: '',
            difficulty: '',
            vegetarian: false,
            vegan: false,
            glutenFree: false,
            ingredients: [],
            sortBy: 'name'
        };
        
        // Update UI
        this.updateIngredientsTags();
        this.applyFilters();
        
        this.showToast('All filters cleared', 'info');
    }
    
    // Toggle advanced filters
    toggleAdvancedFilters() {
        const advanced = this.elements.advancedFilters;
        const icon = this.elements.advancedIcon;
        
        advanced.classList.toggle('show');
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
    }
    
    // Switch between grid and list view
    switchView(view) {
        this.currentView = view;
        
        // Update button states
        this.elements.gridView.classList.toggle('active', view === 'grid');
        this.elements.listView.classList.toggle('active', view === 'list');
        
        // Update recipes display
        this.showRecipes(this.filteredRecipes);
    }
    
    // Generate meal plan
    generateMealPlan() {
        if (this.currentRecipes.length === 0) {
            this.showToast('Search for some recipes first!', 'warning');
            return;
        }
        
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const usedRecipes = new Set();
        
        days.forEach(day => {
            // Find a random recipe not already used
            let availableRecipes = this.currentRecipes.filter(r => !usedRecipes.has(r.idMeal));
            
            if (availableRecipes.length === 0) {
                availableRecipes = this.currentRecipes; // Reuse if necessary
            }
            
            const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
            usedRecipes.add(randomRecipe.idMeal);
            
            // Update day plan
            this.updateMealCard(day, randomRecipe);
        });
        
        // Update shopping list
        this.updateShoppingList();
        
        this.showToast('Weekly meal plan generated!', 'success');
    }
    
    // Update meal card for a day
    updateMealCard(day, recipe) {
        const card = document.getElementById(`${day}Meal`);
        
        if (card) {
            card.innerHTML = `
                <div class="planned-meal">
                    <h5>${recipe.strMeal}</h5>
                    <p class="meal-meta">${recipe.strCategory} • ${recipe.strArea}</p>
                    <div class="meal-actions">
                        <button class="small-btn view-recipe" data-id="${recipe.idMeal}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="small-btn remove-meal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Add event listeners
            card.querySelector('.view-recipe').addEventListener('click', (e) => {
                e.stopPropagation();
                this.showRecipeDetails(recipe.idMeal);
            });
            
            card.querySelector('.remove-meal').addEventListener('click', (e) => {
                e.stopPropagation();
                card.innerHTML = `
                    <div class="empty-meal">
                        <i class="fas fa-utensils"></i>
                        <span>No meal planned</span>
                    </div>
                `;
                this.updateShoppingList();
            });
        }
    }
    
    // Show meal selector
    showMealSelector(day = null, preSelectedRecipe = null) {
        if (preSelectedRecipe) {
            // If recipe is pre-selected (from modal), add it to today
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            this.updateMealCard(today, preSelectedRecipe);
            this.updateShoppingList();
            this.showToast(`Added "${preSelectedRecipe.strMeal}" to ${today}'s plan`, 'success');
            return;
        }
        
        // For now, just show a simple selector
        // In a full implementation, this would show a modal with recipe search
        this.showToast('Click "Generate Plan" or add recipes from search results', 'info');
    }
    
    // Update shopping list
    updateShoppingList() {
        const list = this.elements.shoppingList;
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        let allIngredients = new Map(); // Use Map to combine quantities
        
        // Collect ingredients from all planned meals
        days.forEach(day => {
            const card = document.getElementById(`${day}Meal`);
            const recipeTitle = card.querySelector('.planned-meal h5');
            
            if (recipeTitle) {
                // For demo, generate random ingredients
                const demoIngredients = [
                    '2 cups flour', '3 eggs', '1 cup milk', '200g cheese',
                    '1 onion', '2 tomatoes', '3 cloves garlic', '500g chicken',
                    '1 bell pepper', '2 carrots', '1 head lettuce', '250g pasta',
                    '1 lemon', 'olive oil', 'salt', 'pepper', 'herbs'
                ];
                
                // Pick 3-5 random ingredients for this meal
                const numIngredients = Math.floor(Math.random() * 3) + 3;
                const shuffled = [...demoIngredients].sort(() => 0.5 - Math.random());
                const mealIngredients = shuffled.slice(0, numIngredients);
                
                mealIngredients.forEach(ing => {
                    if (allIngredients.has(ing)) {
                        allIngredients.set(ing, allIngredients.get(ing) + 1);
                    } else {
                        allIngredients.set(ing, 1);
                    }
                });
            }
        });
        
        // Display shopping list
        if (allIngredients.size === 0) {
            list.innerHTML = `
                <div class="empty-list">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Add meals to your plan to generate a shopping list</p>
                </div>
            `;
        } else {
            let listHTML = '<ul class="shopping-items">';
            
            allIngredients.forEach((count, ingredient) => {
                listHTML += `
                    <li class="shopping-item">
                        <label class="checkbox">
                            <input type="checkbox">
                            <span class="checkmark"></span>
                            <span class="item-text">
                                ${count > 1 ? `${count}x ` : ''}${ingredient}
                            </span>
                        </label>
                    </li>
                `;
            });
            
            listHTML += '</ul>';
            list.innerHTML = listHTML;
            
            // Add checkbox functionality
            list.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const item = this.closest('.shopping-item');
                    if (this.checked) {
                        item.classList.add('checked');
                    } else {
                        item.classList.remove('checked');
                    }
                });
            });
        }
    }
    
    // Clear shopping list
    clearShoppingList() {
        this.elements.shoppingList.innerHTML = `
            <div class="empty-list">
                <i class="fas fa-shopping-basket"></i>
                <p>Add meals to your plan to generate a shopping list</p>
            </div>
        `;
        this.showToast('Shopping list cleared', 'info');
    }
    
    // Close recipe modal
    closeRecipeModal() {
        this.elements.recipeModal.style.display = 'none';
        this.elements.modalBody.innerHTML = '';
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
    
    // Setup image slider in hero section
    setupImageSlider() {
        const sliderItems = document.querySelectorAll('.slider-item');
        let currentIndex = 0;
        
        setInterval(() => {
            sliderItems[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % sliderItems.length;
            sliderItems[currentIndex].classList.add('active');
        }, 5000);
    }
    
    // Helper: Truncate text
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }
    
    // Helper: Shuffle array
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Add CSS for toast animation
const style = document.createElement('style');
style.textContent = `
    @keyframes toastSlideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .shopping-item.checked .item-text {
        text-decoration: line-through;
        opacity: 0.6;
    }
    
    .planned-meal {
        padding: 15px;
        background: #f8f9fa;
        border-radius: 10px;
    }
    
    .planned-meal h5 {
        margin-bottom: 5px;
        color: #2c3e50;
    }
    
    .meal-meta {
        color: #7f8c8d;
        font-size: 0.9rem;
        margin-bottom: 10px;
    }
    
    .meal-actions {
        display: flex;
        gap: 10px;
    }
    
    .small-btn {
        background: #4ecdc4;
        color: white;
        border: none;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
    }
    
    .small-btn:hover {
        background: #3dbcb3;
        transform: scale(1.1);
    }
    
    .small-btn.remove-meal {
        background: #ff6b6b;
    }
    
    .small-btn.remove-meal:hover {
        background: #ff5252;
    }
    
    .view-all-message {
        grid-column: 1 / -1;
        text-align: center;
        padding: 40px 20px;
        color: #7f8c8d;
    }
    
    .view-all-message button {
        background: #ff6b6b;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        margin-top: 15px;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .view-all-message button:hover {
        background: #ff5252;
        transform: translateY(-2px);
    }
    
    .no-results {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        color: #bdc3c7;
    }
    
    .no-results i {
        font-size: 4rem;
        margin-bottom: 20px;
        color: #ff6b6b;
        display: block;
    }
    
    .no-results h3 {
        margin-bottom: 10px;
        color: #2c3e50;
    }
`;
document.head.appendChild(style);

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.recipeFinder = new RecipeFinder();
});
