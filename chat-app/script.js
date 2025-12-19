// ChatApp Core Database & Utilities
// This file contains shared functionality across all pages

// Chat Database - Stores all messages, users, and rooms
class ChatDatabase {
    constructor() {
        this.storageKey = 'chatAppData';
        this.initDatabase();
        this.broadcastChannel = new BroadcastChannel('chat_app_updates');
        this.setupBroadcastListener();
    }

    initDatabase() {
        // Initialize with sample data if empty
        if (!localStorage.getItem(this.storageKey)) {
            const sampleData = {
                users: this.getSampleUsers(),
                rooms: this.getSampleRooms(),
                messages: this.getSampleMessages(),
                settings: {
                    theme: 'light',
                    notifications: true,
                    sound: true,
                    fontSize: 'medium'
                }
            };
            this.saveData(sampleData);
        }
    }

    getSampleUsers() {
        return [
            {
                id: '1',
                username: 'alice',
                displayName: 'Alice Johnson',
                avatar: '👩‍💻',
                status: 'online',
                lastSeen: new Date().toISOString(),
                color: '#4f46e5',
                isGuest: false
            },
            {
                id: '2',
                username: 'bob',
                displayName: 'Bob Smith',
                avatar: '👨‍🎓',
                status: 'online',
                lastSeen: new Date().toISOString(),
                color: '#10b981',
                isGuest: false
            },
            {
                id: '3',
                username: 'charlie',
                displayName: 'Charlie Brown',
                avatar: '🤖',
                status: 'away',
                lastSeen: new Date(Date.now() - 300000).toISOString(),
                color: '#f59e0b',
                isGuest: false
            },
            {
                id: '4',
                username: 'diana',
                displayName: 'Diana Prince',
                avatar: '🦸‍♀️',
                status: 'offline',
                lastSeen: new Date(Date.now() - 3600000).toISOString(),
                color: '#8b5cf6',
                isGuest: false
            }
        ];
    }

    getSampleRooms() {
        return [
            {
                id: 'general',
                name: 'General',
                description: 'General discussions',
                type: 'public',
                members: ['1', '2', '3', '4'],
                createdAt: new Date().toISOString(),
                unreadCount: 0,
                lastMessage: null
            },
            {
                id: 'random',
                name: 'Random',
                description: 'Random conversations',
                type: 'public',
                members: ['1', '2'],
                createdAt: new Date().toISOString(),
                unreadCount: 0,
                lastMessage: null
            },
            {
                id: 'help',
                name: 'Help',
                description: 'Get help and ask questions',
                type: 'public',
                members: ['1', '3', '4'],
                createdAt: new Date().toISOString(),
                unreadCount: 0,
                lastMessage: null
            }
        ];
    }

    getSampleMessages() {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60000);
        
