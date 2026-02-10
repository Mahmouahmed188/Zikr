/**
 * Search Ranking Algorithm
 * Provides intelligent ranking for multilingual search results
 */

import { UnifiedSearchResult } from './unifiedSearch';
import {
  detectLanguage
} from './textNormalization';

export interface RankingOptions {
  boostExactMatches?: boolean;
  boostReciters?: number;
  boostQuranTerms?: number;
  boostSurahs?: number;
  penalizeFuzzy?: number;
  languageWeight?: number;
}

export interface RankedResult extends UnifiedSearchResult {
  finalScore: number;
  rankingFactors: {
    exactMatchBonus: number;
    categoryBonus: number;
    languageMatchBonus: number;
    recencyBonus: number;
    popularityBonus: number;
  };
}

class SearchRanker {
  private categoryPopularity: Map<string, number> = new Map();

  constructor() {
    this.initializePopularityScores();
  }

  private initializePopularityScores(): void {
    this.categoryPopularity.set('reciter', 0.9);
    this.categoryPopularity.set('quran-term', 0.7);
    this.categoryPopularity.set('surah', 0.8);
    this.categoryPopularity.set('content', 0.6);
  }

  rank(
    results: UnifiedSearchResult[],
    query: string,
    options: RankingOptions = {}
  ): RankedResult[] {
    const opts: Required<RankingOptions> = {
      boostExactMatches: options.boostExactMatches !== false,
      boostReciters: options.boostReciters ?? 0.1,
      boostQuranTerms: options.boostQuranTerms ?? 0.05,
      boostSurahs: options.boostSurahs ?? 0.08,
      penalizeFuzzy: options.penalizeFuzzy ?? 0.2,
      languageWeight: options.languageWeight ?? 0.15
    };

    const queryLang = detectLanguage(query);

    return results
      .map(result => this.calculateRank(result, query, queryLang, opts))
      .sort((a, b) => b.finalScore - a.finalScore);
  }

  private calculateRank(
    result: UnifiedSearchResult,
    _query: string,
    queryLang: 'arabic' | 'english' | 'mixed',
    options: Required<RankingOptions>
  ): RankedResult {
    let score = result.relevanceScore;

    const factors = {
      exactMatchBonus: 0,
      categoryBonus: 0,
      languageMatchBonus: 0,
      recencyBonus: 0,
      popularityBonus: 0
    };

    if (options.boostExactMatches && result.matchType === 'exact') {
      factors.exactMatchBonus = 0.2;
      score += factors.exactMatchBonus;
    }

    if (result.category === 'reciter') {
      factors.categoryBonus = options.boostReciters;
      score += factors.categoryBonus;
    } else if (result.category === 'quran-term') {
      factors.categoryBonus = options.boostQuranTerms;
      score += factors.categoryBonus;
    } else if (result.category === 'surah') {
      factors.categoryBonus = options.boostSurahs;
      score += factors.categoryBonus;
    }

    if (queryLang !== 'mixed') {
      const resultLang = this.detectResultLanguage(result);
      if (queryLang === resultLang) {
        factors.languageMatchBonus = options.languageWeight;
        score += factors.languageMatchBonus;
      }
    }

    if (result.matchType === 'fuzzy') {
      score *= (1 - options.penalizeFuzzy);
    }

    const popularity = this.categoryPopularity.get(result.category) || 0.5;
    factors.popularityBonus = popularity * 0.1;
    score += factors.popularityBonus;

    score = Math.min(Math.max(score, 0), 1);

    return {
      ...result,
      finalScore: score,
      rankingFactors: factors
    };
  }

  private detectResultLanguage(result: UnifiedSearchResult): 'arabic' | 'english' {
    const arabicText = `${result.title.ar} ${result.description?.ar || ''}`;
    const englishText = `${result.title.en} ${result.description?.en || ''}`;

    const arabicChars = (arabicText.match(/[\u0600-\u06FF]/g) || []).length;
    const englishChars = (englishText.match(/[a-zA-Z]/g) || []).length;

    return arabicChars > englishChars ? 'arabic' : 'english';
  }

  reRankByPopularity(results: RankedResult[]): RankedResult[] {
    return [...results].sort((a, b) => {
      const popularityDiff = 
        (this.categoryPopularity.get(b.category) || 0) - 
        (this.categoryPopularity.get(a.category) || 0);

      if (Math.abs(popularityDiff) > 0.1) {
        return popularityDiff;
      }

      return b.finalScore - a.finalScore;
    });
  }

  reRankByRecency(results: RankedResult[]): RankedResult[] {
    return [...results].sort((a, b) => {
      const recencyA = this.getRecencyScore(a);
      const recencyB = this.getRecencyScore(b);

      if (Math.abs(recencyB - recencyA) > 0.1) {
        return recencyB - recencyA;
      }

      return b.finalScore - a.finalScore;
    });
  }

  private getRecencyScore(result: UnifiedSearchResult): number {
    if (result.category === 'reciter') {
      return 0.7;
    }
    if (result.category === 'surah' && result.metadata?.surahNumber) {
      const surahNum = result.metadata.surahNumber as number;
      return surahNum > 80 ? 0.6 : 0.4;
    }
    return 0.5;
  }

  explainRanking(result: RankedResult): string {
    const explanations: string[] = [];

    if (result.rankingFactors.exactMatchBonus > 0) {
      explanations.push('Exact match bonus applied');
    }
    if (result.rankingFactors.categoryBonus > 0) {
      explanations.push(`${result.category} category boost applied`);
    }
    if (result.rankingFactors.languageMatchBonus > 0) {
      explanations.push('Language match bonus applied');
    }
    if (result.matchType === 'fuzzy') {
      explanations.push('Fuzzy match penalty applied');
    }

    if (explanations.length === 0) {
      return 'Standard relevance scoring';
    }

    return explanations.join(', ');
  }

  getTopResult(results: UnifiedSearchResult[], query: string, options?: RankingOptions): RankedResult | null {
    const ranked = this.rank(results, query, options);
    return ranked.length > 0 ? ranked[0] : null;
  }

  filterByMinScore(results: RankedResult[], minScore: number): RankedResult[] {
    return results.filter(r => r.finalScore >= minScore);
  }

  getDiverseResults(
    results: UnifiedSearchResult[],
    query: string,
    maxPerCategory: number = 3,
    options?: RankingOptions
  ): RankedResult[] {
    const ranked = this.rank(results, query, options);
    const diverse: RankedResult[] = [];
    const categoryCounts: Map<string, number> = new Map();

    for (const result of ranked) {
      const count = categoryCounts.get(result.category) || 0;
      
      if (count < maxPerCategory) {
        diverse.push(result);
        categoryCounts.set(result.category, count + 1);
      }
    }

    return diverse;
  }
}

export const searchRanker = new SearchRanker();