# Theme System Implementation

## Overview
A complete Dark/Light mode theme system has been implemented for the Zikr Chrome Extension with persistent storage, smooth transitions, and system preference detection.

## Features Implemented

### 1. **Theme Context Provider** (`src/context/ThemeContext.tsx`)
- **Three theme modes**: Dark, Light, System (follows OS preference)
- **Persistent storage**: Uses `chrome.storage.local` with `localStorage` fallback
- **System preference detection**: Automatically adapts to OS theme changes when in "System" mode
- **No flash on load**: Theme is applied before React renders to prevent flickering

### 2. **Theme Toggle Component** (`src/components/ThemeToggle.tsx`)
- **Animated sun/moon icons**: Smooth rotation and opacity transitions
- **Accessible**: Includes aria-label and title attributes
- **Hover effects**: Subtle glow on hover
- **Instant toggle**: Single click to switch between dark and light modes

### 3. **CSS Variables** (`src/index.css`)
Comprehensive CSS custom properties for theming:
- `--bg-primary`: Main background
- `--bg-card`: Card backgrounds
- `--bg-surface`: Surface/elevated backgrounds
- `--text-primary`: Primary text
- `--text-secondary`: Secondary text
- `--text-tertiary`: Tertiary/muted text
- `--border-color`: Border colors
- `--glass-bg`, `--glass-border`, `--glass-shadow`: Glass morphism effects
- `--shadow-gold`: Gold glow effects
- All colors adapt automatically between dark and light modes

### 4. **Smooth Transitions**
- All theme changes animate over 300ms
- No-flash script in `index.html` prevents wrong theme flash on load
- `.no-transition` class disables transitions during initial theme setup

### 5. **Updated Components**
All components now support both themes:
- **App.tsx**: Main layout with CSS variable styling
- **Settings.tsx**: Theme selector with 3 options (Dark/Light/System)
- **VolumeControl.tsx**: Theme-aware volume panel
- **SurahList.tsx**: Theme-aware surah list
- **ThemeToggle.tsx**: Quick toggle button in header

## How It Works

### Theme Selection Flow
1. **System** (default): Follows OS preference via `prefers-color-scheme`
2. **Dark**: Forces dark theme
3. **Light**: Forces light theme

### Storage Strategy
1. Primary: `chrome.storage.local` (for Chrome Extension)
2. Fallback: `localStorage` (for development)
3. Storage key: `zikr-theme`

### Theme Application
1. On page load, inline script reads stored theme from `localStorage`
2. Applies appropriate class (`dark` or `light`) to `<html>` element
3. React app initializes with `ThemeProvider`
4. All components use CSS variables for styling
5. Changes persist to storage automatically

## Usage

### In Components
```tsx
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  
  // Use CSS variables for styling
  return (
    <div style={{ 
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      Current theme: {resolvedTheme}
    </div>
  );
}
```

### Available CSS Variables
```css
/* Backgrounds */
var(--bg-primary)     /* Main background */
var(--bg-card)        /* Card background */
var(--bg-surface)     /* Surface/elevated background */
var(--bg-input)       /* Input field background */

/* Text colors */
var(--text-primary)   /* Main text */
var(--text-secondary) /* Secondary text */
var(--text-tertiary)  /* Muted text */
var(--text-muted)     /* Placeholder/very muted text */

/* Borders & Effects */
var(--border-color)   /* Default border color */
var(--border-focus)   /* Focus state border */
var(--glass-bg)       /* Glass effect background */
var(--glass-border)   /* Glass effect border */
var(--glass-shadow)   /* Glass effect shadow */

/* Icons */
var(--icon-color)         /* Primary icon color */
var(--icon-color-muted)   /* Muted icon color */
var(--icon-color-hover)   /* Icon color on hover */

/* Scrollbar */
var(--scrollbar-thumb)        /* Scrollbar thumb */
var(--scrollbar-thumb-hover)  /* Scrollbar thumb hover */
```

## Design Decisions

1. **CSS Variables over Tailwind classes**: Provides more flexibility and easier maintenance
2. **Three theme options**: Gives users full control - system preference or manual override
3. **Inline script for initial theme**: Prevents flash of wrong theme before React loads
4. **Chrome storage API**: Properly persists theme for Chrome Extension context
5. **Gold accent color maintained**: Primary brand color (#C5A059) works well in both themes
6. **Glass morphism preserved**: Works beautifully in both dark and light modes

## Browser Support
- Chrome Extension (Manifest V3)
- Modern browsers with CSS Custom Properties support
- Respects `prefers-color-scheme` media query

## Files Changed
1. `src/context/ThemeContext.tsx` - New: Theme state management
2. `src/components/ThemeToggle.tsx` - New: Theme toggle button
3. `src/index.css` - Updated: CSS variables and theme styles
4. `src/popup/index.html` - Updated: Theme initialization script
5. `src/popup/main.tsx` - Updated: ThemeProvider wrapper
6. `src/popup/App.tsx` - Updated: Theme integration
7. `src/components/Settings.tsx` - Updated: Theme selection UI
8. `src/components/VolumeControl.tsx` - Updated: Theme support
9. `src/components/SurahList.tsx` - Updated: Theme support
10. `tailwind.config.js` - Updated: Light theme colors

## Testing
Run the build to verify everything works:
```bash
npm run build
```

No errors should appear, and both themes should render correctly with smooth transitions.
