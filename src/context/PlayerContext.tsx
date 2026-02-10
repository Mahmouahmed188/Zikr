import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { Surah, Reciter } from '../types';
import { getReciters, getSurahs, getAudioUrl } from '../services/quranApi';

interface PlayerContextType {
    // State
    currentSurah: Surah | null;
    currentReciter: Reciter | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isLooping: boolean;
    isLoading: boolean;
    error: string | null;
    
    // Data
    reciters: Reciter[];
    surahs: Surah[];
    isDataLoading: boolean;
    
    // Actions
    playSurah: (surah: Surah) => void;
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    stop: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    toggleLoop: () => void;
    setReciter: (reciter: Reciter) => void;
    playNext: () => void;
    playPrevious: () => void;
    refreshData: () => Promise<void>;
    clearError: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
    CURRENT_RECITER: 'zikr_current_reciter',
    CURRENT_SURAHS: 'zikr_surahs_list',
    RECITERS: 'zikr_reciters_list',
    LAST_VOLUME: 'zikr_last_volume',
    LAST_SURAH: 'zikr_last_surah',
};

// Error translation keys
const ERROR_KEYS = {
    FAILED_TO_LOAD_QURAN: 'errors.failedToLoadQuran',
    FAILED_TO_FETCH: 'errors.failedToFetch',
    FAILED_TO_LOAD_AUDIO: 'errors.failedToLoadAudio',
    FAILED_TO_PLAY: 'errors.failedToPlay',
    FAILED_TO_PLAY_AUDIO: 'errors.failedToPlayAudio',
    SELECT_RECITER_FIRST: 'errors.selectReciterFirst',
    AUDIO_LOAD_FAILED: 'errors.audioLoadFailed',
};

