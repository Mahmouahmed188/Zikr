import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { changeLanguage as i18nChangeLanguage, getCurrentLanguage, toggleLanguage as i18nToggleLanguage } from '../i18n/config';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  dir: 'ltr' | 'rtl';
  setLanguage: (lang: Language) => Promise<void>;
  toggleLanguage: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [mounted, setMounted] = useState(false);

  // Initialize language on mount
  useEffect(() => {
    const initLanguage = async () => {
      // Set initial direction
      const currentLang = getCurrentLanguage();
      setLanguageState(currentLang);
      document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
      setMounted(true);
    };

    initLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    await i18nChangeLanguage(lang);
    setLanguageState(lang);
  };

  const toggleLanguage = async () => {
    const newLang = await i18nToggleLanguage();
    setLanguageState(newLang);
  };

  const dir: 'ltr' | 'rtl' = language === 'ar' ? 'rtl' : 'ltr';

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, dir, setLanguage, toggleLanguage }}>
      <div dir={dir}>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
