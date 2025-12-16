// Admin Dashboard JavaScript
// Handles all admin functionality for the Blog/CMS system

class AdminDashboard {
    constructor() {
        this.blogDB = blogDB;
        this.utils = BlogUtils;
        this.currentPostPage = 1;
        this.postsPerPageAdmin = 10;
        this.editingPostId = null;
        this.editingCategory = null;
        this.currentCommentFilter = 'all';
        this.currentSettingsTab = 'general';
        
        this.chart = null; // For traffic chart
        
        this.initialize();
    }

    initialize() {
        this.setupTabNavigation();
        this.loadDashboardStats();
        this.loadPostsTable();
        this.loadCategories();
        this.loadTags();
        this.setupPostForm();
        this.setupCategoryForm();
        this.setupTagForm();
        this.setupSettings();
        this.setupEventListeners();
        this.setupModals();
        
        // Initialize Chart.js
        this.initTrafficChart();
    }

    setupTabNavigation() {
        const menuItems = document.querySelectorAll('.menu-item');
        const tabs = document.querySelectorAll('.admin-tab');
        
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all menu items and tabs
                menuItems.forEach(i => i.classList.remove('active'));
                tabs.forEach(tab => tab.classList.remove('active'));
                
                // Add active class to clicked menu item
                item.classList.add('active');
                
                // Show corresponding tab
                const tabId = item.dataset.tab;
                const tab = document.getElementById(tabId);
                if (tab) {
                    tab.classList.add('active');
                    
                    // Load tab-specific content
                    this.loadTabContent(tabId);
                }
            });
        });

        // Quick actions also trigger tabs
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.dataset.tab) {
                    e.preventDefault();
                    const tabId = btn.dataset.tab;
                    const menuItem = document.querySelector(`.menu-item[data-tab="${tabId}"]`);
                    if (menuItem) menuItem.click();
                }
            });
        });

        // Settings tab buttons
        document.querySelectorAll('.settings-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.settings-tab-content').forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                const tabId = btn.dataset.tab;
                document.getElementById(tabId).classList.add('active');
                this.currentSettingsTab = tabId;
            });
        });
    }

    loadTabContent(tabId) {
        switch(tabId) {
            case 'dashboard':
                this.loadDashboardStats();
                this.loadPopularPosts();
                this.loadActivityFeed();
                break;
            case 'posts':
                this.loadPostsTable();
                break;
            case 'new-post':
                // Reset form if not editing
                if (!this.editingPostId) {
                    this.resetPostForm();
                }
                break;
            case 'categories':
                this.loadCategoriesTable();
                break;
            case 'tags':
                this.loadTagsTable();
                break;
            case 'comments':
                this.loadComments();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    // Dashboard Functions
    loadDashboardStats() {
        const stats = this.blogDB.getStats();
        
        // Update stats cards
        document.getElementById('stat-total-posts').textContent = stats.totalPosts;
        document.getElementById('stat-total-categories').textContent = stats.totalCategories;
        document.getElementById('stat-total-tags').textContent = stats.totalTags;
        document.getElementById('stat-total-views').textContent = this.utils.formatNumber(stats.totalViews);
        
        // Update counts in sidebar
        document.getElementById('posts-count').textContent = stats.totalPosts;
        document.getElementById('categories-count').textContent = stats.totalCategories;
        document.getElementById('tags-count').textContent = stats.totalTags;
        
        // Update average read time
        document.getElementById('avg-read-time').textContent = `${stats.averageReadTime} min`;
        
        // Calculate today's views (simulated - in real app, track daily)
        const todayViews = Math.floor(Math.random() * 100) + 50;
        document.getElementById('today-views').textContent = todayViews;
        
        // Update storage info
        this.updateStorageInfo();
    }

    updateStorageInfo() {
        const data = localStorage.getItem('devBlogData');
        const size = data ? (data.length / 1024).toFixed(2) : 0;
        document.getElementById('storage-info').textContent = `${size} KB`;
        
        // Update backup section
        document.getElementById('backup-size').textContent = `${size} KB`;
        document.getElementById('backup-posts').textContent = this.blogDB.getAllPosts().length;
        document.getElementById('backup-categories').textContent = this.blogDB.getAllCategories().length;
        
        const lastBackup = localStorage.getItem('devBlogLastBackup');
        document.getElementById('last-backup').textContent = lastBackup || 'Never';
    }

    initTrafficChart() {
        const ctx = document.getElementById('trafficChart');
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Generate sample data for last 7 days
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const views = days.map(() => Math.floor(Math.random() * 200) + 100);
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Daily Views',
                    data: views,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: true
                        },
                        ticks: {
                            stepSize: 50
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

    loadPopularPosts() {
        const container = document.getElementById('popular-posts');
        if (!container) return;
        
        const popularPosts = this.blogDB.getPublishedPosts()
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);
        
        if (popularPosts.length === 0) {
            container.innerHTML = '<p class="text-muted">No posts yet.</p>';
            return;
        }
        
        container.innerHTML = popularPosts.map((post, index) => `
            <div class="popular-post-item">
                <div class="popular-post-rank">${index + 1}</div>
                <div class="popular-post-content">
                    <h4><a href="index.html?preview=${post.slug}" target="_blank">${post.title}</a></h4>
                    <div class="popular-post-meta">
                        <span><i class="far fa-eye"></i> ${this.utils.formatNumber(post.views || 0)}</span>
                        <span><i class="far fa-clock"></i> ${post.readTime || 5} min</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadActivityFeed() {
        const container = document.getElementById('activity-feed');
        if (!container) return;
        
        const posts = this.blogDB.getAllPosts()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        if (posts.length === 0) {
            container.innerHTML = '<p class="text-muted">No activity yet.</p>';
            return;
        }
        
        container.innerHTML = posts.map(post => `
            <div class="activity-item">
                <div class="activity-icon">
                    ${post.published ? 
                        '<i class="fas fa-check-circle text-success"></i>' : 
                        '<i class="fas fa-pencil-alt text-warning"></i>'
                    }
                </div>
                <div class="activity-content">
                    <p><strong>${post.title}</strong> was ${post.published ? 'published' : 'saved as draft'}</p>
                    <small class="text-muted">${this.blogDB.getRelativeTime(post.date)}</small>
                </div>
            </div>
        `).join('');
    }

    // Posts Management
    loadPostsTable() {
        const posts = this.blogDB.getAllPosts();
        const container = document.getElementById('posts-table-body');
        if (!container) return;
        
        // Apply filters
        let filteredPosts = [...posts];
        const filter = document.getElementById('posts-filter')?.value;
        const categoryFilter = document.getElementById('category-filter')?.value;
        const sort = document.getElementById('sort-posts')?.value;
        
        // Status filter
        if (filter === 'published') {
            filteredPosts = filteredPosts.filter(post => post.published);
        } else if (filter === 'draft') {
            filteredPosts = filteredPosts.filter(post => !post.published);
        } else if (filter === 'featured') {
            filteredPosts = filteredPosts.filter(post => post.featured);
        }
        
        // Category filter
        if (categoryFilter && categoryFilter !== 'all') {
            filteredPosts = filteredPosts.filter(post => 
                post.category.toLowerCase() === categoryFilter.toLowerCase()
            );
        }
        
        // Search filter
        const searchTerm = document.getElementById('posts-search')?.value.toLowerCase();
        if (searchTerm) {
            filteredPosts = filteredPosts.filter(post => 
                post.title.toLowerCase().includes(searchTerm) ||
                post.content.toLowerCase().includes(searchTerm) ||
                post.excerpt.toLowerCase().includes(searchTerm)
            );
        }
        
        // Sorting
        switch(sort) {
            case 'oldest':
                filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'popular':
                filteredPosts.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            case 'title':
                filteredPosts.sort((a, b) => a.title.localeCompare(b.title));
                break;
            default: // newest
                filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        
        // Pagination
        const totalPosts = filteredPosts.length;
        const totalPages = Math.ceil(totalPosts / this.postsPerPageAdmin);
        const startIndex = (this.currentPostPage - 1) * this.postsPerPageAdmin;
        const endIndex = startIndex + this.postsPerPageAdmin;
        const pagePosts = filteredPosts.slice(startIndex, endIndex);
        
        // Update counts
        document.getElementById('posts-shown').textContent = pagePosts.length;
        document.getElementById('posts-total').textContent = totalPosts;
        
        // Render table rows
        if (pagePosts.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <i class="fas fa-newspaper fa-2x text-muted mb-3"></i>
                        <p>No posts found.</p>
                    </td>
                </tr>
            `;
        } else {
            container.innerHTML = pagePosts.map(post => `
                <tr data-id="${post.id}">
                    <td>
                        <strong>${post.title}</strong>
                        ${post.featured ? '<span class="badge badge-featured">Featured</span>' : ''}
                    </td>
                    <td>${post.author || 'Admin'}</td>
                    <td><span class="badge">${post.category}</span></td>
                    <td>${this.blogDB.formatDate(post.date)}</td>
                    <td>${this.utils.formatNumber(post.views || 0)}</td>
                    <td>
                        <span class="status-badge ${post.published ? 'published' : 'draft'}">
                            ${post.published ? 'Published' : 'Draft'}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-outline edit-post" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline delete-post" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                            <a href="index.html?preview=${post.slug}" target="_blank" 
                               class="btn btn-sm btn-outline" title="Preview">
                                <i class="fas fa-eye"></i>
                            </a>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
        
        // Setup pagination
        this.setupPostsPagination(totalPages);
        
        // Add event listeners to action buttons
        this.setupPostActions();
    }

    setupPostsPagination(totalPages) {
        const container = document.getElementById('posts-pagination');
        if (!container) return;
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // Previous button
        html += `
            <button class="pagination-btn ${this.currentPostPage === 1 ? 'disabled' : ''}" 
                    data-page="${this.currentPostPage - 1}" ${this.currentPostPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPostPage - 1 && i <= this.currentPostPage + 1)) {
                html += `
                    <button class="pagination-btn ${i === this.currentPostPage ? 'active' : ''}" 
                            data-page="${i}">${i}</button>
                `;
            } else if (i === this.currentPostPage - 2 || i === this.currentPostPage + 2) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        // Next button
        html += `
            <button class="pagination-btn ${this.currentPostPage === totalPages ? 'disabled' : ''}" 
                    data-page="${this.currentPostPage + 1}" ${this.currentPostPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        container.innerHTML = html;
        
        // Add event listeners
        container.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.disabled) return;
                this.currentPostPage = parseInt(btn.dataset.page);
                this.loadPostsTable();
            });
        });
    }

    setupPostActions() {
        // Edit post buttons
        document.querySelectorAll('.edit-post').forEach(btn => {
            btn.addEventListener('click', () => {
                const postId = btn.closest('tr').dataset.id;
                this.editPost(postId);
            });
        });
        
        // Delete post buttons
        document.querySelectorAll('.delete-post').forEach(btn => {
            btn.addEventListener('click', () => {
                const postId = btn.closest('tr').dataset.id;
                this.deletePost(postId);
            });
        });
    }

    // Post Form Management
    setupPostForm() {
        const form = document.getElementById('post-form');
        if (!form) return;
        
        // Auto-generate slug from title
        const titleInput = document.getElementById('post-title');
        const slugInput = document.getElementById('post-slug');
        
        titleInput.addEventListener('input', this.utils.debounce(() => {
            const title = titleInput.value.trim();
            if (title && !this.editingPostId) {
                slugInput.value = this.blogDB.generateSlug(title);
            }
        }, 300));
        
        // Allow manual slug editing
        slugInput.addEventListener('focus', () => {
            slugInput.readOnly = false;
        });
        
        slugInput.addEventListener('blur', () => {
            slugInput.readOnly = true;
        });
        
        // Load categories dropdown
        this.loadCategoryDropdown();
        
        // Setup markdown toolbar
        this.setupMarkdownToolbar();
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePost();
        });
        
        // Save draft button
        document.getElementById('save-draft').addEventListener('click', () => {
            this.savePost(true);
        });
        
        // Reset form button
        form.querySelector('button[type="reset"]').addEventListener('click', () => {
            this.resetPostForm();
        });
    }

    setupMarkdownToolbar() {
        const toolbar = document.querySelector('.editor-toolbar');
        const textarea = document.getElementById('post-content');
        
        if (!toolbar || !textarea) return;
        
        const formatText = (startTag, endTag = '') => {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = textarea.value.substring(start, end);
            const newText = textarea.value.substring(0, start) + 
                           startTag + selectedText + endTag + 
                           textarea.value.substring(end);
            textarea.value = newText;
            textarea.focus();
            textarea.setSelectionRange(start + startTag.length, end + startTag.length);
        };
        
        toolbar.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.dataset.format;
                
                switch(format) {
                    case 'bold':
                        formatText('**', '**');
                        break;
                    case 'italic':
                        formatText('*', '*');
                        break;
                    case 'heading':
                        formatText('# ', '');
                        break;
                    case 'link':
                        formatText('[', '](url)');
                        break;
                    case 'code':
                        formatText('```\n', '\n```');
                        break;
                    case 'list':
                        formatText('- ', '');
                        break;
                    case 'preview':
                        this.showPreview();
                        break;
                }
            });
        });
    }

    loadCategoryDropdown() {
        const dropdown = document.getElementById('post-category');
        const filterDropdown = document.getElementById('category-filter');
        
        if (!dropdown) return;
        
        const categories = this.blogDB.getAllCategories();
        const options = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        
        dropdown.innerHTML = '<option value="">Select a category</option>' + options;
        
        if (filterDropdown) {
            filterDropdown.innerHTML = '<option value="all">All Categories</option>' + options;
        }
    }

    savePost(isDraft = false) {
        const title = document.getElementById('post-title').value.trim();
        const slug = document.getElementById('post-slug').value.trim();
        const category = document.getElementById('post-category').value;
        const tags = document.getElementById('post-tags').value.split(',').map(t => t.trim()).filter(t => t);
        const excerpt = document.getElementById('post-excerpt').value.trim();
        const content = document.getElementById('post-content').value.trim();
        const status = isDraft ? 'draft' : document.querySelector('input[name="post-status"]:checked').value;
        const featured = document.getElementById('post-featured').checked;
        
        // Validation
        if (!title || !category || !excerpt || !content) {
            this.utils.createNotification('Please fill in all required fields', 'error');
            return;
        }
        
        const postData = {
            title,
            slug: slug || this.blogDB.generateSlug(title),
            category,
            tags,
            excerpt,
            content,
            author: 'Admin',
            published: status === 'published',
            featured
        };
        
        if (this.editingPostId) {
            // Update existing post
            this.blogDB.updatePost(this.editingPostId, postData);
            this.utils.createNotification('Post updated successfully!', 'success');
        } else {
            // Create new post
            this.blogDB.createPost(postData);
            this.utils.createNotification('Post created successfully!', 'success');
        }
        
        // Reset form and return to posts tab
        this.resetPostForm();
        document.querySelector('.menu-item[data-tab="posts"]').click();
        this.loadPostsTable();
        this.loadDashboardStats();
    }

    editPost(postId) {
        const post = this.blogDB.getPostById(postId);
        if (!post) return;
        
        this.editingPostId = postId;
        
        // Fill form
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-slug').value = post.slug;
        document.getElementById('post-slug').readOnly = false;
        document.getElementById('post-category').value = post.category;
        document.getElementById('post-tags').value = post.tags?.join(', ') || '';
        document.getElementById('post-excerpt').value = post.excerpt;
        document.getElementById('post-content').value = post.content;
        document.querySelector(`input[name="post-status"][value="${post.published ? 'published' : 'draft'}"]`).checked = true;
        document.getElementById('post-featured').checked = post.featured || false;
        
        // Update button text
        document.querySelector('#post-form button[type="submit"]').innerHTML = 
            '<i class="fas fa-save"></i> Update Post';
        
        // Switch to new post tab
        document.querySelector('.menu-item[data-tab="new-post"]').click();
        
        // Scroll to top
        window.scrollTo(0, 0);
    }

    deletePost(postId) {
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }
        
        const success = this.blogDB.deletePost(postId);
        if (success) {
            this.utils.createNotification('Post deleted successfully!', 'success');
            this.loadPostsTable();
            this.loadDashboardStats();
        }
    }

    resetPostForm() {
        this.editingPostId = null;
        const form = document.getElementById('post-form');
        form.reset();
        
        // Reset slug field
        document.getElementById('post-slug').value = '';
        document.getElementById('post-slug').readOnly = true;
        
        // Reset button text
        document.querySelector('#post-form button[type="submit"]').innerHTML = 
            '<i class="fas fa-save"></i> Publish Post';
        
        // Set default category
        const categories = this.blogDB.getAllCategories();
        if (categories.length > 0) {
            document.getElementById('post-category').value = categories[0];
        }
    }

    // Category Management
    loadCategories() {
        this.loadCategoryDropdown();
        this.loadCategoriesTable();
    }

    loadCategoriesTable() {
        const container = document.getElementById('categories-table-body');
        if (!container) return;
        
        const categories = this.blogDB.getAllCategories();
        const posts = this.blogDB.getPublishedPosts();
        
        if (categories.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <p class="text-muted">No categories yet.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        container.innerHTML = categories.map(category => {
            const postCount = posts.filter(post => post.category === category).length;
            const color = this.getCategoryColor(category);
            
            return `
                <tr data-category="${category}">
                    <td>
                        <div class="category-display">
                            <span class="category-color" style="background-color: ${color}"></span>
                            <strong>${category}</strong>
                        </div>
                    </td>
                    <td>${this.blogDB.generateSlug(category)}</td>
                    <td>${postCount}</td>
                    <td>
                        <input type="color" value="${color}" class="category-color-input" 
                               data-category="${category}">
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-outline edit-category" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline delete-category" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Add event listeners
        this.setupCategoryActions();
    }

    setupCategoryForm() {
        const form = document.getElementById('category-form');
        if (!form) return;
        
        const nameInput = document.getElementById('category-name');
        const slugInput = document.getElementById('category-slug');
        
        // Auto-generate slug
        nameInput.addEventListener('input', this.utils.debounce(() => {
            if (nameInput.value.trim()) {
                slugInput.value = this.blogDB.generateSlug(nameInput.value);
            }
        }, 300));
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = nameInput.value.trim();
            const color = document.getElementById('category-color').value;
            
            if (!name) {
                this.utils.createNotification('Please enter a category name', 'error');
                return;
            }
            
            const categories = this.blogDB.getAllCategories();
            
            if (this.editingCategory) {
                // Update existing category in all posts
                const posts = this.blogDB.getAllPosts();
                posts.forEach(post => {
                    if (post.category === this.editingCategory) {
                        post.category = name;
                    }
                });
                
                // Update in database
                const index = categories.indexOf(this.editingCategory);
                if (index !== -1) {
                    categories[index] = name;
                }
                
                this.utils.createNotification('Category updated successfully!', 'success');
                this.editingCategory = null;
            } else {
                // Check if category already exists
                if (categories.includes(name)) {
                    this.utils.createNotification('Category already exists!', 'error');
                    return;
                }
                
                categories.push(name);
                this.utils.createNotification('Category added successfully!', 'success');
            }
            
            // Save to database
            const data = this.blogDB.getData();
            data.categories = categories;
            this.blogDB.saveData(data);
            
            // Reset form and reload
            form.reset();
            document.getElementById('category-color').value = '#6366f1';
            this.loadCategories();
            this.loadCategoryDropdown();
        });
    }

    setupCategoryActions() {
        // Edit category buttons
        document.querySelectorAll('.edit-category').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.closest('tr').dataset.category;
                this.editCategory(category);
            });
        });
        
        // Delete category buttons
        document.querySelectorAll('.delete-category').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.closest('tr').dataset.category;
                this.deleteCategory(category);
            });
        });
        
        // Color pickers
        document.querySelectorAll('.category-color-input').forEach(input => {
            input.addEventListener('change', () => {
                // In a real app, you'd save this color somewhere
                // For now, we'll just show a notification
                this.utils.createNotification('Category color updated (not saved)', 'info');
            });
        });
    }

    editCategory(category) {
        this.editingCategory = category;
        
        document.getElementById('category-name').value = category;
        document.getElementById('category-slug').value = this.blogDB.generateSlug(category);
        
        // Try to get existing color or use default
        const color = this.getCategoryColor(category);
        document.getElementById('category-color').value = color;
        
        // Scroll to form
        document.getElementById('category-form').scrollIntoView({ behavior: 'smooth' });
        
        this.utils.createNotification(`Editing category: ${category}`, 'info');
    }

    deleteCategory(category) {
        if (!confirm(`Delete category "${category}"? Posts in this category will not be deleted.`)) {
            return;
        }
        
        const categories = this.blogDB.getAllCategories();
        const index = categories.indexOf(category);
        
        if (index !== -1) {
            categories.splice(index, 1);
            
            // Update database
            const data = this.blogDB.getData();
            data.categories = categories;
            this.blogDB.saveData(data);
            
            this.utils.createNotification('Category deleted successfully!', 'success');
            this.loadCategories();
            this.loadCategoryDropdown();
        }
    }

    // Tag Management
    loadTags() {
        this.loadTagsTable();
        this.loadTagsCloud();
    }

    loadTagsTable() {
        const container = document.getElementById('tags-table-body');
        if (!container) return;
        
        const allTags = this.blogDB.getAllTags();
        const posts = this.blogDB.getPublishedPosts();
        
        if (allTags.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center py-4">
                        <p class="text-muted">No tags yet.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Calculate tag frequency
        const tagFrequency = {};
        posts.forEach(post => {
            (post.tags || []).forEach(tag => {
                tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
            });
        });
        
        container.innerHTML = allTags.map(tag => {
            const postCount = tagFrequency[tag] || 0;
            
            return `
                <tr data-tag="${tag}">
                    <td><span class="tag">${tag}</span></td>
                    <td>${postCount}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-outline delete-tag" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Add event listeners
        this.setupTagActions();
    }

    loadTagsCloud() {
        const container = document.getElementById('admin-tags-cloud');
        if (!container) return;
        
        const allTags = this.blogDB.getAllTags();
        const posts = this.blogDB.getPublishedPosts();
        
        // Calculate tag frequency
        const tagFrequency = {};
        posts.forEach(post => {
            (post.tags || []).forEach(tag => {
                tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
            });
        });
        
        // Sort by frequency
        const sortedTags = Object.keys(tagFrequency)
            .sort((a, b) => tagFrequency[b] - tagFrequency[a])
            .slice(0, 20);
        
        if (sortedTags.length === 0) {
            container.innerHTML = '<p class="text-muted">No tags yet.</p>';
            return;
        }
        
        const maxSize = 24;
        const minSize = 12;
        const maxFreq = Math.max(...Object.values(tagFrequency));
        const minFreq = Math.min(...Object.values(tagFrequency));
        
        container.innerHTML = sortedTags.map(tag => {
            let fontSize = minSize;
            if (maxFreq !== minFreq) {
                fontSize = minSize + ((tagFrequency[tag] - minFreq) / (maxFreq - minFreq)) * (maxSize - minSize);
            }
            
            return `<span class="tag" style="font-size: ${fontSize}px">${tag}</span>`;
        }).join('');
    }

    setupTagForm() {
        const form = document.getElementById('tag-form');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('tag-name');
            const name = nameInput.value.trim().toLowerCase();
            
            if (!name) {
                this.utils.createNotification('Please enter a tag name', 'error');
                return;
            }
            
            const tags = this.blogDB.getAllTags();
            
            // Check if tag already exists
            if (tags.includes(name)) {
                this.utils.createNotification('Tag already exists!', 'error');
                return;
            }
            
            tags.push(name);
            
            // Save to database
            const data = this.blogDB.getData();
            data.tags = tags;
            this.blogDB.saveData(data);
            
            this.utils.createNotification('Tag added successfully!', 'success');
            
            // Reset form and reload
            form.reset();
            this.loadTags();
        });
    }

    setupTagActions() {
        // Delete tag buttons
        document.querySelectorAll('.delete-tag').forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.closest('tr').dataset.tag;
                this.deleteTag(tag);
            });
        });
    }

    deleteTag(tag) {
        if (!confirm(`Delete tag "${tag}"? This will remove it from all posts.`)) {
            return;
        }
        
        const tags = this.blogDB.getAllTags();
        const index = tags.indexOf(tag);
        
        if (index !== -1) {
            tags.splice(index, 1);
            
            // Remove tag from all posts
            const posts = this.blogDB.getAllPosts();
            posts.forEach(post => {
                if (post.tags) {
                    post.tags = post.tags.filter(t => t !== tag);
                }
            });
            
            // Update database
            const data = this.blogDB.getData();
            data.tags = tags;
            data.posts = posts;
            this.blogDB.saveData(data);
            
            this.utils.createNotification('Tag deleted successfully!', 'success');
            this.loadTags();
        }
    }

    // Comments Management
    loadComments() {
        // Since we don't have a comment system implemented yet,
        // we'll just show a placeholder
        const container = document.getElementById('comments-list');
        if (!container) return;
        
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>Comment system not implemented</h3>
                <p>This is a demo feature. In a real application, you would manage comments here.</p>
            </div>
        `;
    }

    // Settings Management
    loadSettings() {
        // Load current settings if any
        const data = this.blogDB.getData();
        const settings = data.settings || {};
        
        // General settings
        if (settings.blogName) {
            document.getElementById('blog-name').value = settings.blogName;
        }
        if (settings.blogDescription) {
            document.getElementById('blog-description').value = settings.blogDescription;
        }
        if (settings.postsPerPage) {
            document.getElementById('posts-per-page').value = settings.postsPerPage;
        }
    }

    setupSettings() {
        // General settings form
        const generalForm = document.getElementById('general-settings-form');
        if (generalForm) {
            generalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveGeneralSettings();
            });
        }
        
        // Appearance settings form
        const appearanceForm = document.getElementById('appearance-settings-form');
        if (appearanceForm) {
            appearanceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAppearanceSettings();
            });
        }
        
        // SEO settings form
        const seoForm = document.getElementById('seo-settings-form');
        if (seoForm) {
            seoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSEOSettings();
            });
        }
        
        // Backup buttons
        document.getElementById('export-data')?.addEventListener('click', () => this.exportData());
        document.getElementById('export-backup')?.addEventListener('click', () => this.exportBackup());
        document.getElementById('import-backup')?.addEventListener('click', () => this.importBackup());
        document.getElementById('reset-data')?.addEventListener('click', () => this.resetData());
        
        // Import file selection
        const importFile = document.getElementById('import-file');
        if (importFile) {
            importFile.addEventListener('change', () => {
                const importBtn = document.getElementById('import-backup');
                importBtn.disabled = !importFile.files.length;
            });
        }
    }

    saveGeneralSettings() {
        const settings = {
            blogName: document.getElementById('blog-name').value,
            blogDescription: document.getElementById('blog-description').value,
            postsPerPage: parseInt(document.getElementById('posts-per-page').value) || 6
        };
        
        const data = this.blogDB.getData();
        data.settings = { ...data.settings, ...settings };
        this.blogDB.saveData(data);
        
        this.utils.createNotification('General settings saved!', 'success');
    }

    saveAppearanceSettings() {
        const theme = document.querySelector('input[name="theme"]:checked').value;
        const primaryColor = document.getElementById('primary-color').value;
        
        // In a real app, you would save these settings and apply them
        // For this demo, we'll just show a notification
        this.utils.createNotification(`Appearance settings saved (Theme: ${theme}, Color: ${primaryColor})`, 'success');
        
        // Apply theme immediately for demo
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    saveSEOSettings() {
        this.utils.createNotification('SEO settings saved!', 'success');
    }

    exportData() {
        const data = this.blogDB.getData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `devblog-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.utils.createNotification('Data exported successfully!', 'success');
        
        // Save backup timestamp
        localStorage.setItem('devBlogLastBackup', new Date().toLocaleString());
        this.updateStorageInfo();
    }

    exportBackup() {
        const includePosts = document.getElementById('export-posts').checked;
        const includeCategories = document.getElementById('export-categories').checked;
        const includeSettings = document.getElementById('export-settings').checked;
        
        const data = this.blogDB.getData();
        const exportData = {};
        
        if (includePosts) exportData.posts = data.posts;
        if (includeCategories) exportData.categories = data.categories;
        if (includeSettings) exportData.settings = data.settings;
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `devblog-partial-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.utils.createNotification('Partial backup exported successfully!', 'success');
    }

    importBackup() {
        const fileInput = document.getElementById('import-file');
        if (!fileInput.files.length) return;
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                const currentData = this.blogDB.getData();
                
                // Merge imported data with current data
                const newData = {
                    ...currentData,
                    ...importedData
                };
                
                // Special handling for posts (append instead of replace if we want)
                if (importedData.posts && !confirm('Import posts? This will replace all existing posts.')) {
                    newData.posts = currentData.posts;
                }
                
                // Save to localStorage
                localStorage.setItem('devBlogData', JSON.stringify(newData));
                
                // Refresh the page to load new data
                location.reload();
            } catch (error) {
                this.utils.createNotification('Error importing backup file', 'error');
                console.error('Import error:', error);
            }
        };
        
        reader.readAsText(file);
    }

    resetData() {
        if (!confirm('Are you sure you want to reset all data? This cannot be undone!')) {
            return;
        }
        
        localStorage.removeItem('devBlogData');
        this.utils.createNotification('All data has been reset!', 'success');
        
        // Refresh the page
        setTimeout(() => location.reload(), 1000);
    }

    // Modal Functions
    setupModals() {
        // Preview modal
        const previewModal = document.getElementById('preview-modal');
        const previewClose = previewModal.querySelector('.modal-close');
        
        previewClose.addEventListener('click', () => {
            previewModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                previewModal.style.display = 'none';
            }
        });
    }

    showPreview() {
        const content = document.getElementById('post-content').value;
        const preview = document.getElementById('preview-content');
        
        if (!content.trim()) {
            this.utils.createNotification('No content to preview', 'warning');
            return;
        }
        
        preview.innerHTML = this.utils.renderMarkdown(content);
        
        // Highlight code
        if (typeof hljs !== 'undefined') {
            hljs.highlightAll();
        }
        
        // Show modal
        document.getElementById('preview-modal').style.display = 'block';
    }

    // Helper Functions
    getCategoryColor(category) {
        // Simple hash function to generate consistent colors
        let hash = 0;
        for (let i = 0; i < category.length; i++) {
            hash = category.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const colors = [
            '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#14b8a6'
        ];
        
        return colors[Math.abs(hash) % colors.length];
    }

    // Event Listeners
    setupEventListeners() {
        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                // In a real app, you would clear session/token
                // For this demo, just redirect to blog
                window.location.href = 'index.html';
            }
        });
        
        // Posts filter and search
        const postsFilter = document.getElementById('posts-filter');
        const categoryFilter = document.getElementById('category-filter');
        const sortPosts = document.getElementById('sort-posts');
        const postsSearch = document.getElementById('posts-search');
        
        [postsFilter, categoryFilter, sortPosts].forEach(element => {
            if (element) {
                element.addEventListener('change', () => {
                    this.currentPostPage = 1;
                    this.loadPostsTable();
                });
            }
        });
        
        if (postsSearch) {
            postsSearch.addEventListener('input', this.utils.debounce(() => {
                this.currentPostPage = 1;
                this.loadPostsTable();
            }, 500));
        }
        
        // Comments filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentCommentFilter = tab.dataset.status;
                this.loadComments();
            });
        });
    }
}

