import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
        <div className="flex flex-col h-full animate-slide-up"
             style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="p-4 sticky top-0 z-10 backdrop-blur-md border-b"
                 style={{ 
                     backgroundColor: 'var(--bg-surface)',
                     borderColor: 'var(--border-color)'
                 }}>
                <h2 className="text-xs uppercase font-bold mb-2 tracking-wider"
                    style={{ color: 'var(--text-muted)' }}>
                    {t('player.nowPlayingFrom')}
                </h2>
                <p className="text-sm font-semibold text-primary truncate mb-3">
                    {currentReciterName}
                </p>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5" 
                            style={{ color: 'var(--text-muted)' }} size={16} />
                    <input
                        className="w-full p-2 pl-9 rounded-lg text-sm border outline-none transition-all theme-input"
                        placeholder={t('surah.searchPlaceholder')}
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
                            className="w-full text-left p-2.5 rounded-lg flex items-center justify-between group transition-all"
                            style={{
                                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                                color: isActive ? '#FFFFFF' : 'var(--text-primary)',
                                boxShadow: isActive ? 'var(--shadow-gold)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 flex items-center justify-center rounded-md font-mono text-xs font-bold"
                                      style={{
                                          backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-surface)',
                                          color: isActive ? '#FFFFFF' : 'var(--text-muted)'
                                      }}>
                                    {surah.id}
                                </span>
                                <div>
                                    <h4 className="text-sm font-semibold"
                                        style={{ color: isActive ? '#FFFFFF' : 'var(--text-primary)' }}>
                                        {surah.name}
                                    </h4>
                                    <p className="text-[10px] uppercase font-medium tracking-wide"
                                       style={{ color: isActive ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                                        {meta.englishName}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                                      style={{
                                          borderColor: isActive ? 'rgba(255,255,255,0.3)' : 'var(--border-color)',
                                          color: isActive ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)'
                                      }}>
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
