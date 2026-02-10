/**
 * Unified Multilingual Search Service
 * Comprehensive search for Arabic and English text with image support
 * Handles reciters, Quran terms, and content with transliteration variants
 */

import { nameMappings } from './nameMappings';
import { search as bilingualSearch } from './bilingualSearch';
import { searchImages, ImageSearchResult, ImageMetadata } from './imageSearch';
import {
  normalizeArabic,
  normalizeEnglish,
  detectLanguage,
  normalizeText,
  calculateSimilarity
} from './textNormalization';

export interface UnifiedSearchOptions {
  limit?: number;
  minScore?: number;
  includePartial?: boolean;
  includeInitials?: boolean;
  bilingual?: boolean;
  includeImages?: boolean;
  imageLimit?: number;
  includeRelated?: boolean;
}

export interface UnifiedSearchResult {
  id: string;
  type: 'reciter' | 'quran-term' | 'surah' | 'content';
  title: {
    ar: string;
    en: string;
  };
  description?: {
    ar: string;
    en: string;
  };
  images: ImageMetadata[];
  relevanceScore: number;
  matchType: 'exact' | 'variant' | 'partial' | 'fuzzy' | 'related';
  category: string;
  metadata?: Record<string, any>;
}

export interface SearchSuggestion {
  id: string;
  text: {
    ar: string;
    en: string;
  };
  type: string;
  thumbnail?: string;
}

class UnifiedSearchService {
  private quranTerms: Map<string, QuranTerm> = new Map();
  private surahNames: Map<string, SurahInfo> = new Map();

  constructor() {
    this.initializeQuranTerms();
    this.initializeSurahNames();
  }

  private initializeQuranTerms(): void {
    const terms: QuranTerm[] = [
      {
        id: 'quran',
        arabic: 'القرآن',
        english: 'Quran',
        arabicVariants: ['قرآن', 'القرآن الكريم', 'كتاب الله'],
        englishVariants: ['Quran', "Qur'an", 'Koran', 'Al-Quran', 'The Quran'],
        category: 'quran-term',
        images: [
          {
            id: 'quran-cover',
            url: '/images/quran/quran-cover.jpg',
            thumbnailUrl: '/images/quran/quran-cover-thumb.jpg',
            altText: { ar: 'القرآن الكريم', en: 'The Holy Quran' },
            width: 800,
            height: 1000
          }
        ]
      },
      {
        id: 'surah',
        arabic: 'سورة',
        english: 'Surah',
        arabicVariants: ['سورة', 'السورة', 'الفصل'],
        englishVariants: ['Surah', 'Chapter', 'Surat'],
        category: 'quran-term',
        images: [
          {
            id: 'surah-open',
            url: '/images/quran/surah-open.jpg',
            thumbnailUrl: '/images/quran/surah-open-thumb.jpg',
            altText: { ar: 'سورة من القرآن', en: 'A Surah from the Quran' },
            width: 600,
            height: 800
          }
        ]
      },
      {
        id: 'ayat',
        arabic: 'آية',
        english: 'Ayah',
        arabicVariants: ['آية', 'الآية', 'الآيات'],
        englishVariants: ['Ayah', 'Verse', 'Ayat', 'Aya'],
        category: 'quran-term',
        images: [
          {
            id: 'ayah-text',
            url: '/images/quran/ayah-text.jpg',
            thumbnailUrl: '/images/quran/ayah-text-thumb.jpg',
            altText: { ar: 'آية قرآنية', en: 'Quranic Verse' },
            width: 600,
            height: 400
          }
        ]
      },
      {
        id: 'tajweed',
        arabic: 'تجويد',
        english: 'Tajweed',
        arabicVariants: ['تجويد', 'التجويد', 'أحكام التجويد'],
        englishVariants: ['Tajweed', 'Tajwid', 'Quranic Recitation Rules'],
        category: 'quran-term',
        images: [
          {
            id: 'tajweed-rules',
            url: '/images/quran/tajweed-rules.jpg',
            thumbnailUrl: '/images/quran/tajweed-rules-thumb.jpg',
            altText: { ar: 'أحكام التجويد', en: 'Tajweed Rules' },
            width: 800,
            height: 600
          }
        ]
      },
      {
        id: 'tilawah',
        arabic: 'تلاوة',
        english: 'Tilawah',
        arabicVariants: ['تلاوة', 'التلاوة', 'تلاوة القرآن'],
        englishVariants: ['Tilawah', 'Recitation', 'Quran Recitation'],
        category: 'quran-term',
        images: [
          {
            id: 'tilawah-mic',
            url: '/images/quran/tilawah-mic.jpg',
            thumbnailUrl: '/images/quran/tilawah-mic-thumb.jpg',
            altText: { ar: 'تلاوة القرآن', en: 'Quran Recitation' },
            width: 600,
            height: 600
          }
        ]
      },
      {
        id: 'juz',
        arabic: 'جزء',
        english: 'Juz',
        arabicVariants: ['جزء', 'الجزء', 'الأجزاء'],
        englishVariants: ['Juz', 'Juz\'', 'Part', 'Section', 'Para'],
        category: 'quran-term',
        images: [
          {
            id: 'juz-bookmark',
            url: '/images/quran/juz-bookmark.jpg',
            thumbnailUrl: '/images/quran/juz-bookmark-thumb.jpg',
            altText: { ar: 'جزء من القرآن', en: 'Juz of the Quran' },
            width: 600,
            height: 800
          }
        ]
      },
      {
        id: 'hizb',
        arabic: 'حزب',
        english: 'Hizb',
        arabicVariants: ['حزب', 'الحزب', 'الأحزاب'],
        englishVariants: ['Hizb', 'Hizb\'', 'Section', 'Portion'],
        category: 'quran-term',
        images: []
      }
    ];

    terms.forEach(term => {
      this.quranTerms.set(term.id, term);
    });
  }

