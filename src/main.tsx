// Global error handler - catches ALL errors before anything else
window.addEventListener('error', (event) => {
  console.error('❌ GLOBAL ERROR:', event.error);
  console.error('Error details:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ UNHANDLED PROMISE REJECTION:', event.reason);
});

console.log('🚀 Application starting...');

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './i18n';
import App from './App';

console.log('✅ All imports loaded successfully');

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  document.body.innerHTML = '<div style="padding: 40px; font-family: sans-serif;"><h1 style="color: red;">Error: Root element not found</h1><p>The #root element is missing from index.html</p></div>';
  throw new Error('Root element not found');
}

try {
  console.log('Creating React root...');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
  console.log('✅ React app rendered successfully');
} catch (error) {
  console.error('❌ Failed to render React app:', error);
  document.body.innerHTML = `<div style="padding: 40px; font-family: sans-serif;">
    <h1 style="color: red;">Failed to render application</h1>
    <pre style="background: #f5f5f5; padding: 20px; border-radius: 8px;">${error}</pre>
  </div>`;
}