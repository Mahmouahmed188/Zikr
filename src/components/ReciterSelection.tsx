import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Music, Check, BookOpen } from 'lucide-react';
import { Reciter } from '../types';
import {
    normalizeArabic,
    normalizeEnglish,
    detectLanguage
} from '../utils/textNormalization';

interface ReciterSelectionProps {
    reciters: Reciter[];
    selectedId?: number;
    onSelect: (reciter: Reciter) => void;
    onClose: () => void;
}

const ReciterSelection: React.FC<ReciterSelectionProps> = ({ reciters, selectedId, onSelect, onClose }) => {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');

    const filteredReciters = useMemo(() => {
        if (!search.trim()) return reciters;

        const trimmedSearch = search.trim();
        const searchLang = detectLanguage(trimmedSearch);
        
        const normalizedSearch = searchLang === 'arabic' 
            ? normalizeArabic(trimmedSearch)
            : normalizeEnglish(trimmedSearch);

        return reciters
            .map(reciter => {
                const searchTerms = [
                    reciter.name,
                    reciter.letter,
                    reciter.englishName || '',
                    reciter.name_ar || '',
                    reciter.name_en || '',
                    ...(reciter.nameVariants || [])
                ].filter(Boolean);

                let score = 0;
                let matchType: 'exact' | 'prefix' | 'word-start' | 'contains' | null = null;

                for (const term of searchTerms) {
                    const normalizedTerm = searchLang === 'arabic'
                        ? normalizeArabic(term)
                        : normalizeEnglish(term);

                    if (normalizedSearch.length === 0) continue;

                    if (normalizedTerm === normalizedSearch) {
                        score = 100;
                        matchType = 'exact';
                        break;
                    }

                    if (normalizedTerm.startsWith(normalizedSearch)) {
                        const prefixScore = 90 + (normalizedSearch.length / normalizedTerm.length) * 10;
                        score = Math.max(score, prefixScore);
                        matchType = 'prefix';
                        continue;
                    }

                    const words = normalizedTerm.split(/\s+/);
                    for (const word of words) {
                        if (word.startsWith(normalizedSearch)) {
                            score = Math.max(score, 75 + (normalizedSearch.length / word.length) * 15);
                            matchType = 'word-start';
                            break;
                        }
                    }

                    if (normalizedTerm.includes(normalizedSearch)) {
                        const containsScore = 50 + (normalizedSearch.length / normalizedTerm.length) * 20;
                        score = Math.max(score, containsScore);
                        if (!matchType) matchType = 'contains';
                    }
                }

                return { reciter, score, matchType };
            })
            .filter(({ score, matchType }) => score > 0 && matchType !== null)
            .sort((a, b) => b.score - a.score)
            .map(({ reciter }) => reciter);
    }, [reciters, search]);

    const handleSelectReciter = (reciter: Reciter) => {
        onSelect(reciter);
        onClose();
    };

    return (
        <div className="flex flex-col h-full bg-light-bg dark:bg-dark-bg animate-slide-up">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                        className="w-full bg-gray-100 dark:bg-dark-surface p-2.5 pl-10 rounded-xl text-sm outline-none focus:ring-2 ring-primary/50 transition-all font-medium text-gray-700 dark:text-gray-200 placeholder-gray-500"
                        placeholder={t('reciter.searchPlaceholder')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        >
                            {t('common.clear')}
                        </button>
                    )}
                </div>
                {search && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <BookOpen size={12} />
                        <span>
                            {detectLanguage(search) === 'arabic' 
                                ? 'بحث باللغة العربية' 
                                : 'English search enabled'}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {filteredReciters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 py-12">
                        <Music size={48} className="text-gray-300 dark:text-gray-600" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {search ? t('reciter.noResults') : t('reciter.noRecitersAvailable')}
                        </p>
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="text-sm mt-2 px-4 py-2 rounded-lg border border-primary/20 text-primary hover:bg-primary/5 transition-colors"
                            >
                                {t('common.clear')}
                            </button>
                        )}
                    </div>
                ) : (
                    filteredReciters.map(reciter => (
                        <button
                            key={reciter.id}
                            onClick={() => handleSelectReciter(reciter)}
                            className={`w-full text-left p-3 mb-1 rounded-lg flex items-center gap-3 transition-colors ${selectedId === reciter.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${selectedId === reciter.id ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                {reciter.letter || reciter.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className={`text-sm font-semibold truncate ${selectedId === reciter.id ? 'text-primary' : 'text-gray-800 dark:text-gray-200'}`}>
                                    {reciter.name}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-0.5"><Music size={10} /> {reciter.moshaf[0]?.name || t('reciter.unknownStyle')}</span>
                                </div>
                            </div>
                            {selectedId === reciter.id && (
                                <Check size={18} className="text-primary" />
                            )}
                        </button>
                    ))
                )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button onClick={onClose} className="w-full py-3 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:brightness-95 transition-all">
                    {t('common.cancel')}
                </button>
            </div>
        </div>
    );
};

export default ReciterSelection;