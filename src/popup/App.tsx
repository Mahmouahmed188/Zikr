import React, { useState, useMemo } from 'react';
import { Settings as SettingsIcon, Search, Play, Pause, SkipBack, SkipForward, ArrowLeft } from 'lucide-react';
import Waveform from '../components/Waveform';
import VolumeControl from '../components/VolumeControl';
import SettingsPage from '../components/Settings';
import { getSurahMeta } from '../data/surahMeta';

// Generate initial list of surahs from metadata
const INITIAL_SURAHS = Array.from({ length: 114 }, (_, i) => {
    const id = i + 1;
    const meta = getSurahMeta(id);
    return {
        id,
        name: meta.englishName,
        arabicName: meta.arabicName || meta.englishName,
        script: meta.script || meta.englishName.charAt(0),
        verses: meta.verses,
        revelation: meta.type,
        revelationType: meta.type
    };
});

const App: React.FC = () => {
    // View state
    const [currentView, setCurrentView] = useState<'main' | 'settings'>('main');

    // Main app state
    const [searchQuery, setSearchQuery] = useState('');
    const [currentSurah, setCurrentSurah] = useState(INITIAL_SURAHS[0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.7);

    // Settings state
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [language, setLanguage] = useState<'eng' | 'ar'>('eng');
    const [currentReciter] = useState('فارس عباد');

    // Filter surahs based on search query
    const filteredSurahs = useMemo(() => {
        if (!searchQuery) return [];
        const q = searchQuery.toLowerCase();
        return INITIAL_SURAHS.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.arabicName.toLowerCase().includes(q) ||
            s.id.toString() === q
        );
    }, [searchQuery]);



    return (
        <div className="w-[500px] h-[600px] bg-dark-bg text-white flex flex-col select-none relative overflow-hidden font-sans mx-auto">

            {/* Conditionally render based on current view */}
            {currentView === 'settings' ? (
                // Settings View
                <div className="flex flex-col h-full">
                    {/* Settings Header with Back Button */}
                    <header className="flex items-center justify-between p-6 border-b border-white/5">
                        <button
                            onClick={() => setCurrentView('main')}
                            className="p-2.5 rounded-full glass hover:bg-white/10 transition-colors group"
                        >
                            <ArrowLeft size={20} className="text-primary group-hover:-translate-x-1 transition-transform duration-300" />
                        </button>
                        <h1 className="text-xl font-semibold tracking-tight gold-text">Settings</h1>
                        <div className="w-10" /> {/* Spacer for centering */}
                    </header>

                    {/* Settings Component */}
                    <SettingsPage
                        currentReciterName={currentReciter}
                        onOpenReciters={() => {
                            // TODO: Implement reciter selection
                            console.log('Open reciter selection');
                        }}
                        isDark={isDarkMode}
                        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
                        language={language}
                        onToggleLanguage={() => setLanguage(language === 'eng' ? 'ar' : 'eng')}
                        onBack={() => setCurrentView('main')}
                    />
                </div>
            ) : (
                // Main View
                <>

                    {/* Content Container - No Scroll */}
                    <div className="flex-1 flex flex-col px-5 pt-4 pb-4 overflow-hidden">

                        {/* Header */}
                        <header className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center border border-primary/30 shadow-gold-glow overflow-hidden">
                                    <img
                                        src="/icons/icon.png"
                                        alt="Zikr App Icon"
                                        className="w-full h-full object-contain p-1.5"
                                        loading="eager"
                                    />
                                </div>
                                <h1 className="text-2xl font-semibold tracking-tight gold-text drop-shadow-sm">Zikr</h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setCurrentView('settings')}
                                    className="p-2.5 rounded-full glass hover:bg-white/10 transition-colors group"
                                >
                                    <SettingsIcon size={20} className="text-primary group-hover:rotate-90 transition-transform duration-500" />
                                </button>
                            </div>
                        </header>

                        {/* Search Bar - Compact */}
                        <div className="relative group z-50 mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search Surah..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-10 pl-10 pr-3 text-sm bg-dark-card rounded-xl border border-dark-border focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/20 shadow-inner"
                            />
                            {searchQuery && (
                                <div className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl p-2 border border-white/10 shadow-2xl max-h-60 overflow-y-auto animate-fade-in custom-scrollbar">
                                    {filteredSurahs.length > 0 ? (
                                        filteredSurahs.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => {
                                                    setCurrentSurah(s);
                                                    setSearchQuery('');
                                                }}
                                                className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl text-sm transition-colors group"
                                            >
                                                <span className="text-white/90 group-hover:text-primary transition-colors">{s.id}. {s.name}</span>
                                                <span className="font-amiri opacity-60 text-lg">{s.arabicName}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-white/40 text-sm">No surahs found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Main Surah Card - Compact */}
                        <div className="relative glass rounded-[32px] px-6 py-5 flex flex-col items-center overflow-hidden border border-white/10 shadow-glass group hover:shadow-gold-glow transition-shadow duration-700 flex-1">
                            {/* Background Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary opacity-5 blur-[100px] pointer-events-none group-hover:opacity-10 transition-opacity duration-700" />

                            <div className="bg-dark-card/60 px-3 py-1 rounded-full border border-white/5 mb-4 backdrop-blur-md">
                                <span className="text-[9px] font-bold tracking-[0.15em] text-white/60 uppercase">
                                    Surah {currentSurah.id} • {currentSurah.revelation}
                                </span>
                            </div>

                            <div className="text-6xl font-amiri mb-3 gold-text drop-shadow-lg scale-100 group-hover:scale-110 transition-transform duration-700 ease-in-out">
                                {currentSurah.script}
                            </div>

                            <h2 className="text-xl font-bold gold-text tracking-wide mb-1.5 uppercase text-center">
                                {currentSurah.name}
                            </h2>
                            <h3 className="text-base font-amiri text-white/50 mb-2">{currentSurah.arabicName}</h3>

                            <div className="text-white/40 text-[10px] font-medium uppercase tracking-wider flex items-center gap-2 mb-3">
                                <span>{currentSurah.verses} Verses</span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span>{currentSurah.revelation}</span>
                            </div>

                            <Waveform isPlaying={isPlaying} />

                            {/* Player Controls */}
                            <div className="w-full flex items-center justify-between mt-4">
                                {/* Volume Control */}
                                <div className="flex-1">
                                    <VolumeControl volume={volume} onVolumeChange={setVolume} />
                                </div>


                                <div className="flex items-center gap-4 mx-4">
                                    <button className="text-white/40 hover:text-white transition-colors hover:scale-110 active:scale-95">
                                        <SkipBack size={20} />
                                    </button>
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-300"
                                    >
                                        {isPlaying ? (
                                            <Pause size={24} fill="currentColor" className="text-dark-bg" />
                                        ) : (
                                            <Play size={24} fill="currentColor" className="text-dark-bg ml-1" />
                                        )}
                                    </button>
                                    <button className="text-white/40 hover:text-white transition-colors hover:scale-110 active:scale-95">
                                        <SkipForward size={20} />
                                    </button>
                                </div>

                                <div className="flex flex-col items-end flex-1 cursor-pointer hover:opacity-80 transition-opacity">
                                    <span className="text-[7px] text-white/30 uppercase tracking-widest mb-0.5">Reciter</span>
                                    <div className="flex items-center gap-1.5 p-0.5 pl-2 pr-0.5 rounded-full bg-white/5 border border-white/5">
                                        <span className="font-amiri text-[11px] opacity-90 whitespace-nowrap">فارس عباد</span>
                                        <img src="https://picsum.photos/seed/reciter/40/40" className="w-5 h-5 rounded-full border border-primary/30" alt="Reciter" />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>



                </>
            )}

        </div>
    );
};

export default App;
