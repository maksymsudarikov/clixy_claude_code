import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { supabase } from './services/supabase';

// Handle Supabase PKCE magic link redirect.
// When Supabase redirects back after magic link click, it appends ?code=xxx
// to the URL. We must exchange that code for a session BEFORE React renders,
// so it works regardless of which route the user lands on.
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
if (code) {
  supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
    if (error) {
      console.error('[Auth] Code exchange failed:', error.message);
    } else {
      // Remove ?code= from URL, then redirect to studio
      window.history.replaceState({}, '', '/#/studio');
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });
}