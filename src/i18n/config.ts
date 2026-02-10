import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from '../locales/en/translation.json';
import arTranslation from '../locales/ar/translation.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  ar: {
    translation: arTranslation,
  },
};

// Custom language detector for Chrome extension environment
const chromeStorageLanguageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Try chrome.storage.local first (for extension)
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const result = await chrome.storage.local.get(['zikr-language']);
        const savedLanguage = result['zikr-language'];
        if (savedLanguage) {
          callback(savedLanguage);
          return;
        }
      }
      // Fallback to localStorage (for development)
      const savedLanguage = localStorage.getItem('zikr-language');
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
    } catch (error) {
      console.error('Error detecting language:', error);
    }
    // Default to Arabic
    callback('ar');
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(chromeStorageLanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Helper function to change language and persist it
export const changeLanguage = async (lng: 'en' | 'ar') => {
  await i18n.changeLanguage(lng);
  
  // Update document direction
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  
  // Persist language
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ 'zikr-language': lng });
    } else {
      localStorage.setItem('zikr-language', lng);
    }
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

// Helper function to get current language
type Language = 'en' | 'ar';

export const getCurrentLanguage = (): Language => {
  return (i18n.language as Language) || 'ar';
};

// Helper function to toggle language
export const toggleLanguage = async (): Promise<Language> => {
  const currentLang = getCurrentLanguage();
  const newLang: Language = currentLang === 'ar' ? 'en' : 'ar';
  await changeLanguage(newLang);
  return newLang;
};
