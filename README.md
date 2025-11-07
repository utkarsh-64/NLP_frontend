# Mental Health Companion - Frontend

A responsive, accessible web application for AI-powered mental health support with emotion detection and empathetic responses.

## 🌟 Features

### Core Functionality
- **Real-time Emotion Detection**: Analyzes text for 28+ emotions using advanced AI models
- **Dual AI Models**: Switch between Enhanced DistilBERT and Logistic Regression
- **Audio Responses**: Server-side TTS with frontend fallback
- **Empathetic Conversations**: Context-aware therapeutic responses
- **Therapeutic Content**: YouTube video recommendations based on detected emotions

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Offline Support**: Service worker provides offline functionality
- **Accessibility**: Full keyboard navigation and screen reader support
- **Progressive Web App**: Can be installed on devices
- **Real-time Feedback**: Live emotion visualization and processing times

### Technical Features
- **Cross-Origin Audio**: Handles CORS for audio playback
- **Error Recovery**: Graceful fallbacks for network issues
- **Performance Optimized**: Efficient caching and lazy loading
- **Security Headers**: Production-ready security configuration

## 🚀 Quick Start

### Deploy to Netlify
1. **Drag & Drop**: Simply drag the `frontend/` folder to [Netlify](https://netlify.com)
2. **GitHub Integration**: Push to GitHub and connect repository
3. **Custom Domain**: Configure your own domain in Netlify settings

### Local Development
```bash
# Serve locally (Python)
python -m http.server 8000

# Serve locally (Node.js)
npx serve .

# Open in browser
open http://localhost:8000
```

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Send message |
| `Alt+M` | Switch AI model |
| `Alt+A` | Toggle audio |
| `Escape` | Stop audio playback |
| `F1` or `Shift+?` | Show help |

## 🔧 Configuration

### Backend API
The app connects to: `https://nlp-emotion-detection-clxd.onrender.com/api`

To use a different backend, update the `API_BASE` in `script.js`:
```javascript
this.API_BASE = 'https://your-backend-url.com/api';
```

### Audio Settings
- **Server Audio**: Preferred method using pyttsx3
- **Frontend TTS**: Automatic fallback using Web Speech API
- **Voice Selection**: Automatically chooses calm, therapeutic voices

## 📱 Progressive Web App

The app can be installed on devices:
1. **Chrome/Edge**: Click install button in address bar
2. **Safari**: Add to Home Screen
3. **Mobile**: Use "Add to Home Screen" option

## 🛡️ Security & Privacy

- **No Data Storage**: Conversations are not permanently stored
- **Secure Headers**: CSP, HSTS, and other security headers configured
- **HTTPS Only**: All communications encrypted
- **Privacy First**: No tracking or analytics

## 🎨 Customization

### Themes
Modify `styles.css` to change colors and styling:
```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #10b981;
  --accent-color: #8b5cf6;
}
```

### Models
Add new AI models by updating the model toggle functionality in `script.js`.

## 🔍 Troubleshooting

### Audio Not Working
1. Check browser audio permissions
2. Verify CORS headers on backend
3. Test with frontend TTS fallback
4. Check network connectivity

### Offline Issues
1. Clear browser cache
2. Re-register service worker
3. Check network status indicator

### Performance Issues
1. Check browser console for errors
2. Verify backend API response times
3. Test on different devices/browsers

## 📊 Browser Support

- **Chrome**: 80+ ✅
- **Firefox**: 75+ ✅
- **Safari**: 13+ ✅
- **Edge**: 80+ ✅
- **Mobile**: iOS 13+, Android 8+ ✅

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Test on multiple devices
4. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Crisis Resources

If you're in crisis, please contact:
- **Emergency**: 911
- **Crisis Text Line**: Text HOME to 741741
- **National Suicide Prevention Lifeline**: 988

---

**Built with ❤️ for mental health support**