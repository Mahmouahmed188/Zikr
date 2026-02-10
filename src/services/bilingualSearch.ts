/**
 * Bilingual Search Service
 * Comprehensive search functionality for Arabic-English sheikh/reciter names
 */

import {
  NameMapping,
  SearchResult,
  nameMappings,
  buildSearchIndex,
  getMappingById,
} from './nameMappings';
import {
  normalizeArabic,
  normalizeEnglish,
  normalizeText,
  detectLanguage,
  isArabic,
  calculateSimilarity,
  levenshteinDistance,
  tokenize,
  matchesInitials,
} from './textNormalization';

/**
 * Search options
 */
export interface SearchOptions {
  /** Maximum number of results to return */
  limit?: number;
  /** Minimum similarity score (0-1) for fuzzy matches */
  minScore?: number;
  /** Whether to include partial matches */
  includePartial?: boolean;
  /** Whether to search using initials matching */
  includeInitials?: boolean;
  /** Whether to search across both languages */
  bilingual?: boolean;
}

/**
 * Default search options
 */
const DEFAULT_OPTIONS: Required<SearchOptions> = {
  limit: 10,
  minScore: 0.3,
  includePartial: true,
  includeInitials: true,
  bilingual: true,
};

/**
 * Search for sheikh/reciter names using the pre-built index
 * 
 * @param query - Search query
 * @param useIndex - Whether to use the search index (faster for exact matches)
 * @returns Array of matching name mappings
 */
export function searchByIndex(query: string): NameMapping[] {
  const index = buildSearchIndex();
  const normalized = normalizeText(query);
  return index.get(normalized) || [];
}

/**
 * Search for sheikh/reciter names
 * Automatically detects query language and searches both Arabic and English
 * 
 * @param query - Search query
 * @param options - Search options
 * @returns Array of search results sorted by relevance
 */
export function search(query: string, options: SearchOptions = {}): SearchResult[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const queryTrimmed = query.trim();
  const detectedLang = detectLanguage(queryTrimmed);
  
  const results = new Map<string, SearchResult>();

  // Search based on detected language
  if (detectedLang === 'arabic' || opts.bilingual) {
    searchArabic(queryTrimmed, results, opts);
  }
  
  if (detectedLang === 'english' || detectedLang === 'mixed' || opts.bilingual) {
    searchEnglish(queryTrimmed, results, opts);
  }

  // Convert to array and sort by score
  const sortedResults = Array.from(results.values())
    .filter((result) => result.score >= opts.minScore)
    .sort((a, b) => b.score - a.score);

  return sortedResults.slice(0, opts.limit);
}

/**
 * Search in Arabic names
 */
function searchArabic(
  query: string,
  results: Map<string, SearchResult>,
  options: Required<SearchOptions>
): void {
  const normalizedQuery = normalizeArabic(query);
  
  if (normalizedQuery.length === 0) return;

  for (const mapping of nameMappings) {
    // Check exact match on primary Arabic name
    const arabicPrimary = normalizeArabic(mapping.arabic);
    if (arabicPrimary === normalizedQuery) {
      addResult(results, mapping, 1.0, 'exact', mapping.arabic);
      continue;
    }

    // Check Arabic variants
    for (const variant of mapping.arabicVariants) {
      const normalizedVariant = normalizeArabic(variant);
      
      if (normalizedVariant === normalizedQuery) {
        addResult(results, mapping, 0.95, 'variant', variant);
        break;
      }

      // Check partial match
      if (options.includePartial) {
        if (normalizedVariant.includes(normalizedQuery)) {
          const score = normalizedQuery.length / normalizedVariant.length;
          addResult(results, mapping, score * 0.9, 'partial', variant);
        }
        
        // Check if query contains the variant
        if (normalizedQuery.includes(normalizedVariant)) {
          addResult(results, mapping, 0.85, 'partial', variant);
        }
      }
    }

    // Fuzzy matching for Arabic
    const similarity = calculateSimilarity(arabicPrimary, normalizedQuery);
    if (similarity >= options.minScore && similarity < 1.0) {
      addResult(results, mapping, similarity * 0.8, 'fuzzy', mapping.arabic);
    }
  }
}

