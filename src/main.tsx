import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

console.log('Main.tsx loading...');

import './i18n/index.js';

console.log('i18n loaded');

import App from './App';

console.log('App imported, rendering...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<div style="color: white; padding: 20px;">Root element not found</div>';
  throw new Error('Root element not found');
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('Failed to render app:', error);
  document.body.innerHTML = `<div style="color: white; padding: 20px;">
    <h1>Error loading application</h1>
    <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
    <pre>${error instanceof Error ? error.stack : ''}</pre>
  </div>`;
}