import axios, { AxiosInstance, AxiosError } from 'axios';
import { Surah, Reciter, SurahsResponse, RecitersResponse } from '../types';
import DataCache from '../utils/dataCache';
import { BilingualSearchEngine } from './bilingualSearchEngine';
import { SURAH_NAMES } from '../data/surahNames';

const API_BASE_URL = 'https://www.mp3quran.net/api/v3';
const CACHE_TTL = 30 * 60 * 1000;

export interface QuranAPIError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

class QuranAPIService {
  private client: AxiosInstance;
  private surahCache: DataCache<Surah[]>;
  private reciterCache: DataCache<Reciter[]>;
  private searchEngine: BilingualSearchEngine | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.surahCache = new DataCache<Surah[]>(CACHE_TTL);
    this.reciterCache = new DataCache<Reciter[]>(CACHE_TTL);

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        throw this.handleError(error);
      }
    );
  }

  private handleError(error: AxiosError): QuranAPIError {
    if (error.response) {
      const responseData = error.response.data as any;
      return {
        message: responseData?.message || 'API request failed',
        code: responseData?.code || 'API_ERROR',
        status: error.response.status,
        details: error.response.data,
      };
    }

    if (error.request) {
      return {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
        status: 0,
      };
    }

    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      status: 500,
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await Promise.all([this.fetchSuwar(), this.fetchReciters()]);
      this.initializeSearchEngine();
      this.isInitialized = true;
    } catch (error) {
      console.error('[QuranAPI] Failed to initialize:', error);
      throw error;
    }
  }

  private initializeSearchEngine(): void {
    const surahs = this.surahCache.getAll().values().next().value || [];
    const reciters = this.reciterCache.getAll().values().next().value || [];

    if (surahs.length > 0 && reciters.length > 0) {
      this.searchEngine = new BilingualSearchEngine(surahs, reciters);
    }
  }

  async fetchSuwar(): Promise<Surah[]> {
    const cacheKey = 'suwar_all';
    const cached = this.surahCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await this.client.get<SurahsResponse>('/suwar');

      if (!response.data?.suwar || !Array.isArray(response.data.suwar)) {
        throw new Error('Invalid response format for suwar');
      }

      const surahs: Surah[] = response.data.suwar.map((sura: any) => {
        const surahNames = SURAH_NAMES[sura.id];

        return {
          id: sura.id,
          name: sura.name,
          name_ar: sura.name,
          name_en: surahNames?.en || '',
          arabicName: sura.name,
          englishName: surahNames?.en || '',
          revelation_place: sura.makkia === 1 ? 'Makkah' : 'Madinah',
          revelationType: sura.makkia === 1 ? 'Makki' : 'Madani',
          verses_count: undefined,
          verses: undefined,
          page: sura.start_page,
          juz: undefined,
          hizb: undefined,
        };
      });

      this.surahCache.set(cacheKey, surahs);

      return surahs;
    } catch (error) {
      console.error('[QuranAPI] Failed to fetch suwar:', error);
      throw error;
    }
  }

  async fetchReciters(language: 'ar' | 'en' = 'ar'): Promise<Reciter[]> {
    const cacheKey = `reciters_${language}`;
    const cached = this.reciterCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const url = language ? `/reciters?language=${language}` : '/reciters';
      const response = await this.client.get<RecitersResponse>(url);

      if (!response.data?.reciters || !Array.isArray(response.data.reciters)) {
        throw new Error('Invalid response format for reciters');
      }

      const reciters: Reciter[] = response.data.reciters.map((reciter: any) => {
        const reciterObj: Reciter = {
          id: reciter.id,
          name: reciter.name,
          letter: reciter.letter,
          moshaf: reciter.moshaf || (reciter as any).moshafs || [],
          server: reciter.server,
          count: reciter.count,
          rewaya: reciter.rewaya,
          biography: reciter.biography || undefined,
        };

        if (language === 'ar') {
          reciterObj.name_ar = reciter.name;
          reciterObj.name_en = (reciter as any).name_en || (reciter as any).name_english || (reciter as any).english_name;
        } else {
          reciterObj.name_en = reciter.name;
          reciterObj.name_ar = (reciter as any).name_ar || (reciter as any).arabic_name;
        }

        return reciterObj;
      });

      this.reciterCache.set(cacheKey, reciters);

      return reciters;
    } catch (error) {
      console.error(`[QuranAPI] Failed to fetch reciters (${language}):`, error);
      throw error;
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.searchEngine) {
      throw new Error('QuranAPI not initialized. Call initialize() first.');
    }
  }

  searchSuwar(query: string, options?: { limit?: number; minScore?: number }) {
    if (!this.isInitialized || !this.searchEngine) {
      throw new Error('Search engine not available. Call initialize() first.');
    }

    return this.searchEngine.searchSurahs(query, options);
  }

  searchReciters(query: string, options?: { limit?: number; minScore?: number }) {
    if (!this.isInitialized || !this.searchEngine) {
      throw new Error('Search engine not available. Call initialize() first.');
    }

    return this.searchEngine.searchReciters(query, options);
  }

  search(query: string, options?: { limit?: number; minScore?: number }) {
    if (!this.isInitialized || !this.searchEngine) {
      return {
        suwar: [],
        reciters: [],
        query,
      };
    }

    return this.searchEngine.search(query, options);
  }

  getSurahAudioUrl(reciterId: number, surahId: number): string | null {
    this.ensureInitialized();

    if (!this.searchEngine) {
      return null;
    }

    return this.searchEngine.getSurahAudioUrl(reciterId, surahId);
  }

  getSurahImageUrl(surahId: number): string {
    this.ensureInitialized();

    if (!this.searchEngine) {
      return `https://quran-images-api.herokuapp.com/surah/${surahId.toString().padStart(3, '0')}`;
    }

    return this.searchEngine.getSurahImageUrl(surahId);
  }

  getReciterImageUrl(_reciterId: number, reciterName: string): string {
    const normalizedName = reciterName.replace(/\s+/g, '_').toLowerCase();
    return `https://www.mp3quran.net/assets/img/reciters/${normalizedName}.jpg`;
  }

  getSurahWithResources(surahId: number, reciterId: number = 1) {
    this.ensureInitialized();

    if (!this.searchEngine) {
      return null;
    }

    return this.searchEngine.getSurahWithResources(surahId, reciterId);
  }

  getReciterWithResources(reciterId: number) {
    this.ensureInitialized();

    if (!this.searchEngine) {
      return null;
    }

    return this.searchEngine.getReciterWithResources(reciterId);
  }

  getSurahById(surahId: number): Surah | null {
    const surahs = this.surahCache.get('suwar_all');
    if (!surahs) return null;

    return surahs.find((s) => s.id === surahId) || null;
  }

  getReciterById(reciterId: number): Reciter | null {
    const arReciters = this.reciterCache.get('reciters_ar');
    const enReciters = this.reciterCache.get('reciters_en');
    const allReciters = [...(arReciters || []), ...(enReciters || [])];

    return allReciters.find((r) => r.id === reciterId) || null;
  }

  getAllSurahs(): Surah[] {
    return this.surahCache.get('suwar_all') || [];
  }

  getAllReciters(): Reciter[] {
    const arReciters = this.reciterCache.get('reciters_ar') || [];
    const enReciters = this.reciterCache.get('reciters_en') || [];

    const seen = new Set<number>();
    const uniqueReciters: Reciter[] = [];

    for (const reciter of [...arReciters, ...enReciters]) {
      if (!seen.has(reciter.id)) {
        seen.add(reciter.id);
        uniqueReciters.push(reciter);
      }
    }

    return uniqueReciters;
  }

  getAvailableSurahsForReciter(reciterId: number): number[] {
    this.ensureInitialized();

    const reciter = this.getReciterById(reciterId);
    if (!reciter || !reciter.moshaf || reciter.moshaf.length === 0) {
      return [];
    }

    const availableSurahs = new Set<number>();

    for (const moshaf of reciter.moshaf) {
      if (moshaf.surah_list) {
        if (moshaf.surah_list.includes(',')) {
          const parts = moshaf.surah_list.split(',');
          for (const part of parts) {
            const trimmed = part.trim();
            if (trimmed.includes('-')) {
              const [start, end] = trimmed.split('-').map(Number);
              for (let i = start; i <= end; i++) {
                availableSurahs.add(i);
              }
            } else {
              const surahId = parseInt(trimmed, 10);
              if (!isNaN(surahId)) {
                availableSurahs.add(surahId);
              }
            }
          }
        } else {
          const surahId = parseInt(moshaf.surah_list.trim(), 10);
          if (!isNaN(surahId)) {
            availableSurahs.add(surahId);
          }
        }
      }

      if (moshaf.surahs && Array.isArray(moshaf.surahs)) {
        moshaf.surahs.forEach((surahId: number) => {
          availableSurahs.add(surahId);
        });
      }
    }

    return Array.from(availableSurahs).sort((a, b) => a - b);
  }

  isSurahAvailableForReciter(reciterId: number, surahId: number): boolean {
    const availableSurahs = this.getAvailableSurahsForReciter(reciterId);
    return availableSurahs.includes(surahId);
  }

  clearCache(): void {
    this.surahCache.clear();
    this.reciterCache.clear();
  }

  getCacheStats(): { suwar: any; reciters: any } {
    return {
      suwar: this.surahCache.getStats(),
      reciters: this.reciterCache.getStats(),
    };
  }
}

export const quranAPIService = new QuranAPIService();
export default QuranAPIService;
