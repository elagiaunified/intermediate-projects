// Chat Application - Main JavaScript File

// DOM Elements
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const emojiBtn = document.getElementById('emojiBtn');
const emojiPicker = document.getElementById('emojiPicker');
const emojiGrid = document.getElementById('emojiGrid');
const closeEmoji = document.getElementById('closeEmoji');
const typingIndicator = document.getElementById('typingIndicator');
const typingUsers = document.getElementById('typingUsers');
const roomsList = document.getElementById('roomsList');
const usersList = document.getElementById('usersList');
const onlineCount = document.getElementById('onlineCount');
const currentRoom = document.getElementById('currentRoom');
const roomDescription = document.getElementById('roomDescription');
const membersCount = document.getElementById('membersCount');
const createRoomBtn = document.getElementById('createRoomBtn');
const createRoomModal = document.getElementById('createRoomModal');
const closeRoomModal = document.getElementById('closeRoomModal');
const cancelRoomBtn = document.getElementById('cancelRoomBtn');
const saveRoomBtn = document.getElementById('saveRoomBtn');
const roomName = document.getElementById('roomName');
const roomDesc = document.getElementById('roomDescription');
const attachBtn = document.getElementById('attachBtn');
const fileUploadModal = document.getElementById('fileUploadModal');
const closeFileModal = document.getElementById('closeFileModal');
const cancelUpload = document.getElementById('cancelUpload');
const sendFiles = document.getElementById('sendFiles');
const uploadZone = document.getElementById('uploadZone');
const browseFiles = document.getElementById('browseFiles');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const userMenuBtn = document.getElementById('userMenuBtn');
const userMenu = document.getElementById('userMenu');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');
const userStatus = document.getElementById('userStatus');
const userAvatar = document.getElementById('userAvatar');
const welcomeModal = document.getElementById('welcomeModal');
const welcomeUserName = document.getElementById('welcomeUserName');
const skipWelcome = document.getElementById('skipWelcome');
const startTour = document.getElementById('startTour');
const searchChat = document.getElementById('searchChat');

// Application State
let currentUser = null;
let currentRoomId = 'general';
let rooms = [];
let users = [];
let messages = [];
let typingUsersList = [];
let selectedFiles = [];
let isTyping = false;
let typingTimeout = null;
let emojiPickerVisible = false;
let messageCheckInterval = null;
let lastMessageId = null; // Track the last message ID to avoid duplicates

// Initialize the chat application
function initChat() {
    // Load current user from localStorage
    loadCurrentUser();
    
    // Initialize data
    initializeData();
    
    // Set up event listeners
    setupChatEventListeners();
    
    // Load initial room
    loadRoom(currentRoomId);
    
    // Start checking for new messages
    startMessageChecker();
    
    // Initialize emoji picker
    initEmojiPicker();
    
    // Show welcome modal for first-time users
    showWelcomeModal();
}

// Load current user from localStorage
function loadCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        updateUserUI();
    } else {
        // If no user is logged in, redirect to login page
        window.location.href = 'index.html';
    }
}

// Update user UI elements
function updateUserUI() {
    if (currentUser) {
        userName.textContent = currentUser.name || currentUser.username;
        welcomeUserName.textContent = currentUser.name || currentUser.username;
        
        // Set avatar initial
        const avatarText = userAvatar.querySelector('.avatar-text');
        avatarText.textContent = (currentUser.name || currentUser.username).charAt(0).toUpperCase();
        
        // Update user in users list
        updateUserStatus(currentUser.username, true);
    }
}

// Initialize application data
function initializeData() {
    // Load rooms from localStorage or create default ones
    rooms = JSON.parse(localStorage.getItem('chatRooms')) || createDefaultRooms();
    localStorage.setItem('chatRooms', JSON.stringify(rooms));
    
    // Load users from localStorage or create default ones
    users = JSON.parse(localStorage.getItem('chatUsers')) || [];
    
    // If no users exist, create some demo users
    if (users.length === 0) {
        users = createDemoUsers();
        localStorage.setItem('chatUsers', JSON.stringify(users));
    }
    
    // Update current user's online status
    updateUserStatus(currentUser.username, true);
    
    // Update users list UI
    updateUsersList();
    
    // Update rooms list UI
    updateRoomsList();
}

