import React from 'react';
import { createRoot } from 'react-dom/client';
import SimpleCrudApp from './components/SimpleCrudApp';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <SimpleCrudApp />
  </React.StrictMode>
);
