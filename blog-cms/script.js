// BlogCMS - Content Management System
class BlogCMS {
    constructor() {
        // Initialize with sample data if empty
        if (!localStorage.getItem('blogPosts')) {
            this.posts = [
                {
                    id: '1',
                    title: 'Welcome to BlogCMS',
                    excerpt: 'A powerful client-side content management system',
                    content: '<h2>Welcome to Your New Blog!</h2><p>This is a fully functional Blog/CMS system that runs entirely in your browser. All your data is stored locally using localStorage.</p><p>You can:</p><ul><li>Create rich text blog posts</li><li>Organize by categories and tags</li><li>View analytics and statistics</li><li>Manage all content in one place</li></ul><pre><code>// Example code block\nconsole.log("Welcome to BlogCMS!");</code></pre>',
                    category: 'Welcome',
                    tags: ['welcome', 'blog', 'cms'],
                    featuredImage: '',
                    status: 'published',
                    views: 15,
                    createdAt: new Date().toISOString(),
                    wordCount: 120
                },
                {
                    id: '2',
                    title: 'Getting Started with JavaScript',
                    excerpt: 'Learn the basics of JavaScript programming',
                    content: '<h2>JavaScript Fundamentals</h2><p>JavaScript is a versatile programming language that powers the modern web.</p><h3>Variables</h3><pre><code>let message = "Hello World";\nconst PI = 3.14159;\nvar oldVariable = "Deprecated";</code></pre><p>Start your JavaScript journey today!</p>',
                    category: 'Programming',
                    tags: ['javascript', 'webdev', 'tutorial'],
                    featuredImage: '',
                    status: 'published',
                    views: 28,
                    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                    wordCount: 85
                }
            ];
            localStorage.setItem('blogPosts', JSON.stringify(this.posts));
        } else {
            this.posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        }
        
        this.categories = JSON.parse(localStorage.getItem('blogCategories')) || [
            'Technology', 'Programming', 'Web Development', 'Design', 'Tutorial', 'Personal', 'Welcome'
        ];
        this.tags = JSON.parse(localStorage.getItem('blogTags')) || [
            'javascript', 'webdev', 'tutorial', 'css', 'html', 'react', 'nodejs', 'welcome', 'blog'
        ];
        this.currentPostId = null;
        this.isEditing = false;
        this.currentTags = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadCategories();
        this.loadTags();
        this.updateDashboard();
        this.loadRecentPosts();
        this.setupRouting();
    }

