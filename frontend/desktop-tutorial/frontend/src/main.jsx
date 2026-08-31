import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import App from './App';
import './index.css';

// Remove any service worker left by the retired static interface. That worker
// intercepted API calls and displayed the misleading "Queued for sync" state.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
    .catch(() => {});
  caches.keys()
    .then((keys) => Promise.all(keys
      .filter((key) => key.startsWith('fasalsathi-'))
      .map((key) => caches.delete(key))))
    .catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
