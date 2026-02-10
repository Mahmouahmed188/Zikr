import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'zikr-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Try chrome.storage.local first (for extension)
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          const result = await chrome.storage.local.get([STORAGE_KEY]);
          const savedTheme = result[STORAGE_KEY] as Theme | undefined;
          if (savedTheme) {
            setThemeState(savedTheme);
          }
        } else {
          // Fallback to localStorage (for development)
          const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null;
          if (savedTheme) {
            setThemeState(savedTheme);
          }
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
      setMounted(true);
    };

    loadTheme();
  }, []);

  // Update resolved theme whenever theme changes
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setResolvedTheme(systemPrefersDark ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Remove old theme classes
    root.classList.remove('dark', 'light');
    
    // Add current theme class
    root.classList.add(resolvedTheme);
    
    // Set data-theme attribute for CSS variable targeting
    root.setAttribute('data-theme', resolvedTheme);

    // Save theme to storage
    const saveTheme = async () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          await chrome.storage.local.set({ [STORAGE_KEY]: theme });
        } else {
          localStorage.setItem(STORAGE_KEY, theme);
        }
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    };

    saveTheme();
  }, [theme, resolvedTheme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((current) => {
      if (current === 'dark') return 'light';
      if (current === 'light') return 'dark';
      // If system, check what the resolved theme is and toggle
      return resolvedTheme === 'dark' ? 'light' : 'dark';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
