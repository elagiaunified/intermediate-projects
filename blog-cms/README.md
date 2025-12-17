# 📝 DevBlog - Modern Blog/CMS System

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![LocalStorage](https://img.shields.io/badge/LocalStorage-000000?style=for-the-badge&logo=localstorage&logoColor=white)
![Markdown](https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white)

A fully-featured blog and content management system built with pure HTML, CSS, and JavaScript. No frameworks, no backend required - all data is stored locally in your browser.

## 🚀 Live Demo

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Deployed-blue?style=for-the-badge&logo=github)](https://elagiaunified.github.io/intermediate-projects/blog-cms/)

*Replace with your actual GitHub Pages URL*

## ✨ Features

### 📱 **Frontend Blog**
- **Modern Responsive Design** - Mobile-first, fully responsive layout
- **Featured Posts** - Highlight important content
- **Category Filtering** - Browse posts by category
- **Tag Cloud** - Visual tag navigation
- **Search Functionality** - Find posts by keywords
- **Trending Posts** - Most viewed articles
- **Markdown Support** - Beautiful code syntax highlighting
- **Dark/Light Mode** - User preference support

### ⚙️ **Admin Dashboard**
- **Dashboard Analytics** - Post statistics and traffic overview
- **Post Management** - Full CRUD operations for articles
- **Category Management** - Add, edit, delete categories
- **Tag Management** - Organize content with tags
- **Comment Moderation** - Manage user comments
- **Settings Panel** - Customize blog appearance
- **Backup & Restore** - Export/import all data
- **Responsive Admin UI** - Manage from any device

### ✍️ **Markdown Editor**
- **Live Preview** - See changes in real-time
- **Syntax Highlighting** - 180+ programming languages
- **Toolbar** - Quick formatting shortcuts
- **Word Count** - Track writing progress
- **Auto-save** - Never lose your work
- **Export Options** - Save as HTML or Markdown
- **Fullscreen Mode** - Distraction-free writing
- **Table of Contents** - Auto-generated from headings

### 🗂️ **Single Post View**
- **Beautiful Layout** - Clean, readable article design
- **Table of Contents** - Easy navigation for long posts
- **Social Sharing** - Share to Twitter, Facebook, LinkedIn
- **Related Posts** - Automatically suggests similar content
- **Comments System** - User engagement with LocalStorage
- **Reading Stats** - Time to read and view counts
- **Print Styles** - Clean printable version
- **SEO Optimized** - Open Graph and meta tags

## 📸 Screenshots

### Homepage
![Homepage Screenshot](https://via.placeholder.com/800x450/6366f1/ffffff?text=Blog+Homepage)

### Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/800x450/10b981/ffffff?text=Admin+Dashboard)

### Markdown Editor
![Markdown Editor](https://via.placeholder.com/800x450/f59e0b/ffffff?text=Markdown+Editor)

### Single Post View
![Single Post](https://via.placeholder.com/800x450/8b5cf6/ffffff?text=Single+Post+View)

## 🛠️ Installation

1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Visit `https://elagiaunified.github.io/intermediate-projects/blog-cms/`

## 📁 Project Structure

- blog-cms/
- ├── index.html              # Public blog homepage
- ├── admin.html              # Admin dashboard
- ├── editor.html             # Standalone markdown editor
- ├── post.html               # Single post view page
- ├── style.css               # Shared CSS styles (2800+ lines)
- ├── script.js               # Core database & utilities
- ├── blog.js                 # Public blog functionality
- ├── admin.js                # Admin dashboard functionality
- ├── editor.js               # Editor-specific functionality
- ├── README.md               # This documentation
- └── assets/                 # Optional: Images and assets

## 🔧 Usage Guide
1. Viewing the Blog
- Open index.html to see the public blog
- Browse posts by category or tag
- Use search to find specific articles
- Click on any post to read in detail

2. Admin Access
- Click "Admin" link in navigation
- No login required for demo (real implementation would add auth)
- Manage all content from the dashboard

3. Creating Posts
- Go to Admin → "New Post"
- Enter title, content, category, and tags
- Use markdown for formatting
- Preview in real-time
- Save as draft or publish immediately

4. Managing Content
- Posts: Edit, delete, feature posts
- Categories: Add color-coded categories
- Tags: Create and manage tags
- Comments: Moderate user comments
- Settings: Configure blog appearance

5. Using the Editor
- Open editor.html for standalone editing
- Write in markdown on the left
- See live preview on the right
- Use toolbar for quick formatting
- Auto-save every 30 seconds
- Export as HTML when done

## 💾 Data Persistence
All data is stored in browser's LocalStorage:

```javascript
// Data structure
{
  posts: [
    {
      id: "unique-id",
      title: "Post Title",
      slug: "post-url-slug",
      content: "Markdown content...",
      excerpt: "Brief summary...",
      category: "Web Development",
      tags: ["javascript", "tutorial"],
      author: "Admin",
      date: "2023-10-15",
      views: 1250,
      readTime: 5,
      published: true,
      featured: false
    }
  ],
  categories: ["Web Development", "JavaScript", "CSS"],
  tags: ["javascript", "css", "tutorial"],
  settings: {
    blogName: "DevBlog",
    blogDescription: "A modern blog system",
    postsPerPage: 6,
    theme: "light"
  }
}
```

## 🎨 Styling Features
CSS Architecture
- CSS Custom Properties for theming
- Mobile-First Responsive Design
- Flexbox & CSS Grid layouts
- CSS Animations & Transitions
- Print Styles for clean printing
- Dark Mode Support (automatic)

Color Palette
```css
:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --secondary: #10b981;
  --accent: #f59e0b;
  --danger: #ef4444;
  --dark: #1f2937;
  --light: #f9fafb;
}
```

## ⚡ Performance Optimizations
- No External Dependencies (except Font Awesome & highlight.js)
- LocalStorage Caching for fast loading
- Lazy Loading Images (implemented in production)
- Minimal HTTP Requests
- Efficient DOM Manipulation
- Debounced Search for better performance

## 📚 Markdown Support
The editor supports full GitHub-flavored markdown:

- markdown
- # Heading 1
- ## Heading 2
- ### Heading 3

- **Bold text**
- *Italic text*
- ~~Strikethrough~~

- - Bullet list
- 1. Numbered list

- [Link](https://example.com)
- ![Image](image.jpg)

- `inline code`

```javascript
// Code block
function hello() {
  console.log("Hello World!");
}
Blockquote
```

- Table	Header
- Cell	Data

## 🔌 API Integration Points

Ready for backend integration:

```javascript
// Example: Replace LocalStorage with API calls
class BlogAPI {
  async getPosts() {
    const response = await fetch('/api/posts');
    return await response.json();
  }
  
  async createPost(postData) {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });
    return await response.json();
  }
}
```

## 📄 License
- MIT License - see LICENSE file for details.

## 👥 Contributing
- Fork the repository
- Create a feature branch
- Commit your changes
- Push to the branch
- Open a Pull Request

## 🙏 Acknowledgements
- Font Awesome for icons
- Marked.js for markdown parsing
- Highlight.js for syntax highlighting
- Chart.js for admin charts
- Coolors.co for color palette inspiration
- All Contributors who helped improve this project

## 🎯 Roadmap
Planned Features
- User authentication system
- Image upload and management
- RSS feed generation
- Email newsletter integration
- Progressive Web App (PWA) support
- Multi-language support
- Advanced SEO tools
- Social media integration
- Analytics dashboard
- E-commerce integration

Version History
- v1.0.0 (Current): Complete Blog/CMS with all core features
- v0.5.0: Added admin dashboard and editor
- v0.3.0: Basic blog with categories and search
- v0.1.0: Initial prototype

## Browser Compatibility
- Chrome 60+ ✅
- Firefox 55+ ✅
- Safari 11+ ✅
- Edge 79+ ✅
- Opera 47+ ✅
- IE 11+ ⚠️ (Limited support)

## 🤝 Support
If you find this project helpful, please:
- ⭐ Star the repository
- 🐛 Report issues
- 💡 Suggest features
- 🔄 Fork and contribute

- Built with ❤️ for developers and content creators

## 📦 Complete Project Files Summary:
### ✅ All Files Created:
- index.html - Public blog homepage
- admin.html - Admin dashboard
- editor.html - Standalone markdown editor
- post.html - Single post view
- style.css - Complete styling (2800+ lines)
- script.js - Core database & utilities
- blog.js - Public blog functionality
- admin.js - Admin dashboard functionality
- editor.js - Editor functionality
- README.md - Complete documentation

## 🎯 Features Implemented:
#### Public Blog:
- ✅ Responsive grid layout
- ✅ Category & tag filtering
- ✅ Search functionality
- ✅ Featured posts
- ✅ Trending posts sidebar
- ✅ Markdown rendering with syntax highlighting

#### Admin Dashboard:
- ✅ Statistics dashboard
- ✅ Post management (CRUD)
- ✅ Category management
- ✅ Tag management
- ✅ Comment moderation
- ✅ Settings panel
- ✅ Backup & restore
- ✅ Traffic charts

#### Markdown Editor:
- ✅ Live preview
- ✅ Toolbar with formatting
- ✅ Auto-save
- ✅ Word count & reading time
- ✅ Fullscreen mode
- ✅ Export options
- ✅ Table of contents

#### Single Post View:
- ✅ Beautiful post layout
- ✅ Table of contents
- ✅ Social sharing
- ✅ Related posts
- ✅ Comments system
- ✅ Print styles
- ✅ SEO optimization

#### Technical Features:
- ✅ LocalStorage persistence
- ✅ No dependencies (except icons & markdown)
- ✅ Responsive design
- ✅ CSS animations
- ✅ Error handling
- ✅ Loading states
- ✅ Keyboard shortcuts
