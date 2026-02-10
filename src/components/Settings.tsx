import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Moon, Sun, Globe, ChevronRight, Monitor, ArrowLeft } from 'lucide-react';
import { useTheme, type Theme } from '../context/ThemeContext';
import { useLanguage, type Language } from '../context/LanguageContext';

interface SettingsProps {
    currentReciterName: string;
    onOpenReciters: () => void;
    onBack?: () => void;
}

const Settings: React.FC<SettingsProps> = ({
    currentReciterName,
    onOpenReciters,
    onBack
}) => {
    const { t } = useTranslation();
    const { theme, resolvedTheme, setTheme } = useTheme();
    const { language, setLanguage } = useLanguage();

    const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
        { 
            value: 'light', 
            label: t('settings.theme.light'), 
            icon: <Sun size={18} className="text-orange-500" /> 
        },
        { 
            value: 'dark', 
            label: t('settings.theme.dark'), 
            icon: <Moon size={18} className="text-indigo-400" /> 
        },
        { 
            value: 'system', 
            label: t('settings.theme.system'), 
            icon: <Monitor size={18} className="text-blue-500" /> 
        },
    ];

    const handleLanguageToggle = () => {
        const newLang: Language = language === 'ar' ? 'en' : 'ar';
        setLanguage(newLang);
    };

    return (
        <div className="flex flex-col h-full animate-fade-in overflow-y-auto custom-scrollbar"
             style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="p-6">
                {/* Header with Back Button */}
                {onBack && (
                    <header className="flex items-center gap-3 mb-6">
                        <button
                            onClick={onBack}
                            className="p-2.5 rounded-full glass hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft size={20} style={{ color: 'var(--text-primary)' }} />
                        </button>
                        <h1 className="text-xl font-semibold tracking-tight gold-text">{t('settings.title')}</h1>
                    </header>
                )}

                {/* Reciter Section */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)' }}>
                        {t('reciter.title')}
                    </h2>
                    <button
                        onClick={onOpenReciters}
                        className="w-full flex items-center justify-between p-4 rounded-xl border transition-all group"
                        style={{ 
                            backgroundColor: 'var(--bg-card)',
                            borderColor: 'var(--border-color)',
                            boxShadow: 'var(--glass-shadow)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-focus)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                 style={{ backgroundColor: 'rgba(197, 160, 89, 0.1)' }}>
                                <User size={20} className="text-primary" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium transition-colors"
                                   style={{ color: 'var(--text-primary)' }}>
                                    {currentReciterName}
                                </p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {t('common.tapToChange')}
                                </p>
                            </div>
                        </div>
                        <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} 
                                      className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Appearance - Theme Selection */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)' }}>
                        {t('settings.appearance')}
                    </h2>
                    
                    {/* Theme Options */}
                    <div className="grid grid-cols-3 gap-2">
                        {themeOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setTheme(option.value)}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300"
                                style={{
                                    backgroundColor: theme === option.value 
                                        ? 'var(--bg-surface)' 
                                        : 'var(--bg-card)',
                                    borderColor: theme === option.value 
                                        ? 'var(--primary)' 
                                        : 'var(--border-color)',
                                    boxShadow: theme === option.value 
                                        ? 'var(--shadow-gold)' 
                                        : 'var(--glass-shadow)'
                                }}
                            >
                                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                     style={{ 
                                         backgroundColor: theme === option.value 
                                            ? 'rgba(197, 160, 89, 0.15)' 
                                            : 'rgba(0, 0, 0, 0.05)'
                                     }}>
                                    {option.icon}
                                </div>
                                <span className="text-xs font-medium" 
                                      style={{ color: 'var(--text-primary)' }}>
                                    {option.label}
                                </span>
                                {theme === option.value && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Current Theme Display */}
                    <div className="mt-4 p-3 rounded-xl flex items-center justify-between"
                         style={{ 
                             backgroundColor: 'var(--bg-card)',
                             borderColor: 'var(--border-color)',
                             border: '1px solid var(--border-color)'
                         }}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                                 style={{ backgroundColor: 'rgba(197, 160, 89, 0.1)' }}>
                                {resolvedTheme === 'dark' ? (
                                    <Moon size={16} className="text-primary" />
                                ) : (
                                    <Sun size={16} className="text-orange-500" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                    {resolvedTheme === 'dark' ? t('settings.theme.darkMode') : t('settings.theme.lightMode')}
                                </p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {t('common.currentlyActive')}
                                </p>
                            </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                            resolvedTheme === 'dark' ? 'bg-indigo-400' : 'bg-orange-400'
                        }`} />
                    </div>
                </div>

                {/* Language */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)' }}>
                        {t('settings.language')}
                    </h2>
                    <button
                        onClick={handleLanguageToggle}
                        className="w-full flex items-center justify-between p-4 rounded-xl border transition-all group"
                        style={{ 
                            backgroundColor: 'var(--bg-card)',
                            borderColor: 'var(--border-color)',
                            boxShadow: 'var(--glass-shadow)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                 style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                                <Globe size={20} className="text-blue-500" />
                            </div>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                {language === 'en' ? t('settings.languages.english') : t('settings.languages.arabic')}
                            </span>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-md"
                              style={{ 
                                  color: 'var(--text-muted)',
                                  backgroundColor: 'var(--bg-surface)'
                              }}>
                            {language.toUpperCase()}
                        </span>
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {t('app.version')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