  private initializeSurahNames(): void {
    const surahs: SurahInfo[] = [
      { id: 1, arabic: 'الفاتحة', english: 'Al-Fatiha', arabicVariants: ['سورة الفاتحة', 'فاتحة الكتاب'], englishVariants: ['The Opening', 'Fatiha'] },
      { id: 2, arabic: 'البقرة', english: 'Al-Baqarah', arabicVariants: ['سورة البقرة'], englishVariants: ['The Cow', 'Baqarah'] },
      { id: 3, arabic: 'آل عمران', english: 'Ali \'Imran', arabicVariants: ['سورة آل عمران', 'آل عمران'], englishVariants: ['Family of Imran', 'Ale Imran'] },
      { id: 18, arabic: 'الكهف', english: 'Al-Kahf', arabicVariants: ['سورة الكهف'], englishVariants: ['The Cave', 'Kahf'] },
      { id: 36, arabic: 'يس', english: 'Ya-Sin', arabicVariants: ['سورة يس', 'يس'], englishVariants: ['Yasin', 'Ya Seen'] },
      { id: 55, arabic: 'الرحمن', english: 'Ar-Rahman', arabicVariants: ['سورة الرحمن'], englishVariants: ['The Beneficent', 'Rahman'] },
      { id: 56, arabic: 'الواقعة', english: 'Al-Waqi\'ah', arabicVariants: ['سورة الواقعة'], englishVariants: ['The Inevitable', 'Waqiah'] },
      { id: 67, arabic: 'الملك', english: 'Al-Mulk', arabicVariants: ['سورة الملك'], englishVariants: ['The Sovereignty', 'Tabarak'] },
      { id: 112, arabic: 'الإخلاص', english: 'Al-Ikhlas', arabicVariants: ['سورة الإخلاص'], englishVariants: ['The Sincerity', 'Ikhlas'] },
      { id: 113, arabic: 'الفلق', english: 'Al-Falaq', arabicVariants: ['سورة الفلق'], englishVariants: ['The Daybreak', 'Falaq'] },
      { id: 114, arabic: 'الناس', english: 'An-Nas', arabicVariants: ['سورة الناس'], englishVariants: ['Mankind', 'An Nas'] }
    ];

    surahs.forEach(surah => {
      this.surahNames.set(surah.id.toString(), surah);
    });
  }

