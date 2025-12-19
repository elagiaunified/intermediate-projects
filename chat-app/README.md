# Real-time Chat App

A modern, feature-rich chat application built with vanilla JavaScript that simulates real-time communication using localStorage.

## 🚀 Live Demo

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Deployed-blue?style=for-the-badge&logo=github)](https://elagiaunified.github.io/intermediate-projects/chat-app/)

## Features

### Core Features
- **User Authentication**: Sign up and login with username/password
- **Real-time Messaging**: Instant message delivery simulation
- **Multiple Chat Rooms**: Create and join different chat rooms
- **Online Users List**: See who's currently online
- **Message History**: View past messages with timestamps
- **Typing Indicators**: Visual feedback when someone is typing
- **File Sharing**: Simulated file sharing with preview
- **Emoji Support**: Built-in emoji picker
- **Responsive Design**: Works on desktop and mobile devices
- **LocalStorage Persistence**: Messages saved locally in browser

### Additional Features
- **Demo Accounts**: Pre-configured accounts for testing
- **Search Functionality**: Search through messages and users
- **User Status**: Online/offline status indicators
- **Room Management**: Create public or private chat rooms
- **Message Reactions**: Add emoji reactions to messages
- **Welcome Tour**: Interactive tour for new users
- **Toast Notifications**: Visual feedback for user actions

## Tech Stack

- **HTML5**: Semantic markup structure
- **CSS3**: Modern UI with animations and gradients
- **JavaScript (ES6)**: Pure vanilla JS with no frameworks
- **LocalStorage**: Data persistence and simulated real-time
- **Font Awesome**: Icons for UI elements
- **Google Fonts**: Poppins font for typography

## How It Works

The app simulates real-time functionality using:

1. **setInterval**: Periodically checks for new messages
2. **localStorage**: Shared message store between browser tabs
3. **EventTarget**: Custom events for UI updates
4. **Date.now()**: Timestamps for message ordering

## Getting Started

### Installation

1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. No server or build process required!

### Usage

1. **Login**: Use demo accounts or create your own
   - Username: `john`, Password: `demo123`
   - Username: `jane`, Password: `demo123`

2. **Navigate**: Use the sidebar to switch between chat rooms

3. **Chat**: Type messages in the input box and press Enter to send

4. **Features**:
   - Click the smiley face to add emojis
   - Use the paperclip to attach files
   - Click user avatars to see status
   - Create new rooms with the plus button

## File Structure
```
chat-app/
├── index.html # Login/Register page
├── chat.html # Main chat interface
├── style.css # Shared styles (both pages)
├── script.js # Authentication & utilities
├── chat.js # Chat functionality
└── README.md # Documentation
```

## Browser Compatibility

Works best in modern browsers that support:
- ES6+ JavaScript features
- CSS Flexbox/Grid
- localStorage API
- CSS Custom Properties

## Limitations

Since this is a frontend-only application:
- No actual real-time communication (simulated)
- Data is stored locally per browser/device
- No user-to-user direct messaging
- File "sharing" is simulated (no actual upload)

## Future Enhancements

Potential features for future versions:
1. **IndexedDB Integration**: For larger message history storage
2. **Service Workers**: For offline capability
3. **WebSocket Integration**: For actual real-time communication
4. **User Profiles**: Custom avatars and bios
5. **Voice Messages**: Record and send audio
6. **Video Calls**: WebRTC integration
7. **End-to-End Encryption**: For message privacy

## License

This project is open source and available for educational purposes.

## Acknowledgments

- Icons by Font Awesome
- Google Fonts for typography
- EmojiOne for emoji support
- All contributors and testers
