import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProviders } from './AppProviders'; // חדש
import "./styles/index.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
