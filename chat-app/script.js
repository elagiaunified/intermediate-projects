// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginContainer = document.querySelector('.login-form');
const registerContainer = document.querySelector('.register-form');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const toggleLoginPassword = document.getElementById('toggleLoginPassword');
const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const registerPassword = document.getElementById('registerPassword');
const confirmPassword = document.getElementById('confirmPassword');
const strengthBar = document.querySelector('.strength-bar');
const strengthValue = document.getElementById('strengthValue');
const toast = document.getElementById('toast');
const skipAuth = document.getElementById('skipAuth');
const sliderButtons = document.querySelectorAll('.slider-btn');
const previewSlides = document.querySelectorAll('.preview-slide');
const demoAccounts = [
    { username: 'john', password: 'demo123', name: 'John Doe' },
    { username: 'jane', password: 'demo123', name: 'Jane Smith' },
    { username: 'alex', password: 'demo123', name: 'Alex Johnson' }
];

// Initialize the app
function init() {
    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        showToast('Welcome back! Redirecting to chat...', 'success');
        setTimeout(() => {
            window.location.href = 'chat.html';
        }, 1500);
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Start the preview slider
    startPreviewSlider();
}

// Set up all event listeners
function setupEventListeners() {
    // Toggle between login and register forms
    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchToRegister();
    });
    
    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchToLogin();
    });
    
    // Password visibility toggles
    toggleLoginPassword.addEventListener('click', () => togglePasswordVisibility('loginPassword', toggleLoginPassword));
    toggleRegisterPassword.addEventListener('click', () => togglePasswordVisibility('registerPassword', toggleRegisterPassword));
    toggleConfirmPassword.addEventListener('click', () => togglePasswordVisibility('confirmPassword', toggleConfirmPassword));
    
    // Password strength checker
    registerPassword.addEventListener('input', checkPasswordStrength);
    
    // Form submissions
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    // Skip authentication for demo
    skipAuth.addEventListener('click', (e) => {
        e.preventDefault();
        skipToChat();
    });
    
    // Slider controls
    sliderButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const slideIndex = parseInt(btn.getAttribute('data-slide'));
            showSlide(slideIndex);
        });
    });
}

// Switch to register form
function switchToRegister() {
    loginContainer.classList.remove('active');
    registerContainer.classList.add('active');
    
    // Reset forms
    loginForm.reset();
    registerForm.reset();
    resetPasswordStrength();
    
    // Update slider to first slide
    showSlide(0);
}

// Switch to login form
function switchToLogin() {
    registerContainer.classList.remove('active');
    loginContainer.classList.add('active');
    
    // Reset forms
    registerForm.reset();
    resetPasswordStrength();
}

