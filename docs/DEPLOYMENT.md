# Deployment Guide

## Client-Side Only Application

This application runs entirely in the browser with no server-side requirements.

## Build for Production

```bash
# Install dependencies
npm install

# Type check
npm run type-check

# Build
npm run build:prod
```

The build output will be in the `dist/` directory:
- `dist/index.html` - Main application
- `dist/widget.html` - Standalone widget

## Deployment Options

### GitHub Pages

1. Build the application: `npm run build:prod`
2. Push `dist/` folder to `gh-pages` branch
3. Enable GitHub Pages in repository settings
4. Set source to `gh-pages` branch

### Static Hosting (Netlify, Vercel, etc.)

1. Build: `npm run build:prod`
2. Deploy `dist/` folder
3. Configure SPA routing if needed (redirect all routes to `index.html`)

### Manual Deployment

1. Build: `npm run build:prod`
2. Upload `dist/` folder contents to any static hosting service

## Environment Variables

Copy `.env.example` to `.env.local` and update:

```env
VITE_APP_URL=https://your-domain.com/
VITE_APP_NAME=The 7-Day God Mirror
VITE_APP_VERSION=0.0.1
```

## Browser Requirements

- Modern browsers with ES6+ support
- LocalStorage API
- IndexedDB API (optional, for large datasets)
- Web Workers API
- Web Crypto API

## Security Considerations

- **CSP Headers**: Consider adding Content Security Policy headers
- **HTTPS Required**: For Web Crypto API and secure contexts
- **No External Dependencies**: Application is fully client-side

## Build Size Optimization

The build includes code splitting:
- `react-vendor.js` - React dependencies
- `perceptron.js` - Perceptron library code
- `sync.js` - Sync and export/import code
- Main application code

## Troubleshooting

### Build Fails
- Run `npm run type-check` to see TypeScript errors
- Ensure all dependencies are installed: `npm install`

### Runtime Errors
- Check browser console for errors
- Verify browser supports required APIs
- Check that Web Workers are enabled

### Widget Not Loading
- Verify `widget.html` is accessible
- Check browser console for CORS or loading errors
- Ensure iframe parent allows the widget domain

