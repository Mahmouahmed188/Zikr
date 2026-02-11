import { Surah, Reciter, SurahWithResources, ReciterWithResources } from '../types';
import {
  normalizeText,
  getBigrams,
} from '../utils/textNormalization';
import { SURAH_SEARCH_VARIANTS } from '../data/surahNames';

export interface SearchOptions {
  limit?: number;
  minScore?: number;
  includePartial?: boolean;
  includeInitials?: boolean;
}

export class BilingualSearchEngine {
  constructor(
    private surahs: Surah[],
    private reciters: Reciter[]
  ) {}

  searchSurahs(query: string, options: SearchOptions = {}): SurahWithResources[] {
    const { limit = 20, minScore = 30 } = options;

    if (!query || query.trim().length < 1) {
      return [];
    }

    const results: SurahWithResources[] = [];

    for (const surah of this.surahs) {
      let bestScore = 0;
      let matchedField = '';

      const nameAr = surah.name_ar || surah.arabicName || surah.name;
      const nameEn = surah.name_en || surah.englishName || '';
      const variants = SURAH_SEARCH_VARIANTS[surah.id];

      const scores = [
        { score: this.calculateMatchScore(query, nameAr), field: 'name_ar' },
        { score: this.calculateMatchScore(query, nameEn), field: 'name_en' },
        { score: this.calculateMatchScore(query, surah.id.toString()), field: 'id' },
      ];

      if (variants?.ar) {
        variants.ar.forEach(v => {
          scores.push({ score: this.calculateMatchScore(query, v), field: 'name_ar_variant' });
        });
      }

      if (variants?.en) {
        variants.en.forEach(v => {
          scores.push({ score: this.calculateMatchScore(query, v), field: 'name_en_variant' });
        });
      }

      for (const { score, field } of scores) {
        if (score > bestScore) {
          bestScore = score;
          matchedField = field;
        }
      }

      if (bestScore >= minScore) {
        results.push({
          ...surah,
          audioUrl: null,
          imageUrl: this.getSurahImageUrl(surah.id),
          matchScore: bestScore,
          matchedField,
        });
      }
    }

    results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    return results.slice(0, limit);
  }

  searchReciters(query: string, options: SearchOptions = {}): ReciterWithResources[] {
    const { limit = 20, minScore = 50 } = options;

    if (!query || query.trim().length < 1) {
      return [];
    }

    const results: ReciterWithResources[] = [];

    for (const reciter of this.reciters) {
      let bestScore = 0;
      let matchedField = '';

      const nameAr = reciter.name_ar || reciter.arabicName || reciter.name;
      const nameEn = reciter.name_en || reciter.englishName || reciter.name;

      const scores = [
        { score: this.calculateMatchScore(query, nameAr), field: 'name_ar' },
        { score: this.calculateMatchScore(query, nameEn), field: 'name_en' },
        { score: this.calculateMatchScore(query, reciter.rewaya || ''), field: 'rewaya' },
      ];

      for (const { score, field } of scores) {
        if (score > bestScore) {
          bestScore = score;
          matchedField = field;
        }
      }

      if (bestScore >= minScore) {
        results.push({
          ...reciter,
          imageUrl: this.getReciterImageUrl(reciter.id, nameAr || nameEn),
          matchScore: bestScore,
          matchedField,
        });
      }
    }

    results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    return results.slice(0, limit);
  }

  search(query: string, options: SearchOptions = {}): {
    suwar: SurahWithResources[];
    reciters: ReciterWithResources[];
    query: string;
  } {
    if (!query || query.trim().length < 1) {
      return {
        suwar: [],
        reciters: [],
        query,
      };
    }

    return {
      suwar: this.searchSurahs(query, options),
      reciters: this.searchReciters(query, options),
      query,
    };
  }

