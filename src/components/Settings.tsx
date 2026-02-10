import React from 'react';
import { User, Moon, Sun, Globe, ChevronRight } from 'lucide-react';

interface SettingsProps {
    currentReciterName: string;
    onOpenReciters: () => void;
    isDark: boolean;
    onToggleTheme: () => void;
    language: 'eng' | 'ar';
    onToggleLanguage: () => void;
    onBack?: () => void; // Optional if not used
}

const Settings: React.FC<SettingsProps> = ({
    currentReciterName,
    onOpenReciters,
    isDark,
    onToggleTheme,
    language,
    onToggleLanguage
}) => {
    return (
        <div className="flex flex-col h-full bg-light-bg dark:bg-dark-bg animate-fade-in">
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h1>

                {/* Reciter Section */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Reciter</h2>
                    <button
                        onClick={onOpenReciters}
                        className="w-full flex items-center justify-between p-4 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary/50 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">{currentReciterName}</p>
                                <p className="text-xs text-gray-400">Tap to change</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Appearance */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Appearance</h2>
                    <button
                        onClick={onToggleTheme}
                        className="w-full flex items-center justify-between p-4 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-surface transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-orange-500/10 text-orange-500'}`}>
                                {isDark ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {isDark ? 'Dark Mode' : 'Light Mode'}
                            </span>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${isDark ? 'bg-primary justify-end' : 'bg-gray-300 justify-start'}`}>
                            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                        </div>
                    </button>
                </div>

                {/* Language */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Language</h2>
                    <button
                        onClick={onToggleLanguage}
                        className="w-full flex items-center justify-between p-4 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-surface transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <Globe size={20} />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {language === 'eng' ? 'English' : 'Arabic (العربية)'}
                            </span>
                        </div>
                        <span className="text-xs font-bold text-gray-400 px-2 py-1 bg-gray-100 dark:bg-dark-surface rounded-md">
                            {language.toUpperCase()}
                        </span>
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">Zikr Extension v1.0</p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
