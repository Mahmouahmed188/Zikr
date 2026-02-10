import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from '../context/ThemeContext.tsx'
import { PlayerProvider } from '../context/PlayerContext.tsx'
import { LanguageProvider } from '../context/LanguageContext.tsx'
import '../i18n/config.ts'
import '../index.css'

// Theme initialization - runs before React to prevent flash
const STORAGE_KEY = 'zikr-theme';
let theme = 'system';

// Try to get theme from localStorage first
try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        theme = saved;
    }
} catch (e) {
    // localStorage not available
}

// Determine which theme to apply
let resolvedTheme = theme;
if (theme === 'system') {
    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Apply theme class immediately
document.documentElement.classList.add(resolvedTheme);
document.documentElement.setAttribute('data-theme', resolvedTheme);
document.documentElement.classList.add('no-transition');

// Remove no-transition after a brief delay
setTimeout(function() {
    document.documentElement.classList.remove('no-transition');
}, 100);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <LanguageProvider>
            <ThemeProvider>
                <PlayerProvider>
                    <App />
                </PlayerProvider>
            </ThemeProvider>
        </LanguageProvider>
    </React.StrictMode>,
)