// Create default chat rooms
function createDefaultRooms() {
    return [
        {
            id: 'general',
            name: 'General',
            description: 'General discussion room',
            type: 'public',
            createdAt: new Date().toISOString(),
            members: [currentUser.username],
            unreadCount: 0
        },
        {
            id: 'random',
            name: 'Random',
            description: 'Random discussions and fun',
            type: 'public',
            createdAt: new Date().toISOString(),
            members: [currentUser.username],
            unreadCount: 0
        },
        {
            id: 'help',
            name: 'Help & Support',
            description: 'Get help with using the app',
            type: 'public',
            createdAt: new Date().toISOString(),
            members: [currentUser.username],
            unreadCount: 0
        },
        {
            id: 'tech',
            name: 'Technology',
            description: 'Discuss the latest in tech',
            type: 'public',
            createdAt: new Date().toISOString(),
            members: [currentUser.username],
            unreadCount: 0
        }
    ];
}

// Create demo users
function createDemoUsers() {
    return [
        {
            username: 'john',
            name: 'John Doe',
            email: 'john@example.com',
            joinedAt: new Date().toISOString(),
            isOnline: true,
            lastSeen: new Date().toISOString()
        },
        {
            username: 'jane',
            name: 'Jane Smith',
            email: 'jane@example.com',
            joinedAt: new Date().toISOString(),
            isOnline: false,
            lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
        },
        {
            username: 'alex',
            name: 'Alex Johnson',
            email: 'alex@example.com',
            joinedAt: new Date().toISOString(),
            isOnline: true,
            lastSeen: new Date().toISOString()
        },
        {
            username: 'sarah',
            name: 'Sarah Williams',
            email: 'sarah@example.com',
            joinedAt: new Date().toISOString(),
            isOnline: false,
            lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        }
    ];
}

// Update users list UI
function updateUsersList() {
    usersList.innerHTML = '';
    
    // Add current user first
    const currentUserItem = createUserItem(currentUser, true);
    usersList.appendChild(currentUserItem);
    
    // Add other users
    users.forEach(user => {
        if (user.username !== currentUser.username) {
            const userItem = createUserItem(user);
            usersList.appendChild(userItem);
        }
    });
    
    // Update online count
    const onlineUsers = users.filter(user => user.isOnline).length + 1; // +1 for current user
    onlineCount.textContent = onlineUsers;
}

// Create user list item
function createUserItem(user, isCurrentUser = false) {
    const div = document.createElement('div');
    div.className = 'user-item';
    
    const avatarText = (user.name || user.username).charAt(0).toUpperCase();
    const status = user.isOnline ? 'online' : 'offline';
    
    div.innerHTML = `
        <div class="user-avatar">
            <span class="avatar-text">${avatarText}</span>
            <span class="status-indicator ${status}"></span>
        </div>
        <div class="user-info">
            <h5>${isCurrentUser ? 'You' : user.name || user.username}</h5>
            <p class="user-status">${user.isOnline ? 'Online' : 'Last seen ' + formatTime(user.lastSeen)}</p>
        </div>
    `;
    
    return div;
}

// Update rooms list UI
function updateRoomsList() {
    roomsList.innerHTML = '';
    
    rooms.forEach(room => {
        const roomItem = createRoomItem(room);
        roomsList.appendChild(roomItem);
    });
}

// Create room list item
function createRoomItem(room) {
    const div = document.createElement('div');
    div.className = `room-item ${room.id === currentRoomId ? 'active' : ''}`;
    div.setAttribute('data-room', room.id);
    
    // Get last message for this room
    const roomMessages = getRoomMessages(room.id);
    const lastMessage = roomMessages.length > 0 ? roomMessages[roomMessages.length - 1] : null;
    
    div.innerHTML = `
        <div class="room-icon">
            <i class="fas fa-hashtag"></i>
        </div>
        <div class="room-info">
            <h5>${room.name}</h5>
            <p class="last-message">${lastMessage ? lastMessage.text.substring(0, 30) + (lastMessage.text.length > 30 ? '...' : '') : 'No messages yet'}</p>
        </div>
        <div class="room-meta">
            ${room.unreadCount > 0 ? `<span class="unread-count">${room.unreadCount}</span>` : ''}
            <span class="time">${lastMessage ? formatMessageTime(lastMessage.timestamp) : ''}</span>
        </div>
    `;
    
    // Add click event
    div.addEventListener('click', () => switchRoom(room.id));
    
    return div;
}

