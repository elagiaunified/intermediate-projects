// Standalone Markdown Editor JavaScript
// Provides a full-featured markdown editor with live preview

class MarkdownEditor {
    constructor() {
        this.blogDB = blogDB;
        this.utils = BlogUtils;
        
        // Editor state
        this.currentPostId = null;
        this.isDirty = false;
        this.autoSaveInterval = null;
        this.lastSaveTime = null;
        this.isFullscreen = false;
        this.editorRatio = 0.5; // Default split ratio
        
        // DOM Elements
        this.editor = null;
        this.preview = null;
        this.splitter = null;
        this.wordCount = null;
        this.charCount = null;
        this.readingTime = null;
        
        // Form elements
        this.titleInput = null;
        this.slugInput = null;
        this.excerptInput = null;
        this.categorySelect = null;
        this.tagsContainer = null;
        this.tagsInput = null;
        this.featuredCheckbox = null;
        this.publishedCheckbox = null;
        this.authorInput = null;
        
        this.initialize();
    }

    initialize() {
        this.cacheDOM();
        this.setupEventListeners();
        this.setupAutoSave();
        this.loadCategories();
        this.loadExistingPost();
        this.updatePreview();
        this.updateWordCount();
        
        // Set initial title based on URL
        this.updateTitleFromURL();
        
        // Focus the editor
        setTimeout(() => {
            this.editor.focus();
        }, 100);
    }

    cacheDOM() {
        // Editor and preview
        this.editor = document.getElementById('markdown-editor');
        this.preview = document.getElementById('preview-content');
        this.splitter = document.getElementById('splitter');
        
        // Counters
        this.wordCount = document.getElementById('word-count');
        this.charCount = document.getElementById('char-count');
        this.readingTime = document.getElementById('reading-time');
        
        // Form inputs
        this.titleInput = document.getElementById('post-title');
        this.slugInput = document.getElementById('post-slug');
        this.excerptInput = document.getElementById('post-excerpt');
        this.categorySelect = document.getElementById('post-category');
        this.tagsContainer = document.getElementById('tags-container');
        this.tagsInput = document.getElementById('post-tags-input');
        this.featuredCheckbox = document.getElementById('post-featured');
        this.publishedCheckbox = document.getElementById('post-published');
        this.authorInput = document.getElementById('post-author');
        
        // Status elements
        this.statusBadge = document.getElementById('post-status-badge');
        this.lastSaveElement = document.getElementById('last-save');
        this.autosaveStatus = document.getElementById('autosave-status');
    }

