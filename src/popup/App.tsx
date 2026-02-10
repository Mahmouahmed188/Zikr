import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Search, Play, Pause, SkipBack, SkipForward, Loader2 } from 'lucide-react';
import Waveform from '../components/Waveform';
import VolumeControl from '../components/VolumeControl';
import SettingsPage from '../components/Settings';
import RecitersPage from '../components/RecitersPage';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { usePlayer } from '../context/PlayerContext';
import { Surah } from '../types';

// Format time for display
const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

type ViewState = 'main' | 'settings' | 'reciters';

const App: React.FC = () => {
    const { t } = useTranslation();
    useTheme();
    const {
        surahs,
        currentSurah,
        currentReciter,
        isPlaying,
        isLoading: playerLoading,
        isDataLoading,
        currentTime,
        duration,
        volume,
        error: playerError,
        playSurah,
        togglePlay,
        playNext,
        playPrevious,
        seek,
        setVolume,
        clearError
    } = usePlayer();

    // View state
    const [currentView, setCurrentView] = useState<ViewState>('main');

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);

    // Filter surahs based on search query
    const filteredSurahs = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase().trim();
        return surahs.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.englishName?.toLowerCase().includes(q) ||
            s.id.toString() === q
        ).slice(0, 10);
    }, [surahs, searchQuery]);

    // Handle surah selection
    const handleSelectSurah = (surah: Surah) => {
        playSurah(surah);
        setSearchQuery('');
        setShowSearchResults(false);
    };

    // Handle progress bar click
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const newTime = percentage * duration;
        seek(newTime);
    };

    return (
        <div className="w-[500px] h-[550px] flex flex-col select-none relative overflow-hidden font-sans mx-auto"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

            {/* Error Toast */}
            {playerError && (
                <div className="absolute top-4 left-4 right-4 z-50 p-3 rounded-xl flex items-center justify-between"
                    style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.9)',
                        color: 'white'
                    }}>
                    <p className="text-sm">{playerError.startsWith('errors.') ? t(playerError) : playerError}</p>
                    <button onClick={clearError} className="text-sm font-bold px-2">✕</button>
                </div>
            )}

            {/* Conditionally render based on current view */}
            {currentView === 'settings' ? (
                <SettingsPage
                    currentReciterName={currentReciter?.name || t('reciter.selectReciter')}
                    onOpenReciters={() => setCurrentView('reciters')}
                    onBack={() => setCurrentView('main')}
                />
            ) : currentView === 'reciters' ? (
                <RecitersPage onClose={() => setCurrentView('main')} />
            ) : (
                // Main View
                <>
                    {/* Content Container */}
                    <div className="flex-1 flex flex-col px-5 pt-4 pb-4 overflow-hidden">

                        {/* Header */}
                        <header className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center border border-primary/30 gold-glow gold-glow-hover overflow-hidden transition-all duration-300">
                                    <img
                                        src="/icons/icon.png"
                                        alt={t('app.name')}
                                        className="w-full h-full object-contain p-1.5"
                                        loading="eager"
                                    />
                                </div>
                                <h1 className="text-2xl font-semibold tracking-tight gold-text drop-shadow-sm">{t('app.name')}</h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <ThemeToggle />
                                <button
                                    onClick={() => setCurrentView('settings')}
                                    className="p-2.5 rounded-full glass hover:bg-white/10 dark:hover:bg-white/10 transition-colors group"
                                >
                                    <SettingsIcon size={20} className="text-primary group-hover:rotate-90 transition-transform duration-500" />
                                </button>
                            </div>
                        </header>

                        {/* Search Bar */}
                        <div className="relative group z-50 mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
                                style={{ color: 'var(--text-muted)' }} size={16} />
                            <input
                                type="text"
                                placeholder={t('surah.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSearchResults(e.target.value.length > 0);
                                }}
                                onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                                className="w-full h-10 pl-10 pr-3 text-sm rounded-xl theme-input shadow-inner"
                            />
                            {isDataLoading && (
                                <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin"
                                    style={{ color: 'var(--text-muted)' }} />
                            )}

                            {/* Search Results Dropdown */}
                            {showSearchResults && (
                                <div className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl p-2 border max-h-60 overflow-y-auto animate-fade-in custom-scrollbar z-50"
                                    style={{ borderColor: 'var(--glass-border)' }}>
                                    {filteredSurahs.length > 0 ? (
                                        filteredSurahs.map(surah => (
                                            <button
                                                key={surah.id}
                                                onClick={() => handleSelectSurah(surah)}
                                                className="w-full flex items-center justify-between p-3 rounded-xl text-sm transition-colors group text-left"
                                                style={{
                                                    color: 'var(--text-secondary)',
                                                    backgroundColor: currentSurah?.id === surah.id
                                                        ? 'rgba(197, 160, 89, 0.1)'
                                                        : 'transparent'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (currentSurah?.id !== surah.id) {
                                                        e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                                                        e.currentTarget.style.color = 'var(--hover-text)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (currentSurah?.id !== surah.id) {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                                    }
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                                                        style={{
                                                            backgroundColor: 'var(--bg-surface)',
                                                            color: 'var(--text-muted)'
                                                        }}>
                                                        {surah.id}
                                                    </span>
                                                    <span className="group-hover:text-primary transition-colors">
                                                        {surah.englishName || surah.name}
                                                    </span>
                                                </div>
                                                <span className="font-amiri opacity-60 text-lg">{surah.name}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                            {searchQuery ? t('surah.noResults') : t('surah.startTyping')}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Main Surah Card */}
                        <div className="relative glass rounded-[32px] px-6 py-5 flex flex-col items-center overflow-hidden border shadow-glass group gold-glow-hover transition-all duration-700 flex-1"
                            style={{ borderColor: 'var(--glass-border)' }}>

                            {isDataLoading ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                    <Loader2 size={40} className="animate-spin" style={{ color: '#C5A059' }} />
                                    <p style={{ color: 'var(--text-muted)' }}>{t('player.loadingQuran')}</p>
                                </div>
                            ) : (
                                <>
                                    {/* Background Glow */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary opacity-5 blur-[100px] pointer-events-none group-hover:opacity-10 transition-opacity duration-700" />

                                    {/* Surah Info Badge */}
                                    <div className="px-3 py-1 rounded-full border mb-4 backdrop-blur-md"
                                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                                        <span className="text-[9px] font-bold tracking-[0.15em] uppercase"
                                            style={{ color: 'var(--text-tertiary)' }}>
                                            {currentSurah ? `${t('surah.title')} ${currentSurah.id}` : t('surah.selectToBegin')}
                                            {currentSurah?.revelationType && ` • ${currentSurah.revelationType}`}
                                        </span>
                                    </div>

                                    {/* Surah Display */}
                                    {currentSurah ? (
                                        <>
                                            <div className="text-6xl font-amiri mb-3 gold-text drop-shadow-lg scale-100 group-hover:scale-110 transition-transform duration-700 ease-in-out">
                                                {currentSurah.script || currentSurah.name.charAt(0)}
                                            </div>

                                            <h2 className="text-xl font-bold gold-text tracking-wide mb-1.5 uppercase text-center">
                                                {currentSurah.englishName || currentSurah.name}
                                            </h2>
                                            <h3 className="text-base font-amiri mb-2" style={{ color: 'var(--text-tertiary)' }}>
                                                {currentSurah.name}
                                            </h3>

                                            {currentSurah.verses && (
                                                <div className="text-[10px] font-medium uppercase tracking-wider flex items-center gap-2 mb-3"
                                                    style={{ color: 'var(--text-muted)' }}>
                                                    <span>{currentSurah.verses} {t('surah.verses')}</span>
                                                    {currentSurah.revelationType && (
                                                        <>
                                                            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
                                                            <span>{currentSurah.revelationType}</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                                            <div className="text-5xl mb-4">📖</div>
                                            <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                                {t('surah.selectToBegin')}
                                            </p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {t('surah.useSearch')}
                                            </p>
                                        </div>
                                    )}

                                    {/* Waveform Visualization */}
                                    <Waveform isPlaying={isPlaying} />

                                    {/* Progress Bar */}
                                    {currentSurah && duration > 0 && (
                                        <div className="w-full mt-2 mb-3">
                                            <div
                                                className="h-1 rounded-full cursor-pointer relative overflow-hidden"
                                                style={{ backgroundColor: 'var(--bg-surface)' }}
                                                onClick={handleProgressClick}
                                            >
                                                <div
                                                    className="absolute left-0 top-0 h-full rounded-full transition-all"
                                                    style={{
                                                        width: `${(currentTime / duration) * 100}%`,
                                                        backgroundColor: '#C5A059'
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                                    {formatTime(currentTime)}
                                                </span>
                                                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                                    {formatTime(duration)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Player Controls */}
                                    <div className="w-full flex items-center justify-between mt-4">
                                        {/* Volume Control */}
                                        <div className="flex-1">
                                            <VolumeControl
                                                volume={volume}
                                                onVolumeChange={setVolume}
                                            />
                                        </div>

                                        {/* Playback Controls */}
                                        <div className="flex items-center gap-4 mx-4">
                                            <button
                                                className="transition-all hover:scale-110 active:scale-95"
                                                style={{ color: 'var(--icon-color-muted)' }}
                                                onClick={playPrevious}
                                                disabled={!currentSurah}
                                                onMouseEnter={(e) => currentSurah && (e.currentTarget.style.color = 'var(--icon-color-hover)')}
                                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--icon-color-muted)'}
                                            >
                                                <SkipBack size={20} />
                                            </button>

                                            <button
                                                onClick={togglePlay}
                                                disabled={!currentSurah || playerLoading}
                                                className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center shadow-lg hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
                                                style={{ boxShadow: 'var(--shadow-gold)' }}
                                            >
                                                {playerLoading ? (
                                                    <Loader2 size={24} className="animate-spin" style={{ color: 'var(--bg-primary)' }} />
                                                ) : isPlaying ? (
                                                    <Pause size={24} fill="currentColor" style={{ color: 'var(--bg-primary)' }} />
                                                ) : (
                                                    <Play size={24} fill="currentColor" style={{ color: 'var(--bg-primary)' }} className="ml-1" />
                                                )}
                                            </button>

                                            <button
                                                className="transition-all hover:scale-110 active:scale-95"
                                                style={{ color: 'var(--icon-color-muted)' }}
                                                onClick={playNext}
                                                disabled={!currentSurah}
                                                onMouseEnter={(e) => currentSurah && (e.currentTarget.style.color = 'var(--icon-color-hover)')}
                                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--icon-color-muted)'}
                                            >
                                                <SkipForward size={20} />
                                            </button>
                                        </div>

                                        {/* Reciter Display - Clickable */}
                                        <div
                                            className="flex flex-col items-end flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => setCurrentView('reciters')}
                                        >
                                            <span className="text-[7px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>
                                                {t('player.reciterLabel')}
                                            </span>
                                            <div className="flex items-center gap-1.5 p-0.5 pl-2 pr-0.5 rounded-full border"
                                                style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
                                                <span className="font-amiri text-[11px] opacity-90 whitespace-nowrap">
                                                    {currentReciter?.name || t('common.select')}
                                                </span>
                                                <div className="w-5 h-5 rounded-full border border-primary/30 flex items-center justify-center text-[8px] font-bold"
                                                    style={{ backgroundColor: 'var(--bg-surface)' }}>
                                                    {currentReciter?.letter || '?'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default App;