// Switch to a different room
function switchRoom(roomId) {
    if (roomId === currentRoomId) return;
    
    // Update current room
    currentRoomId = roomId;
    
    // Update room UI
    const room = rooms.find(r => r.id === roomId);
    if (room) {
        currentRoom.textContent = room.name;
        roomDescription.textContent = room.description;
        
        // Update members count
        const memberCount = room.members ? room.members.length : 1;
        membersCount.textContent = `${memberCount} ${memberCount === 1 ? 'member' : 'members'}`;
    }
    
    // Reset unread count for this room
    resetRoomUnreadCount(roomId);
    
    // Update rooms list UI
    updateRoomsList();
    
    // Load messages for this room
    loadRoom(roomId);
    
    // Show notification
    showToast(`Switched to ${room.name}`, 'info');
}

// Reset unread count for a room
function resetRoomUnreadCount(roomId) {
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    if (roomIndex !== -1) {
        rooms[roomIndex].unreadCount = 0;
        localStorage.setItem('chatRooms', JSON.stringify(rooms));
    }
}

// Load room messages
function loadRoom(roomId) {
    // Clear current messages
    messagesContainer.innerHTML = '';
    
    // Add day divider
    const dayDivider = document.createElement('div');
    dayDivider.className = 'message-day';
    dayDivider.innerHTML = `<span class="day-divider">Today</span>`;
    messagesContainer.appendChild(dayDivider);
    
    // Load messages from localStorage
    messages = getRoomMessages(roomId);
    
    // If no messages, add a welcome message
    if (messages.length === 0) {
        addSystemMessage(`Welcome to the ${roomId} room! Start the conversation.`);
    } else {
        // Display all messages
        messages.forEach(message => {
            addMessageToUI(message, false); // false = don't add to storage
        });
    }
    
    // Update last message ID
    if (messages.length > 0) {
        lastMessageId = messages[messages.length - 1].id;
    }
    
    // Scroll to bottom
    scrollToBottom();
}

// Get messages for a specific room
function getRoomMessages(roomId) {
    const allMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    return allMessages.filter(msg => msg.roomId === roomId);
}

// Add system message
function addSystemMessage(text) {
    const message = {
        id: generateId(),
        roomId: currentRoomId,
        sender: 'system',
        senderName: 'System',
        text: text,
        timestamp: new Date().toISOString(),
        type: 'system'
    };
    
    addMessageToStorage(message);
    addMessageToUI(message, false); // false = don't add to storage (already done)
}

// Add message to localStorage
function addMessageToStorage(message) {
    const allMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    allMessages.push(message);
    localStorage.setItem('chatMessages', JSON.stringify(allMessages));
    
    // Update last message ID
    lastMessageId = message.id;
}

// Add message to UI
function addMessageToUI(message, addToStorage = true) {
    // First, check if this message already exists in the UI
    const existingMessage = document.querySelector(`[data-message-id="${message.id}"]`);
    if (existingMessage) {
        return; // Message already displayed, don't add again
    }
    
    const messageElement = createMessageElement(message);
    messagesContainer.appendChild(messageElement);
    
    // Add to storage if requested
    if (addToStorage) {
        addMessageToStorage(message);
    }
    
    scrollToBottom();
}

