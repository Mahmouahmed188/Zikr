# Enhanced Multilingual Search System

## Overview

This document describes the enhanced bilingual search system for the Zikr Quran application, which provides robust Arabic and English search capabilities for reciters, Quran terms, and content with image support.

## Features

### 1. **Bilingual Search Support**
- Search in Arabic (العربية) and English
- Automatic language detection
- Bidirectional matching (search in Arabic, get English results and vice versa)
- Support for mixed-language queries

### 2. **Transliteration Handling**
- Handles multiple transliteration variants (e.g., Mohammed, Muhammad, Mohamed)
- Supports common name variations (Abdul Rahman, Abdurrahman, Abdulrahman)
- Initials matching (e.g., "MA" matches "Mishary Al-Afasy")

### 3. **Arabic Text Normalization**
- Diacritics (tashkeel) removal
- Letter variant normalization (أ, إ, آ → ا)
- Hamza handling
- Alif maqsura normalization
- White space normalization

### 4. **Image Search**
- Automatic image retrieval for search results
- Thumbnail support
- Fallback images for missing content
- Alt-text in both Arabic and English

### 5. **Intelligent Ranking**
- Category-based scoring
- Exact match bonuses
- Language match preferences
- Popularity-based reordering
- Fuzzy match handling

### 6. **Real-time Performance**
- Debounced search (300ms delay)
- Memoized results
- Efficient string matching
- Optimized similarity calculations

## Architecture

### Core Services

#### 1. `textNormalization.ts`
Handles text normalization for both Arabic and English:
- `normalizeArabic()` - Removes diacritics and normalizes letters
- `normalizeEnglish()` - Normalizes prefixes and transliterations
- `detectLanguage()` - Detects if text is Arabic, English, or mixed
- `calculateSimilarity()` - Levenshtein distance-based similarity
- `tokenize()` - Breaks text into searchable tokens

#### 2. `bilingualSearch.ts`
Main search engine for reciter names:
- `search()` - Main search function with options
- `getSuggestions()` - Autocomplete suggestions
- `findSimilar()` - "Did you mean?" functionality
- `batchSearch()` - Process multiple queries

#### 3. `imageSearch.ts`
Image retrieval and management:
- `searchImages()` - Find images by query
- `getImageSuggestions()` - Thumbnail suggestions
- `preloadImages()` - Preload images for performance

#### 4. `unifiedSearch.ts`
Comprehensive search across all content types:
- `search()` - Unified search (reciters, Quran terms, surahs)
- `searchByType()` - Filter by content type
- `searchImagesOnly()` - Image-only search
- `getRelatedContent()` - Find related content

#### 5. `searchRanking.ts`
Intelligent result ranking:
- `rank()` - Calculate relevance scores
- `reRankByPopularity()` - Reorder by popularity
- `reRankByRecency()` - Reorder by recency
- `getDiverseResults()` - Ensure category diversity

### Data Sources

#### Name Mappings (`nameMappings.ts`)
Comprehensive database of reciter names with:
- Primary Arabic and English names
- Transliteration variants
- Aliases
- ID mappings

#### Quran Terms Database
Built-in Quran terminology:
- Quran (القرآن)
- Surah (سورة)
- Ayah (آية)
- Tajweed (تجويد)
- Tilawah (تلاوة)
- Juz (جزء)
- Hizb (حزب)

#### Surah Names
Important surahs with variants:
- Al-Fatiha (الفاتحة)
- Al-Baqarah (البقرة)
- Al-Kahf (الكهف)
- Ya-Sin (يس)
- Ar-Rahman (الرحمن)
- And more...

## Usage

### Basic Search

```typescript
import { unifiedSearchService } from './services/unifiedSearch';

// Search for a reciter
const results = unifiedSearchService.search('mishary', {
  limit: 10,
  includeImages: true,
  minScore: 0.3
});

// Search in Arabic
const arabicResults = unifiedSearchService.search('العفاسي', {
  limit: 10,
  includeImages: true
});
```

### Search Options

```typescript
interface UnifiedSearchOptions {
  limit?: number;           // Max results (default: 10)
  minScore?: number;        // Minimum relevance (default: 0.3)
  includePartial?: boolean; // Include partial matches (default: true)
  includeInitials?: boolean;// Match initials (default: true)
  bilingual?: boolean;      // Search both languages (default: true)
  includeImages?: boolean;  // Return images (default: true)
  imageLimit?: number;      // Images per result (default: 2)
  includeRelated?: boolean; // Include related content (default: true)
}
```

### Component Integration

```tsx
import UnifiedSearchComponent from './components/UnifiedSearchComponent';

<UnifiedSearchComponent
  onResultSelect={(result) => console.log(result)}
  placeholder="Search reciters, surahs, or Quran terms..."
  showImages={true}
  maxResults={10}
/>
```

### Reciter Search

```tsx
import RecitersPage from './components/RecitersPage';

// The RecitersPage now supports:
// - Arabic reciter names (مشاري, السديس, etc.)
// - English transliterations (Mishary, Sudais, etc.)
// - Name variants (Muhammad, Mohammed, Mohamed)
// - Initials matching (MA, AS, etc.)
```