  private calculateMatchScore(query: string, text: string): number {
    if (!query || !text) return 0;

    const normalizedQuery = normalizeText(query);
    const normalizedText = normalizeText(text);

    if (normalizedQuery.length === 0) return 0;

    if (normalizedText === normalizedQuery) {
      return 100;
    }

    if (normalizedText.startsWith(normalizedQuery)) {
      return 90 + (normalizedQuery.length / normalizedText.length) * 10;
    }

    const words = normalizedText.split(/\s+/);
    for (const word of words) {
      if (word.startsWith(normalizedQuery)) {
        return 75 + (normalizedQuery.length / word.length) * 15;
      }
    }

    if (normalizedText.includes(normalizedQuery)) {
      return 50 + (normalizedQuery.length / normalizedText.length) * 20;
    }

    const queryParts = normalizedQuery.split(' ').filter((p) => p.length > 0);
    let matchedParts = 0;

    for (const part of queryParts) {
      if (normalizedText.includes(part)) {
        matchedParts++;
      }
    }

    if (matchedParts === queryParts.length && queryParts.length > 1) {
      return 70;
    }

    if (matchedParts > 0) {
      return 50 * (matchedParts / queryParts.length);
    }

    const queryBigrams = getBigrams(normalizedQuery);
    const textBigrams = getBigrams(normalizedText);

    const intersection = queryBigrams.filter((bigram) =>
      textBigrams.includes(bigram)
    );
    const similarity =
      (intersection.length * 2) / (queryBigrams.length + textBigrams.length);

    return similarity * 40;
  }

  getSurahImageUrl(surahId: number): string {
    const surahStr = surahId.toString().padStart(3, '0');
    return `https://quran-images-api.herokuapp.com/surah/${surahStr}`;
  }

  getReciterImageUrl(_reciterId: number, reciterName: string): string {
    const normalizedName = reciterName.replace(/\s+/g, '_').toLowerCase();
    return `https://www.mp3quran.net/assets/img/reciters/${normalizedName}.jpg`;
  }

  getSurahAudioUrl(reciterId: number, surahId: number): string | null {
    const reciter = this.reciters.find((r) => r.id === reciterId);

    if (!reciter || !reciter.moshaf || reciter.moshaf.length === 0) {
      return null;
    }

    for (const moshaf of reciter.moshaf) {
      if (this.hasSurahInMoshaf(moshaf, surahId)) {
        const surahStr = surahId.toString().padStart(3, '0');
        const server = moshaf.server.replace(/\/$/, '');
        return `${server}/${surahStr}.mp3`;
      }
    }

    if (reciter.server) {
      const surahStr = surahId.toString().padStart(3, '0');
      const server = reciter.server.replace(/\/$/, '');
      return `${server}/${surahStr}.mp3`;
    }

    return null;
  }

  private hasSurahInMoshaf(moshaf: any, surahId: number): boolean {
    if (!moshaf.surah_list) return false;

    const surahStr = surahId.toString();

    if (moshaf.surah_list.includes(',')) {
      const surahs = moshaf.surah_list.split(',');
      return surahs.some((s: string) => {
        const trimmed = s.trim();
        if (trimmed.includes('-')) {
          const [start, end] = trimmed.split('-').map(Number);
          return surahId >= start && surahId <= end;
        }
        return trimmed === surahStr;
      });
    }

    return moshaf.surah_list === surahStr;
  }

  getSurahWithResources(surahId: number, reciterId: number): SurahWithResources | null {
    const surah = this.surahs.find((s) => s.id === surahId);

    if (!surah) {
      return null;
    }

    return {
      ...surah,
      audioUrl: this.getSurahAudioUrl(reciterId, surahId),
      imageUrl: this.getSurahImageUrl(surahId),
    };
  }

  getReciterWithResources(reciterId: number): ReciterWithResources | null {
    const reciter = this.reciters.find((r) => r.id === reciterId);

    if (!reciter) {
      return null;
    }

    return {
      ...reciter,
      imageUrl: this.getReciterImageUrl(reciterId, reciter.name),
    };
  }
}