// Create message element
function createMessageElement(message) {
    const isCurrentUser = message.sender === currentUser.username;
    const isSystem = message.type === 'system';
    
    if (isSystem) {
        const div = document.createElement('div');
        div.className = 'message system';
        div.innerHTML = `
            <div class="message-content">
                <div class="message-text">${message.text}</div>
            </div>
        `;
        return div;
    }
    
    const div = document.createElement('div');
    div.className = `message ${isCurrentUser ? 'sent' : 'received'}`;
    div.setAttribute('data-message-id', message.id);
    
    // Get sender info
    let senderName = message.senderName || message.sender;
    if (message.sender === currentUser.username) {
        senderName = 'You';
    }
    
    // Format message text
    let messageText = message.text;
    if (message.type === 'file') {
        messageText = `<i class="fas fa-paperclip"></i> ${message.fileName} (${formatFileSize(message.fileSize)})`;
    }
    
    div.innerHTML = `
        <div class="message-avatar">
            <span class="avatar-text">${senderName.charAt(0).toUpperCase()}</span>
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-sender">${senderName}</span>
                <span class="message-time">${formatMessageTime(message.timestamp)}</span>
            </div>
            <div class="message-text">${messageText}</div>
            ${message.reactions && message.reactions.length > 0 ? createReactionsHTML(message.reactions) : ''}
        </div>
    `;
    
    return div;
}

// Create reactions HTML
function createReactionsHTML(reactions) {
    let html = '<div class="message-reactions">';
    reactions.forEach(reaction => {
        html += `
            <div class="reaction" data-emoji="${reaction.emoji}">
                <span class="emoji">${reaction.emoji}</span>
                <span class="reaction-count">${reaction.count}</span>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

// Set up chat event listeners
function setupChatEventListeners() {
    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);
    
    // Send message on Enter key (Shift+Enter for new line)
    // Note: Since we're using emojionearea, we need to attach to the actual input
    const messageInputField = document.querySelector('.emojionearea-editor');
    if (messageInputField) {
        messageInputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
            
            // Show typing indicator
            if (!isTyping) {
                isTyping = true;
                updateTypingIndicator();
            }
            
            // Reset typing timeout
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                isTyping = false;
                updateTypingIndicator();
            }, 1000);
        });
    }
    
    // Emoji picker
    emojiBtn.addEventListener('click', toggleEmojiPicker);
    closeEmoji.addEventListener('click', hideEmojiPicker);
    
    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
        if (emojiPickerVisible && !emojiPicker.contains(e.target) && !emojiBtn.contains(e.target)) {
            hideEmojiPicker();
        }
    });
    
    // Room creation
    createRoomBtn.addEventListener('click', showCreateRoomModal);
    closeRoomModal.addEventListener('click', hideCreateRoomModal);
    cancelRoomBtn.addEventListener('click', hideCreateRoomModal);
    saveRoomBtn.addEventListener('click', createNewRoom);
    
    // File upload
    attachBtn.addEventListener('click', showFileUploadModal);
    closeFileModal.addEventListener('click', hideFileUploadModal);
    cancelUpload.addEventListener('click', hideFileUploadModal);
    sendFiles.addEventListener('click', sendSelectedFiles);
    browseFiles.addEventListener('click', () => fileInput.click());
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop for files
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        handleFileDrop(e.dataTransfer.files);
    });
    
    // User menu
    userMenuBtn.addEventListener('click', toggleUserMenu);
    
    // Logout
    logoutBtn.addEventListener('click', logout);
    
    // Welcome modal
    skipWelcome.addEventListener('click', hideWelcomeModal);
    startTour.addEventListener('click', startQuickTour);
    
    // Search chat
    searchChat.addEventListener('input', searchMessages);
    
    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideCreateRoomModal();
            hideFileUploadModal();
            hideEmojiPicker();
            hideUserMenu();
        }
    });
    
    // Initialize emojionearea
    $(document).ready(function() {
        if ($('#messageInput').length) {
            $('#messageInput').emojioneArea({
                pickerPosition: 'top',
                tonesStyle: 'bullet',
                events: {
                    keyup: function() {
                        // Show typing indicator
                        if (!isTyping) {
                            isTyping = true;
                            updateTypingIndicator();
                        }
                        
                        // Reset typing timeout
                        clearTimeout(typingTimeout);
                        typingTimeout = setTimeout(() => {
                            isTyping = false;
                            updateTypingIndicator();
                        }, 1000);
                    }
                }
            });
        }
    });
}

// Send message
function sendMessage() {
    const emojioneArea = $('.emojionearea-editor');
    let text = '';
    
    if (emojioneArea.length) {
        text = emojioneArea[0].innerText.trim();
    } else {
        text = messageInput.innerText.trim();
    }
    
    if (!text && selectedFiles.length === 0) {
        showToast('Please enter a message or attach a file', 'error');
        return;
    }
    
    // Create message object for text
    if (text) {
        const message = {
            id: generateId(),
            roomId: currentRoomId,
            sender: currentUser.username,
            senderName: currentUser.name || currentUser.username,
            text: text,
            timestamp: new Date().toISOString(),
            type: 'text'
        };
        
        // Add message to UI (this will also add to storage)
        addMessageToUI(message);
        
        // Clear input
        if (emojioneArea.length) {
            emojioneArea[0].innerText = '';
        } else {
            messageInput.innerText = '';
        }
    }
    
    // Send files if any
    if (selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
            sendFileMessage(file);
        });
        selectedFiles = [];
        hideFileUploadModal();
    }
    
    // Scroll to bottom
    scrollToBottom();
    
    // Update rooms list to show last message
    updateRoomsList();
    
    // Simulate other users responding (only if we sent a text message)
    if (text) {
        simulateResponses();
    }
}

// Send file message
function sendFileMessage(file) {
    const message = {
        id: generateId(),
        roomId: currentRoomId,
        sender: currentUser.username,
        senderName: currentUser.name || currentUser.username,
        text: `Shared a file: ${file.name}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        timestamp: new Date().toISOString(),
        type: 'file'
    };
    
    addMessageToUI(message);
}

// Handle file selection
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFilesToSelection(files);
}