  search(query: string, options: UnifiedSearchOptions = {}): UnifiedSearchResult[] {
    const opts: Required<UnifiedSearchOptions> = {
      limit: options.limit || 10,
      minScore: options.minScore || 0.3,
      includePartial: options.includePartial !== false,
      includeInitials: options.includeInitials !== false,
      bilingual: options.bilingual !== false,
      includeImages: options.includeImages !== false,
      imageLimit: options.imageLimit || 2,
      includeRelated: options.includeRelated !== false
    };

    if (!query || query.trim().length === 0) {
      return [];
    }

    const results: Map<string, UnifiedSearchResult> = new Map();

    this.searchReciters(query, results, opts);
    this.searchQuranTerms(query, results, opts);
    this.searchSurahNames(query, results, opts);

    const sortedResults = Array.from(results.values())
      .filter(result => result.relevanceScore >= opts.minScore)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    return sortedResults.slice(0, opts.limit);
  }

  private searchReciters(
    query: string,
    results: Map<string, UnifiedSearchResult>,
    options: Required<UnifiedSearchOptions>
  ): void {
    const searchResults = bilingualSearch(query, {
      limit: options.limit * 2,
      minScore: options.minScore,
      includePartial: options.includePartial,
      includeInitials: options.includeInitials,
      bilingual: options.bilingual
    });

    searchResults.forEach(result => {
      const images = options.includeImages 
        ? this.getReciterImages(result.mapping.id, options.imageLimit)
        : [];

      const unifiedResult: UnifiedSearchResult = {
        id: result.mapping.id,
        type: 'reciter',
        title: {
          ar: result.mapping.arabic,
          en: result.mapping.english
        },
        description: {
          ar: `الشيخ ${result.mapping.arabic}`,
          en: `Sheikh ${result.mapping.english}`
        },
        images,
        relevanceScore: result.score,
        matchType: result.matchType === 'variant' ? 'variant' : result.matchType,
        category: 'reciter',
        metadata: {
          englishVariants: result.mapping.englishVariants,
          arabicVariants: result.mapping.arabicVariants,
          aliases: result.mapping.aliases
        }
      };

      this.mergeResult(results, unifiedResult);
    });
  }

  private searchQuranTerms(
    query: string,
    results: Map<string, UnifiedSearchResult>,
    options: Required<UnifiedSearchOptions>
  ): void {
    const normalizedQuery = normalizeText(query);

    this.quranTerms.forEach(term => {
      let maxScore = 0;
      let matchType: UnifiedSearchResult['matchType'] = 'fuzzy';

      const checkMatch = (termText: string) => {
        const normalizedTerm = normalizeText(termText);

        if (normalizedTerm === normalizedQuery) {
          return { score: 1.0, type: 'exact' as const };
        }
        if (normalizedTerm.includes(normalizedQuery)) {
          const score = normalizedQuery.length / normalizedTerm.length;
          return { score: score * 0.9, type: 'partial' as const };
        }
        if (normalizedQuery.includes(normalizedTerm)) {
          return { score: 0.85, type: 'partial' as const };
        }
        const similarity = calculateSimilarity(normalizedTerm, normalizedQuery);
        if (similarity >= options.minScore) {
          return { score: similarity * 0.8, type: 'fuzzy' as const };
        }
        return { score: 0, type: 'fuzzy' as const };
      };

      const arabicMatches = [
        checkMatch(term.arabic),
        ...term.arabicVariants.map(v => checkMatch(v))
      ];

      const englishMatches = [
        checkMatch(term.english),
        ...term.englishVariants.map(v => checkMatch(v))
      ];

      arabicMatches.forEach(m => {
        if (m.score > maxScore) {
          maxScore = m.score;
          matchType = m.type;
        }
      });

      englishMatches.forEach(m => {
        if (m.score > maxScore) {
          maxScore = m.score;
          matchType = m.type;
        }
      });

      if (maxScore >= options.minScore) {
        const images = options.includeImages ? term.images.slice(0, options.imageLimit) : [];

        const unifiedResult: UnifiedSearchResult = {
          id: `quran-${term.id}`,
          type: 'quran-term',
          title: {
            ar: term.arabic,
            en: term.english
          },
          description: {
            ar: `مصطلح قرآني: ${term.arabic}`,
            en: `Quranic term: ${term.english}`
          },
          images,
          relevanceScore: maxScore,
          matchType,
          category: 'quran-term',
          metadata: {
            arabicVariants: term.arabicVariants,
            englishVariants: term.englishVariants
          }
        };

        this.mergeResult(results, unifiedResult);
      }
    });
  }

