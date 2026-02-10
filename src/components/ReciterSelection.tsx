import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Music, Check } from 'lucide-react';
import { Reciter } from '../types';

interface ReciterSelectionProps {
    reciters: Reciter[];
    selectedId?: number;
    onSelect: (reciter: Reciter) => void;
    onClose: () => void;
}

const ReciterSelection: React.FC<ReciterSelectionProps> = ({ reciters, selectedId, onSelect, onClose }) => {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        return reciters.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    }, [reciters, search]);

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
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {filtered.map(reciter => (
                    <button
                        key={reciter.id}
                        onClick={() => { onSelect(reciter); onClose(); }}
                        className={`w-full text-left p-3 mb-1 rounded-lg flex items-center gap-3 transition-colors ${selectedId === reciter.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent'}`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${selectedId === reciter.id ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                            {reciter.letter || reciter.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`text-sm font-semibold truncate ${selectedId === reciter.id ? 'text-primary' : 'text-gray-800 dark:text-gray-200'}`}>
                                {reciter.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="flex items-center gap-0.5"><Music size={10} /> {reciter.moshaf[0]?.name || t('reciter.unknownStyle')}</span>
                            </div>
                        </div>
                        {selectedId === reciter.id && (
                            <Check size={18} className="text-primary" />
                        )}
                    </button>
                ))}
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
