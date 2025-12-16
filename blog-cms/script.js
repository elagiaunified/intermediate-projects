// Blog CMS - Simple Working Version
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    if (!localStorage.getItem('blogPosts')) {
        localStorage.setItem('blogPosts', JSON.stringify([
            {
                id: '1',
                title: 'Welcome to BlogCMS',
                excerpt: 'A powerful client-side content management system',
                content: '<h2>Welcome to Your New Blog!</h2><p>This is a fully functional Blog/CMS system that runs entirely in your browser. All your data is stored locally using localStorage.</p><p>You can:</p><ul><li>Create rich text blog posts</li><li>Organize by categories and tags</li><li>View analytics and statistics</li><li>Manage all content in one place</li></ul>',
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
                content: '<h2>JavaScript Fundamentals</h2><p>JavaScript is a versatile programming language that powers the modern web.</p><h3>Variables</h3><p>Use let, const, and var to declare variables in JavaScript.</p><p>Start your JavaScript journey today!</p>',
                category: 'Programming',
                tags: ['javascript', 'webdev', 'tutorial'],
                featuredImage: '',
                status: 'published',
                views: 28,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                wordCount: 85
            }
        ]));
    }
    
    if (!localStorage.getItem('blogCategories')) {
        localStorage.setItem('blogCategories', JSON.stringify([
            'Technology', 'Programming', 'Web Development', 'Design', 'Tutorial', 'Personal', 'Welcome'
        ]));
    }
    
    if (!localStorage.getItem('blogTags')) {
        localStorage.setItem('blogTags', JSON.stringify([
            'javascript', 'webdev', 'tutorial', 'css', 'html', 'react', 'nodejs', 'welcome', 'blog'
        ]));
    }
    
    // State
    let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    let categories = JSON.parse(localStorage.getItem('blogCategories')) || [];
    let tags = JSON.parse(localStorage.getItem('blogTags')) || [];
    let currentPostId = null;
    let currentTags = [];
    
    // DOM Elements
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.getElementById('navToggle');
    const navLogo = document.getElementById('nav-home');
    
    // Home Page
    const totalPostsEl = document.getElementById('total-posts');
    const totalViewsEl = document.getElementById('total-views');
    const totalCategoriesEl = document.getElementById('total-categories');
    const latestPostDateEl = document.getElementById('latest-post-date');
    const recentPostsContainer = document.getElementById('recent-posts-container');
    
    // Posts Page
    const postSearch = document.getElementById('post-search');
    const categoryFilter = document.getElementById('category-filter');
    const sortPosts = document.getElementById('sort-posts');
    const allPostsContainer = document.getElementById('all-posts-container');
    
    // Editor
    const postTitle = document.getElementById('post-title');
    const postExcerpt = document.getElementById('post-excerpt');
    const postCategory = document.getElementById('post-category');
    const featuredImage = document.getElementById('featured-image');
    const editorContent = document.getElementById('editor-content');
    const editorPreview = document.getElementById('editor-preview');
    const imagePreview = document.getElementById('image-preview');
    const postDateEl = document.getElementById('post-date');
    const postViewsEl = document.getElementById('post-views');
    const postLengthEl = document.getElementById('post-length');
    const tagsContainer = document.getElementById('tags-container');
    const tagInput = document.getElementById('tag-input');
    const previewToggle = document.getElementById('preview-toggle');
    const saveDraftBtn = document.getElementById('save-draft');
    const publishBtn = document.getElementById('publish-post');
    const currentPostIdInput = document.getElementById('current-post-id');
    
    // Categories Page
    const categorySearch = document.getElementById('category-search');
    const categoriesList = document.getElementById('categories-list');
    const tagsCloud = document.getElementById('tags-cloud');
    const newCategoryInput = document.getElementById('new-category');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const addCategoryModalBtn = document.getElementById('add-category');
    
    // Stats Page
    const topCategories = document.getElementById('top-categories');
    const popularPosts = document.getElementById('popular-posts');
    const avgPostLength = document.getElementById('avg-post-length');
    const postsPerMonth = document.getElementById('posts-per-month');
    const draftRatio = document.getElementById('draft-ratio');
    const activeDay = document.getElementById('active-day');
    
    // Modals
    const postModal = document.getElementById('post-modal');
    const confirmModal = document.getElementById('confirm-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalDate = document.getElementById('modal-date');
    const modalViews = document.getElementById('modal-views');
    const modalContent = document.getElementById('modal-content');
    const modalTags = document.getElementById('modal-tags');
    const modalEditBtn = document.getElementById('modal-edit');
    const modalDeleteBtn = document.getElementById('modal-delete');
    const modalClose = document.querySelectorAll('.modal-close');
    const confirmCancel = document.getElementById('confirm-cancel');
    const confirmOk = document.getElementById('confirm-ok');
    const confirmMessage = document.getElementById('confirm-message');
    
    // Toolbar
    const toolbarButtons = document.querySelectorAll('.toolbar-btn');
    const insertCodeBtn = document.getElementById('insert-code');
    const insertImageBtn = document.getElementById('insert-image');
    const clearFormattingBtn = document.getElementById('clear-formatting');
    
    // Initialize
    init();
    
    function init() {
        setupNavigation();
        setupEditor();
        loadCategories();
        updateDashboard();
        loadRecentPosts();
        setupToolbar();
        setupModals();
        updatePostStats();
        
        // Set today's date in editor
        const now = new Date();
        postDateEl.textContent = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    // Navigation
    function setupNavigation() {
        // Navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                showPage(page);
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Close mobile menu
                document.querySelector('.nav-links').classList.remove('active');
            });
        });
        
        // Logo
        navLogo.addEventListener('click', (e) => {
            e.preventDefault();
            showPage('home');
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelector('.nav-link[data-page="home"]').classList.add('active');
        });
        
        // Mobile menu toggle
        navToggle.addEventListener('click', () => {
            document.querySelector('.nav-links').classList.toggle('active');
        });
        
        // Hero buttons
        document.querySelectorAll('.hero-actions a').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const page = btn.dataset.page;
                showPage(page);
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                document.querySelector(`.nav-link[data-page="${page}"]`).classList.add('active');
            });
        });
        
        // Footer links
        document.querySelectorAll('.footer-section a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                if (page) {
                    showPage(page);
                    
                    // Update active state
                    navLinks.forEach(l => l.classList.remove('active'));
                    document.querySelector(`.nav-link[data-page="${page}"]`).classList.add('active');
                }
            });
        });
    }
    
    function showPage(pageName) {
        // Hide all pages
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Show the requested page
        const pageElement = document.getElementById(`${pageName}-page`);
        if (pageElement) {
            pageElement.classList.add('active');
            
            // Load page-specific content
            switch(pageName) {
                case 'home':
                    updateDashboard();
                    loadRecentPosts();
                    break;
                case 'posts':
                    loadAllPosts();
                    break;
                case 'editor':
                    clearEditor();
                    break;
                case 'categories':
                    loadCategoriesList();
                    loadTagsCloud();
                    break;
                case 'stats':
                    updateStats();
                    break;
            }
        }
    }
    
    // Editor Functions
    function setupEditor() {
        // Tag input
        tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag(tagInput.value.trim());
                tagInput.value = '';
            }
        });
        
        // Add category modal button
        addCategoryModalBtn.addEventListener('click', () => {
            const category = prompt('Enter new category name:');
            if (category && !categories.includes(category)) {
                categories.push(category);
                saveData();
                loadCategories();
                showNotification('Category added successfully!', 'success');
            }
        });
        
        // Add category main button
        addCategoryBtn.addEventListener('click', () => {
            const category = newCategoryInput.value.trim();
            if (category && !categories.includes(category)) {
                categories.push(category);
                saveData();
                loadCategories();
                newCategoryInput.value = '';
                showNotification('Category added successfully!', 'success');
            }
        });
        
        // Editor content listener for word count
        editorContent.addEventListener('input', updatePostStats);
        postTitle.addEventListener('input', updatePostStats);
        
        // Featured image preview
        featuredImage.addEventListener('input', updateImagePreview);
        
        // Preview toggle
        previewToggle.addEventListener('click', togglePreview);
        
        // Save draft
        saveDraftBtn.addEventListener('click', () => savePost('draft'));
        
        // Publish
        publishBtn.addEventListener('click', () => savePost('published'));
    }
    
    function setupToolbar() {
        // Formatting buttons
        toolbarButtons.forEach(button => {
            if (button.dataset.command) {
                button.addEventListener('click', () => {
                    const command = button.dataset.command;
                    const value = button.dataset.value;
                    document.execCommand(command, false, value);
                    editorContent.focus();
                });
            }
        });
        
        // Code block
        insertCodeBtn.addEventListener('click', () => {
            const codeBlock = '<pre><code>// Your code here\nconsole.log("Hello World!");</code></pre><p></p>';
            document.execCommand('insertHTML', false, codeBlock);
            editorContent.focus();
        });
        
        // Insert image
        insertImageBtn.addEventListener('click', () => {
            const url = prompt('Enter image URL:');
            if (url) {
                const img = `<img src="${url}" alt="Image" style="max-width: 100%; border-radius: 8px; margin: 1rem 0;">`;
                document.execCommand('insertHTML', false, img);
            }
        });
        
        // Clear formatting
        clearFormattingBtn.addEventListener('click', () => {
            document.execCommand('removeFormat', false, null);
            document.execCommand('unlink', false, null);
        });
    }
    
    function togglePreview() {
        const isPreview = editorPreview.style.display !== 'none';
        
        if (isPreview) {
            editorPreview.style.display = 'none';
            editorContent.style.display = 'block';
            previewToggle.innerHTML = '<i class="fas fa-eye"></i> Preview';
        } else {
            editorPreview.innerHTML = editorContent.innerHTML;
            editorPreview.style.display = 'block';
            editorContent.style.display = 'none';
            previewToggle.innerHTML = '<i class="fas fa-edit"></i> Edit';
        }
    }
    
    function savePost(status) {
        const title = postTitle.value.trim();
        const excerpt = postExcerpt.value.trim();
        const content = editorContent.innerHTML;
        const category = postCategory.value;
        const featuredImg = featuredImage.value;
        
        if (!title) {
            showNotification('Please enter a post title', 'error');
            postTitle.focus();
            return;
        }
        
        if (!content || content === '<br>' || content === '<div><br></div>') {
            showNotification('Please enter some content', 'error');
            editorContent.focus();
            return;
        }
        
        const postData = {
            id: currentPostId || Date.now().toString(),
            title: title,
            excerpt: excerpt || generateExcerpt(content),
            content: content,
            category: category || 'Uncategorized',
            tags: currentTags,
            featuredImage: featuredImg,
            status: status,
            wordCount: countWords(content)
        };
        
        if (currentPostId) {
            // Update existing post
            const existingPost = posts.find(p => p.id === currentPostId);
            if (existingPost) {
                postData.views = existingPost.views;
                postData.createdAt = existingPost.createdAt;
                const index = posts.findIndex(p => p.id === currentPostId);
                posts[index] = postData;
            }
        } else {
            // Add new post
            postData.views = 0;
            postData.createdAt = new Date().toISOString();
            posts.unshift(postData);
        }
        
        saveData();
        
        if (status === 'published') {
            showNotification('Post published successfully!', 'success');
            clearEditor();
            showPage('posts');
        } else {
            showNotification('Draft saved successfully!', 'success');
        }
        
        updateDashboard();
        loadRecentPosts();
    }
    
    function clearEditor() {
        postTitle.value = '';
        postExcerpt.value = '';
        editorContent.innerHTML = '';
        featuredImage.value = '';
        currentTags = [];
        currentPostId = null;
        currentPostIdInput.value = '';
        renderTags();
        updateImagePreview();
        updatePostStats();
        publishBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publish';
        postCategory.value = '';
        
        // Set default status to draft
        document.querySelector('input[name="status"][value="draft"]').checked = true;
        
        // Focus on title
        setTimeout(() => postTitle.focus(), 100);
    }
    
    function editPost(id) {
        const post = posts.find(p => p.id === id);
        if (!post) return;
        
        currentPostId = id;
        currentPostIdInput.value = id;
        
        postTitle.value = post.title;
        postExcerpt.value = post.excerpt;
        editorContent.innerHTML = post.content;
        postCategory.value = post.category;
        featuredImage.value = post.featuredImage || '';
        currentTags = post.tags || [];
        
        renderTags();
        updateImagePreview();
        updatePostStats();
        
        showPage('editor');
        publishBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Update';
        
        // Set status
        document.querySelector(`input[name="status"][value="${post.status}"]`).checked = true;
    }
    
    // Tag Management
    function addTag(tag) {
        if (!tag || currentTags.includes(tag)) return;
        
        currentTags.push(tag);
        renderTags();
        
        // Add to global tags if new
        if (!tags.includes(tag)) {
            tags.push(tag);
            saveData();
        }
    }
    
    function removeTag(tag) {
        currentTags = currentTags.filter(t => t !== tag);
        renderTags();
    }
    
    function renderTags() {
        tagsContainer.innerHTML = '';
        currentTags.forEach(tag => {
            const tagEl = document.createElement('div');
            tagEl.className = 'tag';
            tagEl.innerHTML = `
                ${tag}
                <button class="tag-remove" data-tag="${tag}">&times;</button>
            `;
            tagsContainer.appendChild(tagEl);
        });
        
        // Add event listeners to remove buttons
        tagsContainer.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tag = e.target.dataset.tag;
                removeTag(tag);
            });
        });
    }
    
    // Category Management
    function loadCategories() {
        // Populate category selects
        postCategory.innerHTML = '<option value="">Select Category</option>';
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        
        categories.forEach(category => {
            const option1 = document.createElement('option');
            option1.value = category;
            option1.textContent = category;
            postCategory.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = category;
            option2.textContent = category;
            categoryFilter.appendChild(option2);
        });
    }
    
    function loadCategoriesList() {
        categoriesList.innerHTML = '';
        
        if (categories.length === 0) {
            categoriesList.innerHTML = '<p class="no-data">No categories yet</p>';
            return;
        }
        
        categories.forEach(category => {
            const categoryPosts = posts.filter(p => p.category === category).length;
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.innerHTML = `
                <div class="category-name">${category}</div>
                <div class="category-count">${categoryPosts} posts</div>
            `;
            categoriesList.appendChild(categoryItem);
        });
    }
    
    function loadTagsCloud() {
        // Calculate tag frequency
        const tagFrequency = {};
        posts.forEach(post => {
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
        if (sortedTags.length === 0) {
            tagsCloud.innerHTML = '<p class="no-data">No tags yet</p>';
            return;
        }
        
        tagsCloud.innerHTML = sortedTags.map(([tag, count]) => `
            <div class="tag-cloud-item" data-tag="${tag}">
                ${tag} <span class="tag-count">(${count})</span>
            </div>
        `).join('');
        
        // Add click event to tags
        tagsCloud.querySelectorAll('.tag-cloud-item').forEach(tagEl => {
            tagEl.addEventListener('click', () => {
                const tag = tagEl.dataset.tag;
                postSearch.value = tag;
                showPage('posts');
                filterPosts();
            });
        });
    }
    
    // Post Display
    function loadRecentPosts() {
        const recentPosts = posts
            .filter(post => post.status === 'published')
            .slice(0, 6);
        
        if (recentPosts.length === 0) {
            recentPostsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-feather-alt"></i>
                    <h3>No posts yet</h3>
                    <p>Create your first blog post to get started!</p>
                </div>
            `;
            return;
        }
        
        recentPostsContainer.innerHTML = recentPosts.map(post => `
            <div class="post-card" data-id="${post.id}">
                <div class="post-image">
                    ${post.featuredImage ? 
                        `<img src="${post.featuredImage}" alt="${post.title}" onerror="this.style.display='none'">` :
                        `<i class="fas fa-newspaper"></i>`
                    }
                </div>
                <div class="post-content">
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${post.excerpt || generateExcerpt(post.content)}</p>
                    <div class="post-meta">
                        <div class="post-meta-left">
                            <span class="post-category">${post.category}</span>
                            <span class="post-date">${formatDate(post.createdAt)}</span>
                        </div>
                        <div class="post-meta-right">
                            <span class="post-status-badge ${post.status}">${post.status}</span>
                            <span class="post-views"><i class="fas fa-eye"></i> ${post.views}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click event to post cards
        recentPostsContainer.querySelectorAll('.post-card').forEach(card => {
            card.addEventListener('click', () => {
                const postId = card.dataset.id;
                showPostModal(postId);
            });
        });
    }
    
    function loadAllPosts() {
        const filteredPosts = filterAndSortPosts();
        
        if (filteredPosts.length === 0) {
            allPostsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <h3>No posts found</h3>
                    <p>${posts.length === 0 ? 'Create your first blog post!' : 'Try changing your filters'}</p>
                </div>
            `;
            return;
        }
        
        allPostsContainer.innerHTML = filteredPosts.map(post => `
            <div class="post-card" data-id="${post.id}">
                <div class="post-image">
                    ${post.featuredImage ? 
                        `<img src="${post.featuredImage}" alt="${post.title}" onerror="this.style.display='none'">` :
                        `<i class="fas fa-newspaper"></i>`
                    }
                </div>
                <div class="post-content">
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${post.excerpt || generateExcerpt(post.content)}</p>
                    <div class="post-meta">
                        <div class="post-meta-left">
                            <span class="post-category">${post.category}</span>
                            <span class="post-date">${formatDate(post.createdAt)}</span>
                        </div>
                        <div class="post-meta-right">
                            <span class="post-status-badge ${post.status}">${post.status}</span>
                            <span class="post-views"><i class="fas fa-eye"></i> ${post.views}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click event to post cards
        allPostsContainer.querySelectorAll('.post-card').forEach(card => {
            card.addEventListener('click', () => {
                const postId = card.dataset.id;
                showPostModal(postId);
            });
        });
    }
    
    function filterAndSortPosts() {
        let filtered = [...posts];
        
        // Filter by search
        const searchTerm = postSearch.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(post => 
                post.title.toLowerCase().includes(searchTerm) ||
                (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm)) ||
                post.content.toLowerCase().includes(searchTerm) ||
                (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }
        
        // Filter by category
        const category = categoryFilter.value;
        if (category) {
            filtered = filtered.filter(post => post.category === category);
        }
        
        // Sort
        const sortBy = sortPosts.value;
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'views':
                filtered.sort((a, b) => b.views - a.views);
                break;
            case 'title':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }
        
        return filtered;
    }
    
    function filterPosts() {
        loadAllPosts();
    }
    
    // Event listeners for filtering
    postSearch.addEventListener('input', filterPosts);
    categoryFilter.addEventListener('change', filterPosts);
    sortPosts.addEventListener('change', filterPosts);
    
    // Dashboard
    function updateDashboard() {
        const publishedPosts = posts.filter(post => post.status === 'published');
        const totalViews = publishedPosts.reduce((sum, post) => sum + post.views, 0);
        const uniqueCategories = [...new Set(posts.map(post => post.category).filter(Boolean))];
        
        totalPostsEl.textContent = publishedPosts.length;
        totalViewsEl.textContent = totalViews.toLocaleString();
        totalCategoriesEl.textContent = uniqueCategories.length;
        
        if (publishedPosts.length > 0) {
            const latestPost = publishedPosts.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            )[0];
            latestPostDateEl.textContent = formatDate(latestPost.createdAt, 'short');
        } else {
            latestPostDateEl.textContent = '-';
        }
    }
    
    // Stats
    function updateStats() {
        const publishedPosts = posts.filter(post => post.status === 'published');
        
        // Top Categories
        const categoryCounts = {};
        publishedPosts.forEach(post => {
            if (post.category) {
                categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
            }
        });
        
        const topCategoriesList = Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        topCategories.innerHTML = topCategoriesList.map(([category, count]) => `
            <div class="top-item">
                <span>${category}</span>
                <span class="top-count">${count} posts</span>
            </div>
        `).join('');
        
        // Popular Posts
        const popularPostsList = [...publishedPosts]
            .sort((a, b) => b.views - a.views)
            .slice(0, 5);
        
        popularPosts.innerHTML = popularPostsList.map(post => `
            <div class="top-item" data-id="${post.id}" style="cursor: pointer;">
                <span>${post.title.substring(0, 30)}${post.title.length > 30 ? '...' : ''}</span>
                <span class="top-count">${post.views} views</span>
            </div>
        `).join('');
        
        // Add click event to popular posts
        popularPosts.querySelectorAll('.top-item').forEach(item => {
            item.addEventListener('click', () => {
                const postId = item.dataset.id;
                showPostModal(postId);
            });
        });
        
        // Metrics
        const totalWords = publishedPosts.reduce((sum, post) => sum + (post.wordCount || 0), 0);
        const avgWords = publishedPosts.length > 0 ? Math.round(totalWords / publishedPosts.length) : 0;
        
        // Draft ratio
        const draftCount = posts.filter(post => post.status === 'draft').length;
        const draftRatio = posts.length > 0 ? Math.round((draftCount / posts.length) * 100) : 0;
        
        // Update UI
        avgPostLength.textContent = `${avgWords} words`;
        postsPerMonth.textContent = '2.5'; // Simplified for demo
        draftRatio.textContent = `${draftRatio}%`;
        activeDay.textContent = 'Monday'; // Simplified for demo
    }
    
    // Modals
    function setupModals() {
        // Close buttons
        modalClose.forEach(btn => {
            btn.addEventListener('click', closeModal);
        });
        
        // Modal edit button
        modalEditBtn.addEventListener('click', () => {
            const postId = modalEditBtn.dataset.id;
            closeModal();
            editPost(postId);
        });
        
        // Modal delete button
        modalDeleteBtn.addEventListener('click', () => {
            const postId = modalDeleteBtn.dataset.id;
            showConfirmModal(
                'Are you sure you want to delete this post? This action cannot be undone.',
                () => {
                    deletePost(postId);
                    closeModal();
                    closeConfirmModal();
                }
            );
        });
        
        // Confirm modal buttons
        confirmCancel.addEventListener('click', closeConfirmModal);
        confirmOk.addEventListener('click', confirmAction);
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === postModal) closeModal();
            if (e.target === confirmModal) closeConfirmModal();
        });
    }
    
    let confirmCallback = null;
    
    function showPostModal(id) {
        const post = posts.find(p => p.id === id);
        if (!post) return;
        
        // Increment views
        post.views = (post.views || 0) + 1;
        saveData();
        
        // Update modal content
        modalTitle.textContent = post.title;
        modalCategory.textContent = post.category;
        modalDate.textContent = formatDate(post.createdAt);
        modalViews.textContent = `${post.views} views`;
        modalContent.innerHTML = post.content;
        modalTags.innerHTML = (post.tags || []).map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');
        
        modalEditBtn.dataset.id = id;
        modalDeleteBtn.dataset.id = id;
        
        // Show modal
        postModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function showConfirmModal(message, callback) {
        confirmMessage.textContent = message;
        confirmModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        confirmCallback = callback;
    }
    
    function confirmAction() {
        if (confirmCallback) {
            confirmCallback();
        }
    }
    
    function closeModal() {
        postModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    function closeConfirmModal() {
        confirmModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        confirmCallback = null;
    }
    
    function deletePost(id) {
        posts = posts.filter(post => post.id !== id);
        saveData();
        updateDashboard();
        loadRecentPosts();
        loadAllPosts();
        showNotification('Post deleted successfully!', 'success');
    }
    
    // Helper Functions
    function generateExcerpt(content, length = 150) {
        const plainText = content.replace(/<[^>]*>/g, '');
        return plainText.length > length ? 
            plainText.substring(0, length) + '...' : 
            plainText;
    }
    
    function countWords(text) {
        const plainText = text.replace(/<[^>]*>/g, ' ');
        const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
        return words.length;
    }
    
    function formatDate(dateString, format = 'medium') {
        if (!dateString) return 'Unknown date';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (format === 'short') {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        }
        
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    function updatePostStats() {
        const wordCount = countWords(editorContent.innerHTML);
        postLengthEl.textContent = `${wordCount} words`;
    }
    
    function updateImagePreview() {
        const url = featuredImage.value;
        if (url) {
            imagePreview.innerHTML = `<img src="${url}" alt="Preview" onerror="this.onerror=null; this.style.display='none';">`;
        } else {
            imagePreview.innerHTML = `
                <div class="image-placeholder">
                    <i class="fas fa-image"></i>
                    <span>No image selected</span>
                </div>
            `;
        }
    }
    
    function showNotification(message, type = 'success') {
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
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    function saveData() {
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        localStorage.setItem('blogCategories', JSON.stringify(categories));
        localStorage.setItem('blogTags', JSON.stringify(tags));
    }
});
