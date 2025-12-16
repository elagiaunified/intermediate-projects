// Blog Frontend JavaScript
// Handles the public blog view (index.html)

class BlogFrontend {
    constructor() {
        this.blogDB = blogDB;
        this.utils = BlogUtils;
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.currentCategory = null;
        this.currentTag = null;
        this.searchQuery = null;
        
        this.initialize();
    }

    initialize() {
        // Check for search query
        this.searchQuery = sessionStorage.getItem('blogSearchQuery');
        if (this.searchQuery) {
            sessionStorage.removeItem('blogSearchQuery');
            this.handleSearch(this.searchQuery);
        }
        
        // Check for category filter
        const categoryFromURL = this.utils.getQueryParam('category');
        if (categoryFromURL) {
            this.currentCategory = categoryFromURL;
            this.filterByCategory(categoryFromURL);
        }
        
        // Check for tag filter
        const tagFromURL = this.utils.getQueryParam('tag');
        if (tagFromURL) {
            this.currentTag = tagFromURL;
            this.filterByTag(tagFromURL);
        }
        
        // Load all blog content
        this.loadFeaturedPost();
        this.loadRecentPosts();
        this.loadCategories();
        this.loadTags();
        this.loadTrendingPosts();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize any animations
        this.initAnimations();
    }

