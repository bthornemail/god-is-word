# The 7-Day God Mirror

A profound digital journal for collective reflection on the nature of divinity and human perception. This privacy-first application helps users explore their understanding of God through a structured 7-day journey, with cryptographic verification and collective pattern analysis.

## 🌟 Features

### Daily Reflection
- **7-Day Journey**: Complete one word reflection per day for a week
- **Context Triples**: Optional subject-predicate-object statements to add depth
- **Local Storage**: All data stays securely in your browser

### Cryptographic Security
- **Digital Signatures**: Cryptographically sign your reflections
- **Verification**: Import and verify others' signatures
- **Private Key Generation**: Secure local key management

### Pattern Analysis
- **Binomial Classification**: Automatic categorization of reflections as life-affirming, neutral, or life-denying
- **Personal Insights**: Understand your spiritual trajectory
- **QR Code Export**: Visual representation of your journey

### Collective Consciousness
- **Import Signatures**: Analyze patterns across multiple users
- **Time-Series Analysis**: Track collective spiritual evolution
- **Emergent Meaning**: Discover shared patterns in perception

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Modern browser with Web Crypto API support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bthornemail/god-is-word.git
   cd god-is-word
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📱 How to Use

### Day 1-7: The Journey
1. **Start with "Journal" view**
2. Each day, complete: "God is _____?" with one word
3. Add optional reflections or context triples
4. Save your entry to progress to the next day

### Understanding Your Pattern
- **Life-Affirming Words**: love, light, truth, beauty, peace, joy, life, infinite, eternal
- **Life-Denying Words**: void, nothing, dead, fear, illusion, control, limit
- **Neutral**: All other words

### Sharing & Collective Analysis
1. **Export your signature** from Pattern view
2. **Import others' signatures** in Collective view
3. **Analyze emergent patterns** across the community

## 🔒 Privacy & Security

- **No Tracking**: Zero analytics or external data collection
- **Local-First**: All data stored in your browser's localStorage
- **Cryptographic Proof**: Signatures provide tamper-evident verification
- **Optional Sharing**: Export only what you choose to share

## 🛠️ Technical Details

### Built With
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Lucide React** - Beautiful icons
- **Web Crypto API** - Browser-native cryptography

### Architecture
- **Component-Based**: Modular React components
- **Responsive Design**: Works on desktop and mobile
- **Progressive Enhancement**: Graceful degradation for older browsers

### Cryptography
- **SHA-256** hashing for signature generation
- **Local key generation** using `crypto.getRandomValues`
- **JSON-based signature format** for portability

## 📁 Project Structure

```
god-is-word/
├── src/
│   ├── App.tsx          # Main application component
│   ├── App.css          # Comprehensive styling
│   └── main.tsx         # Application entry point
├── public/              # Static assets
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── index.html           # HTML template
```

## 🌐 Browser Support

- **Chrome/Edge 80+**
- **Firefox 75+**
- **Safari 14+**
- **Mobile browsers** with Web Crypto support

## 🤝 Contributing

We welcome contributions that align with the project's spiritual and technical vision:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain the privacy-first approach
- Ensure responsive design
- Test across modern browsers

## 📜 License

This project is open source. See LICENSE file for details.

## 💝 Support the Project

If this application has been meaningful to you, consider supporting its development:

- **Cash App**: [https://cash.app/$bthornemail](https://cash.app/$bthornemail)
- **Venmo**: [https://venmo.com/u/bthornemail](https://venmo.com/u/bthornemail)

## 🧘 Philosophical Foundation

> "If we perceive God as supernatural, we create the boundary that defines our limitlessness."

This application is built on the premise that our understanding of divinity shapes our perception of reality. By collectively reflecting on the nature of God, we can discover the boundaries and boundlessness of human consciousness.

## 🔮 Future Vision

- [ ] P2P signature sharing
- [ ] Advanced graph visualization
- [ ] Meditation integration
- [ ] Multi-language support
- [ ] Offline-first enhancements

## 🐛 Troubleshooting

### Common Issues

**"Web Crypto not supported"**
- Update your browser to a modern version
- Ensure you're using HTTPS in production

**"Data not persisting"**
- Check if localStorage is enabled
- Ensure you're not using private/incognito mode

**"QR code not generating"**
- Verify you have completed at least one journal entry
- Check browser console for errors

## 📞 Support

For technical issues or spiritual inquiries:
- Create an issue on GitHub
- Ensure you include browser version and steps to reproduce

---

*May your reflections reveal the boundaries that define your infinite nature.*