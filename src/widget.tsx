// ============================================================================
// widget.tsx - Standalone Widget Entry Point for iframe embedding
// ============================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Widget } from './components/Widget';
import { ErrorBoundary } from './components/ErrorBoundary';
import './widget.css';

// Get configuration from URL parameters or environment
const getConfig = () => {
  const params = new URLSearchParams(window.location.search);

  // Check if we're in an iframe
  const inIframe = window.self !== window.top;

  return {
    appUrl: params.get('appUrl') || import.meta.env.VITE_APP_URL || 'https://bthornemail.github.io/god-is-word/',
    widgetUrl: params.get('widgetUrl') || window.location.href.split('?')[0],
    showEmbed: params.get('embed') !== 'false' && !inIframe, // Hide embed in iframe
    showShare: params.get('share') !== 'false',
    showFullAppLink: params.get('fullApp') !== 'false',
    storageKey: params.get('storageKey') || 'god_quick_answers',
  };
};

const config = getConfig();

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

// Apply iframe-specific styles only if in iframe
const inIframe = window.self !== window.top;
if (inIframe) {
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.background = 'transparent';
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Widget
        appUrl={config.appUrl}
        widgetUrl={config.widgetUrl}
        showEmbed={config.showEmbed}
        showShare={config.showShare}
        showFullAppLink={config.showFullAppLink}
        storageKey={config.storageKey}
      />
    </ErrorBoundary>
  </React.StrictMode>
);

