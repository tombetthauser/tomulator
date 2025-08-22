import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SimpleCrudApp from './components/SimpleCrudApp';
import NewTableCreator from './components/NewTableCreator';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SimpleCrudApp />} />
        <Route path="/new-table" element={<NewTableCreator />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
