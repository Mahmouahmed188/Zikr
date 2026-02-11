export const API_CONFIG = {
  BASE_URL: 'https://www.mp3quran.net/api/v3',
  
  ENDPOINTS: {
    SUWAR: '/suwar',
    RECITERS: '/reciters',
    LANGUAGES: '/languages',
    RIWAYAH: '/riwayah',
  },
  
  IMAGE_BASE_URL: 'https://quran-images-api.herokuapp.com',
  
  RECITER_IMAGE_BASE_URL: 'https://www.mp3quran.net/assets/img/reciters',
  
  CACHE_TTL: 30 * 60 * 1000,
  
  REQUEST_TIMEOUT: 30000,
  
  LANGUAGES: {
    ARABIC: 'ar',
    ENGLISH: 'en',
  },
  
  getAudioUrl: (server: string, surahId: number): string => {
    const paddedSurahId = surahId.toString().padStart(3, '0');
    const normalizedServer = server.replace(/\/$/, '');
    return `${normalizedServer}/${paddedSurahId}.mp3`;
  },
  
  getSurahImageUrl: (surahId: number): string => {
    const paddedSurahId = surahId.toString().padStart(3, '0');
    return `${API_CONFIG.IMAGE_BASE_URL}/surah/${paddedSurahId}`;
  },
  
  getReciterImageUrl: (reciterName: string): string => {
    const normalizedName = reciterName.replace(/\s+/g, '_').toLowerCase();
    return `${API_CONFIG.RECITER_IMAGE_BASE_URL}/${normalizedName}.jpg`;
  },
  
  getReciterEndpoint: (language: 'ar' | 'en'): string => {
    return `${API_CONFIG.ENDPOINTS.RECITERS}?language=${language}`;
  },
} as const;

export default API_CONFIG;