    setupEventListeners() {
        // Editor input events
        this.editor.addEventListener('input', () => {
            this.isDirty = true;
            this.updatePreview();
            this.updateWordCount();
            this.updateReadingTime();
        });

        // Title and slug
        this.titleInput.addEventListener('input', () => {
            this.isDirty = true;
            this.updateSlugFromTitle();
            this.updateEditorTitle();
        });

        this.slugInput.addEventListener('focus', () => {
            this.slugInput.readOnly = false;
        });

        this.slugInput.addEventListener('blur', () => {
            this.slugInput.readOnly = true;
        });

        // Excerpt
        this.excerptInput.addEventListener('input', () => {
            this.isDirty = true;
        });

        // Category
        this.categorySelect.addEventListener('change', () => {
            this.isDirty = true;
        });

        // Tags
        this.tagsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                this.addTag(this.tagsInput.value.trim());
                this.tagsInput.value = '';
            }
        });

        this.tagsInput.addEventListener('blur', () => {
            if (this.tagsInput.value.trim()) {
                this.addTag(this.tagsInput.value.trim());
                this.tagsInput.value = '';
            }
        });

        // Checkboxes
        this.featuredCheckbox.addEventListener('change', () => {
            this.isDirty = true;
        });

        this.publishedCheckbox.addEventListener('change', () => {
            this.isDirty = true;
            this.updateStatusBadge();
        });

        // Toolbar buttons
        document.querySelectorAll('.toolbar-btn[data-format]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.applyFormat(btn.dataset.format);
            });
        });

        // Action buttons
        document.getElementById('save-draft').addEventListener('click', () => this.saveDraft());
        document.getElementById('publish-post').addEventListener('click', () => this.publishPost());
        document.getElementById('sidebar-save').addEventListener('click', () => this.savePost());
        document.getElementById('sidebar-preview').addEventListener('click', () => this.openPreview());
        document.getElementById('sidebar-clear').addEventListener('click', () => this.clearAll());
        document.getElementById('toggle-fullscreen').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('fullscreen-toggle').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('toggle-help').addEventListener('click', () => this.toggleHelp());
        document.getElementById('help-toggle').addEventListener('click', () => this.toggleHelp());

        // Splitter for resizing panes
        this.setupSplitter();

        // More actions menu
        this.setupMoreActions();

        // Before unload warning
        window.addEventListener('beforeunload', (e) => {
            if (this.isDirty) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        });
    }

    setupSplitter() {
        let isDragging = false;
        let startX = 0;
        let startWidth = 0;

        const editorPane = this.editor.parentElement;
        const previewPane = this.preview.parentElement;

        this.splitter.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startWidth = editorPane.offsetWidth;
            
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const delta = e.clientX - startX;
            const containerWidth = editorPane.parentElement.offsetWidth;
            const newWidth = Math.max(200, Math.min(containerWidth - 200, startWidth + delta));
            
            this.editorRatio = newWidth / containerWidth;
            editorPane.style.width = `${newWidth}px`;
            previewPane.style.width = `calc(100% - ${newWidth}px)`;
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            
            isDragging = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            
            // Save ratio to localStorage
            localStorage.setItem('editorSplitRatio', this.editorRatio);
        });

        // Load saved ratio
        const savedRatio = localStorage.getItem('editorSplitRatio');
        if (savedRatio) {
            this.editorRatio = parseFloat(savedRatio);
            const containerWidth = editorPane.parentElement.offsetWidth;
            const editorWidth = containerWidth * this.editorRatio;
            
            editorPane.style.width = `${editorWidth}px`;
            previewPane.style.width = `calc(100% - ${editorWidth}px)`;
        }
    }

    setupMoreActions() {
        const moreBtn = document.getElementById('more-actions');
        if (!moreBtn) return;

        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Create dropdown menu
            const dropdown = document.createElement('div');
            dropdown.className = 'dropdown-menu';
            dropdown.style.cssText = `
                position: absolute;
                top: 100%;
                right: 0;
                background: var(--white);
                border: 1px solid var(--gray-200);
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-lg);
                min-width: 200px;
                z-index: 1000;
                margin-top: 0.5rem;
            `;

            dropdown.innerHTML = `
                <div class="dropdown-item" data-action="export">
                    <i class="fas fa-download"></i> Export as HTML
                </div>
                <div class="dropdown-item" data-action="import">
                    <i class="fas fa-upload"></i> Import from File
                </div>
                <div class="dropdown-item" data-action="stats">
                    <i class="fas fa-chart-bar"></i> Writing Statistics
                </div>
                <div class="dropdown-item" data-action="print">
                    <i class="fas fa-print"></i> Print Post
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item" data-action="shortcuts">
                    <i class="fas fa-keyboard"></i> Keyboard Shortcuts
                </div>
            `;

            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .dropdown-item {
                    padding: 0.75rem 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--gray-700);
                    transition: background 0.2s;
                }
                
                .dropdown-item:hover {
                    background: var(--gray-50);
                }
                
                .dropdown-divider {
                    height: 1px;
                    background: var(--gray-200);
                    margin: 0.25rem 0;
                }
            `;
            document.head.appendChild(style);

            // Add event listeners
            dropdown.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', () => {
                    const action = item.dataset.action;
                    this.handleMoreAction(action);
                    dropdown.remove();
                    style.remove();
                });
            });

            // Add to DOM
            moreBtn.parentElement.appendChild(dropdown);

            // Close on click outside
            const closeDropdown = (e) => {
                if (!dropdown.contains(e.target) && !moreBtn.contains(e.target)) {
                    dropdown.remove();
                    style.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            };

            setTimeout(() => {
                document.addEventListener('click', closeDropdown);
            }, 0);
        });
    }

    handleMoreAction(action) {
        switch(action) {
            case 'export':
                this.exportAsHTML();
                break;
            case 'import':
                this.importFromFile();
                break;
            case 'stats':
                this.showWritingStats();
                break;
            case 'print':
                window.print();
                break;
            case 'shortcuts':
                this.showKeyboardShortcuts();
                break;
        }
    }

    loadCategories() {
        const categories = this.blogDB.getAllCategories();
        this.categorySelect.innerHTML = '<option value="">Select a category</option>' +
            categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }

    loadExistingPost() {
        // Check if we're editing an existing post
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('edit');
        const postSlug = urlParams.get('slug');
        
        let post = null;
        
        if (postId) {
            post = this.blogDB.getPostById(postId);
        } else if (postSlug) {
            post = this.blogDB.getPostBySlug(postSlug);
        }
        
        if (post) {
            this.currentPostId = post.id;
            
            // Load post data into form
            this.editor.value = post.content || '';
            this.titleInput.value = post.title || '';
            this.slugInput.value = post.slug || '';
            this.excerptInput.value = post.excerpt || '';
            this.authorInput.value = post.author || 'Admin';
            
            // Select category
            if (post.category) {
                this.categorySelect.value = post.category;
            }
            
            // Load tags
            if (post.tags && Array.isArray(post.tags)) {
                post.tags.forEach(tag => this.addTag(tag));
            }
            
            // Set checkboxes
            this.featuredCheckbox.checked = post.featured || false;
            this.publishedCheckbox.checked = post.published || false;
            
            // Update UI
            this.updateEditorTitle();
            this.updateStatusBadge();
            this.isDirty = false;
            
            this.utils.createNotification(`Loaded post: ${post.title}`, 'success');
        }
    }

    updateTitleFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const title = urlParams.get('title');
        
        if (title && !this.titleInput.value) {
            this.titleInput.value = decodeURIComponent(title);
            this.updateSlugFromTitle();
            this.updateEditorTitle();
        }
    }

    updateSlugFromTitle() {
        const title = this.titleInput.value.trim();
        if (title && (!this.slugInput.value || this.slugInput.value === 'auto-generated-slug')) {
            this.slugInput.value = this.blogDB.generateSlug(title);
        }
    }

    updateEditorTitle() {
        const title = this.titleInput.value.trim();
        const titleElement = document.getElementById('editor-title');
        
        if (title) {
            titleElement.textContent = title;
            document.title = `${title} - Editor | DevBlog`;
        } else {
            titleElement.textContent = this.currentPostId ? 'Edit Post' : 'New Post';
            document.title = 'Editor | DevBlog';
        }
    }

    updateStatusBadge() {
        const isPublished = this.publishedCheckbox.checked;
        
        this.statusBadge.textContent = isPublished ? 'Published' : 'Draft';
        this.statusBadge.className = `status-badge ${isPublished ? 'published' : 'draft'}`;
    }

    addTag(tagText) {
        if (!tagText) return;
        
        // Clean and validate tag
        const tag = tagText.toLowerCase().trim();
        if (!tag || tag.length > 50) return;
        
        // Check if tag already exists
        const existingTags = Array.from(this.tagsContainer.querySelectorAll('.tag-badge'))
            .map(badge => badge.dataset.tag);
        
        if (existingTags.includes(tag)) return;
        
        // Create tag badge
        const badge = document.createElement('span');
        badge.className = 'tag-badge';
        badge.dataset.tag = tag;
        badge.innerHTML = `
            ${tag}
            <span class="remove-tag">
                <i class="fas fa-times"></i>
            </span>
        `;
        
        // Add remove event
        badge.querySelector('.remove-tag').addEventListener('click', (e) => {
            e.stopPropagation();
            badge.remove();
            this.isDirty = true;
        });
        
        // Insert before input
        this.tagsContainer.insertBefore(badge, this.tagsInput);
        this.isDirty = true;
    }

    getTags() {
        return Array.from(this.tagsContainer.querySelectorAll('.tag-badge'))
            .map(badge => badge.dataset.tag);
    }

    updatePreview() {
        const content = this.editor.value;
        
        if (!content.trim()) {
            this.preview.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-paragraph fa-2x"></i>
                    <h3>Preview will appear here</h3>
                    <p>Start typing in the editor to see live preview</p>
                </div>
            `;
            return;
        }
        
        try {
            const html = this.utils.renderMarkdown(content);
            this.preview.innerHTML = html;
            
            // Highlight code blocks
            if (typeof hljs !== 'undefined') {
                hljs.highlightAll();
            }
        } catch (error) {
            this.preview.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error rendering preview</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    updateWordCount() {
        const text = this.editor.value;
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const characters = text.length;
        
        this.wordCount.textContent = words;
        this.charCount.textContent = characters;
        
        // Update document title with word count
        const title = this.titleInput.value.trim();
        if (title) {
            document.title = `${title} (${words} words) - Editor | DevBlog`;
        }
    }

    updateReadingTime() {
        const text = this.editor.value;
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const minutes = Math.ceil(words / 200); // 200 words per minute
        
        this.readingTime.textContent = `${minutes} min`;
    }

    applyFormat(format) {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const selectedText = this.editor.value.substring(start, end);
        
        let before = '';
        let after = '';
        let cursorOffset = 0;
        
        switch(format) {
            case 'h1':
                before = '# ';
                cursorOffset = 2;
                break;
            case 'h2':
                before = '## ';
                cursorOffset = 3;
                break;
            case 'h3':
                before = '### ';
                cursorOffset = 4;
                break;
            case 'bold':
                before = '**';
                after = '**';
                cursorOffset = 2;
                break;
            case 'italic':
                before = '*';
                after = '*';
                cursorOffset = 1;
                break;
            case 'strikethrough':
                before = '~~';
                after = '~~';
                cursorOffset = 2;
                break;
            case 'link':
                before = '[';
                after = '](url)';
                cursorOffset = 1;
                break;
            case 'image':
                before = '![';
                after = '](image-url)';
                cursorOffset = 2;
                break;
            case 'code':
                before = '`';
                after = '`';
                cursorOffset = 1;
                break;
            case 'codeblock':
                before = '```\n';
                after = '\n```';
                cursorOffset = 4;
                break;
            case 'list':
                before = '- ';
                cursorOffset = 2;
                break;
            case 'olist':
                before = '1. ';
                cursorOffset = 3;
                break;
            case 'checklist':
                before = '- [ ] ';
                cursorOffset = 6;
                break;
            case 'blockquote':
                before = '> ';
                cursorOffset = 2;
                break;
            case 'table':
                before = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n';
                cursorOffset = before.length;
                break;
            case 'hr':
                before = '\n---\n';
                cursorOffset = 4;
                break;
        }
        
        const newText = this.editor.value.substring(0, start) + 
                       before + selectedText + after + 
                       this.editor.value.substring(end);
        
        this.editor.value = newText;
        this.isDirty = true;
        
        // Update cursor position
        const newCursorPos = start + before.length + selectedText.length;
        this.editor.setSelectionRange(newCursorPos, newCursorPos);
        
        // Update preview and counts
        this.updatePreview();
        this.updateWordCount();
        this.updateReadingTime();
        
        // Refocus editor
        this.editor.focus();
    }

    setupAutoSave() {
        // Check for existing autosave
        this.loadAutoSave();
        
        // Set up interval for autosave
        this.autoSaveInterval = setInterval(() => {
            if (this.isDirty) {
                this.autoSave();
            }
        }, 30000); // Autosave every 30 seconds
    }

    loadAutoSave() {
        const autosaveKey = `devBlogAutosave_${this.currentPostId || 'new'}`;
        const autosave = localStorage.getItem(autosaveKey);
        
        if (autosave && !this.editor.value) {
            try {
                const data = JSON.parse(autosave);
                
                if (confirm('Found autosaved content. Load it?')) {
                    this.editor.value = data.content || '';
                    this.titleInput.value = data.title || '';
                    this.excerptInput.value = data.excerpt || '';
                    this.categorySelect.value = data.category || '';
                    this.publishedCheckbox.checked = data.published || false;
                    
                    // Load tags
                    if (data.tags && Array.isArray(data.tags)) {
                        data.tags.forEach(tag => this.addTag(tag));
                    }
                    
                    this.updatePreview();
                    this.updateWordCount();
                    this.updateEditorTitle();
                    this.updateStatusBadge();
                    
                    this.utils.createNotification('Autosaved content loaded', 'success');
                }
            } catch (error) {
                console.error('Error loading autosave:', error);
            }
        }
        
        // Update last save time
        this.updateLastSaveTime();
    }

    autoSave() {
        const data = {
            content: this.editor.value,
            title: this.titleInput.value,
            excerpt: this.excerptInput.value,
            category: this.categorySelect.value,
            tags: this.getTags(),
            published: this.publishedCheckbox.checked,
            timestamp: new Date().toISOString()
        };
        
        const autosaveKey = `devBlogAutosave_${this.currentPostId || 'new'}`;
        localStorage.setItem(autosaveKey, JSON.stringify(data));
        
        this.lastSaveTime = new Date();
        this.updateLastSaveTime();
        
        // Show brief notification
        this.autosaveStatus.innerHTML = `
            <i class="fas fa-check-circle text-success"></i> 
            Autosaved: <span id="last-save">Just now</span>
        `;
        
        setTimeout(() => {
            this.updateLastSaveTime();
        }, 2000);
    }

    updateLastSaveTime() {
        if (!this.lastSaveElement) return;
        
        if (this.lastSaveTime) {
            const now = new Date();
            const diff = Math.floor((now - this.lastSaveTime) / 1000);
            
            let text = '';
            if (diff < 60) {
                text = 'Just now';
            } else if (diff < 3600) {
                text = `${Math.floor(diff / 60)} minutes ago`;
            } else if (diff < 86400) {
                text = `${Math.floor(diff / 3600)} hours ago`;
            } else {
                text = this.lastSaveTime.toLocaleDateString();
            }
            
            this.lastSaveElement.textContent = text;
        } else {
            this.lastSaveElement.textContent = 'Never';
        }
    }

    validateForm() {
        const title = this.titleInput.value.trim();
        const content = this.editor.value.trim();
        const category = this.categorySelect.value;
        
        if (!title) {
            this.utils.createNotification('Please enter a post title', 'error');
            this.titleInput.focus();
            return false;
        }
        
        if (!content) {
            this.utils.createNotification('Please enter post content', 'error');
            this.editor.focus();
            return false;
        }
        
        if (!category) {
            this.utils.createNotification('Please select a category', 'error');
            this.categorySelect.focus();
            return false;
        }
        
        return true;
    }

    saveDraft() {
        this.publishedCheckbox.checked = false;
        this.savePost();
    }

    publishPost() {
        this.publishedCheckbox.checked = true;
        this.savePost();
    }

    savePost() {
        if (!this.validateForm()) return;
        
        const postData = {
            title: this.titleInput.value.trim(),
            slug: this.slugInput.value.trim() || this.blogDB.generateSlug(this.titleInput.value.trim()),
            content: this.editor.value,
            excerpt: this.excerptInput.value.trim(),
            category: this.categorySelect.value,
            tags: this.getTags(),
            author: this.authorInput.value.trim(),
            published: this.publishedCheckbox.checked,
            featured: this.featuredCheckbox.checked,
            date: new Date().toISOString().split('T')[0],
            readTime: Math.ceil(this.editor.value.split(/\s+/).length / 200)
        };
        
        let savedPost;
        
        if (this.currentPostId) {
            // Update existing post
            savedPost = this.blogDB.updatePost(this.currentPostId, postData);
            this.utils.createNotification('Post updated successfully!', 'success');
        } else {
            // Create new post
            savedPost = this.blogDB.createPost(postData);
            this.currentPostId = savedPost.id;
            this.utils.createNotification('Post saved successfully!', 'success');
        }
        
        // Clear autosave
        const autosaveKey = `devBlogAutosave_${this.currentPostId || 'new'}`;
        localStorage.removeItem(autosaveKey);
        
        // Update UI
        this.isDirty = false;
        this.lastSaveTime = new Date();
        this.updateLastSaveTime();
        this.updateStatusBadge();
        
        // Update URL if this is a new post
        if (!window.location.search.includes('edit=') && !window.location.search.includes('slug=')) {
            const newUrl = `${window.location.pathname}?edit=${this.currentPostId}`;
            window.history.pushState({}, '', newUrl);
        }
    }

    clearAll() {
        if (!confirm('Clear all content? This cannot be undone.')) {
            return;
        }
        
        this.editor.value = '';
        this.titleInput.value = '';
        this.slugInput.value = '';
        this.excerptInput.value = '';
        this.categorySelect.value = '';
        this.authorInput.value = 'Admin';
        this.featuredCheckbox.checked = false;
        this.publishedCheckbox.checked = true;
        
        // Clear tags
        this.tagsContainer.querySelectorAll('.tag-badge').forEach(badge => badge.remove());
        
        // Update UI
        this.currentPostId = null;
        this.isDirty = false;
        this.updatePreview();
        this.updateWordCount();
        this.updateEditorTitle();
        this.updateStatusBadge();
        
        // Clear URL
        window.history.pushState({}, '', window.location.pathname);
        
        this.utils.createNotification('Editor cleared', 'info');
    }

    openPreview() {
        if (!this.validateForm()) return;
        
        // Create preview HTML
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${this.titleInput.value} - Preview</title>
                <link rel="stylesheet" href="style.css">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css">
                <style>
                    body { padding: 2rem; max-width: 800px; margin: 0 auto; }
                    .preview-header { text-align: center; margin-bottom: 3rem; }
                    .post-meta { color: var(--gray-500); margin-bottom: 2rem; }
                    .markdown-content { font-size: 1.125rem; line-height: 1.8; }
                </style>
            </head>
            <body>
                <div class="preview-header">
                    <h1>${this.titleInput.value}</h1>
                    <div class="post-meta">
                        <span><i class="far fa-user"></i> ${this.authorInput.value}</span> | 
                        <span><i class="far fa-calendar"></i> ${new Date().toLocaleDateString()}</span> | 
                        <span><i class="far fa-clock"></i> ${this.readingTime.textContent} read</span>
                    </div>
                    ${this.excerptInput.value ? `<p class="excerpt">${this.excerptInput.value}</p>` : ''}
                </div>
                <div class="markdown-content">
                    ${this.utils.renderMarkdown(this.editor.value)}
                </div>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
                <script>hljs.highlightAll();</script>
            </body>
            </html>
        `;
        
        // Open in new window
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
    }

    toggleFullscreen() {
        const editorPane = this.editor.parentElement.parentElement;
        
        if (!this.isFullscreen) {
            // Enter fullscreen
            editorPane.classList.add('fullscreen');
            document.body.style.overflow = 'hidden';
            this.isFullscreen = true;
            
            document.getElementById('toggle-fullscreen').innerHTML = '<i class="fas fa-compress"></i>';
            document.getElementById('fullscreen-toggle').innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            // Exit fullscreen
            editorPane.classList.remove('fullscreen');
            document.body.style.overflow = '';
            this.isFullscreen = false;
            
            document.getElementById('toggle-fullscreen').innerHTML = '<i class="fas fa-expand"></i>';
            document.getElementById('fullscreen-toggle').innerHTML = '<i class="fas fa-expand"></i>';
        }
    }

    toggleHelp() {
        const helpPanel = document.getElementById('markdown-help');
        const toggleBtn = document.getElementById('help-toggle');
        
        helpPanel.classList.toggle('active');
        
        if (helpPanel.classList.contains('active')) {
            toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        }
    }

    exportAsHTML() {
        const title = this.titleInput.value.trim() || 'Untitled Post';
        const content = this.editor.value;
        
        if (!content.trim()) {
            this.utils.createNotification('No content to export', 'warning');
            return;
        }
        
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        h1, h2, h3 { color: #2d3748; }
        pre {
            background: #1a202c;
            color: #e2e8f0;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
        }
        code { background: #edf2f7; padding: 0.2rem 0.4rem; border-radius: 0.25rem; }
        blockquote {
            border-left: 4px solid #4299e1;
            padding-left: 1rem;
            margin-left: 0;
            color: #4a5568;
            font-style: italic;
        }
        img { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #e2e8f0; padding: 0.5rem; }
        th { background: #f7fafc; }
    </style>
</head>
<body>
    ${this.utils.renderMarkdown(content)}
</body>
</html>`;
        
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.blogDB.generateSlug(title)}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.utils.createNotification('Post exported as HTML', 'success');
    }

    importFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.txt,.html';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    
                    // Try to extract title from first line
                    const lines = content.split('\n');
                    let title = '';
                    let markdownContent = content;
                    
                    if (lines[0].startsWith('# ')) {
                        title = lines[0].substring(2).trim();
                        markdownContent = lines.slice(1).join('\n');
                    }
                    
                    this.editor.value = markdownContent;
                    if (title && !this.titleInput.value) {
                        this.titleInput.value = title;
                        this.updateSlugFromTitle();
                        this.updateEditorTitle();
                    }
                    
                    this.updatePreview();
                    this.updateWordCount();
                    this.isDirty = true;
                    
                    this.utils.createNotification(`Imported: ${file.name}`, 'success');
                } catch (error) {
                    this.utils.createNotification('Error importing file', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    showWritingStats() {
        const text = this.editor.value;
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const characters = text.length;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
        const readingTime = Math.ceil(words / 200);
        
        const statsHTML = `
            <div class="stats-modal">
                <h3><i class="fas fa-chart-bar"></i> Writing Statistics</h3>
                <div class="stats-grid">
                    <div class="stat">
                        <div class="stat-value">${words}</div>
                        <div class="stat-label">Words</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${characters}</div>
                        <div class="stat-label">Characters</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${sentences}</div>
                        <div class="stat-label">Sentences</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${paragraphs}</div>
                        <div class="stat-label">Paragraphs</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${readingTime}</div>
                        <div class="stat-label">Minutes to read</div>
                    </div>
                </div>
                <p><small>Based on average reading speed of 200 words per minute.</small></p>
            </div>
        `;
        
        this.showModal('Writing Statistics', statsHTML);
    }

    showKeyboardShortcuts() {
        const shortcutsHTML = `
            <div class="shortcuts-modal">
                <h3><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h3>
                <table>
                    <tr><td><kbd>Ctrl</kbd> + <kbd>S</kbd></td><td>Save post</td></tr>
                    <tr><td><kbd>Ctrl</kbd> + <kbd>P</kbd></td><td>Publish post</td></tr>
                    <tr><td><kbd>Ctrl</kbd> + <kbd>B</kbd></td><td>Bold selected text</td></tr>
                    <tr><td><kbd>Ctrl</kbd> + <kbd>I</kbd></td><td>Italic selected text</td></tr>
                    <tr><td><kbd>Ctrl</kbd> + <kbd>K</kbd></td><td>Insert link</td></tr>
                    <tr><td><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd></td><td>Insert code block</td></tr>
                    <tr><td><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>H</kbd></td><td>Toggle help panel</td></tr>
                    <tr><td><kbd>Ctrl</kbd> + <kbd>F</kbd></td><td>Fullscreen editor</td></tr>
                    <tr><td><kbd>Ctrl</kbd> + <kbd>L</kbd></td><td>Clear editor</td></tr>
                </table>
            </div>
        `;
        
        this.showModal('Keyboard Shortcuts', shortcutsHTML);
    }

    showModal(title, content) {
        // Remove existing modal
        const existingModal = document.querySelector('.custom-modal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease;
        `;
        
        modal.innerHTML = `
            <div class="modal-dialog" style="
                background: var(--white);
                border-radius: var(--border-radius);
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: var(--shadow-xl);
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                ">
                    <h3 style="margin: 0;">${title}</h3>
                    <button class="modal-close" style="
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                        color: var(--gray-500);
                    ">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add close functionality
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Add keyboard shortcut to close
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
    }

    // Cleanup on destroy
    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }
}

// Initialize editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the editor page
    if (document.getElementById('markdown-editor')) {
        window.markdownEditor = new MarkdownEditor();
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when user is typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Save: Ctrl/Cmd + S
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                window.markdownEditor.savePost();
            }
            
            // Bold: Ctrl/Cmd + B
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                window.markdownEditor.applyFormat('bold');
            }
            
            // Italic: Ctrl/Cmd + I
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                window.markdownEditor.applyFormat('italic');
            }
            
            // Link: Ctrl/Cmd + K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                window.markdownEditor.applyFormat('link');
            }
            
            // Fullscreen: Ctrl/Cmd + F
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                window.markdownEditor.toggleFullscreen();
            }
            
            // Clear: Ctrl/Cmd + L
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                if (confirm('Clear editor?')) {
                    window.markdownEditor.clearAll();
                }
            }
            
            // Help: Ctrl/Cmd + Shift + H
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
                e.preventDefault();
                window.markdownEditor.toggleHelp();
            }
        });
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (window.markdownEditor) {
                window.markdownEditor.destroy();
            }
        });
    }
});