// Initialize Admin Dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on an admin page
    if (document.querySelector('.admin-container')) {
        window.adminDashboard = new AdminDashboard();
        
        // Add admin-specific CSS
        const adminStyles = document.createElement('style');
        adminStyles.textContent = `
            /* Admin-specific styles */
            .admin-navbar {
                background: linear-gradient(135deg, var(--dark) 0%, var(--gray-800) 100%);
            }
            
            .admin-navbar .logo {
                color: var(--white);
            }
            
            .admin-badge {
                background: var(--primary);
                color: var(--white);
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 600;
                margin-left: 1rem;
            }
            
            .navbar-left {
                display: flex;
                align-items: center;
            }
            
            .admin-container {
                display: flex;
                min-height: calc(100vh - var(--header-height));
            }
            
            .admin-sidebar {
                width: 280px;
                background: var(--white);
                border-right: 1px solid var(--gray-200);
                display: flex;
                flex-direction: column;
                flex-shrink: 0;
            }
            
            .admin-profile {
                padding: 2rem 1.5rem;
                border-bottom: 1px solid var(--gray-200);
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .profile-avatar {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--gray-100);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                color: var(--gray-600);
            }
            
            .profile-info h4 {
                margin-bottom: 0.25rem;
                font-size: 1.125rem;
            }
            
            .profile-info p {
                color: var(--gray-500);
                font-size: 0.875rem;
                margin-bottom: 0;
            }
            
            .admin-menu {
                flex: 1;
                padding: 1rem 0;
            }
            
            .menu-item {
                display: flex;
                align-items: center;
                padding: 0.75rem 1.5rem;
                color: var(--gray-600);
                text-decoration: none;
                transition: all 0.2s;
                border-left: 3px solid transparent;
            }
            
            .menu-item:hover {
                background: var(--gray-50);
                color: var(--gray-900);
            }
            
            .menu-item.active {
                background: var(--primary-light);
                color: var(--primary);
                border-left-color: var(--primary);
            }
            
            .menu-item i {
                width: 20px;
                margin-right: 0.75rem;
                font-size: 1.125rem;
            }
            
            .menu-badge {
                margin-left: auto;
                background: var(--gray-200);
                color: var(--gray-700);
                padding: 0.125rem 0.5rem;
                border-radius: 10px;
                font-size: 0.75rem;
                font-weight: 600;
            }
            
            .menu-item.active .menu-badge {
                background: var(--primary);
                color: var(--white);
            }
            
            .sidebar-footer {
                padding: 1.5rem;
                border-top: 1px solid var(--gray-200);
            }
            
            .system-info p {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 0.5rem;
                font-size: 0.875rem;
                color: var(--gray-600);
            }
            
            .system-info i {
                margin-right: 0.5rem;
            }
            
            .admin-main {
                flex: 1;
                padding: 2rem;
                overflow-y: auto;
            }
            
            .admin-tab {
                display: none;
                animation: fadeIn 0.3s ease;
            }
            
            .admin-tab.active {
                display: block;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .tab-header {
                margin-bottom: 2rem;
            }
            
            .tab-header h2 {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 0.5rem;
            }
            
            .tab-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 1.5rem;
            }
            
            .search-box {
                position: relative;
                width: 300px;
            }
            
            .search-box input {
                width: 100%;
                padding-right: 2.5rem;
            }
            
            .search-box i {
                position: absolute;
                right: 1rem;
                top: 50%;
                transform: translateY(-50%);
                color: var(--gray-400);
            }
            
            .posts-controls {
                margin-bottom: 1.5rem;
            }
            
            .filter-controls {
                display: flex;
                gap: 1rem;
            }
            
            .filter-controls select {
                min-width: 150px;
            }
            
            .table-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 1.5rem;
                padding-top: 1rem;
                border-top: 1px solid var(--gray-200);
            }
            
            .table-info {
                color: var(--gray-600);
                font-size: 0.875rem;
            }
            
            .pagination {
                display: flex;
                gap: 0.5rem;
            }
            
            .pagination-btn {
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid var(--gray-300);
                background: var(--white);
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .pagination-btn:hover:not(.disabled) {
                background: var(--gray-50);
                border-color: var(--gray-400);
            }
            
            .pagination-btn.active {
                background: var(--primary);
                color: var(--white);
                border-color: var(--primary);
            }
            
            .pagination-btn.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .pagination-ellipsis {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                color: var(--gray-500);
            }
            
            .badge {
                display: inline-block;
                padding: 0.25rem 0.5rem;
                background: var(--gray-100);
                color: var(--gray-700);
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: 600;
            }
            
            .badge-featured {
                background: var(--warning);
                color: var(--white);
                margin-left: 0.5rem;
            }
            
            .status-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 600;
            }
            
            .status-badge.published {
                background: rgba(16, 185, 129, 0.1);
                color: var(--success);
            }
            
            .status-badge.draft {
                background: rgba(245, 158, 11, 0.1);
                color: var(--warning);
            }
            
            .dashboard-content {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 2rem;
                margin-top: 2rem;
            }
            
            @media (max-width: 1024px) {
                .dashboard-content {
                    grid-template-columns: 1fr;
                }
            }
            
            .dashboard-card {
                background: var(--white);
                border-radius: var(--border-radius);
                padding: 1.5rem;
                box-shadow: var(--shadow-md);
                margin-bottom: 1.5rem;
            }
            
            .traffic-chart {
                height: 200px;
                margin: 1rem 0;
            }
            
            .traffic-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-top: 1rem;
            }
            
            .traffic-stat {
                text-align: center;
                padding: 1rem;
                background: var(--gray-50);
                border-radius: 8px;
            }
            
            .stat-label {
                display: block;
                color: var(--gray-600);
                font-size: 0.875rem;
                margin-bottom: 0.25rem;
            }
            
            .stat-value {
                display: block;
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--gray-900);
            }
            
            .popular-post-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem 0;
                border-bottom: 1px solid var(--gray-200);
            }
            
            .popular-post-item:last-child {
                border-bottom: none;
            }
            
            .popular-post-rank {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--gray-100);
                color: var(--gray-700);
                border-radius: 50%;
                font-weight: 700;
                font-size: 0.875rem;
            }
            
            .popular-post-content h4 {
                margin-bottom: 0.25rem;
                font-size: 0.875rem;
            }
            
            .popular-post-content a {
                color: var(--gray-900);
                text-decoration: none;
            }
            
            .popular-post-content a:hover {
                color: var(--primary);
            }
            
            .popular-post-meta {
                display: flex;
                gap: 1rem;
                font-size: 0.75rem;
                color: var(--gray-500);
            }
            
            .quick-actions {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
            }
            
            .quick-action-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 1.5rem;
                background: var(--gray-50);
                border: 1px solid var(--gray-200);
                border-radius: 8px;
                text-decoration: none;
                color: var(--gray-700);
                transition: all 0.2s;
                cursor: pointer;
            }
            
            .quick-action-btn:hover {
                background: var(--gray-100);
                border-color: var(--gray-300);
                transform: translateY(-2px);
            }
            
            .quick-action-btn i {
                font-size: 1.5rem;
                margin-bottom: 0.5rem;
                color: var(--primary);
            }
            
            .activity-item {
                display: flex;
                gap: 1rem;
                padding: 1rem 0;
                border-bottom: 1px solid var(--gray-200);
            }
            
            .activity-item:last-child {
                border-bottom: none;
            }
            
            .activity-icon {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--gray-100);
                border-radius: 50%;
                flex-shrink: 0;
            }
            
            .activity-content p {
                margin-bottom: 0.25rem;
                font-size: 0.875rem;
            }
            
            .post-form .form-row {
                margin-bottom: 1.5rem;
            }
            
            .editor-group {
                margin-bottom: 2rem;
            }
            
            .editor-toolbar {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
                padding: 0.5rem;
                background: var(--gray-100);
                border-radius: 6px 6px 0 0;
                border: 1px solid var(--gray-300);
                border-bottom: none;
            }
            
            .toolbar-btn {
                padding: 0.5rem 0.75rem;
                background: var(--white);
                border: 1px solid var(--gray-300);
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .toolbar-btn:hover {
                background: var(--gray-50);
                border-color: var(--gray-400);
            }
            
            .form-inline {
                display: flex;
                gap: 1rem;
                align-items: flex-end;
            }
            
            .form-inline .form-group {
                margin-bottom: 0;
            }
            
            .categories-manager, .tags-manager {
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }
            
            .category-display {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .category-color {
                width: 16px;
                height: 16px;
                border-radius: 50%;
            }
            
            .category-color-input {
                width: 40px;
                height: 40px;
                padding: 0;
                border: none;
                border-radius: 50%;
                cursor: pointer;
            }
            
            .category-color-input::-webkit-color-swatch-wrapper {
                padding: 0;
            }
            
            .category-color-input::-webkit-color-swatch {
                border: none;
                border-radius: 50%;
            }
            
            .tags-cloud-manager .tags-cloud {
                min-height: 150px;
                padding: 1.5rem;
                background: var(--gray-50);
                border-radius: 8px;
            }
            
            .settings-tabs {
                display: grid;
                grid-template-columns: 250px 1fr;
                gap: 2rem;
            }
            
            @media (max-width: 768px) {
                .settings-tabs {
                    grid-template-columns: 1fr;
                }
            }
            
            .settings-sidebar {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .settings-tab-btn {
                padding: 1rem 1.5rem;
                text-align: left;
                background: none;
                border: none;
                border-left: 3px solid transparent;
                color: var(--gray-600);
                cursor: pointer;
                transition: all 0.2s;
                border-radius: 0 6px 6px 0;
            }
            
            .settings-tab-btn:hover {
                background: var(--gray-50);
                color: var(--gray-900);
            }
            
            .settings-tab-btn.active {
                background: var(--primary-light);
                color: var(--primary);
                border-left-color: var(--primary);
                font-weight: 600;
            }
            
            .settings-tab-btn i {
                margin-right: 0.75rem;
                width: 20px;
            }
            
            .settings-tab-content {
                display: none;
            }
            
            .settings-tab-content.active {
                display: block;
            }
            
            .theme-selector {
                display: flex;
                gap: 1rem;
            }
            
            .theme-option input {
                display: none;
            }
            
            .theme-preview {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 1.5rem;
                border: 2px solid var(--gray-300);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .theme-option input:checked + .theme-preview {
                border-color: var(--primary);
                background: var(--primary-light);
            }
            
            .theme-preview i {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }
            
            .backup-actions {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .backup-card {
                padding: 1.5rem;
                background: var(--white);
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-md);
            }
            
            .file-upload {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-top: 1rem;
            }
            
            .info-item {
                padding: 1rem;
                background: var(--gray-50);
                border-radius: 6px;
            }
            
            .info-label {
                display: block;
                color: var(--gray-600);
                font-size: 0.875rem;
                margin-bottom: 0.25rem;
            }
            
            .info-value {
                display: block;
                font-weight: 600;
                color: var(--gray-900);
            }
            
            /* Modal Styles */
            .modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            }
            
            .modal-content {
                position: relative;
                background: var(--white);
                margin: 5% auto;
                width: 90%;
                max-width: 800px;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-xl);
                max-height: 80vh;
                display: flex;
                flex-direction: column;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid var(--gray-200);
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--gray-500);
                transition: color 0.2s;
            }
            
            .modal-close:hover {
                color: var(--gray-700);
            }
            
            .modal-body {
                flex: 1;
                overflow-y: auto;
                padding: 1.5rem;
            }
            
            .modal-footer {
                padding: 1rem 1.5rem;
                border-top: 1px solid var(--gray-200);
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
            }
            
            /* Responsive adjustments for admin */
            @media (max-width: 768px) {
                .admin-container {
                    flex-direction: column;
                }
                
                .admin-sidebar {
                    width: 100%;
                    border-right: none;
                    border-bottom: 1px solid var(--gray-200);
                }
                
                .admin-menu {
                    display: flex;
                    overflow-x: auto;
                    padding: 0;
                }
                
                .menu-item {
                    flex-direction: column;
                    padding: 1rem;
                    min-width: 80px;
                    border-left: none;
                    border-bottom: 3px solid transparent;
                }
                
                .menu-item.active {
                    border-bottom-color: var(--primary);
                }
                
                .menu-item span {
                    font-size: 0.75rem;
                    margin-top: 0.5rem;
                }
                
                .menu-item i {
                    margin-right: 0;
                    margin-bottom: 0.25rem;
                }
                
                .menu-badge {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                }
                
                .filter-controls {
                    flex-direction: column;
                }
                
                .filter-controls select {
                    width: 100%;
                }
                
                .tab-actions {
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .search-box {
                    width: 100%;
                }
                
                .table-footer {
                    flex-direction: column;
                    gap: 1rem;
                    align-items: stretch;
                }
                
                .pagination {
                    justify-content: center;
                }
                
                .quick-actions {
                    grid-template-columns: 1fr;
                }
                
                .form-inline {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .theme-selector {
                    flex-direction: column;
                }
                
                .backup-actions {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(adminStyles);
    }
});