        return [
            {
                id: 'msg1',
                roomId: 'general',
                userId: '1',
                content: 'Hello everyone! 👋',
                timestamp: tenMinutesAgo.toISOString(),
                type: 'text',
                reactions: {},
                status: 'read'
            },
            {
                id: 'msg2',
                roomId: 'general',
                userId: '2',
                content: 'Hey Alice! How are you doing today?',
                timestamp: new Date(tenMinutesAgo.getTime() + 30000).toISOString(),
                type: 'text',
                reactions: { '👍': ['3'] },
                status: 'read'
            },
            {
                id: 'msg3',
                roomId: 'general',
                userId: '3',
                content: 'Good morning! Just joined the chat.',
                timestamp: new Date(tenMinutesAgo.getTime() + 60000).toISOString(),
                type: 'text',
                reactions: {},
                status: 'read'
            },
            {
                id: 'msg4',
                roomId: 'general',
                userId: 'system',
                content: 'Charlie set their status to Away',
                timestamp: new Date(fiveMinutesAgo.getTime() - 120000).toISOString(),
                type: 'system',
                reactions: {},
                status: 'read'
            },
            {
                id: 'msg5',
                roomId: 'random',
                userId: '1',
                content: 'Anyone watching the game tonight? 🏀',
                timestamp: fiveMinutesAgo.toISOString(),
                type: 'text',
                reactions: { '🏀': ['2'], '🔥': ['2', '4'] },
                status: 'read'
            },
            {
                id: 'msg6',
                roomId: 'random',
                userId: '2',
                content: 'Yeah! Lakers vs Celtics! Should be epic!',
                timestamp: new Date(fiveMinutesAgo.getTime() + 45000).toISOString(),
                type: 'text',
                reactions: {},
                status: 'read'
            }
        ];
    }

    // Data Management
    getData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : { users: [], rooms: [], messages: [], settings: {} };
    }

    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        // Broadcast update to other tabs
        this.broadcastChannel.postMessage({ type: 'data_updated' });
    }

    // User Operations
    getCurrentUser() {
        return JSON.parse(sessionStorage.getItem('chatAppCurrentUser'));
    }

    setCurrentUser(user) {
        sessionStorage.setItem('chatAppCurrentUser', JSON.stringify(user));
        this.broadcastChannel.postMessage({ type: 'user_updated', userId: user.id });
    }

    clearCurrentUser() {
        sessionStorage.removeItem('chatAppCurrentUser');
        this.broadcastChannel.postMessage({ type: 'user_logged_out' });
    }

    getUserById(id) {
        const data = this.getData();
        return data.users.find(user => user.id === id);
    }

    getUserByUsername(username) {
        const data = this.getData();
        return data.users.find(user => user.username === username);
    }

    createUser(userData) {
        const data = this.getData();
        const newUser = {
            id: Date.now().toString(),
            status: 'online',
            lastSeen: new Date().toISOString(),
            color: this.generateUserColor(),
            isGuest: false,
            ...userData
        };
        
        data.users.push(newUser);
        this.saveData(data);
        return newUser;
    }

    updateUserStatus(userId, status) {
        const data = this.getData();
        const user = data.users.find(u => u.id === userId);
        if (user) {
            user.status = status;
            user.lastSeen = new Date().toISOString();
            this.saveData(data);
            this.broadcastChannel.postMessage({ 
                type: 'status_changed', 
                userId, 
                status 
            });
        }
    }

    // Room Operations
    getAllRooms() {
        const data = this.getData();
        return data.rooms.sort((a, b) => 
            new Date(b.lastMessage?.timestamp || b.createdAt) - 
            new Date(a.lastMessage?.timestamp || a.createdAt)
        );
    }

    getRoomById(id) {
        const data = this.getData();
        return data.rooms.find(room => room.id === id);
    }

    getRoomMessages(roomId) {
        const data = this.getData();
        return data.messages
            .filter(msg => msg.roomId === roomId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    createRoom(roomData) {
        const data = this.getData();
        const newRoom = {
            id: this.generateRoomId(roomData.name),
            type: 'public',
            members: [],
            createdAt: new Date().toISOString(),
            unreadCount: 0,
            lastMessage: null,
            ...roomData
        };
        
        data.rooms.push(newRoom);
        this.saveData(data);
        
        this.broadcastChannel.postMessage({ 
            type: 'room_created', 
            room: newRoom 
        });
        
        return newRoom;
    }

    joinRoom(roomId, userId) {
        const data = this.getData();
        const room = data.rooms.find(r => r.id === roomId);
        if (room && !room.members.includes(userId)) {
            room.members.push(userId);
            this.saveData(data);
            
            this.broadcastChannel.postMessage({ 
                type: 'user_joined_room', 
                roomId, 
                userId 
            });
        }
    }

    // Message Operations
    sendMessage(messageData) {
        const data = this.getData();
        const newMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            status: 'sent',
            reactions: {},
            ...messageData
        };
        
        data.messages.push(newMessage);
        
        // Update room's last message
        const room = data.rooms.find(r => r.id === messageData.roomId);
        if (room) {
            room.lastMessage = {
                id: newMessage.id,
                content: newMessage.content,
                userId: newMessage.userId,
                timestamp: newMessage.timestamp
            };
            
            // Increment unread count for all room members except sender
            room.members.forEach(memberId => {
                if (memberId !== messageData.userId) {
                    room.unreadCount = (room.unreadCount || 0) + 1;
                }
            });
        }
        
        this.saveData(data);
        
        // Broadcast new message
        this.broadcastChannel.postMessage({ 
            type: 'new_message', 
            message: newMessage 
        });
        
        return newMessage;
    }

    updateMessageStatus(messageId, status) {
        const data = this.getData();
        const message = data.messages.find(msg => msg.id === messageId);
        if (message) {
            message.status = status;
            this.saveData(data);
        }
    }

    addReaction(messageId, userId, emoji) {
        const data = this.getData();
        const message = data.messages.find(msg => msg.id === messageId);
        if (message) {
            if (!message.reactions[emoji]) {
                message.reactions[emoji] = [];
            }
            
            if (!message.reactions[emoji].includes(userId)) {
                message.reactions[emoji].push(userId);
            } else {
                // Remove reaction if already exists
                message.reactions[emoji] = message.reactions[emoji].filter(id => id !== userId);
                if (message.reactions[emoji].length === 0) {
                    delete message.reactions[emoji];
                }
            }
            
            this.saveData(data);
            this.broadcastChannel.postMessage({ 
                type: 'reaction_added', 
                messageId, 
                userId, 
                emoji 
            });
        }
    }

    deleteMessage(messageId, userId) {
        const data = this.getData();
        const message = data.messages.find(msg => msg.id === messageId);
        if (message && message.userId === userId) {
            message.content = '[Message deleted]';
            message.type = 'deleted';
            this.saveData(data);
            
            this.broadcastChannel.postMessage({ 
                type: 'message_deleted', 
                messageId 
            });
        }
    }

    // Typing Indicators
    setTypingStatus(roomId, userId, isTyping) {
        this.broadcastChannel.postMessage({ 
            type: isTyping ? 'user_typing' : 'user_stopped_typing',
            roomId,
            userId
        });
    }

    // Settings Operations
    getSettings() {
        const data = this.getData();
        return data.settings;
    }

    updateSettings(newSettings) {
        const data = this.getData();
        data.settings = { ...data.settings, ...newSettings };
        this.saveData(data);
        
        this.broadcastChannel.postMessage({ 
            type: 'settings_updated', 
            settings: data.settings 
        });
    }

    // Helper Methods
    generateUserColor() {
        const colors = [
            '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#14b8a6'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    generateRoomId(name) {
        return name.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // If less than 1 minute
        if (diff < 60000) {
            return 'Just now';
        }
        
        // If less than 1 hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        }
        
        // If today
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        // If yesterday
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        
        // If same year
        if (date.getFullYear() === now.getFullYear()) {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
        
        // Otherwise
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }

    formatMessageTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    groupMessagesByDate(messages) {
        const groups = {};
        
        messages.forEach(message => {
            const date = new Date(message.timestamp).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
        });
        
        return groups;
    }

    // Broadcast Channel
    setupBroadcastListener() {
        this.broadcastChannel.addEventListener('message', (event) => {
            // This will be handled by individual pages
            if (typeof this.onBroadcastMessage === 'function') {
                this.onBroadcastMessage(event.data);
            }
        });
    }
}

// Chat Utilities
class ChatUtils {
    static initTheme() {
        const settings = new ChatDatabase().getSettings();
        const theme = settings.theme || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        
        // Save theme preference
        localStorage.setItem('chatAppTheme', theme);
    }

    static toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Update settings
        const db = new ChatDatabase();
        db.updateSettings({ theme: newTheme });
        
        return newTheme;
    }

    static createNotification(title, message, type = 'info') {
        // Check if notifications are enabled
        const settings = new ChatDatabase().getSettings();
        if (!settings.notifications) return;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle'
        };
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${icons[type] || icons.info}"></i>
            </div>
            <div class="notification-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Add close button event
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Play sound if enabled
        if (settings.sound) {
            this.playNotificationSound();
        }
        
        // Browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/favicon.ico'
            });
        }
    }

    static playNotificationSound() {
        const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQ='); // Silent audio
        audio.play().catch(() => {
            // Fallback to beep sound using Web Audio API
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
            
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.1);
        });
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

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static parseMessageContent(content) {
        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let parsed = content.replace(urlRegex, url => 
            `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
        );
        
        // Convert newlines to <br>
        parsed = parsed.replace(/\n/g, '<br>');
        
        // Convert emoji shortcodes
        parsed = this.convertEmojiShortcodes(parsed);
        
        return parsed;
    }

    static convertEmojiShortcodes(text) {
        const emojiMap = {
            ':)': '😊',
            ':(': '😞',
            ':D': '😃',
            ':P': '😛',
            ';)': '😉',
            ':\\': '😕',
            ':\'(': '😢',
            ':|': '😐',
            '<3': '❤️',
            '</3': '💔',
            ':*': '😘',
            '+1': '👍',
            '-1': '👎',
            'ok': '👌',
            'yay': '🎉',
            'lol': '😂',
            'rofl': '🤣',
            'omg': '😲',
            'wtf': '😳',
            'idk': '🤷',
            'brb': '⌛',
            'ttyl': '👋',
            'imo': '💭',
            'fyi': '📢',
            'nsfw': '🔞'
        };
        
        let parsed = text;
        Object.keys(emojiMap).forEach(shortcode => {
            const regex = new RegExp(`\\b${shortcode}\\b`, 'gi');
            parsed = parsed.replace(regex, emojiMap[shortcode]);
        });
        
        return parsed;
    }

    static generateAvatarInitials(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2);
    }

    static getRandomAvatar() {
        const avatars = [
            '👤', '😊', '🤖', '👩‍💻', '👨‍🎓', '🦄', '🐱', '🐶', '🦊', '🐼',
            '🐯', '🦁', '🐮', '🐷', '🐸', '🐙', '🦋', '🐝', '🐢', '🐬'
        ];
        return avatars[Math.floor(Math.random() * avatars.length)];
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static isValidImage(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!validTypes.includes(file.type)) {
            return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP.' };
        }
        
        if (file.size > maxSize) {
            return { valid: false, error: 'File too large. Maximum size is 5MB.' };
        }
        
        return { valid: true };
    }

    static async compressImage(file, maxWidth = 1024, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    let width = img.width;
                    let height = img.height;
                    
                    // Calculate new dimensions
                    if (width > maxWidth) {
                        height = (maxWidth / width) * height;
                        width = maxWidth;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob(
                        (blob) => resolve(blob),
                        file.type,
                        quality
                    );
                };
                
                img.onerror = reject;
            };
            
            reader.onerror = reject;
        });
    }

    static copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => this.createNotification('Copied!', 'Text copied to clipboard', 'success'))
            .catch(() => {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                this.createNotification('Copied!', 'Text copied to clipboard', 'success');
            });
    }

    static getConnectionStatus() {
        return navigator.onLine ? 'online' : 'offline';
    }

    static setupConnectionMonitor(callback) {
        window.addEventListener('online', () => callback('online'));
        window.addEventListener('offline', () => callback('offline'));
        
        return this.getConnectionStatus();
    }
}

// Initialize theme when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ChatUtils.initTheme();
    
    // Add global error handler
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        ChatUtils.createNotification('Error', 'Something went wrong. Please refresh the page.', 'error');
    });
    
    // Add unhandled rejection handler
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled rejection:', event.reason);
        ChatUtils.createNotification('Error', 'Something went wrong. Please try again.', 'error');
    });
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChatDatabase, ChatUtils };
}