/**
 * Search in English names
 */
function searchEnglish(
  query: string,
  results: Map<string, SearchResult>,
  options: Required<SearchOptions>
): void {
  const normalizedQuery = normalizeEnglish(query);
  const queryLower = query.toLowerCase().trim();
  
  if (normalizedQuery.length === 0) return;

  for (const mapping of nameMappings) {
    // Check exact match on primary English name
    const englishPrimary = normalizeEnglish(mapping.english);
    if (englishPrimary === normalizedQuery) {
      addResult(results, mapping, 1.0, 'exact', mapping.english);
      continue;
    }

    // Check English variants
    for (const variant of mapping.englishVariants) {
      const normalizedVariant = normalizeEnglish(variant);
      
      if (normalizedVariant === normalizedQuery) {
        addResult(results, mapping, 0.95, 'variant', variant);
        break;
      }

      // Check partial match
      if (options.includePartial) {
        if (normalizedVariant.includes(normalizedQuery)) {
          const score = normalizedQuery.length / normalizedVariant.length;
          addResult(results, mapping, score * 0.9, 'partial', variant);
        }
        
        // Check if query contains the variant
        if (normalizedQuery.includes(normalizedVariant)) {
          addResult(results, mapping, 0.85, 'partial', variant);
        }
      }
    }

    // Check aliases
    for (const alias of mapping.aliases) {
      const normalizedAlias = alias.toLowerCase().trim();
      
      if (normalizedAlias === queryLower) {
        addResult(results, mapping, 0.9, 'variant', alias);
        break;
      }

      if (options.includePartial && normalizedAlias.includes(queryLower)) {
        const score = queryLower.length / normalizedAlias.length;
        addResult(results, mapping, score * 0.85, 'partial', alias);
      }
    }

    // Check initials matching (e.g., "MA" for "Mishary Al-Afasy")
    if (options.includeInitials && query.length >= 2) {
      // Check if query looks like initials (mostly uppercase or short)
      if (/^[A-Z\s]+$/i.test(query) && query.length <= 5) {
        if (matchesInitials(query, mapping.english)) {
          addResult(results, mapping, 0.88, 'variant', mapping.english);
        }
        
        for (const variant of mapping.englishVariants) {
          if (matchesInitials(query, variant)) {
            addResult(results, mapping, 0.85, 'variant', variant);
            break;
          }
        }
      }
    }

    // Fuzzy matching for English
    const similarity = calculateSimilarity(englishPrimary, normalizedQuery);
    if (similarity >= options.minScore && similarity < 1.0) {
      addResult(results, mapping, similarity * 0.8, 'fuzzy', mapping.english);
    }

    // Word-by-word matching
    const queryTokens = tokenize(query);
    if (queryTokens.length > 1) {
      const englishTokens = tokenize(mapping.english);
      const matchCount = queryTokens.filter((qt) =>
        englishTokens.some((et) => et.includes(qt) || qt.includes(et))
      ).length;
      
      if (matchCount > 0) {
        const tokenScore = matchCount / Math.max(queryTokens.length, englishTokens.length);
        addResult(results, mapping, tokenScore * 0.75, 'partial', mapping.english);
      }
    }
  }
}

/**
 * Add or update a search result
 */
function addResult(
  results: Map<string, SearchResult>,
  mapping: NameMapping,
  score: number,
  matchType: SearchResult['matchType'],
  matchedVariant?: string
): void {
  const existing = results.get(mapping.id);
  
  if (!existing || existing.score < score) {
    results.set(mapping.id, {
      mapping,
      score,
      matchType,
      matchedVariant,
    });
  }
}

/**
 * Search by exact ID
 */
