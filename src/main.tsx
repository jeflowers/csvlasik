// Extension isolation and error handling
(function() {
  const isExtensionError = (error: any): boolean => {
    const stack = error?.stack?.toString() || '';
    const message = error?.message?.toString() || '';
    return (
      stack.includes('chrome-extension://') ||
      stack.includes('moz-extension://') ||
      stack.includes('safari-extension://') ||
      message.includes('extension')
    );
  };

  // Global error handler - filter extension errors
  window.addEventListener('error', (event) => {
    if (isExtensionError(event.error)) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return false;
    }
    console.error('Application Error:', event.error);
  });

  // Handle promise rejections - filter extension errors
  window.addEventListener('unhandledrejection', (event) => {
    if (isExtensionError(event.reason)) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return false;
    }
    console.error('Unhandled Promise Rejection:', event.reason);
  });

  // Protect input events from extensions
  const protectInputs = () => {
    document.addEventListener('input', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        e.target.dataset.appControlled = 'true';
      }
    }, { capture: true, passive: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', protectInputs);
  } else {
    protectInputs();
  }
})();

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './i18n';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="padding: 40px; font-family: sans-serif;"><h1 style="color: red;">Error: Root element not found</h1><p>The #root element is missing from index.html</p></div>';
  throw new Error('Root element not found');
}

// Isolate React rendering from extension interference
const renderApp = () => {
  try {
    // Use original timing functions for React
    const originalSetTimeout = (window as any).__originalSetTimeout || window.setTimeout;
    const originalSetInterval = (window as any).__originalSetInterval || window.setInterval;
    const originalRAF = (window as any).__originalRequestAnimationFrame || window.requestAnimationFrame;

    // Temporarily restore originals for React initialization
    window.setTimeout = originalSetTimeout;
    window.setInterval = originalSetInterval;
    window.requestAnimationFrame = originalRAF;

    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );

    // Mark app as loaded - disable extension throttling
    setTimeout(() => {
      (window as any).__appLoading = false;
    }, 2000);

  } catch (error) {
    console.error('Failed to render React app:', error);
    document.body.innerHTML = `<div style="padding: 40px; font-family: sans-serif;">
      <h1 style="color: red;">Failed to render application</h1>
      <pre style="background: #f5f5f5; padding: 20px; border-radius: 8px;">${error}</pre>
    </div>`;
  }
};

// Ensure DOM is ready before rendering
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}