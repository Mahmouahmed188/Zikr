/**
 * Image Search Service
 * 
 * Provides bilingual image search capabilities for reciters/sheikhs.
 * Maps search queries to appropriate images regardless of language.
 */

import { NameMapping, nameMappings } from './nameMappings';
import { normalizeArabic, normalizeEnglish, detectLanguage } from './textNormalization';
import { search } from './bilingualSearch';

/**
 * Image metadata interface
 */
export interface ImageMetadata {
  id: string;
  url: string;
  thumbnailUrl?: string;
  altText: {
    ar: string;
    en: string;
  };
  width?: number;
  height?: number;
  size?: number;
}

/**
 * Search result with image
 */
export interface ImageSearchResult {
  reciterId: string;
  reciterName: {
    ar: string;
    en: string;
  };
  images: ImageMetadata[];
  relevanceScore: number;
  matchType: 'exact' | 'fuzzy' | 'partial' | 'variant' | 'related';
}

/**
 * Default image mapping for reciters
 * In production, these would be actual image URLs from your CDN or API
 */
const reciterImageMap: Map<string, ImageMetadata[]> = new Map();

/**
 * Initialize the image database
 * This can be replaced with API calls to fetch actual images
 */
export function initializeImageDatabase(): void {
  // Clear existing mappings
  reciterImageMap.clear();

  // Map images to reciters
  // In production, these URLs would come from your image CDN
  nameMappings.forEach((mapping) => {
    const images: ImageMetadata[] = [
      {
        id: `${mapping.id}-main`,
        url: `/images/reciters/${mapping.id}.jpg`,
        thumbnailUrl: `/images/reciters/thumbnails/${mapping.id}.jpg`,
        altText: {
          ar: `الشيخ ${mapping.arabic}`,
          en: `Sheikh ${mapping.english}`,
        },
        width: 800,
        height: 800,
      },
      {
        id: `${mapping.id}-portrait`,
        url: `/images/reciters/${mapping.id}-portrait.jpg`,
        thumbnailUrl: `/images/reciters/thumbnails/${mapping.id}-portrait.jpg`,
        altText: {
          ar: `صورة ${mapping.arabic}`,
          en: `Portrait of ${mapping.english}`,
        },
        width: 600,
        height: 800,
      },
    ];

    reciterImageMap.set(mapping.id, images);
  });
}

/**
 * Get images for a specific reciter by ID
 */
export function getImagesByReciterId(reciterId: string): ImageMetadata[] {
  return reciterImageMap.get(reciterId) || [];
}

/**
 * Search for images by query
 * Works with both Arabic and English queries
 */
export function searchImages(
  query: string,
  options: {
    limit?: number;
    minScore?: number;
    includeRelated?: boolean;
  } = {}
): ImageSearchResult[] {
  const { limit = 10, minScore = 0.3, includeRelated = true } = options;

  if (!query || query.trim().length === 0) {
    return [];
  }

  // First, search for matching reciters
  const searchResults = search(query, {
    limit: limit * 2, // Get more results to filter
    minScore: minScore,
    includePartial: true,
    includeInitials: true,
    bilingual: true,
  });

  // Map search results to image results
  const imageResults: ImageSearchResult[] = searchResults
    .filter((result) => {
      const images = getImagesByReciterId(result.mapping.id);
      return images.length > 0 || includeRelated;
    })
    .map((result) => {
      const images = getImagesByReciterId(result.mapping.id);

      return {
        reciterId: result.mapping.id,
        reciterName: {
          ar: result.mapping.arabic,
          en: result.mapping.english,
        },
        images: images.length > 0 ? images : getDefaultImages(result.mapping),
        relevanceScore: result.score,
        matchType: result.matchType === 'variant' ? 'variant' : result.matchType,
      };
    });

  // If no direct matches, try related searches
  if (imageResults.length === 0 && includeRelated) {
    return getRelatedImageResults(query, limit);
  }

  return imageResults.slice(0, limit);
}

/**
 * Get default/fallback images when specific images aren't available
 */
function getDefaultImages(mapping: NameMapping): ImageMetadata[] {
  return [
    {
      id: `${mapping.id}-default`,
      url: `/images/reciters/default-reciter.jpg`,
      thumbnailUrl: `/images/reciters/thumbnails/default-reciter.jpg`,
      altText: {
        ar: `الشيخ ${mapping.arabic}`,
        en: `Sheikh ${mapping.english}`,
      },
      width: 400,
      height: 400,
    },
  ];
}

/**
 * Get related image results when no direct matches found
 * Uses semantic similarity and category matching
 */
