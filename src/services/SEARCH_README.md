# Bilingual Sheikh/Reciter Search System

This directory contains a comprehensive bilingual search system for sheikh/reciter names that supports both Arabic and English queries with intelligent matching across transliteration variants.

## Features

- **Bidirectional Search**: Search in Arabic and find English matches, and vice versa
- **Transliteration Variants**: Handles multiple English spellings (e.g., "Mohammed", "Muhammad", "Mohamed")
- **Fuzzy Matching**: Finds similar names even with typos or partial matches
- **Initials Matching**: Supports acronym searches (e.g., "MA" for "Mishary Al-Afasy")
- **Diacritic Removal**: Automatically handles Arabic diacritics (tashkeel)
- **Prefix Normalization**: Handles "Al-", "El-", "Abdul" variations
- **Scalable Architecture**: Efficient search with indexing and relevance scoring

## File Structure

```
src/services/
├── nameMappings.ts          # Database of Arabic-English name mappings
├── textNormalization.ts     # Text normalization utilities
└── bilingualSearch.ts       # Main search service
```

## Usage Examples

### Basic Search

```typescript
import { search } from './services/bilingualSearch';

// Search in Arabic - returns both Arabic and English results
const results = search('محمد');
// Returns: Muhammad Al-Minshawi, Mohammed Al-Majid, etc.

// Search in English - returns both English and Arabic results
const results = search('Mishary');
// Returns: مشاري العفاسي (Mishary Al-Afasy)
```

### Search with Options

```typescript
import { search } from './services/bilingualSearch';

const results = search('Abdul Rahman', {
  limit: 5,              // Maximum results
  minScore: 0.3,         // Minimum relevance score (0-1)
  includePartial: true,  // Include partial matches
  includeInitials: true, // Match initials (e.g., "AR" for "Abdul Rahman")
  bilingual: true        // Search across both languages
});
```

### Autocomplete Suggestions

```typescript
import { getSuggestions } from './services/bilingualSearch';

// Get suggestions as user types
const suggestions = getSuggestions('mis', 5);
// Returns: Mishary Al-Afasy, Muhammad Al-Minshawi, etc.
```

### Find Similar Names

```typescript
import { findSimilar } from './services/bilingualSearch';

// Useful for "Did you mean?" functionality
const similar = findSimilar('Al-Minshawy', 3);
// Returns: Muhammad Al-Minshawi (with similarity score)
```

### Language Detection

```typescript
import { detectLanguage, isArabic } from './services/textNormalization';

const lang = detectLanguage('محمد'); // Returns: 'arabic'
const lang = detectLanguage('Mohammed'); // Returns: 'english'

const isAr = isArabic('عبدالرحمن'); // Returns: true
```

### Text Normalization

```typescript
import { normalizeArabic, normalizeEnglish } from './services/textNormalization';

// Normalize Arabic text (removes diacritics, normalizes letter variants)
const normalized = normalizeArabic('مُحَمَّدٌ');
// Returns: 'محمد'

// Normalize English text (handles prefixes, transliteration variants)
const normalized = normalizeEnglish('Al-Mohammed');
// Returns: 'mohammed' (al- prefix removed)
```

## Supported Sheikh/Reciter Names

The system includes comprehensive mappings for 30+ prominent Quran reciters:

- Saud Al-Shuraim
- Mishary Al-Afasy
- Mahmoud Khalil Al-Husary
- Abdul Rahman Al-Sudais
- Muhammad Al-Minshawi
- Abu Bakr Al-Shatri
- Yasser Al-Dosari
- Maher Al-Muaiqly
- Nasser Al-Qatami
- Salah Al-Budair
- Ahmed Al-Ajmi
- Fares Abbad
- Saad Al-Ghamdi
- And many more...

Each entry includes:
- Primary Arabic name
- Arabic name variants
- Primary English name
- English transliteration variants
- Search aliases

## Name Mapping Structure

