// Blog/CMS System - Core JavaScript
// This file contains shared functionality across all pages

// Blog Database - Stores all posts, categories, and tags
class BlogDatabase {
    constructor() {
        this.storageKey = 'devBlogData';
        this.initDatabase();
    }

    initDatabase() {
        // Initialize with sample data if empty
        if (!localStorage.getItem(this.storageKey)) {
            const sampleData = {
                posts: this.getSamplePosts(),
                categories: ['Web Development', 'JavaScript', 'CSS', 'HTML', 'Tutorials', 'Tips & Tricks'],
                tags: ['javascript', 'css', 'html', 'react', 'nodejs', 'tutorial', 'tips', 'webdev', 'frontend', 'backend'],
                settings: {
                    blogName: 'DevBlog',
                    blogDescription: 'A modern blog & CMS system',
                    featuredPostId: '1'
                }
            };
            this.saveData(sampleData);
        }
    }

    getSamplePosts() {
        return [
            {
                id: '1',
                title: 'Getting Started with Modern JavaScript',
                slug: 'getting-started-with-modern-javascript',
                excerpt: 'Learn the essential features of modern JavaScript ES6+ including arrow functions, destructuring, async/await, and more...',
                content: `# Getting Started with Modern JavaScript

JavaScript has evolved tremendously over the years. With the introduction of ES6 (ECMAScript 2015) and subsequent versions, we now have powerful features that make development more efficient and enjoyable.

## Key Features to Master

### 1. Arrow Functions
Arrow functions provide a concise syntax and lexical \`this\` binding:

\`\`\`javascript
// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// Arrow function with single parameter
const square = n => n * n;

// Arrow function with multiple lines
const processData = (data) => {
    const cleaned = data.trim();
    return cleaned.toUpperCase();
};
\`\`\`

### 2. Destructuring
Easily extract values from arrays or properties from objects:

\`\`\`javascript
// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];

// Object destructuring
const { name, age, city } = user;
const { name: userName, age: userAge } = user;

// Function parameter destructuring
function getUserInfo({ id, name, email }) {
    return \`\${name} (\${email})\`;
}
\`\`\`

### 3. Template Literals
Create strings with embedded expressions:

\`\`\`javascript
const name = 'John';
const age = 30;

// Traditional way
const message = 'Hello, ' + name + '. You are ' + age + ' years old.';

// With template literals
const message = \`Hello, \${name}. You are \${age} years old.\`;

// Multi-line strings
const html = \`
    <div class="user-card">
        <h2>\${name}</h2>
        <p>Age: \${age}</p>
    </div>
\`;
\`\`\`

### 4. Async/Await
Write asynchronous code that looks synchronous:

\`\`\`javascript
// Traditional promises
fetch('/api/data')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

// With async/await
async function fetchData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}
\`\`\`

## Best Practices

1. **Use const by default**, let when reassignment is needed
2. **Avoid var** - it has function scope and can lead to bugs
3. **Use descriptive variable names**
4. **Keep functions small and focused**
5. **Write pure functions when possible**

## Conclusion

Modern JavaScript provides tools that make development faster and more maintainable. Start incorporating these features into your projects today!

> **Pro Tip**: Use a linter like ESLint to enforce consistent coding standards.`,
                author: 'Admin',
                category: 'JavaScript',
                tags: ['javascript', 'es6', 'tutorial', 'webdev'],
                date: '2023-10-15',
                lastModified: '2023-10-15',
                published: true,
                views: 1250,
                readTime: 5,
                featured: true
            },
            {
                id: '2',
                title: 'Mastering CSS Grid Layout',
                slug: 'mastering-css-grid-layout',
                excerpt: 'Learn how to create complex layouts with CSS Grid, from basic grid concepts to advanced responsive patterns.',
                content: `# Mastering CSS Grid Layout

CSS Grid is a powerful layout system that allows you to create two-dimensional layouts with ease. Unlike Flexbox (which is one-dimensional), Grid lets you control both rows and columns simultaneously.

## Basic Grid Concepts

### Creating a Grid Container
\`\`\`css
.container {
    display: grid;
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: 100px auto 100px;
    gap: 20px;
}
\`\`\`

### Grid Lines and Areas
You can name grid lines and create named areas for easier placement:

\`\`\`css
.container {
    display: grid;
    grid-template-areas:
        "header header header"
        "sidebar content ads"
        "footer footer footer";
    grid-template-columns: 1fr 3fr 1fr;
    grid-template-rows: auto 1fr auto;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.ads { grid-area: ads; }
.footer { grid-area: footer; }
\`\`\`

## Responsive Grid Patterns

### Auto-fit and Minmax
Create responsive grids without media queries:

\`\`\`css
.responsive-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}
\`\`\`

### Masonry Layout with Grid
\`\`\`css
.masonry-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-auto-rows: 10px;
    gap: 10px;
}

.masonry-item {
    grid-row-end: span var(--row-span);
}
\`\`\`

## Practical Examples

### Holy Grail Layout
\`\`\`css
.holy-grail {
    display: grid;
    grid-template:
        "header header header" 80px
        "nav main aside" 1fr
        "footer footer footer" 60px
        / 200px 1fr 200px;
    min-height: 100vh;
}
\`\`\`

### Responsive Card Grid
\`\`\`css
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 30px;
    padding: 20px;
}

@media (max-width: 768px) {
    .card-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
}
\`\`\`

## Grid vs Flexbox

| Feature | CSS Grid | Flexbox |
|---------|----------|---------|
| Dimension | 2D (rows & columns) | 1D (row OR column) |
| Layout Type | Container-based | Content-based |
| Best For | Overall page layout | Component layout |
| Alignment | Both axes independently | Main axis only |

## Browser Support

CSS Grid is supported in all modern browsers. For older browsers, consider using feature queries:

\`\`\`css
@supports (display: grid) {
    .container {
        display: grid;
    }
}

@supports not (display: grid) {
    .container {
        display: flex;
    }
}
\`\`\`

## Conclusion

CSS Grid revolutionizes web layout. Start using it today for cleaner, more maintainable layouts!`,
                author: 'Admin',
                category: 'CSS',
                tags: ['css', 'grid', 'layout', 'responsive'],
                date: '2023-10-10',
                lastModified: '2023-10-12',
                published: true,
                views: 980,
                readTime: 4,
                featured: false
            },
            {
                id: '3',
                title: 'Building RESTful APIs with Node.js',
                slug: 'building-restful-apis-with-nodejs',
                excerpt: 'A comprehensive guide to creating robust RESTful APIs using Node.js, Express, and MongoDB.',
                content: `# Building RESTful APIs with Node.js

RESTful APIs are the backbone of modern web applications. In this guide, we'll build a complete API using Node.js, Express, and MongoDB.

## Project Setup

### Initialize Project
\`\`\`bash
mkdir my-api
cd my-api
npm init -y
npm install express mongoose dotenv cors
npm install -D nodemon
\`\`\`

### Basic Express Server
\`\`\`javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});
\`\`\`

## Creating Models

### User Model
\`\`\`javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
\`\`\`

## RESTful Routes

### CRUD Operations
\`\`\`javascript
// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single user
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create user
router.post('/', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update user
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE user
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
\`\`\`

## Authentication & Authorization

### JWT Authentication
\`\`\`javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied.' });
        }
        next();
    };
};

module.exports = { authenticate, authorize };
\`\`\`

## API Documentation with Swagger

### Swagger Setup
\`\`\`javascript
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'My API',
            version: '1.0.0',
            description: 'API Documentation'
        },
        servers: [
            {
                url: 'http://localhost:3000'
            }
        ]
    },
    apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
\`\`\`

## Testing with Jest

\`\`\`javascript
// tests/user.test.js
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('User API', () => {
    beforeEach(async () => {
        await User.deleteMany();
    });

    test('GET /api/users should return all users', async () => {
        const response = await request(app).get('/api/users');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });

    test('POST /api/users should create a new user', async () => {
        const userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };

        const response = await request(app)
            .post('/api/users')
            .send(userData);

        expect(response.statusCode).toBe(201);
        expect(response.body.username).toBe(userData.username);
    });
});
\`\`\`

## Deployment Considerations

1. **Environment Variables**: Use .env files
2. **Security**: Helmet.js for security headers
3. **Rate Limiting**: Express-rate-limit
4. **Logging**: Winston or Morgan
5. **Monitoring**: PM2 or Kubernetes

## Conclusion

Building RESTful APIs with Node.js is straightforward with the right tools and patterns. Focus on security, testing, and documentation for production-ready APIs.`,
                author: 'Admin',
                category: 'Web Development',
                tags: ['nodejs', 'api', 'rest', 'backend', 'mongodb'],
                date: '2023-10-05',
                lastModified: '2023-10-08',
                published: true,
                views: 2100,
                readTime: 8,
                featured: true
            }
        ];
    }