function getRelatedImageResults(query: string, limit: number): ImageSearchResult[] {
  const lang = detectLanguage(query);
  if (lang === 'mixed') {
    return [];
  }
  const normalizedQuery = lang === 'arabic' 
    ? normalizeArabic(query) 
    : normalizeEnglish(query);

  // Find reciters with related names or categories
  const relatedResults: ImageSearchResult[] = [];

  // Search by keywords/categories
  const keywords = extractKeywords(normalizedQuery, lang);
  
  for (const mapping of nameMappings) {
    let relevanceScore = 0;

    // Check for keyword matches in aliases
    for (const alias of mapping.aliases) {
      const normalizedAlias = lang === 'arabic' 
        ? normalizeArabic(alias) 
        : normalizeEnglish(alias);
      
      for (const keyword of keywords) {
        if (normalizedAlias.includes(keyword)) {
          relevanceScore = Math.max(relevanceScore, 0.5);
        }
      }
    }

    // Check for partial matches in names
    const searchTerms = lang === 'arabic' 
      ? [mapping.arabic, ...mapping.arabicVariants]
      : [mapping.english, ...mapping.englishVariants];

    for (const term of searchTerms) {
      const normalizedTerm = lang === 'arabic' 
        ? normalizeArabic(term) 
        : normalizeEnglish(term);
      
      for (const keyword of keywords) {
        if (normalizedTerm.includes(keyword) || keyword.includes(normalizedTerm)) {
          relevanceScore = Math.max(relevanceScore, 0.4);
        }
      }
    }

    if (relevanceScore > 0) {
      const images = getImagesByReciterId(mapping.id);
      relatedResults.push({
        reciterId: mapping.id,
        reciterName: {
          ar: mapping.arabic,
          en: mapping.english,
        },
        images: images.length > 0 ? images : getDefaultImages(mapping),
        relevanceScore: relevanceScore,
        matchType: 'related',
      });
    }
  }

  // Sort by relevance and return top results
  return relatedResults
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
}

/**
 * Extract keywords from a search query
 */
function extractKeywords(query: string, lang: 'arabic' | 'english'): string[] {
  const stopWords = lang === 'arabic'
    ? ['الشيخ', 'القارئ', 'الدكتور', 'سيد', 'الاستاذ', 'فضيلة']
    : ['sheikh', 'sheik', 'qari', 'reciter', 'dr', 'doctor', 'professor'];

  const words = query.split(/\s+/).filter(word => 
    word.length > 2 && !stopWords.includes(word.toLowerCase())
  );

  return words;
}

/**
 * Get image suggestions as user types
 */
export function getImageSuggestions(
  partial: string,
  limit: number = 5
): { name: { ar: string; en: string }; thumbnailUrl: string }[] {
  if (!partial || partial.length < 2) {
    return [];
  }

  const searchResults = search(partial, {
    limit,
    minScore: 0.2,
    includePartial: true,
    bilingual: true,
  });

  return searchResults.map((result) => {
    const images = getImagesByReciterId(result.mapping.id);
    const thumbnail = images[0]?.thumbnailUrl || images[0]?.url || '/images/reciters/default-thumb.jpg';

    return {
      name: {
        ar: result.mapping.arabic,
        en: result.mapping.english,
      },
      thumbnailUrl: thumbnail,
    };
  });
}

/**
 * Batch image search for multiple queries
 */
export function batchImageSearch(
  queries: string[],
  options: { limit?: number; minScore?: number } = {}
): Map<string, ImageSearchResult[]> {
  const results = new Map<string, ImageSearchResult[]>();

  for (const query of queries) {
    results.set(query, searchImages(query, options));
  }

  return results;
}

/**
 * Check if images exist for a reciter
 */
export function hasImages(reciterId: string): boolean {
  const images = reciterImageMap.get(reciterId);
  return images !== undefined && images.length > 0;
}

/**
 * Get all available image URLs
 * Useful for preloading or caching
 */
export function getAllImageUrls(): string[] {
  const urls: string[] = [];

  reciterImageMap.forEach((images) => {
    images.forEach((image) => {
      urls.push(image.url);
      if (image.thumbnailUrl) {
        urls.push(image.thumbnailUrl);
      }
    });
  });

  return urls;
}

/**
 * Preload images for better performance
 */
export function preloadImages(imageUrls: string[]): Promise<void[]> {
  const preloadPromises = imageUrls.map((url) => {
    return new Promise<void>((resolve, _reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn(`Failed to preload image: ${url}`);
        resolve(); // Resolve anyway to not block other images
      };
      img.src = url;
    });
  });

  return Promise.all(preloadPromises);
}

/**
 * Format image search result for display
 */
export function formatImageResult(
  result: ImageSearchResult,
  locale: 'ar' | 'en' = 'en'
): {
  title: string;
  subtitle: string;
  images: string[];
  altText: string;
} {
  const title = locale === 'ar' ? result.reciterName.ar : result.reciterName.en;
  const subtitle = locale === 'ar' 
    ? `نتائج البحث (${Math.round(result.relevanceScore * 100)}% تطابق)`
    : `Search results (${Math.round(result.relevanceScore * 100)}% match)`;

  return {
    title,
    subtitle,
    images: result.images.map((img) => img.url),
    altText: locale === 'ar' ? result.images[0]?.altText.ar : result.images[0]?.altText.en,
  };
}

// Initialize on module load
initializeImageDatabase();
