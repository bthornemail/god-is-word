# Widget Documentation

## Overview

The 7-Day God Mirror Widget is a standalone, embeddable component that allows users to quickly submit answers without using the full app.

## Files

- `src/components/Widget.tsx` - Main React component
- `src/widget.tsx` - Standalone entry point for widget page
- `src/widget.css` - Widget-specific styles
- `widget.html` - Widget HTML entry point

## Development

### Run widget locally

```bash
# Widget will be available at:
# http://localhost:5173/widget.html
npm run dev
```

### Build widget

```bash
npm run build
# Output: dist/widget.html
```

## Embedding

### Basic iframe

```html
<iframe 
  src="https://bthornemail.github.io/god-is-word/widget.html" 
  width="500" 
  height="400" 
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);"
  title="The 7-Day God Mirror"
></iframe>
```

### React Component

```tsx
import { Widget } from './components/Widget';

<Widget 
  appUrl="https://bthornemail.github.io/god-is-word/"
  onSave={(answer) => {
    console.log('User answered:', answer);
  }}
/>
```

## Configuration

### URL Parameters

All parameters are optional:

- `appUrl` - Link to full app
- `widgetUrl` - Widget URL for embed code
- `embed` - Show embed button (`true`/`false`)
- `share` - Show share button (`true`/`false`)
- `fullApp` - Show full app link (`true`/`false`)
- `storageKey` - LocalStorage key prefix

Example:
```
/widget.html?embed=false&share=false&storageKey=custom_key
```

## Data Storage

Widget saves answers to LocalStorage:

```javascript
// Default key: 'god_quick_answers'
const answers = JSON.parse(
  localStorage.getItem('god_quick_answers') || '[]'
);

// Format:
[
  {
    word: "love",
    timestamp: "2024-01-15T10:30:00.000Z",
    source: "widget"
  }
]
```

The main app can import these answers on the collective view.

## Features

- ✅ One-word answer input
- ✅ LocalStorage persistence
- ✅ Share functionality (native share API)
- ✅ Embed code generator
- ✅ Responsive design
- ✅ Auto-hides embed button when in iframe
- ✅ Keyboard shortcuts (Enter to submit, Esc to close modal)

## Styling

The widget is self-contained with inline styles for maximum portability.

Background is transparent when embedded in iframe.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

Requires:
- LocalStorage
- ES6+ JavaScript
- Modern CSS (flexbox, grid)

