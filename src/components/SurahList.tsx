import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Surah } from '../types';
import { getSurahMeta } from '../data/surahMeta';

interface SurahListProps {
    surahs: Surah[];
    activeSurahId?: number;
    onSelect: (surah: Surah) => void;
    currentReciterName: string;
}

const SurahList: React.FC<SurahListProps> = ({ surahs, activeSurahId, onSelect, currentReciterName }) => {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return surahs.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.id.toString().includes(q) ||
            getSurahMeta(s.id).englishName.toLowerCase().includes(q)
        );
    }, [surahs, search]);

    return (
        <div className="flex flex-col h-full bg-light-bg dark:bg-dark-bg animate-slide-up">
            <div className="p-4 bg-light-surface dark:bg-dark-surface/50 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 backdrop-blur-md">
                <h2 className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-2 tracking-wider">Now Playing From</h2>
                <p className="text-sm font-semibold text-primary truncate mb-3">{currentReciterName}</p>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input
                        className="w-full bg-white dark:bg-dark-card p-2 pl-9 rounded-lg text-sm border border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-gray-400 text-gray-700 dark:text-white"
                        placeholder="Search Surah by Name or Number..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {filtered.map(surah => {
                    const meta = getSurahMeta(surah.id);
                    const isActive = activeSurahId === surah.id;
                    return (
                        <button
                            key={surah.id}
                            onClick={() => onSelect(surah)}
                            className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between group transition-all ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 flex items-center justify-center rounded-md font-mono text-xs font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
                                    {surah.id}
                                </span>
                                <div>
                                    <h4 className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`} lang="ar">{surah.name}</h4>
                                    <p className={`text-[10px] uppercase font-medium tracking-wide ${isActive ? 'text-white/80' : 'text-gray-400'}`}>{meta.englishName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${isActive ? 'border-white/30 text-white/90' : 'border-gray-200 dark:border-gray-700 text-gray-400'}`}>
                                    {meta.type}
                                </span>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default SurahList;