```typescript
interface NameMapping {
  id: string;                    // Unique identifier
  arabic: string;               // Primary Arabic name
  arabicVariants: string[];     // Alternative Arabic spellings
  english: string;              // Primary English name
  englishVariants: string[];    // Transliteration variants
  aliases: string[];            // Search aliases/nicknames
}
```

## Search Algorithm

1. **Language Detection**: Automatically detects if query is Arabic or English
2. **Normalization**: Applies language-specific normalization
   - Arabic: Removes diacritics, normalizes letter variants
   - English: Handles prefixes, expands transliteration variants
3. **Multi-field Search**: Searches across:
   - Primary names
   - Name variants
   - Aliases
   - Initials (for English)
4. **Scoring**: Assigns relevance scores based on:
   - Exact matches (1.0)
   - Variant matches (0.95)
   - Partial matches (0.7-0.9)
   - Fuzzy matches (0.3-0.8)
   - Initial matches (0.85)
5. **Ranking**: Results sorted by relevance score

## Integration

The search system is integrated into:

1. **RecitersPage Component**: Main reciter selection page
2. **ReciterSelection Component**: Reciter dropdown/selection

Both components use bilingual search with fallback to original name matching.

## Adding New Reciters

To add a new reciter, edit `src/services/nameMappings.ts`:

```typescript
{
  id: 'unique-reciter-id',
  arabic: 'الاسم العربي',
  arabicVariants: ['variant1', 'variant2'],
  english: 'English Name',
  englishVariants: ['Variant1', 'Variant2'],
  aliases: ['nickname', 'alias']
}
```

## Performance Considerations

- Search index is built on-demand and cached
- Fuzzy matching uses Levenshtein distance algorithm
- Results are limited by default (configurable)
- Minimum score threshold prevents irrelevant results

## Future Enhancements

- [ ] Add more reciters to the database
- [ ] Implement phonetic matching (Soundex/Metaphone)
- [ ] Add support for additional languages
- [ ] Cache search results for popular queries
- [ ] Add analytics for search patterns
- [ ] Implement machine learning for better ranking

## API Reference

### Search Functions

- `search(query, options?)`: Main search function
- `searchById(id)`: Search by exact ID
- `getSuggestions(partial, limit?)`: Autocomplete suggestions
- `findSimilar(name, limit?)`: Find similar names
- `searchWithFilters(query, filters, options?)`: Search with filters
- `batchSearch(queries, options?)`: Batch search multiple queries

### Utility Functions

- `normalizeArabic(text)`: Normalize Arabic text
- `normalizeEnglish(text)`: Normalize English text
- `normalizeText(text)`: Auto-detect and normalize
- `detectLanguage(text)`: Detect text language
- `isArabic(text)`: Check if text is Arabic
- `calculateSimilarity(str1, str2)`: Calculate string similarity
- `tokenize(text)`: Break text into search tokens

### Data Functions

- `getAllReciters()`: Get all reciter mappings
- `getAllArabicNames()`: Get all Arabic names
- `getAllEnglishNames()`: Get all English names
- `getMappingById(id)`: Get mapping by ID
- `buildSearchIndex()`: Build search index

## Testing

Example test cases:

```typescript
// Test Arabic to English
search('سعود') // Should match Saud Al-Shuraim

// Test English variants
search('Mohamed') // Should match Muhammad
search('Abdurrahman') // Should match Abdul Rahman

// Test initials
search('MA') // Should match Mishary Al-Afasy

// Test fuzzy matching
search('Minshavy') // Should suggest Al-Minshawi

// Test partial matching
search('Sudais') // Should match Abdul Rahman Al-Sudais
```

## Contributing

When adding new reciters:
1. Add entry to `nameMappings.ts`
2. Include all common transliteration variants
3. Add Arabic variants if applicable
4. Include common aliases/nicknames
5. Test search functionality
6. Update this documentation

## License

This search system is part of the Zikr Quran Extension project.