    initializeElements() {
        // Navigation
        this.navLinks = document.querySelectorAll('.nav-link');
        this.navToggle = document.getElementById('navToggle');
        this.pages = document.querySelectorAll('.page');
        this.navLogo = document.querySelector('.nav-logo');
        
        // Home Page
        this.totalPostsEl = document.getElementById('total-posts');
        this.totalViewsEl = document.getElementById('total-views');
        this.totalCategoriesEl = document.getElementById('total-categories');
        this.latestPostDateEl = document.getElementById('latest-post-date');
        this.recentPostsContainer = document.getElementById('recent-posts-container');
        
        // Posts Page
        this.postSearch = document.getElementById('post-search');
        this.categoryFilter = document.getElementById('category-filter');
        this.sortPosts = document.getElementById('sort-posts');
        this.allPostsContainer = document.getElementById('all-posts-container');
        
        // Editor Page
        this.postTitle = document.getElementById('post-title');
        this.postExcerpt = document.getElementById('post-excerpt');
        this.postCategory = document.getElementById('post-category');
        this.featuredImage = document.getElementById('featured-image');
        this.editorContent = document.getElementById('editor-content');
        this.editorPreview = document.getElementById('editor-preview');
        this.imagePreview = document.getElementById('image-preview');
        this.postDateEl = document.getElementById('post-date');
        this.postViewsEl = document.getElementById('post-views');
        this.postLengthEl = document.getElementById('post-length');
        this.tagsContainer = document.getElementById('tags-container');
        this.tagInput = document.getElementById('tag-input');
        this.addCategoryBtn = document.getElementById('add-category');
        this.newCategoryInput = document.getElementById('new-category');
        this.addCategoryMainBtn = document.getElementById('add-category-btn');
        this.previewToggle = document.getElementById('preview-toggle');
        this.saveDraftBtn = document.getElementById('save-draft');
        this.publishBtn = document.getElementById('publish-post');
        this.currentPostIdInput = document.getElementById('current-post-id');
        
        // Categories Page
        this.categorySearch = document.getElementById('category-search');
        this.categoriesList = document.getElementById('categories-list');
        this.tagsCloud = document.getElementById('tags-cloud');
        this.tagStatsContainer = document.getElementById('tag-stats-container');
        
        // Stats Page
        this.topCategories = document.getElementById('top-categories');
        this.popularPosts = document.getElementById('popular-posts');
        this.avgPostLength = document.getElementById('avg-post-length');
        this.postsPerMonth = document.getElementById('posts-per-month');
        this.draftRatio = document.getElementById('draft-ratio');
        this.activeDay = document.getElementById('active-day');
        
        // Modals
        this.postModal = document.getElementById('post-modal');
        this.confirmModal = document.getElementById('confirm-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalCategory = document.getElementById('modal-category');
        this.modalDate = document.getElementById('modal-date');
        this.modalViews = document.getElementById('modal-views');
        this.modalContent = document.getElementById('modal-content');
        this.modalTags = document.getElementById('modal-tags');
        this.modalEditBtn = document.getElementById('modal-edit');
        this.modalDeleteBtn = document.getElementById('modal-delete');
        this.modalClose = document.querySelectorAll('.modal-close');
        
        // Toolbar
        this.toolbarButtons = document.querySelectorAll('.toolbar-btn');
        this.insertCodeBtn = document.getElementById('insert-code');
        this.insertImageBtn = document.getElementById('insert-image');
        this.clearFormattingBtn = document.getElementById('clear-formatting');
        
        // Chart
        this.postsChart = null;
    }

    setupEventListeners() {
        // Navigation
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('href').substring(1);
                this.showPage(page);
                
                // Update active state
                this.navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                navLinks.classList.remove('active');
            });
        });

        // Logo click
        this.navLogo.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('home');
            this.navLinks.forEach(l => l.classList.remove('active'));
            document.querySelector('.nav-link[href="#home"]').classList.add('active');
        });

        // Mobile menu toggle
        this.navToggle.addEventListener('click', () => {
            const navLinks = document.querySelector('.nav-links');
            navLinks.classList.toggle('active');
        });

        // Editor
        this.postTitle.addEventListener('input', () => this.updatePostStats());
        this.editorContent.addEventListener('input', () => {
            this.updatePostStats();
            // Auto-save draft every 30 seconds
            clearTimeout(this.autoSaveTimer);
            this.autoSaveTimer = setTimeout(() => {
                if (!this.isEditing) this.savePost('draft', true);
            }, 30000);
        });
        
        this.featuredImage.addEventListener('input', () => this.updateImagePreview());
        this.previewToggle.addEventListener('click', () => this.togglePreview());
        this.saveDraftBtn.addEventListener('click', () => this.savePost('draft'));
        this.publishBtn.addEventListener('click', () => this.savePost('published'));
        this.addCategoryBtn.addEventListener('click', () => this.showAddCategoryModal());
        this.addCategoryMainBtn.addEventListener('click', () => this.addNewCategory());
        
        this.tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTag(this.tagInput.value.trim());
                this.tagInput.value = '';
            }
        });

        // Posts Page
        this.postSearch.addEventListener('input', () => this.filterPosts());
        this.categoryFilter.addEventListener('change', () => this.filterPosts());
        this.sortPosts.addEventListener('change', () => this.filterPosts());

        // Categories Page
        this.categorySearch.addEventListener('input', () => this.filterCategories());

        // Toolbar
        this.toolbarButtons.forEach(button => {
            if (button.dataset.command) {
                button.addEventListener('click', () => {
                    const command = button.dataset.command;
                    const value = button.dataset.value;
                    this.executeCommand(command, value);
                });
            }
        });

        this.insertCodeBtn.addEventListener('click', () => this.insertCodeBlock());
        this.insertImageBtn.addEventListener('click', () => this.insertImage());
        this.clearFormattingBtn.addEventListener('click', () => this.clearFormatting());

        // Modals
        this.modalClose.forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.closeModal());
        });

        this.modalEditBtn.addEventListener('click', () => this.editModalPost());
        this.modalDeleteBtn.addEventListener('click', () => this.deleteModalPost());

        document.getElementById('confirm-cancel').addEventListener('click', () => this.closeConfirmModal());
        document.getElementById('confirm-ok').addEventListener('click', () => this.confirmAction());

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.postModal) this.closeModal();
            if (e.target === this.confirmModal) this.closeConfirmModal();
        });

        // Initialize Chart
        this.initializeChart();
        
        // Set current date in editor
        this.updatePostStats();
    }

    setupRouting() {
        // Handle hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        // Handle initial load
        this.handleRoute();
    }

    handleRoute() {
        const hash = window.location.hash.substring(1) || 'home';
        this.showPage(hash);
    }

    showPage(pageName) {
        // Hide all pages
        this.pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Show the requested page
        const pageId = `${pageName}-page`;
        const pageElement = document.getElementById(pageId);
        if (pageElement) {
            pageElement.classList.add('active');
            
            // Update URL hash without triggering navigation
            history.replaceState(null, null, `#${pageName}`);
            
            // Load page-specific content
            switch(pageName) {
                case 'home':
                    this.updateDashboard();
                    this.loadRecentPosts();
                    break;
                case 'posts':
                    this.loadAllPosts();
                    break;
                case 'editor':
                    this.clearEditor();
                    break;
                case 'categories':
                    this.loadCategories();
                    this.loadTags();
                    break;
                case 'stats':
                    this.updateStats();
                    break;
            }
        }
    }

    // Post Management
    createPost(data) {
        const post = {
            id: data.id || Date.now().toString(),
            title: data.title,
            excerpt: data.excerpt,
            content: data.content,
            category: data.category,
            tags: data.tags,
            featuredImage: data.featuredImage,
            status: data.status,
            views: data.views || 0,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            wordCount: data.wordCount || this.countWords(data.content)
        };
        
        if (data.id) {
            // Update existing post
            const index = this.posts.findIndex(p => p.id === data.id);
            if (index !== -1) {
                this.posts[index] = post;
            }
        } else {
            // Add new post
            this.posts.unshift(post);
        }
        
        this.saveData();
        this.updateDashboard();
        return post;
    }

    deletePost(id) {
        this.posts = this.posts.filter(post => post.id !== id);
        this.saveData();
        this.updateDashboard();
        this.loadAllPosts();
        this.loadRecentPosts();
    }

    getPost(id) {
        return this.posts.find(post => post.id === id);
    }

    incrementViews(id) {
        const post = this.getPost(id);
        if (post) {
            post.views = (post.views || 0) + 1;
            this.saveData();
        }
    }

    // Editor Functions
    executeCommand(command, value) {
        document.execCommand(command, false, value);
        this.editorContent.focus();
    }

    insertCodeBlock() {
        const codeBlock = '<pre><code>// Your code here\nconsole.log("Hello World!");</code></pre><p></p>';
        document.execCommand('insertHTML', false, codeBlock);
        this.editorContent.focus();
        this.highlightCode();
    }

    insertImage() {
        const url = prompt('Enter image URL:');
        if (url) {
            const img = `<img src="${url}" alt="Image" style="max-width: 100%; border-radius: 8px; margin: 1rem 0;">`;
            document.execCommand('insertHTML', false, img);
        }
    }

    clearFormatting() {
        document.execCommand('removeFormat', false, null);
        document.execCommand('unlink', false, null);
    }

    togglePreview() {
        const isPreview = this.editorPreview.style.display !== 'none';
        
        if (isPreview) {
            this.editorPreview.style.display = 'none';
            this.editorContent.style.display = 'block';
            this.previewToggle.innerHTML = '<i class="fas fa-eye"></i> Preview';
        } else {
            this.editorPreview.innerHTML = this.formatContent(this.editorContent.innerHTML);
            this.editorPreview.style.display = 'block';
            this.editorContent.style.display = 'none';
            this.previewToggle.innerHTML = '<i class="fas fa-edit"></i> Edit';
            this.highlightCode();
        }
    }

    formatContent(content) {
        // Convert special characters to proper HTML
        let formatted = content
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&');
        
        return formatted;
    }

    highlightCode() {
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }

    // Tag Management
    addTag(tag) {
        if (!tag || this.currentTags.includes(tag)) return;
        
        this.currentTags.push(tag);
        this.renderTags();
        
        // Add to global tags if new
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
            this.saveData();
        }
    }

    removeTag(tag) {
        this.currentTags = this.currentTags.filter(t => t !== tag);
        this.renderTags();
    }

    renderTags() {
        this.tagsContainer.innerHTML = '';
        this.currentTags.forEach(tag => {
            const tagEl = document.createElement('div');
            tagEl.className = 'tag';
            tagEl.innerHTML = `
                ${tag}
                <button class="tag-remove" data-tag="${tag}">&times;</button>
            `;
            this.tagsContainer.appendChild(tagEl);
        });

        // Add event listeners to remove buttons
        this.tagsContainer.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tag = e.target.dataset.tag;
                this.removeTag(tag);
            });
        });
    }

    // Category Management
    loadCategories() {
        // Populate category selects
        this.postCategory.innerHTML = '<option value="">Select Category</option>';
        this.categoryFilter.innerHTML = '<option value="">All Categories</option>';
        
        this.categories.forEach(category => {
            const option1 = document.createElement('option');
            option1.value = category;
            option1.textContent = category;
            this.postCategory.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = category;
            option2.textContent = category;
            this.categoryFilter.appendChild(option2);
        });
    }

    addNewCategory() {
        const category = this.newCategoryInput.value.trim();
        if (!category || this.categories.includes(category)) return;
        
        this.categories.push(category);
        this.saveData();
        this.loadCategories();
        this.newCategoryInput.value = '';
        this.showNotification('Category added successfully!', 'success');
    }

    showAddCategoryModal() {
        const category = prompt('Enter new category name:');
        if (category && !this.categories.includes(category)) {
            this.categories.push(category);
            this.saveData();
            this.loadCategories();
            this.showNotification('Category added successfully!', 'success');
        }
    }

    // Data Management
    savePost(status = 'draft', autoSave = false) {
        const title = this.postTitle.value.trim();
        const excerpt = this.postExcerpt.value.trim();
        const content = this.editorContent.innerHTML;
        const category = this.postCategory.value;
        const featuredImage = this.featuredImage.value;
        
        if (!title && !autoSave) {
            this.showNotification('Please enter a post title', 'error');
            return;
        }
        
        if ((!content || content === '<br>') && !autoSave) {
            this.showNotification('Please enter some content', 'error');
            return;
        }
        
        const postData = {
            id: this.currentPostId || Date.now().toString(),
            title: title || 'Untitled',
            excerpt: excerpt || this.generateExcerpt(content),
            content: content || '<p>Start writing your post...</p>',
            category: category || 'Uncategorized',
            tags: this.currentTags,
            featuredImage,
            status: status,
            wordCount: this.countWords(content)
        };
        
        if (this.currentPostId) {
            // Update existing post
            const existingPost = this.getPost(this.currentPostId);
            if (existingPost) {
                postData.views = existingPost.views;
                postData.createdAt = existingPost.createdAt;
            }
        }
        
        this.createPost(postData);
        
        if (status === 'published') {
            this.showNotification('Post published successfully!', 'success');
            this.clearEditor();
            this.showPage('posts');
        } else if (!autoSave) {
            this.showNotification('Draft saved successfully!', 'success');
        }
    }

    clearEditor() {
        this.postTitle.value = '';
        this.postExcerpt.value = '';
        this.editorContent.innerHTML = '';
        this.featuredImage.value = '';
        this.currentTags = [];
        this.currentPostId = null;
        this.currentPostIdInput.value = '';
        this.isEditing = false;
        this.renderTags();
        this.updateImagePreview();
        this.updatePostStats();
        this.publishBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publish';
        
        // Set default category
        this.postCategory.value = '';
        
        // Set default status to draft
        document.querySelector('input[name="status"][value="draft"]').checked = true;
        
        // Focus on title
        setTimeout(() => this.postTitle.focus(), 100);
    }

    editPost(id) {
        const post = this.getPost(id);
        if (!post) return;
        
        this.currentPostId = id;
        this.isEditing = true;
        this.currentPostIdInput.value = id;
        
        this.postTitle.value = post.title;
        this.postExcerpt.value = post.excerpt;
        this.editorContent.innerHTML = post.content;
        this.postCategory.value = post.category;
        this.featuredImage.value = post.featuredImage || '';
        this.currentTags = post.tags || [];
        
        this.renderTags();
        this.updateImagePreview();
        this.updatePostStats();
        
        this.showPage('editor');
        this.publishBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Update';
        
        // Set status radio button
        document.querySelector(`input[name="status"][value="${post.status}"]`)?.checked = true;
    }

    // UI Rendering
    loadRecentPosts() {
        const recentPosts = this.posts
            .filter(post => post.status === 'published')
            .slice(0, 6);
        
        if (recentPosts.length === 0) {
            this.recentPostsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-feather-alt"></i>
                    <h3>No posts yet</h3>
                    <p>Create your first blog post to get started!</p>
                </div>
            `;
            return;
        }
        
        this.recentPostsContainer.innerHTML = recentPosts.map(post => `
            <div class="post-card" data-id="${post.id}">
                <div class="post-image">
                    ${post.featuredImage ? 
                        `<img src="${post.featuredImage}" alt="${post.title}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-newspaper\\'></i>';">` :
                        `<i class="fas fa-newspaper"></i>`
                    }
                </div>
                <div class="post-content">
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${post.excerpt || this.generateExcerpt(post.content)}</p>
                    <div class="post-meta">
                        <span class="post-category">${post.category}</span>
                        <span class="post-date">${this.formatDate(post.createdAt)}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click event to post cards
        this.recentPostsContainer.querySelectorAll('.post-card').forEach(card => {
            card.addEventListener('click', () => {
                const postId = card.dataset.id;
                this.showPostModal(postId);
            });
        });
    }

    loadAllPosts() {
        const posts = this.filterAndSortPosts();
        
        if (posts.length === 0) {
            this.allPostsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <h3>No posts found</h3>
                    <p>${this.posts.length === 0 ? 'Create your first blog post!' : 'Try changing your filters'}</p>
                </div>
            `;
            return;
        }
        
        this.allPostsContainer.innerHTML = posts.map(post => `
            <div class="post-card" data-id="${post.id}">
                <div class="post-image">
                    ${post.featuredImage ? 
                        `<img src="${post.featuredImage}" alt="${post.title}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-newspaper\\'></i>';">` :
                        `<i class="fas fa-newspaper"></i>`
                    }
                </div>
                <div class="post-content">
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${post.excerpt || this.generateExcerpt(post.content)}</p>
                    <div class="post-meta">
                        <div class="post-meta-left">
                            <span class="post-category">${post.category}</span>
                            <span class="post-date">${this.formatDate(post.createdAt)}</span>
                        </div>
                        <div class="post-meta-right">
                            <span class="post-status ${post.status}">${post.status}</span>
                            <span class="post-views"><i class="fas fa-eye"></i> ${post.views || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click event to post cards
        this.allPostsContainer.querySelectorAll('.post-card').forEach(card => {
            card.addEventListener('click', () => {
                const postId = card.dataset.id;
                this.showPostModal(postId);
            });
        });
    }

    filterAndSortPosts() {
        let filtered = [...this.posts];
        
        // Filter by search
        const searchTerm = this.postSearch.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(post => 
                post.title.toLowerCase().includes(searchTerm) ||
                (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm)) ||
                post.content.toLowerCase().includes(searchTerm) ||
                (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }
        
        // Filter by category
        const categoryFilter = this.categoryFilter.value;
        if (categoryFilter) {
            filtered = filtered.filter(post => post.category === categoryFilter);
        }
        
        // Sort
        const sortBy = this.sortPosts.value;
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'views':
                filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            case 'title':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }
        
        return filtered;
    }

    filterPosts() {
        this.loadAllPosts();
    }

    filterCategories() {
        const searchTerm = this.categorySearch.value.toLowerCase();
        const categoryItems = this.categoriesList.querySelectorAll('.category-item');
        
        categoryItems.forEach(item => {
            const categoryName = item.querySelector('.category-name').textContent.toLowerCase();
            item.style.display = categoryName.includes(searchTerm) ? 'flex' : 'none';
        });
    }

    loadTags() {
        // Calculate tag frequency
        const tagFrequency = {};
        this.posts.forEach(post => {
            if (post.tags) {
                post.tags.forEach(tag => {
                    tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
                });
            }
        });
        
        // Sort tags by frequency
        const sortedTags = Object.entries(tagFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20);
        
        // Render tags cloud
        this.tagsCloud.innerHTML = sortedTags.map(([tag, count]) => `
            <div class="tag-cloud-item" data-tag="${tag}">
                ${tag} <span class="tag-count">(${count})</span>
            </div>
        `).join('');
        
        // Add click event to tags
        this.tagsCloud.querySelectorAll('.tag-cloud-item').forEach(tagEl => {
            tagEl.addEventListener('click', () => {
                const tag = tagEl.dataset.tag;
                this.postSearch.value = tag;
                this.filterPosts();
                this.showPage('posts');
            });
        });
        
        // Update tag stats
        this.updateTagStats(sortedTags);
    }

    updateTagStats(tagData) {
        if (tagData.length === 0) {
            this.tagStatsContainer.innerHTML = '<p class="no-data">No tags yet</p>';
            return;
        }
        
        const totalTags = tagData.reduce((sum, [_, count]) => sum + count, 0);
        const maxCount = Math.max(...tagData.map(([_, count]) => count));
        
        this.tagStatsContainer.innerHTML = tagData.slice(0, 10).map(([tag, count]) => {
            const percentage = (count / maxCount) * 100;
            return `
                <div class="tag-stat-item">
                    <div class="tag-stat-info">
                        <span class="tag-stat-name">${tag}</span>
                        <span class="tag-stat-count">${count}</span>
                    </div>
                    <div class="tag-stat-bar">
                        <div class="tag-stat-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Dashboard & Stats
    updateDashboard() {
        const publishedPosts = this.posts.filter(post => post.status === 'published');
        const totalViews = publishedPosts.reduce((sum, post) => sum + (post.views || 0), 0);
        const categories = [...new Set(this.posts.map(post => post.category).filter(Boolean))];
        
        this.totalPostsEl.textContent = publishedPosts.length;
        this.totalViewsEl.textContent = totalViews.toLocaleString();
        this.totalCategoriesEl.textContent = categories.length;
        
        if (publishedPosts.length > 0) {
            const latestPost = publishedPosts.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            )[0];
            this.latestPostDateEl.textContent = this.formatDate(latestPost.createdAt, 'short');
        } else {
            this.latestPostDateEl.textContent = '-';
        }
        
        this.loadRecentPosts();
    }

    updateStats() {
        const publishedPosts = this.posts.filter(post => post.status === 'published');
        
        // Top Categories
        const categoryCounts = {};
        publishedPosts.forEach(post => {
            if (post.category) {
                categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
            }
        });
        
        const topCategories = Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        this.topCategories.innerHTML = topCategories.map(([category, count]) => `
            <div class="top-item">
                <span>${category}</span>
                <span class="top-count">${count} posts</span>
            </div>
        `).join('');
        
        // Popular Posts
        const popularPosts = [...publishedPosts]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);
        
        this.popularPosts.innerHTML = popularPosts.map(post => `
            <div class="top-item" data-id="${post.id}" style="cursor: pointer;">
                <span>${post.title.substring(0, 30)}${post.title.length > 30 ? '...' : ''}</span>
                <span class="top-count">${post.views || 0} views</span>
            </div>
        `).join('');
        
        // Add click event to popular posts
        this.popularPosts.querySelectorAll('.top-item').forEach(item => {
            item.addEventListener('click', () => {
                const postId = item.dataset.id;
                this.showPostModal(postId);
            });
        });
        
        // Metrics
        const totalWords = publishedPosts.reduce((sum, post) => sum + (post.wordCount || 0), 0);
        const avgWords = publishedPosts.length > 0 ? Math.round(totalWords / publishedPosts.length) : 0;
        
        // Posts per month
        const postsByMonth = {};
        publishedPosts.forEach(post => {
            const date = new Date(post.createdAt);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            postsByMonth[monthYear] = (postsByMonth[monthYear] || 0) + 1;
        });
        
        const avgPostsPerMonth = Object.keys(postsByMonth).length > 0 ? 
            Object.values(postsByMonth).reduce((sum, count) => sum + count, 0) / Object.keys(postsByMonth).length : 0;
        
        // Draft ratio
        const draftCount = this.posts.filter(post => post.status === 'draft').length;
        const draftRatio = this.posts.length > 0 ? Math.round((draftCount / this.posts.length) * 100) : 0;
        
        // Most active day
        const postsByDay = {};
        publishedPosts.forEach(post => {
            const date = new Date(post.createdAt);
            const day = date.toLocaleDateString('en-US', { weekday: 'long' });
            postsByDay[day] = (postsByDay[day] || 0) + 1;
        });
        
        let mostActiveDay = 'None';
        let maxPosts = 0;
        Object.entries(postsByDay).forEach(([day, count]) => {
            if (count > maxPosts) {
                maxPosts = count;
                mostActiveDay = day;
            }
        });
        
        // Update UI
        this.avgPostLength.textContent = `${avgWords.toLocaleString()} words`;
        this.postsPerMonth.textContent = avgPostsPerMonth.toFixed(1);
        this.draftRatio.textContent = `${draftRatio}%`;
        this.activeDay.textContent = mostActiveDay;
        
        // Update chart
        this.updateChart(postsByMonth);
    }

    initializeChart() {
        const ctx = document.getElementById('posts-chart');
        if (!ctx) return;
        
        ctx.getContext('2d');
        this.postsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Posts Published',
                    data: [],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    updateChart(postsByMonth) {
        if (!this.postsChart) {
            this.initializeChart();
            if (!this.postsChart) return;
        }
        
        const months = Object.keys(postsByMonth).sort();
        const counts = months.map(month => postsByMonth[month]);
        
        // Format month labels
        const formattedMonths = months.map(month => {
            const [year, monthNum] = month.split('-');
            const date = new Date(year, monthNum - 1);
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        });
        
        this.postsChart.data.labels = formattedMonths;
        this.postsChart.data.datasets[0].data = counts;
        this.postsChart.update();
    }

    // Modal Functions
    showPostModal(id) {
        const post = this.getPost(id);
        if (!post) return;
        
        // Increment views
        this.incrementViews(id);
        
        // Update modal content
        this.modalTitle.textContent = post.title;
        this.modalCategory.textContent = post.category;
        this.modalDate.textContent = this.formatDate(post.createdAt);
        this.modalViews.textContent = `${(post.views || 0) + 1} views`;
        this.modalContent.innerHTML = this.formatContent(post.content);
        this.modalTags.innerHTML = (post.tags || []).map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');
        
        this.modalEditBtn.dataset.id = id;
        this.modalDeleteBtn.dataset.id = id;
        
        // Highlight code
        this.highlightCode();
        
        // Show modal
        this.postModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    editModalPost() {
        const postId = this.modalEditBtn.dataset.id;
        this.closeModal();
        this.editPost(postId);
    }

    deleteModalPost() {
        const postId = this.modalDeleteBtn.dataset.id;
        this.showConfirmModal(
            'Are you sure you want to delete this post? This action cannot be undone.',
            () => {
                this.deletePost(postId);
                this.closeModal();
                this.closeConfirmModal();
            }
        );
    }

    showConfirmModal(message, callback) {
        document.getElementById('confirm-message').textContent = message;
        this.confirmModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        this.confirmCallback = callback;
    }

    confirmAction() {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
    }

    closeModal() {
        this.postModal.classList.remove('active');
        this.confirmModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    closeConfirmModal() {
        this.confirmModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.confirmCallback = null;
    }

    // Helper Functions
    generateExcerpt(content, length = 150) {
        const plainText = content.replace(/<[^>]*>/g, '');
        return plainText.length > length ? 
            plainText.substring(0, length) + '...' : 
            plainText;
    }

    countWords(text) {
        const plainText = text.replace(/<[^>]*>/g, ' ');
        const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
        return words.length;
    }

    formatDate(dateString, format = 'medium') {
        if (!dateString) return 'Unknown date';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (format === 'short') {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    }

    updatePostStats() {
        const wordCount = this.countWords(this.editorContent.innerHTML);
        this.postLengthEl.textContent = `${wordCount} words`;
        
        // Update date display
        const now = new Date();
        this.postDateEl.textContent = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    updateImagePreview() {
        const url = this.featuredImage.value;
        const preview = document.getElementById('image-preview');
        if (url) {
            preview.innerHTML = `<img src="${url}" alt="Preview" onerror="this.onerror=null; this.src='';">`;
        } else {
            preview.innerHTML = `
                <div class="image-placeholder">
                    <i class="fas fa-image"></i>
                    <span>No image selected</span>
                </div>
            `;
        }
    }

    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    saveData() {
        localStorage.setItem('blogPosts', JSON.stringify(this.posts));
        localStorage.setItem('blogCategories', JSON.stringify(this.categories));
        localStorage.setItem('blogTags', JSON.stringify(this.tags));
    }
}

// Initialize the BlogCMS when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const blogCMS = new BlogCMS();
    
    // Make blogCMS available globally for debugging
    window.blogCMS = blogCMS;
    
    // Initialize highlight.js
    hljs.highlightAll();
});
