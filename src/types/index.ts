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
    surah_list: string; // "1,2,3..."
}

export interface Surah {
    id: number;
    name: string; // Arabic or English name from API
    englishName?: string; // Custom meta
    verses?: number; // Custom meta
    revelationType?: 'Makki' | 'Madani'; // Custom meta
    audioUrl?: string; // e.g. server/001.mp3
    arabicName?: string; // Custom meta for display
    script?: string; // Custom meta for decorative Arabic letter
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