    // Data Management
    getData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : { posts: [], categories: [], tags: [], settings: {} };
    }

    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // Post Operations
    getAllPosts() {
        const data = this.getData();
        return data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getPublishedPosts() {
        return this.getAllPosts().filter(post => post.published);
    }

    getPostById(id) {
        const posts = this.getAllPosts();
        return posts.find(post => post.id === id);
    }

    getPostBySlug(slug) {
        const posts = this.getAllPosts();
        return posts.find(post => post.slug === slug);
    }

    createPost(postData) {
        const data = this.getData();
        const newPost = {
            id: Date.now().toString(),
            slug: this.generateSlug(postData.title),
            date: new Date().toISOString().split('T')[0],
            lastModified: new Date().toISOString().split('T')[0],
            views: 0,
            readTime: this.calculateReadTime(postData.content),
            published: true,
            featured: false,
            ...postData
        };
        
        data.posts.unshift(newPost);
        this.saveData(data);
        return newPost;
    }

    updatePost(id, postData) {
        const data = this.getData();
        const index = data.posts.findIndex(post => post.id === id);
        
        if (index !== -1) {
            data.posts[index] = {
                ...data.posts[index],
                ...postData,
                lastModified: new Date().toISOString().split('T')[0],
                readTime: this.calculateReadTime(postData.content || data.posts[index].content)
            };
            this.saveData(data);
            return data.posts[index];
        }
        return null;
    }

    deletePost(id) {
        const data = this.getData();
        const initialLength = data.posts.length;
        data.posts = data.posts.filter(post => post.id !== id);
        this.saveData(data);
        return data.posts.length !== initialLength;
    }

    incrementViews(id) {
        const post = this.getPostById(id);
        if (post) {
            post.views = (post.views || 0) + 1;
            this.updatePost(id, { views: post.views });
        }
    }

    // Category Operations
    getAllCategories() {
        const data = this.getData();
        return data.categories || [];
    }

    getPostsByCategory(category) {
        return this.getPublishedPosts().filter(post => 
            post.category.toLowerCase() === category.toLowerCase()
        );
    }

    // Tag Operations
    getAllTags() {
        const data = this.getData();
        return data.tags || [];
    }

    getPostsByTag(tag) {
        return this.getPublishedPosts().filter(post => 
            post.tags?.some(t => t.toLowerCase() === tag.toLowerCase())
        );
    }

    // Search Operations
    searchPosts(query) {
        const posts = this.getPublishedPosts();
        const searchTerms = query.toLowerCase().split(' ');
        
        return posts.filter(post => {
            const searchText = `
                ${post.title} 
                ${post.excerpt} 
                ${post.content} 
                ${post.category} 
                ${post.tags?.join(' ')} 
                ${post.author}
            `.toLowerCase();
            
            return searchTerms.every(term => searchText.includes(term));
        });
    }

    // Helper Methods
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
    }

    calculateReadTime(content) {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    getRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        
        return this.formatDate(dateString);
    }

    // Statistics
    getStats() {
        const posts = this.getAllPosts();
        const publishedPosts = this.getPublishedPosts();
        
        return {
            totalPosts: posts.length,
            publishedPosts: publishedPosts.length,
            totalCategories: this.getAllCategories().length,
            totalTags: this.getAllTags().length,
            totalViews: posts.reduce((sum, post) => sum + (post.views || 0), 0),
            averageReadTime: Math.round(
                posts.reduce((sum, post) => sum + (post.readTime || 0), 0) / posts.length
            ) || 0
        };
    }

    // Featured Post
    getFeaturedPost() {
        const data = this.getData();
        if (data.settings.featuredPostId) {
            return this.getPostById(data.settings.featuredPostId);
        }
        return this.getPublishedPosts().find(post => post.featured) || 
               this.getPublishedPosts()[0];
    }

    setFeaturedPost(id) {
        const data = this.getData();
        data.settings.featuredPostId = id;
        
        // Unfeature all other posts
        data.posts.forEach(post => {
            post.featured = post.id === id;
        });
        
        this.saveData(data);
    }
}

