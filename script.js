// Mental Health Companion - Frontend JavaScript
// Connects to Flask backend with audio support

class MentalHealthCompanion {
    constructor() {
        // API Configuration
        this.API_BASE = 'https://nlp-emotion-detection-clxd.onrender.com/api';

        // App State
        this.currentModel = 'enhanced_distilbert';
        this.audioEnabled = true;
        this.isConnected = false;
        this.currentAudio = null;
        this.isOnline = navigator.onLine;
        this.offlineQueue = [];

        // DOM Elements
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.emotionDisplay = document.getElementById('emotionDisplay');
        this.emotionTags = document.getElementById('emotionTags');
        this.loadingOverlay = document.getElementById('loadingOverlay');

        // Initialize
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Mental Health Companion...');

        // Setup event listeners
        this.setupEventListeners();

        // Check backend connection
        await this.checkConnection();

        // Load model information
        await this.loadModelInfo();

        console.log('✅ App initialized successfully');
    }

    setupEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());

        // Send message on Enter key
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Character counter
        this.messageInput.addEventListener('input', (e) => {
            const count = e.target.value.length;
            document.getElementById('charCount').textContent = `${count}/500`;

            if (count > 450) {
                document.getElementById('charCount').classList.add('text-red-500');
            } else {
                document.getElementById('charCount').classList.remove('text-red-500');
            }
        });

        // Model toggle
        document.getElementById('modelToggle').addEventListener('click', () => {
            this.toggleModel();
        });

        // Audio toggle
        document.getElementById('audioToggle').addEventListener('click', () => {
            this.toggleAudio();
        });

        // Help modal
        document.getElementById('helpButton').addEventListener('click', () => {
            this.showHelp();
        });

        document.getElementById('closeHelp').addEventListener('click', () => {
            this.hideHelp();
        });

        // Audio controls
        document.getElementById('audioEnabled').addEventListener('change', (e) => {
            this.audioEnabled = e.target.checked;
        });

        // Online/offline detection
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateConnectionStatus('Connected', 'online');
            this.processOfflineQueue();
            console.log('🌐 Back online');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateConnectionStatus('Offline', 'offline');
            console.log('📴 Gone offline');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to send message
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }

            // Escape to stop audio
            if (e.key === 'Escape') {
                if (this.currentAudio) {
                    this.currentAudio.pause();
                    this.currentAudio = null;
                    this.showAudioPlaying(false);
                }
                if ('speechSynthesis' in window) {
                    speechSynthesis.cancel();
                    this.showAudioPlaying(false);
                }
            }

            // Alt + M to toggle model
            if (e.altKey && e.key === 'm') {
                e.preventDefault();
                this.toggleModel();
            }

            // Alt + A to toggle audio
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.toggleAudio();
            }

            // F1 or ? to show help
            if (e.key === 'F1' || (e.shiftKey && e.key === '?')) {
                e.preventDefault();
                this.showHelp();
            }
        });

        // Click outside help modal to close
        document.getElementById('helpModal').addEventListener('click', (e) => {
            if (e.target.id === 'helpModal') {
                this.hideHelp();
            }
        });
    }

    async checkConnection() {
        console.log('🔍 Checking backend connection...');

        try {
            const response = await fetch(`${this.API_BASE}/health`);
            const data = await response.json();

            if (data.status === 'healthy') {
                this.isConnected = true;
                this.updateConnectionStatus('Connected', 'online');
                console.log('✅ Backend connection successful');
                console.log('📊 Backend capabilities:', data.models);
            } else {
                throw new Error('Backend not healthy');
            }

        } catch (error) {
            console.error('❌ Backend connection failed:', error);
            this.isConnected = false;
            this.updateConnectionStatus('Disconnected', 'offline');
        }
    }

    async loadModelInfo() {
        try {
            const response = await fetch(`${this.API_BASE}/models/info`);
            const data = await response.json();

            if (data.success) {
                this.updateModelDisplay(data.models[this.currentModel]);
                console.log('📊 Model info loaded');
            }

        } catch (error) {
            console.error('❌ Failed to load model info:', error);
        }
    }

    updateConnectionStatus(text, status) {
        const statusElement = document.getElementById('connectionStatus');
        const statusClasses = {
            'online': 'status-online',
            'offline': 'status-offline',
            'connecting': 'status-connecting'
        };

        // Remove all status classes
        Object.values(statusClasses).forEach(cls => {
            statusElement.classList.remove(cls);
        });

        // Add current status class
        statusElement.classList.add(statusClasses[status]);
        statusElement.innerHTML = `
            <div class="w-2 h-2 ${status === 'online' ? 'bg-green-500' : status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'} rounded-full mr-2"></div>
            ${text}
        `;
    }

    updateModelDisplay(modelInfo) {
        document.getElementById('modelName').textContent = modelInfo.name;
        document.getElementById('modelType').textContent = modelInfo.type;
    }

    toggleModel() {
        // Switch between models
        if (this.currentModel === 'enhanced_distilbert') {
            this.currentModel = 'logistic_regression';
            document.getElementById('currentModel').textContent = 'Logistic Reg';
        } else {
            this.currentModel = 'enhanced_distilbert';
            document.getElementById('currentModel').textContent = 'DistilBERT';
        }

        // Update model info display
        this.loadModelInfo();

        console.log(`🔄 Switched to model: ${this.currentModel}`);
    }

    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        const button = document.getElementById('audioToggle');

        if (this.audioEnabled) {
            button.innerHTML = '<i class="fas fa-volume-up mr-2"></i>Audio: ON';
            button.classList.remove('bg-gray-500');
            button.classList.add('bg-green-500', 'hover:bg-green-600');
        } else {
            button.innerHTML = '<i class="fas fa-volume-mute mr-2"></i>Audio: OFF';
            button.classList.remove('bg-green-500', 'hover:bg-green-600');
            button.classList.add('bg-gray-500');

            // Stop current audio if playing
            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio = null;
            }
        }

        console.log(`🔊 Audio ${this.audioEnabled ? 'enabled' : 'disabled'}`);
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();

        if (!message) {
            this.showError('Please enter a message');
            return;
        }

        if (!this.isConnected) {
            this.showError('Not connected to backend. Please refresh the page.');
            return;
        }

        // Disable input while processing
        this.setInputState(false);
        this.showLoading(true);

        // Add user message to chat
        this.addMessage(message, 'user');

        // Clear input
        this.messageInput.value = '';
        document.getElementById('charCount').textContent = '0/500';

        try {
            // Send to backend
            const startTime = Date.now();

            const response = await fetch(`${this.API_BASE}/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    user_id: this.getUserId(),
                    model: this.currentModel,
                    use_advanced_ai: true
                })
            });

            const data = await response.json();
            const processingTime = Date.now() - startTime;

            if (data.success) {
                // Show processing time
                this.showProcessingTime(data.processing_time?.total || processingTime / 1000);

                // Display emotions
                this.displayEmotions(data.emotion_analysis);

                // Add bot response
                const botResponse = data.empathetic_response?.response || 'I hear you.';
                this.addMessage(botResponse, 'bot');

                // Play audio if available and enabled
                if (this.audioEnabled) {
                    if (data.audio?.available) {
                        // Try backend audio first
                        try {
                            await this.playAudioResponse(data.audio.url);
                        } catch (error) {
                            console.warn('Backend audio failed, using frontend TTS:', error);
                            this.playFrontendAudio(botResponse);
                        }
                    } else {
                        // Use frontend TTS as fallback
                        this.playFrontendAudio(botResponse);
                    }
                }

                // Update video recommendations based on emotions
                this.updateVideoRecommendations(data.emotion_analysis);

                console.log('✅ Message processed successfully');

            } else {
                throw new Error(data.message || 'Failed to process message');
            }

        } catch (error) {
            console.error('❌ Error sending message:', error);

            if (!this.isOnline) {
                // Queue message for when back online
                this.offlineQueue.push({
                    message: message,
                    timestamp: Date.now()
                });

                this.showError('You are offline. Message will be sent when connection is restored.');
                this.addMessage('I notice you\'re offline right now. I\'ll respond to your message once you\'re back online. In the meantime, remember that it\'s okay to feel what you\'re feeling.', 'bot');

                // Provide offline support
                this.playFrontendAudio('I notice you are offline right now. Remember that it is okay to feel what you are feeling. Take some deep breaths and know that support is available when you reconnect.');

            } else {
                this.showError('Sorry, I encountered an error. Please try again.');
                this.addMessage('I apologize, but I\'m having trouble processing your message right now. Please try again in a moment.', 'bot');
            }
        } finally {
            this.setInputState(true);
            this.showLoading(false);
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('flex', 'message-enter');

        if (sender === 'user') {
            messageDiv.classList.add('justify-end');
            messageDiv.innerHTML = `
                <div class="user-message">
                    <p>${this.escapeHtml(text)}</p>
                </div>
            `;
        } else {
            messageDiv.classList.add('items-start', 'space-x-3');
            messageDiv.innerHTML = `
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-robot text-white text-sm"></i>
                </div>
                <div class="bot-message" data-message="${this.escapeHtml(text)}">
                    <p>${this.escapeHtml(text)}</p>
                    ${this.audioEnabled ? '<button class="audio-replay-btn mt-2 text-blue-500 hover:text-blue-700 text-sm" onclick="window.app.replayMessage(this)"><i class="fas fa-redo mr-1"></i>Replay Audio</button>' : ''}
                </div>
            `;
        }

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    displayEmotions(emotionAnalysis) {
        console.log('🎭 Displaying emotions:', emotionAnalysis);

        if (!emotionAnalysis) {
            this.emotionDisplay.classList.add('hidden');
            return;
        }

        // Get top 5 emotions (try multiple sources)
        let emotions = emotionAnalysis.top_emotions ||
            emotionAnalysis.predicted_emotions ||
            emotionAnalysis.emotions ||
            [];

        console.log('🎭 Emotions array:', emotions);

        // Limit to top 5
        emotions = emotions.slice(0, 5);

        if (emotions.length === 0) {
            console.warn('⚠️ No emotions found');
            this.emotionDisplay.classList.add('hidden');
            return;
        }

        console.log(`🎭 Displaying ${emotions.length} emotions`);

        // Clear previous emotions
        this.emotionTags.innerHTML = '';

        // Add emotion tags (NO confidence scores)
        emotions.forEach((emotion, index) => {
            const tag = document.createElement('span');
            tag.classList.add('emotion-tag', 'high-confidence');

            // Get emotion name from different possible formats
            const emotionName = emotion.emotion || emotion.label || emotion;

            console.log(`🎭 Emotion ${index + 1}:`, emotionName);

            // NO CONFIDENCE SCORE - just emoji and name
            tag.innerHTML = `
                ${this.getEmotionEmoji(emotionName)}
                ${emotionName.charAt(0).toUpperCase() + emotionName.slice(1)}
            `;

            this.emotionTags.appendChild(tag);
        });

        // Show emotion display
        this.emotionDisplay.classList.remove('hidden');
    }

    getEmotionEmoji(emotion) {
        const emojiMap = {
            'joy': '😊', 'sadness': '😢', 'anger': '😠', 'fear': '😨',
            'love': '❤️', 'surprise': '😲', 'disgust': '🤢', 'excitement': '🎉',
            'gratitude': '🙏', 'confusion': '😕', 'disappointment': '😞',
            'approval': '👍', 'disapproval': '👎', 'curiosity': '🤔',
            'admiration': '👏', 'amusement': '😄', 'caring': '🤗',
            'embarrassment': '😳', 'nervousness': '😰', 'optimism': '😌',
            'pride': '😤', 'realization': '💡', 'relief': '😅',
            'remorse': '😔', 'neutral': '😐', 'annoyance': '😤',
            'desire': '😍', 'grief': '😢'
        };

        return emojiMap[emotion] || '🔸';
    }

    async playAudioResponse(audioUrl) {
        if (!this.audioEnabled || !audioUrl) {
            return;
        }

        try {
            // Stop current audio if playing
            if (this.currentAudio) {
                this.currentAudio.pause();
            }

            // Create new audio
            this.currentAudio = new Audio(`${this.API_BASE.replace('/api', '')}${audioUrl}`);

            // Configure audio
            this.currentAudio.volume = document.getElementById('volume')?.value || 0.8;
            this.currentAudio.playbackRate = document.getElementById('speechRate')?.value || 1.0;

            // Play audio
            await this.currentAudio.play();

            // Visual feedback
            this.showAudioPlaying(true);

            // Handle audio end
            this.currentAudio.addEventListener('ended', () => {
                this.showAudioPlaying(false);
                this.currentAudio = null;
            });

            console.log('🔊 Audio response playing');

        } catch (error) {
            console.error('❌ Audio playback failed:', error);
            // Try frontend TTS as fallback
            throw error; // Re-throw to trigger fallback in calling function
        }
    }

    showAudioPlaying(isPlaying) {
        const audioButton = document.getElementById('audioToggle');

        if (isPlaying) {
            audioButton.classList.add('audio-playing');
        } else {
            audioButton.classList.remove('audio-playing');
        }
    }

    updateVideoRecommendations(emotionAnalysis) {
        const videoContainer = document.getElementById('videoRecommendations');

        if (!emotionAnalysis) {
            console.log('⚠️ No emotion analysis provided');
            return;
        }

        // Get primary emotion from multiple sources
        const primaryEmotion = emotionAnalysis.predicted_emotions?.[0]?.emotion ||
            emotionAnalysis.top_emotions?.[0]?.emotion ||
            'neutral';

        console.log('🎥 Updating videos for emotion:', primaryEmotion);

        // Video recommendations based on emotions
        const videoRecommendations = {
            'sadness': [
                { title: 'Guided Meditation for Sadness', id: 'ZToicYcHIOU', description: 'A gentle meditation to help process difficult emotions' },
                { title: 'Healing Music for Depression', id: '1ZYbU82GVz4', description: 'Soothing music to lift your spirits' }
            ],
            'fear': [
                { title: '5 Minute Anxiety Relief', id: 'O-6f5wQXSu8', description: 'Quick breathing technique for anxiety relief' },
                { title: 'Calming Anxiety Meditation', id: 'cEqZthCaMpo', description: 'Guided meditation to ease anxiety' }
            ],
            'anxiety': [
                { title: '5 Minute Anxiety Relief', id: 'O-6f5wQXSu8', description: 'Quick breathing technique for anxiety relief' },
                { title: 'Calming Anxiety Meditation', id: 'cEqZthCaMpo', description: 'Guided meditation to ease anxiety' }
            ],
            'joy': [
                { title: 'Gratitude Meditation', id: 'nOJTbWC-ULc', description: 'Enhance your positive feelings with gratitude' },
                { title: 'Happy Uplifting Music', id: 'bx1Bh8ZvH84', description: 'Positive music to boost your mood' }
            ],
            'anger': [
                { title: 'Anger Managemnet Gaur Gopal das', id: 'iYjmXxlcm4U', description: 'Calm your mind and release tension' },
                { title: 'Breathing for Anger', id: 'LiUnFJ8P4gM', description: 'Quick technique to manage anger' }
            ],
            'stress': [
                { title: 'Stress Relief Meditation', id: '9yj8mBfHlMk', description: '10-minute guided meditation for stress' },
                { title: 'Relaxing Music for Stress', id: 'H_uc-uQ3Nkc', description: 'Calming music to reduce stress' }
            ],
            'disappointment': [
                { title: 'Overcoming Disappointment', id: 'UFL58z4T33U', description: 'Meditation for processing disappointment' },
                { title: 'Healing from Setbacks', id: 'CrEhGIBCAPU', description: 'Music to help you move forward' }
            ],
            'confusion': [
                { title: 'Clarity Meditation', id: 'inpok4MKVLM', description: 'Find mental clarity and peace' },
                { title: 'Mindfulness for Clarity', id: 'ZToicYcHIOU', description: 'Clear your mind with mindfulness' }
            ],
            'neutral': [
                { title: 'Daily Mindfulness Practice', id: 'ZToicYcHIOU', description: 'General mindfulness for daily well-being' },
                { title: 'Peaceful Nature Sounds', id: 'lFcSrYw-ARY', description: 'Relaxing sounds for peace' }
            ]
        };

        // Get videos for the emotion, with fallbacks
        let videos = videoRecommendations[primaryEmotion];

        console.log('🎬 Videos found for', primaryEmotion, ':', videos ? 'Yes' : 'No');

        // If no videos for this emotion, try related emotions
        if (!videos) {
            const emotionMap = {
                'worried': 'anxiety',
                'nervous': 'anxiety',
                'scared': 'fear',
                'terrified': 'fear',
                'depressed': 'sadness',
                'unhappy': 'sadness',
                'frustrated': 'anger',
                'mad': 'anger',
                'furious': 'anger',
                'annoyed': 'anger',
                'happy': 'joy',
                'excited': 'joy',
                'overwhelmed': 'stress',
                'tired': 'stress'
            };

            const mappedEmotion = emotionMap[primaryEmotion];
            videos = mappedEmotion ? videoRecommendations[mappedEmotion] : videoRecommendations['neutral'];
            console.log('🔄 Mapped', primaryEmotion, 'to', mappedEmotion || 'neutral');
        }

        console.log('✅ Displaying', videos.length, 'videos');

        videoContainer.innerHTML = videos.map(video => `
            <div class="video-card bg-gray-50 p-4">
                <div class="aspect-w-16 aspect-h-9 mb-3">
                    <iframe 
                        src="https://www.youtube.com/embed/${video.id}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                        class="w-full h-32 rounded-lg"
                    ></iframe>
                </div>
                <h4 class="font-semibold text-gray-800 mb-1">${video.title}</h4>
                <p class="text-sm text-gray-600">${video.description}</p>
            </div>
        `).join('');
    }

    setInputState(enabled) {
        this.messageInput.disabled = !enabled;
        this.sendButton.disabled = !enabled;

        if (enabled) {
            this.messageInput.focus();
        }
    }

    showLoading(show) {
        if (show) {
            this.loadingOverlay.classList.remove('hidden');
        } else {
            this.loadingOverlay.classList.add('hidden');
        }
    }

    showProcessingTime(seconds) {
        const timeElement = document.getElementById('processingTime');
        const timeValue = document.getElementById('timeValue');

        timeValue.textContent = `${(seconds * 1000).toFixed(0)}ms`;
        timeElement.classList.remove('hidden');

        // Hide after 3 seconds
        setTimeout(() => {
            timeElement.classList.add('hidden');
        }, 3000);
    }

    showError(message) {
        // Create error toast
        const errorDiv = document.createElement('div');
        errorDiv.classList.add('fixed', 'top-4', 'right-4', 'bg-red-500', 'text-white', 'px-6', 'py-3', 'rounded-lg', 'shadow-lg', 'z-50');
        errorDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(errorDiv);

        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    getUserId() {
        // Generate or retrieve user ID
        let userId = localStorage.getItem('mental_health_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('mental_health_user_id', userId);
        }
        return userId;
    }

    replayMessage(button) {
        const messageDiv = button.closest('.bot-message');
        const messageText = messageDiv.getAttribute('data-message');

        if (messageText) {
            this.playFrontendAudio(messageText);
        }
    }

    playFrontendAudio(text) {
        if (!this.audioEnabled || !text) {
            return;
        }

        // Check if browser supports Speech Synthesis
        if (!('speechSynthesis' in window)) {
            console.warn('Speech Synthesis not supported');
            return;
        }

        try {
            // Stop any current speech
            speechSynthesis.cancel();

            // Create speech utterance
            const utterance = new SpeechSynthesisUtterance(text);

            // Configure voice settings
            utterance.rate = document.getElementById('speechRate')?.value || 1.0;
            utterance.volume = document.getElementById('volume')?.value || 0.8;
            utterance.pitch = 1.0;

            // Try to use a calm, therapeutic voice
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice =>
                voice.name.includes('Female') ||
                voice.name.includes('Samantha') ||
                voice.name.includes('Karen') ||
                voice.lang.startsWith('en')
            );

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            // Visual feedback
            utterance.onstart = () => {
                this.showAudioPlaying(true);
                console.log('🔊 Frontend TTS started');
            };

            utterance.onend = () => {
                this.showAudioPlaying(false);
                console.log('🔊 Frontend TTS ended');
            };

            utterance.onerror = (error) => {
                console.error('❌ Frontend TTS error:', error);
                this.showAudioPlaying(false);
            };

            // Speak the text
            speechSynthesis.speak(utterance);

        } catch (error) {
            console.error('❌ Frontend TTS failed:', error);
            this.showError('Text-to-speech not available');
        }
    }

    showHelp() {
        document.getElementById('helpModal').classList.remove('hidden');
    }

    hideHelp() {
        document.getElementById('helpModal').classList.add('hidden');
    }

    processOfflineQueue() {
        if (this.offlineQueue.length === 0) {
            return;
        }

        console.log(`📤 Processing ${this.offlineQueue.length} offline messages`);

        // Process queued messages
        this.offlineQueue.forEach(queuedMessage => {
            // Add a note about the delayed message
            this.addMessage(`[Sent while offline] ${queuedMessage.message}`, 'user');

            // Process the message
            setTimeout(() => {
                this.sendMessage(queuedMessage.message);
            }, 1000);
        });

        // Clear the queue
        this.offlineQueue = [];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧠 Mental Health Companion Loading...');

    // Initialize the app (auth already checked in HTML)
    window.app = new MentalHealthCompanion();

    // Add logout button functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear all user data
            localStorage.clear();
            sessionStorage.clear();

            // Redirect to login
            window.location.replace('login.html');
        });
    }
});

// Service Worker for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registered');
            })
            .catch(error => {
                console.log('⚠️ Service Worker registration failed');
            });
    });
}