export function searchById(id: string): SearchResult | null {
  const mapping = getMappingById(id);
  if (!mapping) return null;
  
  return {
    mapping,
    score: 1.0,
    matchType: 'exact',
  };
}

/**
 * Get suggestions as the user types
 * Returns top matches for autocomplete
 * 
 * @param partial - Partial query string
 * @param limit - Maximum number of suggestions
 * @returns Array of search results
 */
export function getSuggestions(partial: string, limit: number = 5): SearchResult[] {
  if (!partial || partial.length < 2) {
    return [];
  }

  return search(partial, {
    limit,
    minScore: 0.2,
    includePartial: true,
    includeInitials: true,
    bilingual: true,
  });
}

/**
 * Find similar names
 * Useful for "Did you mean?" functionality
 * 
 * @param name - Name to find similar matches for
 * @param limit - Maximum number of results
 * @returns Array of similar names
 */
export function findSimilar(name: string, limit: number = 3): SearchResult[] {
  const normalized = normalizeText(name);
  const results: SearchResult[] = [];

  for (const mapping of nameMappings) {
    // Calculate similarity with Arabic name
    const arabicSimilarity = calculateSimilarity(normalized, normalizeArabic(mapping.arabic));
    
    // Calculate similarity with English name
    const englishSimilarity = calculateSimilarity(normalized, normalizeEnglish(mapping.english));
    
    // Use the higher similarity
    const maxSimilarity = Math.max(arabicSimilarity, englishSimilarity);
    
    if (maxSimilarity >= 0.4 && maxSimilarity < 1.0) {
      results.push({
        mapping,
        score: maxSimilarity,
        matchType: 'fuzzy',
      });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Search with advanced filtering
 * 
 * @param query - Search query
 * @param filters - Filter options
 * @param options - Search options
 * @returns Filtered search results
 */
export function searchWithFilters(
  query: string,
  filters: {
    language?: 'arabic' | 'english' | 'both';
    exactMatch?: boolean;
  },
  options: SearchOptions = {}
): SearchResult[] {
  const searchOptions: SearchOptions = {
    ...options,
    bilingual: filters.language !== 'arabic' && filters.language !== 'english',
  };

  if (filters.exactMatch) {
    searchOptions.minScore = 0.95;
  }

  return search(query, searchOptions);
}

/**
 * Get all available sheikhs/reciters
 * 
 * @returns Array of all name mappings
 */
export function getAllReciters(): NameMapping[] {
  return [...nameMappings];
}

/**
 * Format a search result for display
 * 
 * @param result - Search result
 * @param locale - Preferred language for display ('ar' or 'en')
 * @returns Formatted string
 */
export function formatResult(
  result: SearchResult,
  locale: 'ar' | 'en' = 'en'
): string {
  if (locale === 'ar') {
    return result.mapping.arabic;
  }
  return result.mapping.english;
}

/**
 * Check if a query matches a specific reciter
 * 
 * @param query - Search query
 * @param reciterId - Reciter ID to check
 * @returns True if query matches the reciter
 */
export function matchesReciter(query: string, reciterId: string): boolean {
  const results = search(query, { limit: 1 });
  return results.length > 0 && results[0].mapping.id === reciterId;
}

/**
 * Batch search multiple queries
 * Useful for searching multiple names at once
 * 
 * @param queries - Array of search queries
 * @param options - Search options
 * @returns Map of queries to their results
 */
export function batchSearch(
  queries: string[],
  options: SearchOptions = {}
): Map<string, SearchResult[]> {
  const results = new Map<string, SearchResult[]>();
  
  for (const query of queries) {
    results.set(query, search(query, options));
  }
  
  return results;
}

/**
 * Export types for use in other modules
 */
export type { NameMapping, SearchResult };
export {
  normalizeArabic,
  normalizeEnglish,
  normalizeText,
  detectLanguage,
  isArabic,
  calculateSimilarity,
  levenshteinDistance,
};