// Handle file drop
function handleFileDrop(files) {
    addFilesToSelection(Array.from(files));
}

// Add files to selection
function addFilesToSelection(files) {
    files.forEach(file => {
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showToast(`File ${file.name} is too large (max 10MB)`, 'error');
            return;
        }
        
        selectedFiles.push(file);
        addFileToList(file);
    });
    
    // Show file list
    fileList.classList.add('show');
    
    // Reset file input
    fileInput.value = '';
}

// Add file to file list UI
function addFileToList(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-list-item';
    fileItem.innerHTML = `
        <i class="fas fa-file"></i>
        <div class="file-list-info">
            <div class="file-list-name">${file.name}</div>
            <div class="file-list-size">${formatFileSize(file.size)}</div>
        </div>
        <button class="file-list-remove" data-file-name="${file.name}">&times;</button>
    `;
    
    fileList.appendChild(fileItem);
    
    // Add remove event
    const removeBtn = fileItem.querySelector('.file-list-remove');
    removeBtn.addEventListener('click', () => removeFileFromList(file.name));
}

// Remove file from selection
function removeFileFromList(fileName) {
    selectedFiles = selectedFiles.filter(file => file.name !== fileName);
    
    // Remove from UI
    const fileItem = document.querySelector(`[data-file-name="${fileName}"]`).closest('.file-list-item');
    fileItem.remove();
    
    // Hide file list if empty
    if (selectedFiles.length === 0) {
        fileList.classList.remove('show');
    }
}

// Send selected files
function sendSelectedFiles() {
    if (selectedFiles.length === 0) {
        showToast('No files selected', 'error');
        return;
    }
    
    selectedFiles.forEach(file => {
        sendFileMessage(file);
    });
    
    selectedFiles = [];
    fileList.innerHTML = '';
    fileList.classList.remove('show');
    hideFileUploadModal();
    
    // Scroll to bottom
    scrollToBottom();
    
    // Update rooms list
    updateRoomsList();
}

// Update typing indicator
function updateTypingIndicator() {
    if (isTyping) {
        // Add current user to typing list
        if (!typingUsersList.includes(currentUser.username)) {
            typingUsersList.push(currentUser.username);
        }
        
        // Update UI
        typingIndicator.classList.add('show');
        typingUsers.textContent = typingUsersList.length === 1 ? 'Someone is typing...' : `${typingUsersList.length} people are typing...`;
    } else {
        // Remove current user from typing list
        const index = typingUsersList.indexOf(currentUser.username);
        if (index !== -1) {
            typingUsersList.splice(index, 1);
        }
        
        // Update UI
        if (typingUsersList.length === 0) {
            typingIndicator.classList.remove('show');
        } else {
            typingUsers.textContent = typingUsersList.length === 1 ? 'Someone is typing...' : `${typingUsersList.length} people are typing...`;
        }
    }
}

