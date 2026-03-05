# The 7-Day God Mirror

> "If we perceive God as supernatural, we create the boundary that defines our limitlessness."

A client-side journaling application for collective reflection on perception, built with React and a Perceptron-based state machine architecture.

## Features

- **7-Day Journal** - Daily reflection entries with semantic triples
- **Pattern Analysis** - Binomial analysis of life-affirming vs life-denying patterns
- **Collective View** - Analyze patterns from multiple users via QR code import/export
- **Perceptron Integration** - AI-driven state machine for knowledge organization
- **Embeddable Widget** - Standalone widget component for external use
- **QR Code Support** - Generate and scan QR codes for data sharing
- **Local-First** - All data stored locally in your browser

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Usage

1. Open the application in your browser
2. Navigate to "Journal" view
3. Enter your word for "God is _____"
4. Optionally add reflection content and semantic triples
5. Save entries for 7 days to see your pattern
6. View patterns in "Pattern" view
7. Import/export signatures via QR codes in "Collective" view

## Project Structure

```
src/
├── main.tsx              # Main app entry point
├── widget.tsx            # Widget entry point
├── App.tsx               # Main application component
├── components/           # React components
├── hooks/                # React hooks
├── lib/                  # Core libraries
│   ├── perceptron/      # Perceptron state machine
│   └── storage/         # Storage adapters
├── sync/                 # Sync and import/export
└── workers/              # Web Workers
```

## Widget Embedding

The application includes a reusable widget component that can be embedded in other websites.

See [docs/WIDGET.md](./docs/WIDGET.md) for embedding instructions.

## Documentation

- [Documentation Index](./docs/README.md) - Complete documentation overview
- [Architecture](./docs/ARCHITECTURE.md) - Technical details and Perceptron system
- [Widget Guide](./docs/WIDGET.md) - Widget embedding and usage
- [Deployment](./docs/DEPLOYMENT.md) - Production deployment guide
- [Test Assessment](./docs/TEST_ASSESSMENT.md) - Code quality report

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Web Workers** - Background computation
- **IndexedDB** - Client-side storage
- **BroadcastChannel** - Multi-tab synchronization
- **Web Crypto API** - Cryptographic operations

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires LocalStorage and IndexedDB support
- Web Workers required for full functionality

## Privacy

- All data is stored locally in your browser
- No server communication
- Data can be exported/imported via QR codes or JSON files
- Cryptographic signatures for verification

## License

See [LICENSE](./LICENSE) file for details.

## Contributing

This is a client-side application. Contributions welcome via pull requests.

## Support

For questions or issues, please open an issue on GitHub.

