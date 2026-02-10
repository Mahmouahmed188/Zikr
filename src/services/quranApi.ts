import { Reciter, Surah } from '../types';

const BASE_URL = 'https://www.mp3quran.net/api/v3';

export const getReciters = async (language: string = 'eng'): Promise<Reciter[]> => {
    try {
        const response = await fetch(`${BASE_URL}/reciters?language=${language}`);
        const data = await response.json();
        return data.reciters || [];
    } catch (error) {
        console.error("Failed to fetch reciters:", error);
        return [];
    }
};

export const getSurahs = async (language: string = 'eng'): Promise<Surah[]> => {
    try {
        const response = await fetch(`${BASE_URL}/suwar?language=${language}`);
        const data = await response.json();
        return data.suwar || [];
    } catch (error) {
        console.error("Failed to fetch surahs:", error);
        return [];
    }
}
