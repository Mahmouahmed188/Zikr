import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Music, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { Reciter } from '../types';
import { usePlayer } from '../context/PlayerContext';

interface RecitersPageProps {
    onClose: () => void;
}

const RecitersPage: React.FC<RecitersPageProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const { reciters, currentReciter, setReciter, isDataLoading } = usePlayer();
    const [search, setSearch] = useState('');

    const filteredReciters = useMemo(() => {
        if (!search.trim()) return reciters;
        const searchTerm = search.toLowerCase().trim();
        return reciters.filter(r => 
            r.name.toLowerCase().includes(searchTerm) ||
            r.letter.toLowerCase().includes(searchTerm)
        );
    }, [reciters, search]);

    const handleSelectReciter = (reciter: Reciter) => {
        setReciter(reciter);
        onClose();
    };

    return (
        <div className="flex flex-col h-full animate-fade-in"
             style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* Header */}
            <header className="flex items-center gap-3 p-6 border-b"
                    style={{ borderColor: 'var(--border-color)' }}>
                <button
                    onClick={onClose}
                    className="p-2.5 rounded-full glass hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft size={20} style={{ color: 'var(--text-primary)' }} />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-semibold tracking-tight gold-text">{t('reciter.selectReciter')}</h1>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {t('reciter.recitersAvailable', { count: reciters.length })}
                    </p>
                </div>
            </header>

            {/* Search */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2"
                            style={{ color: 'var(--text-muted)' }} size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('reciter.searchPlaceholder')}
                        className="w-full h-11 pl-11 pr-4 rounded-xl theme-input text-sm"
                        autoFocus
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-md"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {t('common.clear')}
                        </button>
                    )}
                </div>
            </div>

            {/* Reciters List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                {isDataLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <Loader2 size={32} className="animate-spin" style={{ color: '#C5A059' }} />
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {t('common.loading')}
                        </p>
                    </div>
                ) : filteredReciters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 py-12">
                        <Music size={48} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {search ? t('reciter.noResults') : t('reciter.noRecitersAvailable')}
                        </p>
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="text-sm mt-2 px-4 py-2 rounded-lg border transition-colors"
                                style={{ 
                                    color: '#C5A059',
                                    borderColor: 'rgba(197, 160, 89, 0.3)'
                                }}
                            >
                                {t('common.clear')}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredReciters.map(reciter => (
                            <button
                                key={reciter.id}
                                onClick={() => handleSelectReciter(reciter)}
                                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                                    currentReciter?.id === reciter.id 
                                        ? 'border' 
                                        : 'border border-transparent hover:bg-white/5 dark:hover:bg-white/5'
                                }`}
                                style={{
                                    backgroundColor: currentReciter?.id === reciter.id 
                                        ? 'rgba(197, 160, 89, 0.1)' 
                                        : 'var(--bg-card)',
                                    borderColor: currentReciter?.id === reciter.id 
                                        ? 'rgba(197, 160, 89, 0.3)' 
                                        : undefined
                                }}
                            >
                                <div 
                                    className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                        currentReciter?.id === reciter.id 
                                            ? '' 
                                            : ''
                                    }`}
                                    style={{
                                        backgroundColor: currentReciter?.id === reciter.id 
                                            ? 'rgba(197, 160, 89, 0.2)' 
                                            : 'var(--bg-surface)',
                                        color: currentReciter?.id === reciter.id 
                                            ? '#C5A059' 
                                            : 'var(--text-muted)'
                                    }}
                                >
                                    {reciter.letter || reciter.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`text-sm font-semibold truncate ${
                                        currentReciter?.id === reciter.id ? 'gold-text' : ''
                                    }`}
                                        style={{
                                            color: currentReciter?.id === reciter.id 
                                                ? undefined 
                                                : 'var(--text-primary)'
                                        }}
                                    >
                                        {reciter.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                        <Music size={10} />
                                        <span className="truncate">
                                            {reciter.moshaf[0]?.name || t('reciter.unknownStyle')}
                                        </span>
                                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
                                        <span>{reciter.moshaf[0]?.surah_total || 0} {t('reciter.surahs')}</span>
                                    </div>
                                </div>
                                {currentReciter?.id === reciter.id && (
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                                         style={{ backgroundColor: 'rgba(197, 160, 89, 0.2)' }}>
                                        <Check size={14} style={{ color: '#C5A059' }} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Current Selection Footer */}
            {currentReciter && (
                <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-3 p-3 rounded-xl"
                         style={{ backgroundColor: 'rgba(197, 160, 89, 0.1)' }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                             style={{ 
                                 backgroundColor: 'rgba(197, 160, 89, 0.2)',
                                 color: '#C5A059'
                             }}>
                            {currentReciter.letter || currentReciter.name[0]}
                        </div>
                        <div className="flex-1">
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('reciter.currentlySelected')}</p>
                            <p className="text-sm font-semibold gold-text">{currentReciter.name}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecitersPage;
