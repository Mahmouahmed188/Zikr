import { useTranslation } from 'react-i18next';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { t } = useTranslation();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-full glass hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 group"
      aria-label={resolvedTheme === 'dark' ? t('settings.theme.lightMode') : t('settings.theme.darkMode')}
      title={resolvedTheme === 'dark' ? t('settings.theme.lightMode') : t('settings.theme.darkMode')}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon */}
        <Sun 
          size={20} 
          className={`absolute inset-0 transition-all duration-300 ${
            resolvedTheme === 'dark' 
              ? 'opacity-0 rotate-90 scale-50 text-yellow-400' 
              : 'opacity-100 rotate-0 scale-100 text-orange-500'
          }`}
        />
        
        {/* Moon Icon */}
        <Moon 
          size={20} 
          className={`absolute inset-0 transition-all duration-300 ${
            resolvedTheme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100 text-primary' 
              : 'opacity-0 -rotate-90 scale-50 text-indigo-400'
          }`}
        />
      </div>
      
      {/* Hover glow effect */}
      <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
        resolvedTheme === 'dark' 
          ? 'opacity-0 group-hover:opacity-20 bg-primary/20' 
          : 'opacity-0 group-hover:opacity-30 bg-orange-500/20'
      }`} />
    </button>
  );
}