// Initialize emoji picker
function initEmojiPicker() {
    const emojis = {
        people: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
        nature: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋'],
        food: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅'],
        activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷'],
        objects: ['⌚', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚'],
        symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️']
    };
    
    // Add emojis to grid
    for (const [category, emojiList] of Object.entries(emojis)) {
        emojiList.forEach(emoji => {
            const emojiItem = document.createElement('div');
            emojiItem.className = 'emoji-item';
            emojiItem.textContent = emoji;
            emojiItem.setAttribute('data-category', category);
            emojiItem.addEventListener('click', () => insertEmoji(emoji));
            emojiGrid.appendChild(emojiItem);
        });
    }
    
    // Category filter
    const categoryButtons = document.querySelectorAll('.emoji-category');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            
            // Update active button
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter emojis
            const emojiItems = emojiGrid.querySelectorAll('.emoji-item');
            emojiItems.forEach(item => {
                if (category === 'all' || item.getAttribute('data-category') === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Insert emoji into message input
function insertEmoji(emoji) {
    const emojioneArea = $('.emojionearea-editor');
    if (emojioneArea.length) {
        const editor = emojioneArea[0];
        const textNode = document.createTextNode(emoji);
        editor.appendChild(textNode);
        editor.focus();
    }
    
    // Hide emoji picker after selection
    hideEmojiPicker();
}

// Toggle emoji picker visibility
function toggleEmojiPicker() {
    if (emojiPickerVisible) {
        hideEmojiPicker();
    } else {
        showEmojiPicker();
    }
}

// Show emoji picker
function showEmojiPicker() {
    emojiPicker.classList.add('show');
    emojiPickerVisible = true;
}

// Hide emoji picker
function hideEmojiPicker() {
    emojiPicker.classList.remove('show');
    emojiPickerVisible = false;
}

// Show create room modal
function showCreateRoomModal() {
    createRoomModal.classList.add('show');
}

// Hide create room modal
function hideCreateRoomModal() {
    createRoomModal.classList.remove('show');
    roomName.value = '';
    roomDesc.value = '';
}

// Create new room
function createNewRoom() {
    const name = roomName.value.trim();
    const description = roomDesc.value.trim();
    const roomType = document.querySelector('input[name="roomType"]:checked').value;
    
    if (!name) {
        showToast('Please enter a room name', 'error');
        return;
    }
    
    // Create room object
    const room = {
        id: generateRoomId(name),
        name: name,
        description: description || 'No description',
        type: roomType,
        createdAt: new Date().toISOString(),
        members: [currentUser.username],
        unreadCount: 0
    };
    
    // Add to rooms array
    rooms.push(room);
    localStorage.setItem('chatRooms', JSON.stringify(rooms));
    
    // Update UI
    updateRoomsList();
    
    // Switch to new room
    switchRoom(room.id);
    
    // Hide modal
    hideCreateRoomModal();
    
    // Show success message
    showToast(`Room "${name}" created successfully!`, 'success');
}

// Show file upload modal
function showFileUploadModal() {
    fileUploadModal.classList.add('show');
}

// Hide file upload modal
function hideFileUploadModal() {
    fileUploadModal.classList.remove('show');
    selectedFiles = [];
    fileList.innerHTML = '';
    fileList.classList.remove('show');
}

// Toggle user menu
function toggleUserMenu() {
    userMenu.classList.toggle('show');
}

// Hide user menu
function hideUserMenu() {
    userMenu.classList.remove('show');
}

// Show welcome modal
function showWelcomeModal() {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
        welcomeModal.classList.add('show');
        localStorage.setItem('hasSeenWelcome', 'true');
    }
}

// Hide welcome modal
function hideWelcomeModal() {
    welcomeModal.classList.remove('show');
}

// Start quick tour
function startQuickTour() {
    hideWelcomeModal();
    showToast('Quick tour started! Look for the highlighted elements.', 'info');
    
    // Simple tour by highlighting elements
    const tourSteps = [
        { element: roomsList, text: 'This is where you can see and switch between chat rooms' },
        { element: usersList, text: 'Here you can see who is online and their status' },
        { element: document.querySelector('.emojionearea-editor'), text: 'Type your messages here and press Enter to send' },
        { element: emojiBtn, text: 'Click here to add emojis to your messages' },
        { element: attachBtn, text: 'Use this button to share files and images' }
    ];
    
    let step = 0;
    
    function showTourStep() {
        if (step >= tourSteps.length) {
            showToast('Tour completed! Happy chatting!', 'success');
            return;
        }
        
        const { element, text } = tourSteps[step];
        
        // Highlight element
        if (element) {
            element.style.boxShadow = '0 0 0 3px #6a11cb';
            element.style.transition = 'box-shadow 0.3s ease';
        }
        
        // Show tooltip
        showToast(text, 'info');
        
        // Remove highlight after delay
        setTimeout(() => {
            if (element) {
                element.style.boxShadow = '';
            }
            step++;
            showTourStep();
        }, 3000);
    }
    
    showTourStep();
}

// Search messages
function searchMessages() {
    const query = searchChat.value.toLowerCase().trim();
    
    if (!query) {
        // Reset to normal view
        loadRoom(currentRoomId);
        return;
    }
    
    // Filter messages
    const filteredMessages = messages.filter(msg => 
        msg.text.toLowerCase().includes(query) || 
        (msg.senderName && msg.senderName.toLowerCase().includes(query))
    );
    
    // Clear and display filtered messages
    messagesContainer.innerHTML = '';
    
    if (filteredMessages.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'message system';
        noResults.innerHTML = `
            <div class="message-content">
                <div class="message-text">No messages found for "${query}"</div>
            </div>
        `;
        messagesContainer.appendChild(noResults);
    } else {
        filteredMessages.forEach(message => {
            addMessageToUI(message, false); // Don't add to storage
        });
    }
}

// Start message checker (simulates real-time updates)
function startMessageChecker() {
    messageCheckInterval = setInterval(() => {
        // Check for new messages in the current room
        const allMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
        const currentRoomMessages = allMessages.filter(msg => msg.roomId === currentRoomId);
        
        // Find messages that are newer than our last known message
        let newMessages = [];
        if (lastMessageId) {
            // Find the index of the last message we know about
            const lastMessageIndex = currentRoomMessages.findIndex(msg => msg.id === lastMessageId);
            if (lastMessageIndex !== -1 && lastMessageIndex < currentRoomMessages.length - 1) {
                // Get all messages after the last one we know
                newMessages = currentRoomMessages.slice(lastMessageIndex + 1);
            }
        } else if (currentRoomMessages.length > 0) {
            // If we don't have a lastMessageId, check if we have any messages at all
            newMessages = currentRoomMessages.filter(msg => 
                !messages.some(existing => existing.id === msg.id)
            );
        }
        
        // Add new messages
        if (newMessages.length > 0) {
            newMessages.forEach(message => {
                // Check if message is already in UI
                const existingInUI = document.querySelector(`[data-message-id="${message.id}"]`);
                if (!existingInUI) {
                    messages.push(message);
                    addMessageToUI(message, false); // Don't add to storage (already there)
                }
            });
            
            // Update last message ID
            lastMessageId = currentRoomMessages[currentRoomMessages.length - 1].id;
            
            // Update rooms list to show new messages
            updateRoomsList();
        }
        
        // Check for messages in other rooms to update unread counts
        rooms.forEach(room => {
            if (room.id !== currentRoomId) {
                const roomMessages = allMessages.filter(msg => msg.roomId === room.id);
                if (roomMessages.length > 0) {
                    const lastRoomMessage = roomMessages[roomMessages.length - 1];
                    
                    // Check if this message is newer than what we've seen
                    const roomIndex = rooms.findIndex(r => r.id === room.id);
                    if (roomIndex !== -1) {
                        // Get room info to check last seen message
                        const roomData = rooms[roomIndex];
                        if (!roomData.lastMessageId || 
                            (lastRoomMessage.id !== roomData.lastMessageId && 
                             new Date(lastRoomMessage.timestamp) > new Date(roomData.lastMessageTime || 0))) {
                            
                            // Update unread count
                            rooms[roomIndex].unreadCount = (rooms[roomIndex].unreadCount || 0) + 1;
                            rooms[roomIndex].lastMessageId = lastRoomMessage.id;
                            rooms[roomIndex].lastMessageTime = lastRoomMessage.timestamp;
                        }
                    }
                }
            }
        });
        
        // Save updated rooms
        localStorage.setItem('chatRooms', JSON.stringify(rooms));
        
        // Update rooms list UI
        updateRoomsList();
        
        // Simulate other users' activity
        simulateUserActivity();
        
    }, 3000); // Check every 3 seconds
}

// Simulate user activity (typing, coming online/offline)
function simulateUserActivity() {
    // Randomly have users come online/offline
    if (Math.random() < 0.1) { // 10% chance
        const randomUser = users[Math.floor(Math.random() * users.length)];
        if (randomUser) {
            randomUser.isOnline = Math.random() < 0.7; // 70% chance to be online
            randomUser.lastSeen = new Date().toISOString();
            localStorage.setItem('chatUsers', JSON.stringify(users));
            updateUsersList();
        }
    }
    
    // Random typing indicators
    if (Math.random() < 0.15 && typingUsersList.length < 2) { // 15% chance
        const randomUser = users.find(u => u.isOnline && u.username !== currentUser.username);
        if (randomUser && !typingUsersList.includes(randomUser.username)) {
            typingUsersList.push(randomUser.username);
            updateTypingIndicator();
            
            // Clear after random time
            setTimeout(() => {
                const index = typingUsersList.indexOf(randomUser.username);
                if (index !== -1) {
                    typingUsersList.splice(index, 1);
                    updateTypingIndicator();
                }
            }, 1000 + Math.random() * 3000);
        }
    }
}

// Simulate responses from other users
function simulateResponses() {
    // Only respond in certain rooms and only 20% of the time
    if (!['general', 'random', 'tech'].includes(currentRoomId) || Math.random() > 0.2) return;
    
    const responses = [
        "That's interesting!",
        "I agree with you.",
        "Can you explain more about that?",
        "Thanks for sharing!",
        "I had a similar experience.",
        "What do others think about this?",
        "That's funny! 😄",
        "I'm not sure I understand.",
        "Great point!",
        "Has anyone else tried this?"
    ];
    
    // Random delay before response (1-4 seconds)
    setTimeout(() => {
        // Find a random online user (not current user)
        const onlineUsers = users.filter(u => u.isOnline && u.username !== currentUser.username);
        if (onlineUsers.length > 0) {
            const randomUser = onlineUsers[Math.floor(Math.random() * onlineUsers.length)];
            const response = responses[Math.floor(Math.random() * responses.length)];
            
            const message = {
                id: generateId(),
                roomId: currentRoomId,
                sender: randomUser.username,
                senderName: randomUser.name || randomUser.username,
                text: response,
                timestamp: new Date().toISOString(),
                type: 'text'
            };
            
            // Add message to storage and UI
            addMessageToStorage(message);
            addMessageToUI(message, false); // Don't add to storage (already done)
            
            // Scroll to bottom
            scrollToBottom();
            
            // Update rooms list
            updateRoomsList();
        }
    }, 1000 + Math.random() * 3000);
}

// Update user status
function updateUserStatus(username, isOnline) {
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex !== -1) {
        users[userIndex].isOnline = isOnline;
        users[userIndex].lastSeen = new Date().toISOString();
        localStorage.setItem('chatUsers', JSON.stringify(users));
        updateUsersList();
    }
}

// Logout user
function logout() {
    // Update user status to offline
    updateUserStatus(currentUser.username, false);
    
    // Clear current user
    localStorage.removeItem('currentUser');
    
    // Redirect to login page
    window.location.href = 'index.html';
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateRoomId(name) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

function formatMessageTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    // If more than 24 hours, show date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', initChat);