    setupEventListeners() {
        // Category filter
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.filterByCategory(category);
            });
        });

        // Search functionality
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => this.handleSearch(searchInput.value));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch(searchInput.value);
            });
        }

        // Load more button if exists
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMorePosts());
        }
    }

    initAnimations() {
        // Add fade-in animation to cards as they load
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all cards
        document.querySelectorAll('.post-card, .category-card, .sidebar-widget').forEach(card => {
            observer.observe(card);
        });
    }

    loadFeaturedPost() {
        const featuredPost = this.blogDB.getFeaturedPost();
        
        if (featuredPost) {
            document.getElementById('featured-title').textContent = featuredPost.title;
            document.getElementById('featured-excerpt').textContent = featuredPost.excerpt;
            document.getElementById('featured-date').textContent = this.blogDB.formatDate(featuredPost.date);
            document.getElementById('featured-link').href = `post.html?slug=${featuredPost.slug}`;
            
            // Update featured image with category
            const categoryBadge = document.querySelector('.category-badge');
            if (categoryBadge) {
                categoryBadge.textContent = featuredPost.category;
            }
        } else {
            // Hide featured section if no featured post
            document.getElementById('featured-post').style.display = 'none';
        }
    }

    loadRecentPosts(posts = null) {
        const postsContainer = document.getElementById('posts-container');
        
        if (!posts) {
            posts = this.blogDB.getPublishedPosts();
            
            // Apply filters if any
            if (this.currentCategory) {
                posts = posts.filter(post => 
                    post.category.toLowerCase() === this.currentCategory.toLowerCase()
                );
            }
            
            if (this.currentTag) {
                posts = posts.filter(post => 
                    post.tags?.some(tag => tag.toLowerCase() === this.currentTag.toLowerCase())
                );
            }
            
            if (this.searchQuery) {
                posts = this.blogDB.searchPosts(this.searchQuery);
            }
        }
        
        // Clear loading spinner
        postsContainer.innerHTML = '';
        
        if (posts.length === 0) {
            this.showNoPostsMessage();
            return;
        }
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const postsToShow = posts.slice(startIndex, endIndex);
        
        // Render posts
        postsToShow.forEach(post => {
            const postElement = this.createPostCard(post);
            postsContainer.appendChild(postElement);
        });
        
        // Show/hide load more button
        this.updateLoadMoreButton(posts.length);
    }

    createPostCard(post) {
        const card = document.createElement('article');
        card.className = 'card post-card';
        card.dataset.id = post.id;
        
        // Generate color based on category
        const categoryColor = this.getCategoryColor(post.category);
        const gradient = `linear-gradient(135deg, ${categoryColor} 0%, ${this.adjustColor(categoryColor, -20)} 100%)`;
        
        card.innerHTML = `
            <div class="post-image" style="background: ${gradient};">
                <div class="category-badge">${post.category}</div>
                <div class="read-time">${post.readTime || 5} min read</div>
            </div>
            <div class="card-content">
                <div class="post-meta">
                    <span><i class="far fa-calendar"></i> ${this.blogDB.formatDate(post.date)}</span>
                    <span><i class="far fa-user"></i> ${post.author}</span>
                    <span><i class="far fa-eye"></i> ${this.utils.formatNumber(post.views || 0)}</span>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-tags">
                    ${(post.tags || []).slice(0, 3).map(tag => 
                        `<span class="post-tag" data-tag="${tag}">${tag}</span>`
                    ).join('')}
                </div>
                <a href="post.html?slug=${post.slug}" class="btn btn-primary btn-sm mt-3">
                    Read Article <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;
        
        // Add click event to tags
        card.querySelectorAll('.post-tag').forEach(tagElement => {
            tagElement.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tag = tagElement.dataset.tag;
                this.filterByTag(tag);
            });
        });
        
        return card;
    }

    loadMorePosts() {
        this.currentPage++;
        this.loadRecentPosts();
    }

    updateLoadMoreButton(totalPosts) {
        const loadMoreBtn = document.getElementById('load-more');
        if (!loadMoreBtn) return;
        
        const totalPages = Math.ceil(totalPosts / this.postsPerPage);
        
        if (this.currentPage < totalPages) {
            loadMoreBtn.style.display = 'flex';
            loadMoreBtn.textContent = `Load More (${this.currentPage}/${totalPages})`;
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }

    showNoPostsMessage() {
        const postsContainer = document.getElementById('posts-container');
        
        let message = 'No articles found.';
        if (this.searchQuery) {
            message = `No articles found for "${this.searchQuery}".`;
        } else if (this.currentCategory) {
            message = `No articles found in category "${this.currentCategory}".`;
        } else if (this.currentTag) {
            message = `No articles found with tag "${this.currentTag}".`;
        }
        
        postsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <h3>${message}</h3>
                <p>Try browsing other categories or clearing your filters.</p>
                <button id="clear-filters" class="btn btn-primary mt-3">
                    <i class="fas fa-filter"></i> Clear Filters
                </button>
            </div>
        `;
        
        // Add clear filters button event
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }
    }

    loadCategories() {
        const categories = this.blogDB.getAllCategories();
        const posts = this.blogDB.getPublishedPosts();
        
        // Update category counts
        categories.forEach(category => {
            const count = posts.filter(post => 
                post.category.toLowerCase() === category.toLowerCase()
            ).length;
            
            const countElement = document.getElementById(`${category.toLowerCase().replace(' & ', '-').replace(/\s+/g, '-')}-count`);
            if (countElement) {
                countElement.textContent = `${count} Article${count !== 1 ? 's' : ''}`;
            }
        });
    }

    loadTags() {
        const allTags = this.blogDB.getAllTags();
        const posts = this.blogDB.getPublishedPosts();
        const tagsCloud = document.getElementById('tags-cloud');
        
        if (!tagsCloud) return;
        
        // Clear existing tags
        tagsCloud.innerHTML = '';
        
        // Calculate tag frequency
        const tagFrequency = {};
        posts.forEach(post => {
            (post.tags || []).forEach(tag => {
                tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
            });
        });
        
        // Sort tags by frequency
        const sortedTags = Object.keys(tagFrequency)
            .sort((a, b) => tagFrequency[b] - tagFrequency[a])
            .slice(0, 15); // Show top 15 tags
        
        // Create tag elements
        sortedTags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            tagElement.dataset.tag = tag;
            tagElement.title = `${tagFrequency[tag]} article${tagFrequency[tag] !== 1 ? 's' : ''}`;
            
            // Calculate font size based on frequency
            const maxSize = 24;
            const minSize = 12;
            const maxFreq = Math.max(...Object.values(tagFrequency));
            const minFreq = Math.min(...Object.values(tagFrequency));
            
            let fontSize = minSize;
            if (maxFreq !== minFreq) {
                fontSize = minSize + ((tagFrequency[tag] - minFreq) / (maxFreq - minFreq)) * (maxSize - minSize);
            }
            
            tagElement.style.fontSize = `${fontSize}px`;
            
            tagElement.addEventListener('click', () => {
                this.filterByTag(tag);
            });
            
            tagsCloud.appendChild(tagElement);
        });
    }

    loadTrendingPosts() {
        const trendingContainer = document.getElementById('trending-posts');
        if (!trendingContainer) return;
        
        // Get top 5 posts by views
        const trendingPosts = this.blogDB.getPublishedPosts()
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);
        
        // Clear existing content
        trendingContainer.innerHTML = '';
        
        if (trendingPosts.length === 0) {
            trendingContainer.innerHTML = '<p class="text-muted">No trending articles yet.</p>';
            return;
        }
        
        // Create trending list
        trendingPosts.forEach((post, index) => {
            const item = document.createElement('div');
            item.className = 'trending-item';
            
            item.innerHTML = `
                <div class="trending-number">${index + 1}</div>
                <div class="trending-content">
                    <h4><a href="post.html?slug=${post.slug}">${post.title}</a></h4>
                    <span>${this.utils.formatNumber(post.views || 0)} views</span>
                </div>
            `;
            
            trendingContainer.appendChild(item);
        });
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.currentTag = null;
        this.searchQuery = null;
        this.currentPage = 1;
        
        // Update UI
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
        });
        
        const selectedCard = document.querySelector(`[data-category="${category}"]`);
        if (selectedCard) {
            selectedCard.classList.add('active');
        }
        
        // Update URL
        this.utils.setQueryParam('category', category);
        this.utils.setQueryParam('tag', null);
        
        // Update page title
        document.title = `${category} - DevBlog`;
        
        // Load filtered posts
        this.loadRecentPosts();
        
        // Show filter indicator
        this.showFilterIndicator(`Category: ${category}`);
    }

    filterByTag(tag) {
        this.currentTag = tag;
        this.currentCategory = null;
        this.searchQuery = null;
        this.currentPage = 1;
        
        // Update URL
        this.utils.setQueryParam('tag', tag);
        this.utils.setQueryParam('category', null);
        
        // Update page title
        document.title = `#${tag} - DevBlog`;
        
        // Load filtered posts
        this.loadRecentPosts();
        
        // Show filter indicator
        this.showFilterIndicator(`Tag: #${tag}`);
    }

    handleSearch(query) {
        if (!query.trim()) return;
        
        this.searchQuery = query.trim();
        this.currentCategory = null;
        this.currentTag = null;
        this.currentPage = 1;
        
        // Update search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = query;
        }
        
        // Update URL
        this.utils.setQueryParam('search', query);
        this.utils.setQueryParam('category', null);
        this.utils.setQueryParam('tag', null);
        
        // Update page title
        document.title = `Search: "${query}" - DevBlog`;
        
        // Load search results
        this.loadRecentPosts();
        
        // Show filter indicator
        this.showFilterIndicator(`Search: "${query}"`);
    }

    clearFilters() {
        this.currentCategory = null;
        this.currentTag = null;
        this.searchQuery = null;
        this.currentPage = 1;
        
        // Clear URL parameters
        const url = new URL(window.location);
        url.search = '';
        window.history.pushState({}, '', url);
        
        // Reset UI
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
        });
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Reset page title
        document.title = 'DevBlog | Modern Blog & CMS';
        
        // Reload posts
        this.loadRecentPosts();
        
        // Remove filter indicator
        this.removeFilterIndicator();
    }

    showFilterIndicator(text) {
        // Remove existing indicator
        this.removeFilterIndicator();
        
        // Create indicator
        const indicator = document.createElement('div');
        indicator.id = 'filter-indicator';
        indicator.className = 'filter-indicator';
        indicator.innerHTML = `
            <span>${text}</span>
            <button id="clear-filter-indicator" class="btn btn-sm btn-outline">
                <i class="fas fa-times"></i> Clear
            </button>
        `;
        
        // Add styles
        if (!document.querySelector('#filter-indicator-styles')) {
            const style = document.createElement('style');
            style.id = 'filter-indicator-styles';
            style.textContent = `
                .filter-indicator {
                    background: var(--white);
                    border-radius: var(--border-radius);
                    padding: var(--space-md) var(--space-lg);
                    margin-bottom: var(--space-xl);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: var(--shadow-md);
                    animation: slideDown 0.3s ease;
                }
                
                .filter-indicator span {
                    font-weight: 600;
                    color: var(--gray-700);
                }
                
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Insert after featured section or at top of posts
        const featuredSection = document.getElementById('featured-post');
        const postsSection = document.getElementById('blog-posts');
        
        if (featuredSection) {
            featuredSection.after(indicator);
        } else if (postsSection) {
            postsSection.prepend(indicator);
        } else {
            document.querySelector('.blog-content').prepend(indicator);
        }
        
        // Add clear button event
        document.getElementById('clear-filter-indicator').addEventListener('click', () => {
            this.clearFilters();
        });
    }

    removeFilterIndicator() {
        const indicator = document.getElementById('filter-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Helper methods for visual effects
    getCategoryColor(category) {
        // Generate consistent color based on category name
        const colors = [
            '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#14b8a6'
        ];
        
        let hash = 0;
        for (let i = 0; i < category.length; i++) {
            hash = category.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    }

    adjustColor(color, amount) {
        let usePound = false;
        
        if (color[0] === "#") {
            color = color.slice(1);
            usePound = true;
        }
        
        const num = parseInt(color, 16);
        let r = (num >> 16) + amount;
        if (r > 255) r = 255;
        else if (r < 0) r = 0;
        
        let b = ((num >> 8) & 0x00FF) + amount;
        if (b > 255) b = 255;
        else if (b < 0) b = 0;
        
        let g = (num & 0x0000FF) + amount;
        if (g > 255) g = 255;
        else if (g < 0) g = 0;
        
        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
    }
}

// Initialize Blog Frontend when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.blogFrontend = new BlogFrontend();
    
    // Add CSS for animations
    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
        .post-card, .category-card, .sidebar-widget {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .post-card.animate-in, 
        .category-card.animate-in, 
        .sidebar-widget.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .post-card:nth-child(1) { transition-delay: 0.1s; }
        .post-card:nth-child(2) { transition-delay: 0.2s; }
        .post-card:nth-child(3) { transition-delay: 0.3s; }
        .post-card:nth-child(4) { transition-delay: 0.4s; }
        .post-card:nth-child(5) { transition-delay: 0.5s; }
        .post-card:nth-child(6) { transition-delay: 0.6s; }
        
        .category-card:nth-child(1) { transition-delay: 0.1s; }
        .category-card:nth-child(2) { transition-delay: 0.2s; }
        .category-card:nth-child(3) { transition-delay: 0.3s; }
        .category-card:nth-child(4) { transition-delay: 0.4s; }
        .category-card:nth-child(5) { transition-delay: 0.5s; }
        .category-card:nth-child(6) { transition-delay: 0.6s; }
    `;
    document.head.appendChild(animationStyles);
});
