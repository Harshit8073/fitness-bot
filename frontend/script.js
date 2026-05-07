document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatContainer = document.getElementById('chat-container');
    
    // Generate a random session ID for this conversation
    const sessionId = 'session_' + Math.random().toString(36).substring(2, 9);
    
    // Use local backend for development, and a relative or production URL for deployment
    const API_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
        ? 'http://127.0.0.1:5000/api/chat' 
        : 'https://fitness-bot-backend.onrender.com/api/chat'; // We will set this up later

    // Configure marked options
    marked.setOptions({
        breaks: true,
        gfm: true
    });

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        
        if (isUser) {
            contentDiv.textContent = content;
        } else {
            // Parse markdown for bot messages
            contentDiv.innerHTML = marked.parse(content);
        }

        messageDiv.appendChild(contentDiv);
        chatContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    function addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.classList.add('typing-indicator');
        indicator.id = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('typing-dot');
            indicator.appendChild(dot);
        }
        
        chatContainer.appendChild(indicator);
        scrollToBottom();
        return indicator;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = userInput.value.trim();
        if (!message) return;

        // Display user message
        addMessage(message, true);
        userInput.value = '';
        
        // Show loading indicator
        addTypingIndicator();

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    session_id: sessionId
                }),
            });

            const data = await response.json();
            
            removeTypingIndicator();
            
            if (response.ok) {
                addMessage(data.response, false);
            } else {
                addMessage("Sorry, I encountered an error. Please try again.", false);
                console.error('Server error:', data.error);
            }
        } catch (error) {
            removeTypingIndicator();
            addMessage("Network error. Please check if the backend server is running.", false);
            console.error('Fetch error:', error);
        }
    });
});