// Toggle password visibility
function togglePasswordVisibility(passwordFieldId, toggleBtn) {
    const passwordField = document.getElementById(passwordFieldId);
    const icon = toggleBtn.querySelector('i');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Check password strength
function checkPasswordStrength() {
    const password = registerPassword.value;
    let strength = 0;
    let strengthText = 'None';
    let strengthColor = '#ddd';
    
    // Check password length
    if (password.length >= 8) strength += 25;
    
    // Check for lowercase letters
    if (/[a-z]/.test(password)) strength += 25;
    
    // Check for uppercase letters
    if (/[A-Z]/.test(password)) strength += 25;
    
    // Check for numbers and special characters
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    
    // Determine strength level
    if (strength >= 80) {
        strengthText = 'Strong';
        strengthColor = '#4CAF50';
    } else if (strength >= 60) {
        strengthText = 'Good';
        strengthColor = '#8BC34A';
    } else if (strength >= 40) {
        strengthText = 'Fair';
        strengthColor = '#FFC107';
    } else if (strength >= 20) {
        strengthText = 'Weak';
        strengthColor = '#FF9800';
    } else if (password.length > 0) {
        strengthText = 'Very Weak';
        strengthColor = '#F44336';
    }
    
    // Update UI
    strengthBar.style.width = `${strength}%`;
    strengthBar.style.backgroundColor = strengthColor;
    strengthValue.textContent = strengthText;
    strengthValue.style.color = strengthColor;
}

// Reset password strength indicator
function resetPasswordStrength() {
    strengthBar.style.width = '0%';
    strengthBar.style.backgroundColor = '#ddd';
    strengthValue.textContent = 'None';
    strengthValue.style.color = '#666';
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Simple validation
    if (!username || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    // Check against demo accounts
    const user = demoAccounts.find(account => 
        account.username === username && account.password === password
    );
    
    if (user) {
        // Save user to localStorage
        const userData = {
            username: user.username,
            name: user.name,
            loggedInAt: new Date().toISOString(),
            rememberMe: rememberMe
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Also add to users list if not already there
        let users = JSON.parse(localStorage.getItem('chatUsers')) || [];
        const existingUser = users.find(u => u.username === user.username);
        
        if (!existingUser) {
            users.push({
                username: user.username,
                name: user.name,
                joinedAt: new Date().toISOString(),
                isOnline: true
            });
            localStorage.setItem('chatUsers', JSON.stringify(users));
        }
        
        showToast(`Welcome back, ${user.name}!`, 'success');
        
        // Redirect to chat page after a short delay
        setTimeout(() => {
            window.location.href = 'chat.html';
        }, 1500);
    } else {
        // Check if user exists in local storage (for registered users)
        let users = JSON.parse(localStorage.getItem('chatUsers')) || [];
        const existingUser = users.find(u => u.username === username);
        
        if (existingUser) {
            // In a real app, we would check password hash
            // For demo, we'll just accept any password for registered users
            const userData = {
                username: existingUser.username,
                name: existingUser.name,
                loggedInAt: new Date().toISOString(),
                rememberMe: rememberMe
            };
            
            localStorage.setItem('currentUser', JSON.stringify(userData));
            existingUser.isOnline = true;
            localStorage.setItem('chatUsers', JSON.stringify(users));
            
            showToast(`Welcome back, ${existingUser.name}!`, 'success');
            
            setTimeout(() => {
                window.location.href = 'chat.html';
            }, 1500);
        } else {
            showToast('Invalid username or password', 'error');
        }
    }
}

// Handle register form submission
function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPasswordValue = confirmPassword.value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validation
    if (!username || !email || !password || !confirmPasswordValue) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPasswordValue) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters long', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showToast('You must agree to the terms and conditions', 'error');
        return;
    }
    
    // Check if username already exists
    let users = JSON.parse(localStorage.getItem('chatUsers')) || [];
    const existingUser = users.find(user => user.username === username);
    
    if (existingUser) {
        showToast('Username already exists. Please choose another.', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        username: username,
        name: username, // For simplicity, using username as display name
        email: email,
        joinedAt: new Date().toISOString(),
        isOnline: true
    };
    
    users.push(newUser);
    localStorage.setItem('chatUsers', JSON.stringify(users));
    
    // Log the user in
    const userData = {
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        loggedInAt: new Date().toISOString(),
        rememberMe: false
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    showToast(`Account created successfully! Welcome, ${username}!`, 'success');
    
    // Redirect to chat page after a short delay
    setTimeout(() => {
        window.location.href = 'chat.html';
    }, 1500);
}

// Skip to chat without authentication (for demo)
function skipToChat() {
    // Create a demo user for skipping auth
    const demoUser = {
        username: 'guest',
        name: 'Guest User',
        loggedInAt: new Date().toISOString(),
        rememberMe: false,
        isGuest: true
    };
    
    localStorage.setItem('currentUser', JSON.stringify(demoUser));
    
    // Add guest to users list
    let users = JSON.parse(localStorage.getItem('chatUsers')) || [];
    const existingGuest = users.find(u => u.username === 'guest');
    
    if (!existingGuest) {
        users.push({
            username: 'guest',
            name: 'Guest User',
            joinedAt: new Date().toISOString(),
            isOnline: true,
            isGuest: true
        });
        localStorage.setItem('chatUsers', JSON.stringify(users));
    }
    
    showToast('Entering chat as guest...', 'success');
    
    setTimeout(() => {
        window.location.href = 'chat.html';
    }, 1000);
}

// Show toast notification
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Preview slider functionality
let currentSlide = 0;
let slideInterval;

function startPreviewSlider() {
    // Show first slide
    showSlide(0);
    
    // Auto-advance slides every 5 seconds
    slideInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % previewSlides.length;
        showSlide(currentSlide);
    }, 5000);
}

function showSlide(slideIndex) {
    // Update current slide
    currentSlide = slideIndex;
    
    // Update slides
    previewSlides.forEach((slide, index) => {
        if (index === slideIndex) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
    
    // Update slider buttons
    sliderButtons.forEach((btn, index) => {
        if (index === slideIndex) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Reset interval
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % previewSlides.length;
        showSlide(currentSlide);
    }, 5000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