  private searchSurahNames(
    query: string,
    results: Map<string, UnifiedSearchResult>,
    options: Required<UnifiedSearchOptions>
  ): void {
    const normalizedQuery = normalizeText(query);

    this.surahNames.forEach(surah => {
      let maxScore = 0;
      let matchType: UnifiedSearchResult['matchType'] = 'fuzzy';

      const checkMatch = (termText: string) => {
        const normalizedTerm = normalizeText(termText);

        if (normalizedTerm === normalizedQuery) {
          return { score: 1.0, type: 'exact' as const };
        }
        if (normalizedTerm.includes(normalizedQuery)) {
          const score = normalizedQuery.length / normalizedTerm.length;
          return { score: score * 0.9, type: 'partial' as const };
        }
        if (normalizedQuery.includes(normalizedTerm)) {
          return { score: 0.85, type: 'partial' as const };
        }
        const similarity = calculateSimilarity(normalizedTerm, normalizedQuery);
        if (similarity >= options.minScore) {
          return { score: similarity * 0.8, type: 'fuzzy' as const };
        }
        return { score: 0, type: 'fuzzy' as const };
      };

      const arabicMatches = [
        checkMatch(surah.arabic),
        ...surah.arabicVariants.map(v => checkMatch(v))
      ];

      const englishMatches = [
        checkMatch(surah.english),
        ...surah.englishVariants.map(v => checkMatch(v))
      ];

      arabicMatches.forEach(m => {
        if (m.score > maxScore) {
          maxScore = m.score;
          matchType = m.type;
        }
      });

      englishMatches.forEach(m => {
        if (m.score > maxScore) {
          maxScore = m.score;
          matchType = m.type;
        }
      });

      if (maxScore >= options.minScore) {
        const unifiedResult: UnifiedSearchResult = {
          id: `surah-${surah.id}`,
          type: 'surah',
          title: {
            ar: surah.arabic,
            en: surah.english
          },
          description: {
            ar: `سورة ${surah.arabic}`,
            en: `Surah ${surah.english}`
          },
          images: [],
          relevanceScore: maxScore,
          matchType,
          category: 'surah',
          metadata: {
            surahNumber: surah.id,
            arabicVariants: surah.arabicVariants,
            englishVariants: surah.englishVariants
          }
        };

        this.mergeResult(results, unifiedResult);
      }
    });
  }

  private getReciterImages(reciterId: string, limit: number): ImageMetadata[] {
    const imageResults = searchImages(reciterId, { limit, minScore: 0.1 });
    const images: ImageMetadata[] = [];
    
    imageResults.forEach(result => {
      images.push(...result.images.slice(0, limit));
    });

    if (images.length === 0) {
      images.push({
        id: `${reciterId}-default`,
        url: '/images/reciters/default-reciter.jpg',
        thumbnailUrl: '/images/reciters/thumbnails/default-reciter.jpg',
        altText: { ar: 'صورة افتراضية', en: 'Default image' },
        width: 400,
        height: 400
      });
    }

    return images.slice(0, limit);
  }

  private mergeResult(
    results: Map<string, UnifiedSearchResult>,
    newResult: UnifiedSearchResult
  ): void {
    const existing = results.get(newResult.id);
    
    if (!existing || existing.relevanceScore < newResult.relevanceScore) {
      results.set(newResult.id, newResult);
    }
  }

