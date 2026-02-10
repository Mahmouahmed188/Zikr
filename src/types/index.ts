export interface Reciter {
    id: number;
    name: string;
    letter: string;
    moshaf: Moshaf[];
}

export interface Moshaf {
    id: number;
    name: string;
    server: string;
    surah_total: number;
    surah_list: string;
}

export interface Surah {
    id: number;
    name: string;
    englishName?: string;
    verses?: number;
    revelationType?: 'Makki' | 'Madani';
    audioUrl?: string;
    arabicName?: string;
    script?: string;
}

export interface PlayerState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    currentReciter: Reciter | null;
    currentSurah: Surah | null;
    isLooping: boolean;
}

export type Theme = 'light' | 'dark';
export type Language = 'eng' | 'ar';

export interface ApiError {
    message: string;
    code: string;
    status: number;
}

// API Response Types
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export interface RecitersResponse {
    reciters: Reciter[];
}

export interface SurahsResponse {
    suwar: Surah[];
}

export interface AudioUrlResponse {
    audioUrl: string;
}

// App State Types
export interface AppState {
    language: Language;
    lastPlayedSurah?: number;
    lastReciterId?: number;
    volume: number;
}

// Search Types
export interface SearchResult<T> {
    items: T[];
    total: number;
    hasMore: boolean;
}

export interface SearchFilters {
    query: string;
    language?: Language;
}