// Initialize Blog Database
const blogDB = new BlogDatabase();

// Utility Functions
class BlogUtils {
    static initMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                mobileMenuBtn.innerHTML = navLinks.classList.contains('active') 
                    ? '<i class="fas fa-times"></i>' 
                    : '<i class="fas fa-bars"></i>';
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    navLinks.classList.remove('active');
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        }
    }

    static initSearch() {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchInput && searchBtn) {
            const performSearch = () => {
                const query = searchInput.value.trim();
                if (query) {
                    // Store search query for blog.js to use
                    sessionStorage.setItem('blogSearchQuery', query);
                    window.location.href = 'index.html#search-results';
                }
            };
            
            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') performSearch();
            });
        }
    }

    static renderMarkdown(content) {
        // Configure marked options
        marked.setOptions({
            gfm: true,
            breaks: true,
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {
                        console.warn(`Failed to highlight code with language ${lang}:`, err);
                    }
                }
                return code;
            }
        });
        
        return marked.parse(content);
    }

    static createNotification(message, type = 'success') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        notification.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        
        // Add styles for notification
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                    color: var(--white);
                    padding: 1rem 1.5rem;
                    border-radius: var(--border-radius);
                    box-shadow: var(--shadow-xl);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    animation: slideIn 0.3s ease;
                    max-width: 400px;
                }
                
                .notification-success {
                    background: linear-gradient(135deg, var(--success), #059669);
                }
                
                .notification-error {
                    background: linear-gradient(135deg, var(--danger), #b91c1c);
                }
                
                .notification-warning {
                    background: linear-gradient(135deg, var(--warning), #d97706);
                }
                
                .notification-info {
                    background: linear-gradient(135deg, var(--info), #2563eb);
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes slideOut {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        return notification;
    }

    static formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    static getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    static setQueryParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    }
}

// Initialize common functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    BlogUtils.initMobileMenu();
    BlogUtils.initSearch();
    
    // Initialize Highlight.js
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { blogDB, BlogUtils };
}
