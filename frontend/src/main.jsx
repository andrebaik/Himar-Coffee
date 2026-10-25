import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#2B1B12',
            borderRadius: '8px',
            border: '1px solid #E7DCCB',
          },
          success: {
            iconTheme: { primary: '#6F8F72', secondary: '#FFFFFF' },
          },
          error: {
            iconTheme: { primary: '#B5532C', secondary: '#FFFFFF' },
          },
        }}
      />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