## Search Examples

### Arabic Queries

| Query | Results | Match Type |
|-------|---------|------------|
| قرآن | Quran (The Holy Quran) | Exact |
| العفاسي | Mishary Al-Afasy | Exact |
| السديس | Abdul Rahman Al-Sudais | Exact |
| تجويد | Tajweed (recitation rules) | Exact |
| سورة الفاتحة | Al-Fatiha (The Opening) | Exact |

### English Queries

| Query | Results | Match Type |
|-------|---------|------------|
| Quran | القرآن, Quran term | Exact |
| Mishary | مشاري العفاسي | Exact |
| Sudais | عبد الرحمن السديس | Exact |
| Muhammad | محمد (multiple reciters) | Variant |
| Surah | سورة, Quran term | Exact |

### Transliteration Handling

| Query Variants | All Match Same Reciter |
|----------------|------------------------|
| Mohammed, Muhammad, Mohamed | Muhammad Al-Minshawi |
| Abdul Rahman, Abdurrahman | Abdul Rahman Al-Sudais |
| Al-Afasy, El-Afasy, Afasy | Mishary Al-Afasy |
| Al-Minshawi, Minshawy | Muhammad Al-Minshawi |

## Performance Optimization

### Debounced Search
Search is debounced with 300ms delay to reduce unnecessary API calls:
```typescript
const debouncedQuery = useMemo(() => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (value: string) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      performSearch(value);
    }, 300);
  };
}, []);
```

### Memoization
Results are memoized to prevent unnecessary recalculations:
```typescript
const filteredReciters = useMemo(() => {
  // Search logic here
}, [reciters, search]);
```

### Efficient String Matching
Uses normalized strings for comparison:
```typescript
const normalizedQuery = searchLang === 'arabic' 
  ? normalizeArabic(query)
  : normalizeEnglish(query);
```

## Troubleshooting

### Search Returns No Results

**Problem:** Searching for Arabic terms returns no results

**Solutions:**
1. Ensure Arabic input is properly normalized
2. Check if the term exists in the database
3. Try removing diacritics (tashkeel)
4. Try different transliteration variants

**Example:**
```typescript
// Instead of:
search('مُحَمَّدٌ')

// Try:
search('محمد')
```

### Images Not Loading

**Problem:** Images are not displayed for search results

**Solutions:**
1. Check if image URLs are correct
2. Verify image files exist in the expected location
3. Enable `includeImages` in search options
4. Check browser console for loading errors

### Poor Search Relevance

**Problem:** Results are not sorted by relevance

**Solutions:**
1. Adjust `minScore` threshold
2. Enable ranking: `searchRanker.rank(results, query)`
3. Use `reRankByPopularity()` for popular items
4. Check category boost settings

## API Integration

### External Quran API
The application uses the MP3Quran API:
- Base URL: `https://www.mp3quran.net/api/v3`
- Endpoints:
  - `/reciters` - Get all reciters
  - `/suwar` - Get all surahs
- Language support: `eng`, `ar`

### Data Synchronization
API data is synchronized with local search database:
1. Fetch data from API on initialization
2. Cache in Chrome storage/local storage
3. Map API reciter IDs to search database
4. Refresh periodically

## Testing

### Unit Tests
```typescript
// Test Arabic normalization
const normalized = normalizeArabic('مُحَمَّدٌ');
// Expected: 'محمد'

// Test language detection
const lang = detectLanguage('Hello world');
// Expected: 'english'

// Test similarity
const similarity = calculateSimilarity('Mohammed', 'Muhammad');
// Expected: ~0.85
```

### Integration Tests
```typescript
// Test Arabic search
const results = unifiedSearchService.search('القرآن');
assert(results.length > 0);
assert(results[0].type === 'quran-term');

// Test English search
const englishResults = unifiedSearchService.search('Quran');
assert(englishResults.length > 0);

// Test mixed search
const mixedResults = unifiedSearchService.search('Quran قرآن');
assert(mixedResults.length > 0);
```

## Future Enhancements

1. **Voice Search**: Add speech-to-text for Arabic and English
2. **Semantic Search**: Use ML for context-aware matching
3. **Personalization**: Learn from user preferences
4. **Offline Mode**: Full offline search capability
5. **Advanced Filters**: Filter by reciter style, surah count, etc.
6. **Search History**: Save and suggest recent searches
7. **Collaborative Filtering**: Recommend based on similar users

## Contributing

When adding new reciters or Quran terms:

1. Add to `nameMappings.ts`:
   ```typescript
   {
     id: 'reciter-id',
     arabic: 'الاسم العربي',
     arabicVariants: ['الاسم الكامل'],
     english: 'English Name',
     englishVariants: ['Variant 1', 'Variant 2'],
     aliases: ['alias1', 'alias2']
   }
   ```

2. Update surah names in `unifiedSearch.ts`

3. Add images to image database

4. Test with both Arabic and English queries

## License

This search system is part of the Zikr Quran Extension project.