export function PlayerProvider({ children }: { children: ReactNode }) {
    // Audio element ref
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    // State
    const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
    const [currentReciter, setCurrentReciter] = useState<Reciter | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(0.7);
    const [isLooping, setIsLooping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Data
    const [reciters, setReciters] = useState<Reciter[]>([]);
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

    // Helper to get storage
    const getStorage = () => {
        return typeof chrome !== 'undefined' && chrome.storage?.local 
            ? chrome.storage.local 
            : null;
    };

    // Helper to get from storage
    const getFromStorage = async <T,>(key: string): Promise<T | null> => {
        const storage = getStorage();
        if (storage) {
            const result = await storage.get([key]);
            return result[key] || null;
        } else {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        }
    };

    // Helper to save to storage
    const saveToStorage = async <T,>(key: string, value: T): Promise<void> => {
        const storage = getStorage();
        if (storage) {
            await storage.set({ [key]: value });
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    };

    // Load initial data and preferences
    useEffect(() => {
        const initialize = async () => {
            setIsDataLoading(true);
            try {
                // Load cached data first
                const cachedReciters = await getFromStorage<Reciter[]>(STORAGE_KEYS.RECITERS);
                const cachedSurahs = await getFromStorage<Surah[]>(STORAGE_KEYS.CURRENT_SURAHS);
                const cachedReciter = await getFromStorage<Reciter>(STORAGE_KEYS.CURRENT_RECITER);
                const cachedVolume = await getFromStorage<number>(STORAGE_KEYS.LAST_VOLUME);
                const cachedLastSurah = await getFromStorage<number>(STORAGE_KEYS.LAST_SURAH);

                if (cachedReciters) setReciters(cachedReciters);
                if (cachedSurahs) setSurahs(cachedSurahs);
                if (cachedReciter) setCurrentReciter(cachedReciter);
                if (cachedVolume) setVolumeState(cachedVolume);

                // Fetch fresh data from API
                await refreshData();

                // Restore last played surah if available
                if (cachedLastSurah && cachedSurahs) {
                    const lastSurah = cachedSurahs.find(s => s.id === cachedLastSurah);
                    if (lastSurah) {
                        setCurrentSurah(lastSurah);
                    }
                }
            } catch (err) {
                console.error('Failed to initialize player:', err);
                setError(ERROR_KEYS.FAILED_TO_LOAD_QURAN);
            } finally {
                setIsDataLoading(false);
            }
        };

        initialize();
    }, []);

    // Refresh data from API
    const refreshData = useCallback(async () => {
        try {
            const [fetchedReciters, fetchedSurahs] = await Promise.all([
                getReciters('eng'),
                getSurahs('eng'),
            ]);

            setReciters(fetchedReciters);
            setSurahs(fetchedSurahs);

            // Cache data
            await saveToStorage(STORAGE_KEYS.RECITERS, fetchedReciters);
            await saveToStorage(STORAGE_KEYS.CURRENT_SURAHS, fetchedSurahs);

            // Set default reciter if none selected
            const currentReciterData = await getFromStorage<Reciter>(STORAGE_KEYS.CURRENT_RECITER);
            if (!currentReciterData && fetchedReciters.length > 0) {
                setCurrentReciter(fetchedReciters[0]);
                await saveToStorage(STORAGE_KEYS.CURRENT_RECITER, fetchedReciters[0]);
            }
        } catch (err) {
            console.error('Failed to refresh data:', err);
            setError(ERROR_KEYS.FAILED_TO_FETCH);
        }
    }, []);

    // Initialize audio element
    useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;

        // Event listeners
        audio.addEventListener('timeupdate', () => {
            setCurrentTime(audio.currentTime);
        });

        audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
        });

        audio.addEventListener('ended', () => {
            if (isLooping) {
                audio.currentTime = 0;
                audio.play();
            } else {
                setIsPlaying(false);
                setCurrentTime(0);
            }
        });

        audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            setError(ERROR_KEYS.AUDIO_LOAD_FAILED);
            setIsPlaying(false);
        });

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, [isLooping]);

    // Update volume when changed
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
        saveToStorage(STORAGE_KEYS.LAST_VOLUME, volume);
    }, [volume]);

    // Play surah
    const playSurah = useCallback(async (surah: Surah) => {
        if (!currentReciter) {
            setError(ERROR_KEYS.SELECT_RECITER_FIRST);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const audioUrl = await getAudioUrl(currentReciter.id, surah.id);
            
            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.load();
                
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsPlaying(true);
                            setCurrentSurah(surah);
                            saveToStorage(STORAGE_KEYS.LAST_SURAH, surah.id);
                        })
                        .catch((err) => {
                            console.error('Play failed:', err);
                            setError(ERROR_KEYS.FAILED_TO_PLAY);
                            setIsPlaying(false);
                        });
                }
            }
        } catch (err) {
            console.error('Failed to load surah:', err);
            setError(ERROR_KEYS.FAILED_TO_LOAD_AUDIO);
        } finally {
            setIsLoading(false);
        }
    }, [currentReciter]);

    const play = useCallback(() => {
        if (audioRef.current && currentSurah) {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch((err) => {
                    console.error('Play failed:', err);
                    setError(ERROR_KEYS.FAILED_TO_PLAY_AUDIO);
                });
        }
    }, [currentSurah]);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, []);

    const togglePlay = useCallback(() => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }, [isPlaying, play, pause]);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            setCurrentTime(0);
        }
    }, []);

    const seek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    }, []);

    const setVolume = useCallback((newVolume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolumeState(clampedVolume);
    }, []);

    const toggleLoop = useCallback(() => {
        setIsLooping(prev => !prev);
    }, []);

    const setReciter = useCallback(async (reciter: Reciter) => {
        setCurrentReciter(reciter);
        await saveToStorage(STORAGE_KEYS.CURRENT_RECITER, reciter);
        
        // If currently playing, reload with new reciter
        if (currentSurah && isPlaying) {
            playSurah(currentSurah);
        }
    }, [currentSurah, isPlaying, playSurah]);

    const playNext = useCallback(() => {
        if (!currentSurah || surahs.length === 0) return;
        
        const currentIndex = surahs.findIndex(s => s.id === currentSurah.id);
        if (currentIndex < surahs.length - 1) {
            const nextSurah = surahs[currentIndex + 1];
            playSurah(nextSurah);
        }
    }, [currentSurah, surahs, playSurah]);

    const playPrevious = useCallback(() => {
        if (!currentSurah || surahs.length === 0) return;
        
        const currentIndex = surahs.findIndex(s => s.id === currentSurah.id);
        if (currentIndex > 0) {
            const prevSurah = surahs[currentIndex - 1];
            playSurah(prevSurah);
        }
    }, [currentSurah, surahs, playSurah]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value: PlayerContextType = {
        currentSurah,
        currentReciter,
        isPlaying,
        currentTime,
        duration,
        volume,
        isLooping,
        isLoading,
        error,
        reciters,
        surahs,
        isDataLoading,
        playSurah,
        play,
        pause,
        togglePlay,
        stop,
        seek,
        setVolume,
        toggleLoop,
        setReciter,
        playNext,
        playPrevious,
        refreshData,
        clearError,
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
}
