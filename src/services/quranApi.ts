import { Reciter, Surah } from '../types';
import { quranClient } from './api';

// Get all reciters
export const getReciters = async (language: string = 'eng'): Promise<Reciter[]> => {
    try {
        const response = await quranClient.get('/reciters', {
            params: { language }
        });
        return response.data.reciters || [];
    } catch (error) {
        console.error('Failed to fetch reciters:', error);
        return [];
    }
};

// Get all surahs
export const getSurahs = async (language: string = 'eng'): Promise<Surah[]> => {
    try {
        const response = await quranClient.get('/suwar', {
            params: { language }
        });
        return response.data.suwar || [];
    } catch (error) {
        console.error('Failed to fetch surahs:', error);
        return [];
    }
};

// Get audio URL for a specific reciter and surah
export const getAudioUrl = async (reciterId: number, surahId: number): Promise<string> => {
    try {
        // First get reciter details to find the server URL
        const recitersResponse = await quranClient.get('/reciters');
        const reciters = recitersResponse.data.reciters || [];
        const reciter = reciters.find((r: Reciter) => r.id === reciterId);
        
        if (!reciter || !reciter.moshaf || reciter.moshaf.length === 0) {
            throw new Error('Reciter not found or no audio available');
        }
        
        // Get the first moshaf (reading style)
        const moshaf = reciter.moshaf[0];
        const server = moshaf.server;
        
        // Format surah number with leading zeros (001, 002, etc.)
        const formattedSurah = surahId.toString().padStart(3, '0');
        
        // Construct audio URL
        const audioUrl = `${server}${formattedSurah}.mp3`;
        
        return audioUrl;
    } catch (error) {
        console.error('Failed to get audio URL:', error);
        throw error;
    }
};

// Search surahs by name or number
export const searchSurahs = async (
    query: string, 
    surahs: Surah[]
): Promise<Surah[]> => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase().trim();
    
    return surahs.filter(surah => {
        // Search by number
        if (surah.id.toString() === searchTerm) return true;
        
        // Search by Arabic name
        if (surah.name.toLowerCase().includes(searchTerm)) return true;
        
        // Search by English name
        if (surah.englishName?.toLowerCase().includes(searchTerm)) return true;
        
        return false;
    });
};

// Get surah by ID
export const getSurahById = async (surahId: number, language: string = 'eng'): Promise<Surah | null> => {
    try {
        const surahs = await getSurahs(language);
        return surahs.find(s => s.id === surahId) || null;
    } catch (error) {
        console.error('Failed to get surah:', error);
        return null;
    }
};

// Get reciter by ID
export const getReciterById = async (reciterId: number, language: string = 'eng'): Promise<Reciter | null> => {
    try {
        const reciters = await getReciters(language);
        return reciters.find(r => r.id === reciterId) || null;
    } catch (error) {
        console.error('Failed to get reciter:', error);
        return null;
    }
};
