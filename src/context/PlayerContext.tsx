import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { Surah, Reciter } from '../types';
import QuranAPIService from '../services/quranAPIService';

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
    SURAH_NOT_AVAILABLE: 'errors.surahNotAvailable',
    INVALID_AUDIO_URL: 'errors.invalidAudioUrl',
};

export function PlayerProvider({ children }: { children: ReactNode }) {
    // Refs to avoid closure issues
    const currentSurahRef = useRef<Surah | null>(null);
    const currentReciterRef = useRef<Reciter | null>(null);
    const offscreenReadyRef = useRef(false);
    const audioRefReadyRef = useRef(false);  // Track if audio element has src loaded
    const loadingTimeoutRef = useRef<number | null>(null);
    
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
    const [_availableSurahs, setAvailableSurahs] = useState<Surah[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [apiService, setApiService] = useState<QuranAPIService | null>(null);

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

    // Send message to offscreen document (fire-and-forget, no response expected)
    const sendToOffscreen = useCallback((type: string, payload?: any): void => {
        if (!offscreenReadyRef.current) {
            console.warn('Offscreen not ready yet, queuing message:', type);
            // Messages will work once offscreen is ready, chrome will queue them
        }
        try {
            chrome.runtime.sendMessage({ target: 'offscreen', type, payload }, () => {
                if (chrome.runtime.lastError) {
                    console.warn('Message to offscreen failed:', type, chrome.runtime.lastError.message);
                }
            });
        } catch (e) {
            console.error('Failed to send message to offscreen:', e);
        }
    }, []);

    // Keep refs in sync with state
    useEffect(() => {
        currentSurahRef.current = currentSurah;
    }, [currentSurah]);
    
    useEffect(() => {
        currentReciterRef.current = currentReciter;
    }, [currentReciter]);

    // Initialize offscreen document and sync with popup state
    useEffect(() => {
        const initializeOffscreen = async () => {
            try {
                const existingContexts = await chrome.runtime.getContexts({
                    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
                });

                if (existingContexts.length === 0) {
                    await chrome.offscreen.createDocument({
                        url: 'src/offscreen/index.html',
                        reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
                        justification: 'Playing Quran audio in the background',
                    });
                    // Wait a bit for offscreen to initialize
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
                offscreenReadyRef.current = true;
                console.log('Offscreen document ready');
            } catch (err) {
                console.error('Failed to initialize offscreen:', err);
            }
        };

        initializeOffscreen();

        // Listen for offscreen status updates
        const handleMessage = (message: any) => {
            if (message.target === 'popup') {
                if (message.type === 'AUDIO_STATUS_UPDATE') {
                    const { isPlaying, currentTime, duration, volume, isLooping, currentUrl } = message.payload;
                    setIsPlaying(isPlaying);
                    setCurrentTime(currentTime);
                    setDuration(duration);
                    setVolumeState(volume);
                    setIsLooping(isLooping);
                    // Track if audio has a source loaded
                    audioRefReadyRef.current = !!currentUrl;
                } else if (message.type === 'AUDIO_READY') {
                    setIsLoading(false);
                } else if (message.type === 'AUDIO_ENDED') {
                    setIsPlaying(false);
                    setCurrentTime(0);
                    // Auto-play next surah
                    const reciter = currentReciterRef.current;
                    const surahsList = surahs;
                    if (reciter && apiService && surahsList.length > 0) {
                        const availableSurahsForReciter = apiService.getAvailableSurahsForReciter(reciter.id);
                        const availableSurahsList = surahsList.filter(s => availableSurahsForReciter.includes(s.id));
                        const currentIndex = availableSurahsList.findIndex(s => s.id === currentSurahRef.current?.id);
                        if (currentIndex < availableSurahsList.length - 1) {
                            const nextSurah = availableSurahsList[currentIndex + 1];
                            setTimeout(() => playSurah(nextSurah), 100);
                        }
                    }
                } else if (message.type === 'AUDIO_ERROR') {
                    console.error('Audio error from offscreen:', message.payload);
                    setError(message.payload?.error || 'Audio playback failed');
                    setIsPlaying(false);
                    setIsLoading(false);
                }
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);

        // Initial status fetch after offscreen is ready
        const fetchInitialStatus = setTimeout(() => {
            sendToOffscreen('GET_STATUS');
        }, 500);

        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
            clearTimeout(fetchInitialStatus);
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }
        };
    }, [sendToOffscreen, surahs]);

    // Load initial data and preferences
    useEffect(() => {
        const initialize = async () => {
            setIsDataLoading(true);
            try {
                const api = new QuranAPIService();
                await api.initialize();
                setApiService(api);

                const fetchedReciters = api.getAllReciters();
                const fetchedSurahs = api.getAllSurahs();

                setReciters(fetchedReciters);
                setSurahs(fetchedSurahs);

                await saveToStorage(STORAGE_KEYS.RECITERS, fetchedReciters);
                await saveToStorage(STORAGE_KEYS.CURRENT_SURAHS, fetchedSurahs);

                const cachedReciter = await getFromStorage<Reciter>(STORAGE_KEYS.CURRENT_RECITER);
                const cachedVolume = await getFromStorage<number>(STORAGE_KEYS.LAST_VOLUME);
                const cachedLastSurah = await getFromStorage<number>(STORAGE_KEYS.LAST_SURAH);

                if (cachedReciter) setCurrentReciter(cachedReciter);
                if (cachedVolume) {
                    setVolumeState(cachedVolume);
                    // Volume will be set in offscreen after initialization
                }

                if (cachedLastSurah && fetchedSurahs) {
                    const lastSurah = fetchedSurahs.find(s => s.id === cachedLastSurah);
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

    // Update volume when changed
    useEffect(() => {
        if (offscreenReadyRef.current) {
            sendToOffscreen('SET_VOLUME', { volume });
        }
        saveToStorage(STORAGE_KEYS.LAST_VOLUME, volume);
    }, [volume, sendToOffscreen]);

    // Update available surahs when reciter changes
    useEffect(() => {
        if (currentReciter && apiService && surahs.length > 0) {
            const availableSurahIds = apiService.getAvailableSurahsForReciter(currentReciter.id);
            const filteredAvailableSurahs = surahs.filter(s => availableSurahIds.includes(s.id));
            setAvailableSurahs(filteredAvailableSurahs);
        }
    }, [currentReciter, apiService, surahs]);

    // Refresh data from API
    const refreshData = useCallback(async () => {
        if (!apiService) return;

        try {
            const fetchedReciters = apiService.getAllReciters();
            const fetchedSurahs = apiService.getAllSurahs();

            setReciters(fetchedReciters);
            setSurahs(fetchedSurahs);

            await saveToStorage(STORAGE_KEYS.RECITERS, fetchedReciters);
            await saveToStorage(STORAGE_KEYS.CURRENT_SURAHS, fetchedSurahs);

            const currentReciterData = await getFromStorage<Reciter>(STORAGE_KEYS.CURRENT_RECITER);
            if (!currentReciterData && fetchedReciters.length > 0) {
                setCurrentReciter(fetchedReciters[0]);
                await saveToStorage(STORAGE_KEYS.CURRENT_RECITER, fetchedReciters[0]);
            }
        } catch (err) {
            console.error('Failed to refresh data:', err);
            setError(ERROR_KEYS.FAILED_TO_FETCH);
        }
    }, [apiService]);

    // Play surah
    const playSurah = useCallback(async (surah: Surah) => {
        // Clear any existing loading timeout
        if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const reciter = currentReciterRef.current;
            if (!reciter || !apiService) {
                setError(ERROR_KEYS.SELECT_RECITER_FIRST);
                setIsLoading(false);
                return;
            }

            if (!apiService.isSurahAvailableForReciter(reciter.id, surah.id)) {
                const availableSurahs = apiService.getAvailableSurahsForReciter(reciter.id);
                if (availableSurahs.length > 0) {
                    const firstAvailableId = availableSurahs[0];
                    const firstAvailableSurah = surahs.find(s => s.id === firstAvailableId);
                    if (firstAvailableSurah) {
                        playSurah(firstAvailableSurah);
                        setIsLoading(false);
                        return;
                    }
                }
                setError(ERROR_KEYS.SURAH_NOT_AVAILABLE);
                setIsLoading(false);
                return;
            }

            const audioUrl = apiService.getSurahAudioUrl(reciter.id, surah.id);
            
            if (!audioUrl) {
                setError(ERROR_KEYS.SURAH_NOT_AVAILABLE);
                setIsLoading(false);
                return;
            }
            
            // Play in offscreen audio
            sendToOffscreen('PLAY', { url: audioUrl });
            setIsPlaying(true);
            setCurrentSurah(surah);
            saveToStorage(STORAGE_KEYS.LAST_SURAH, surah.id);

            // Safety timeout to ensure loading state doesn't get stuck
            loadingTimeoutRef.current = setTimeout(() => {
                setIsLoading(false);
            }, 10000);
        } catch (err) {
            console.error('Failed to load surah:', err);
            setError(ERROR_KEYS.FAILED_TO_LOAD_AUDIO);
            setIsLoading(false);
        }
    }, [apiService, sendToOffscreen, surahs]);

    const play = useCallback(() => {
        // Check if we have something to play
        const surah = currentSurahRef.current;
        const reciter = currentReciterRef.current;
        
        if (!surah || !reciter || !apiService) {
            setError(ERROR_KEYS.SELECT_RECITER_FIRST);
            return;
        }
        
        // If audio is paused but already has a source loaded, just resume
        if (!isPlaying && audioRefReadyRef.current) {
            sendToOffscreen('TOGGLE_PLAY');
            return;
        }
        
        // Otherwise, load the audio URL first (first play scenario)
        // Clear any existing loading timeout
        if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const audioUrl = apiService.getSurahAudioUrl(reciter.id, surah.id);
            
            if (!audioUrl) {
                setError(ERROR_KEYS.SURAH_NOT_AVAILABLE);
                setIsLoading(false);
                return;
            }
            
            // Play with URL (this sets src and plays in offscreen)
            sendToOffscreen('PLAY', { url: audioUrl });
            setIsPlaying(true);

            // Safety timeout to ensure loading state doesn't get stuck
            loadingTimeoutRef.current = window.setTimeout(() => {
                setIsLoading(false);
            }, 10000);
        } catch (err) {
            console.error('Failed to load audio:', err);
            setError(ERROR_KEYS.FAILED_TO_LOAD_AUDIO);
            setIsLoading(false);
        }
    }, [isPlaying, sendToOffscreen, apiService]);

    const pause = useCallback(() => {
        sendToOffscreen('PAUSE');
    }, [sendToOffscreen]);

    const togglePlay = useCallback(() => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }, [isPlaying, play, pause]);

    const stop = useCallback(() => {
        sendToOffscreen('STOP');
    }, [sendToOffscreen]);

    const seek = useCallback((time: number) => {
        sendToOffscreen('SEEK', { time });
    }, [sendToOffscreen]);

    const setVolume = useCallback((newVolume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolumeState(clampedVolume);
    }, []);

    const toggleLoop = useCallback(() => {
        const newLoopState = !isLooping;
        setIsLooping(newLoopState);
        sendToOffscreen('SET_LOOP', { loop: newLoopState });
    }, [isLooping, sendToOffscreen]);

    const setReciter = useCallback(async (reciter: Reciter) => {
        await saveToStorage(STORAGE_KEYS.CURRENT_RECITER, reciter);
        setCurrentReciter(reciter);

        if (!apiService) return;

        const availableSurahIds = apiService.getAvailableSurahsForReciter(reciter.id);
        const filteredAvailableSurahs = surahs.filter(s => availableSurahIds.includes(s.id));
        setAvailableSurahs(filteredAvailableSurahs);

        if (filteredAvailableSurahs.length === 0) {
            console.warn('Reciter has no available surahs');
            return;
        }

        const surahToPlay = currentSurahRef.current;
        const isCurrentSurahAvailable = surahToPlay && availableSurahIds.includes(surahToPlay.id);

        if (isCurrentSurahAvailable) {
            setTimeout(() => {
                playSurah(surahToPlay);
            }, 0);
        } else {
            const firstAvailableSurah = filteredAvailableSurahs[0];
            setTimeout(() => {
                playSurah(firstAvailableSurah);
            }, 0);
        }
    }, [playSurah, apiService, surahs]);

    const playNext = useCallback(() => {
        if (!currentSurah || !currentReciter || !apiService || surahs.length === 0) return;

        const availableSurahsForReciter = apiService.getAvailableSurahsForReciter(currentReciter.id);
        const availableSurahsList = surahs.filter(s => availableSurahsForReciter.includes(s.id));

        if (availableSurahsList.length === 0) return;

        const currentIndex = availableSurahsList.findIndex(s => s.id === currentSurah.id);
        if (currentIndex < availableSurahsList.length - 1) {
            const nextSurah = availableSurahsList[currentIndex + 1];
            playSurah(nextSurah);
        }
    }, [currentSurah, currentReciter, surahs, playSurah, apiService]);

    const playPrevious = useCallback(() => {
        if (!currentSurah || !currentReciter || !apiService || surahs.length === 0) return;

        const availableSurahsForReciter = apiService.getAvailableSurahsForReciter(currentReciter.id);
        const availableSurahsList = surahs.filter(s => availableSurahsForReciter.includes(s.id));

        if (availableSurahsList.length === 0) return;

        const currentIndex = availableSurahsList.findIndex(s => s.id === currentSurah.id);
        if (currentIndex > 0) {
            const prevSurah = availableSurahsList[currentIndex - 1];
            playSurah(prevSurah);
        }
    }, [currentSurah, currentReciter, surahs, playSurah, apiService]);

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