  getSuggestions(partial: string, limit: number = 5): SearchSuggestion[] {
    if (!partial || partial.length < 2) {
      return [];
    }

    const suggestions: SearchSuggestion[] = [];
    const normalizedPartial = normalizeText(partial).toLowerCase();

    nameMappings.forEach(mapping => {
      const arabicNormalized = normalizeArabic(mapping.arabic).toLowerCase();
      const englishNormalized = normalizeEnglish(mapping.english).toLowerCase();

      if (arabicNormalized.includes(normalizedPartial) || 
          englishNormalized.includes(normalizedPartial)) {
        
        const images = searchImages(mapping.id, { limit: 1 });
        const thumbnail = images[0]?.images[0]?.thumbnailUrl || 
                         images[0]?.images[0]?.url || '';

        suggestions.push({
          id: mapping.id,
          text: {
            ar: mapping.arabic,
            en: mapping.english
          },
          type: 'reciter',
          thumbnail
        });

        if (suggestions.length >= limit) return;
      }
    });

    if (suggestions.length < limit) {
      this.quranTerms.forEach(term => {
        const arabicNormalized = normalizeArabic(term.arabic).toLowerCase();
        const englishNormalized = normalizeEnglish(term.english).toLowerCase();

        if (arabicNormalized.includes(normalizedPartial) || 
            englishNormalized.includes(normalizedPartial)) {
          
          suggestions.push({
            id: `quran-${term.id}`,
            text: {
              ar: term.arabic,
              en: term.english
            },
            type: 'quran-term',
            thumbnail: term.images[0]?.thumbnailUrl || term.images[0]?.url || ''
          });

          if (suggestions.length >= limit) return;
        }
      });
    }

    return suggestions.slice(0, limit);
  }

  searchByType(query: string, type: UnifiedSearchResult['type'], options: UnifiedSearchOptions = {}): UnifiedSearchResult[] {
    const allResults = this.search(query, options);
    return allResults.filter(result => result.type === type);
  }

  searchImagesOnly(query: string, options: Omit<UnifiedSearchOptions, 'includeImages'> = {}): ImageSearchResult[] {
    return searchImages(query, {
      limit: options.limit || 10,
      minScore: options.minScore || 0.3,
      includeRelated: options.includeRelated !== false
    });
  }

  getRelatedContent(resultId: string, limit: number = 5): UnifiedSearchResult[] {
    const related: UnifiedSearchResult[] = [];

    if (resultId.startsWith('quran-')) {
      const termId = resultId.replace('quran-', '');
      const term = this.quranTerms.get(termId);
      
      if (term) {
        const query = detectLanguage(term.arabic) === 'arabic' ? term.arabic : term.english;
        const results = this.search(query, { limit: limit + 1 });
        results.forEach(r => {
          if (r.id !== resultId && related.length < limit) {
            related.push(r);
          }
        });
      }
    } else {
      const mapping = nameMappings.find(m => m.id === resultId);
      
      if (mapping) {
        const similarReciters = bilingualSearch(mapping.english, { limit: limit + 1 });
        similarReciters.forEach(sr => {
          if (sr.mapping.id !== resultId && related.length < limit) {
            related.push({
              id: sr.mapping.id,
              type: 'reciter',
              title: { ar: sr.mapping.arabic, en: sr.mapping.english },
              description: { ar: `الشيخ ${sr.mapping.arabic}`, en: `Sheikh ${sr.mapping.english}` },
              images: [],
              relevanceScore: sr.score * 0.6,
              matchType: 'related',
              category: 'reciter'
            });
          }
        });
      }
    }

    return related;
  }
}

interface QuranTerm {
  id: string;
  arabic: string;
  english: string;
  arabicVariants: string[];
  englishVariants: string[];
  category: string;
  images: ImageMetadata[];
}

interface SurahInfo {
  id: number;
  arabic: string;
  english: string;
  arabicVariants: string[];
  englishVariants: string[];
}

export const unifiedSearchService = new UnifiedSearchService();