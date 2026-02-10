/**
 * Bilingual Search Examples
 * 
 * This file demonstrates various use cases for the bilingual sheikh/reciter
 * search system. These examples can be used for testing and documentation.
 */

import { search, getSuggestions, findSimilar, SearchResult, getAllReciters, batchSearch } from './bilingualSearch';
import { detectLanguage, normalizeArabic, normalizeEnglish } from './textNormalization';

// ============================================================================
// EXAMPLE 1: Basic Arabic Search
// ============================================================================
console.log('=== Example 1: Arabic Search ===');
const arabicResults = search('محمد');
console.log('Search: محمد');
console.log('Results:', arabicResults.slice(0, 3).map(r => ({
  name: r.mapping.english,
  arabic: r.mapping.arabic,
  score: r.score
})));
// Output will show Muhammad Al-Minshawi, Mohammed Al-Majid, etc.

// ============================================================================
// EXAMPLE 2: Basic English Search
// ============================================================================
console.log('\n=== Example 2: English Search ===');
const englishResults = search('Mishary');
console.log('Search: Mishary');
console.log('Results:', englishResults.slice(0, 3).map(r => ({
  name: r.mapping.english,
  arabic: r.mapping.arabic,
  score: r.score
})));
// Output will show Mishary Al-Afasy

// ============================================================================
// EXAMPLE 3: Transliteration Variants
// ============================================================================
console.log('\n=== Example 3: Transliteration Variants ===');
const variants = ['Mohammed', 'Muhammad', 'Mohamed', 'Mohammad'];
variants.forEach(variant => {
  const results = search(variant, { limit: 1 });
  console.log(`${variant} → ${results[0]?.mapping.english || 'No match'}`);
});
// All variants should match Muhammad reciters

// ============================================================================
// EXAMPLE 4: Abdul/Abdur Variations
// ============================================================================
console.log('\n=== Example 4: Abdul Variations ===');
const abdulVariants = ['Abdul Rahman', 'Abdurrahman', 'Abdulrahman'];
abdulVariants.forEach(variant => {
  const results = search(variant, { limit: 1 });
  console.log(`${variant} → ${results[0]?.mapping.english || 'No match'}`);
});
// All should match Abdul Rahman Al-Sudais

// ============================================================================
// EXAMPLE 5: Partial Name Matching
// ============================================================================
console.log('\n=== Example 5: Partial Matching ===');
const partialResults = search('Sudais');
console.log('Search: Sudais');
console.log('Results:', partialResults.slice(0, 3).map(r => r.mapping.english));
// Should match Abdul Rahman Al-Sudais

// ============================================================================
// EXAMPLE 6: Initials Matching
// ============================================================================
console.log('\n=== Example 6: Initials Matching ===');
const initialsResults = search('MA');
console.log('Search: MA');
console.log('Results:', initialsResults.slice(0, 3).map(r => ({
  name: r.mapping.english,
  score: r.score
})));
// Should match Mishary Al-Afasy (M.A. initials)

// ============================================================================
// EXAMPLE 7: Autocomplete Suggestions
// ============================================================================
console.log('\n=== Example 7: Autocomplete ===');
const suggestions = getSuggestions('mis', 5);
console.log('Partial: mis');
console.log('Suggestions:', suggestions.map(r => r.mapping.english));
// Should suggest Mishary, Muhammad, etc.

// ============================================================================
// EXAMPLE 8: Find Similar Names ("Did you mean?")
// ============================================================================
console.log('\n=== Example 8: Similar Names ===');
const similar = findSimilar('Al-Minshawy', 3);
console.log('Query: Al-Minshawy (misspelled)');
console.log('Did you mean:', similar.map(r => ({
  name: r.mapping.english,
  similarity: r.score
})));
// Should suggest Muhammad Al-Minshawi

// ============================================================================
// EXAMPLE 9: Language Detection
// ============================================================================
console.log('\n=== Example 9: Language Detection ===');
const testStrings = ['محمد', 'Mohammed', 'عبد الرحمن', 'Abdul Rahman'];
testStrings.forEach(str => {
  const lang = detectLanguage(str);
  console.log(`${str} → ${lang}`);
});

// ============================================================================
// EXAMPLE 10: Arabic Normalization (Diacritic Removal)
// ============================================================================
console.log('\n=== Example 10: Arabic Normalization ===');
const arabicStrings = [
  'مُحَمَّدٌ',
  'عَبْدُ الرَّحْمَنِ',
  'ٱلشَّيْخُ'
];
arabicStrings.forEach(str => {
  const normalized = normalizeArabic(str);
  console.log(`${str} → ${normalized}`);
});

// ============================================================================
// EXAMPLE 11: English Normalization
// ============================================================================
console.log('\n=== Example 11: English Normalization ===');
const englishStrings = [
  'Al-Mohammed',
  'Abdul-Rahman',
  'El-Akhdar'
];
englishStrings.forEach(str => {
  const normalized = normalizeEnglish(str);
  console.log(`${str} → ${normalized}`);
});

// ============================================================================
// EXAMPLE 12: Bidirectional Search
// ============================================================================
console.log('\n=== Example 12: Bidirectional Search ===');
// Search in Arabic, get English results
const arabicToEnglish = search('الشريم');
console.log('Arabic: الشريم');
console.log('English matches:', arabicToEnglish.slice(0, 2).map(r => r.mapping.english));

// Search in English, get Arabic results
const englishToArabic = search('Shuraim');
console.log('\nEnglish: Shuraim');
console.log('Arabic matches:', englishToArabic.slice(0, 2).map(r => r.mapping.arabic));

// ============================================================================
// EXAMPLE 13: Complex Name Matching
// ============================================================================
console.log('\n=== Example 13: Complex Names ===');
const complexQueries = [
  'Abu Bakr Shatri',
  'Maher Muaiqly',
  'Yasser Dosari',
  'Ali Jaber'
];
complexQueries.forEach(query => {
  const results = search(query, { limit: 1 });
  console.log(`${query} → ${results[0]?.mapping.english || 'No match'}`);
});

// ============================================================================
// EXAMPLE 14: Search with Filters
// ============================================================================
console.log('\n=== Example 14: Search with Options ===');
const filteredResults = search('Muhammad', {
  limit: 3,
  minScore: 0.5,
  includePartial: false,
  bilingual: true
});
console.log('Filtered search for Muhammad:');
console.log(filteredResults.map(r => ({
  name: r.mapping.english,
  matchType: r.matchType,
  score: r.score
})));

// ============================================================================
// EXAMPLE 15: Image Search Scenario
// ============================================================================
console.log('\n=== Example 15: Image Search (by name) ===');
// Simulate image search - search by name and get image URL
const imageSearchQueries = ['مشاري', 'Mishary', 'العفاسي', 'Afasy'];
imageSearchQueries.forEach(query => {
  const results = search(query, { limit: 1 });
  if (results.length > 0) {
    const reciter = results[0].mapping;
    console.log(`Query: "${query}"`);
    console.log(`  Arabic: ${reciter.arabic}`);
    console.log(`  English: ${reciter.english}`);
    console.log(`  Image: /images/reciters/${reciter.id}.jpg`);
    console.log('');
  }
});

// ============================================================================
// EXAMPLE 16: Biography Search Scenario
// ============================================================================
console.log('\n=== Example 16: Finding Reciter Information ===');
// Example of finding reciter for displaying biography
const findReciterInfo = (query: string): SearchResult | null => {
  const results = search(query, { limit: 1, minScore: 0.4 });
  return results[0] || null;
};

const infoQueries = ['Sudais', 'السديس', 'Minshawi', 'المنشاوي'];
infoQueries.forEach(query => {
  const info = findReciterInfo(query);
  if (info) {
    console.log(`Query: "${query}"`);
    console.log(`  Found: ${info.mapping.english}`);
    console.log(`  Arabic: ${info.mapping.arabic}`);
    console.log(`  Match Type: ${info.matchType}`);
    console.log(`  Confidence: ${(info.score * 100).toFixed(1)}%`);
    console.log('');
  }
});

// ============================================================================
// EXAMPLE 17: Fuzzy Matching with Typos
// ============================================================================
console.log('\n=== Example 17: Handling Typos ===');
const typos = ['Minshavy', 'Menshawi', 'Mishari', 'Al-Afasi'];
typos.forEach(typo => {
  const results = search(typo, { limit: 1 });
  if (results.length > 0) {
    console.log(`${typo} → ${results[0].mapping.english} (${(results[0].score * 100).toFixed(0)}%)`);
  } else {
    console.log(`${typo} → No match`);
  }
});

// ============================================================================
// EXAMPLE 18: Batch Search
// ============================================================================
console.log('\n=== Example 18: Batch Search ===');
const queries = ['Mohammed', 'Abdullah', 'Saud'];
const batchResults = batchSearch(queries, { limit: 2 });
queries.forEach(query => {
  const results = batchResults.get(query);
  console.log(`${query}: ${results?.map((r: SearchResult) => r.mapping.english).join(', ')}`);
});

// ============================================================================
// Summary Statistics
// ============================================================================
console.log('\n=== Search System Statistics ===');
const allReciters = getAllReciters();
console.log(`Total reciters in database: ${allReciters.length}`);
console.log(`Arabic names: ${allReciters.length}`);
console.log(`English names: ${allReciters.length}`);
console.log(`Average variants per reciter: ~${(
  allReciters.reduce((acc: number, r: { englishVariants: string | any[] }) => acc + r.englishVariants.length, 0) / allReciters.length
).toFixed(1)}`);

// ============================================================================
// Usage in React Components
// ============================================================================
/*
Example integration in a React component:

import { search, getSuggestions } from './services/bilingualSearch';

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (query.length >= 2) {
      // Get search results
      const searchResults = search(query, { limit: 10 });
      setResults(searchResults);
      
      // Get autocomplete suggestions
      const autoSuggestions = getSuggestions(query, 5);
      setSuggestions(autoSuggestions);
    }
  }, [query]);

  return (
    <div>
      <input 
        value={query} 
        onChange={e => setQuery(e.target.value)}
        placeholder="Search reciter (Arabic or English)..."
      />
      <ul>
        {results.map(result => (
          <li key={result.mapping.id}>
            {result.mapping.english} ({result.mapping.arabic})
          </li>
        ))}
      </ul>
    </div>
  );
};
*/

// Export examples for testing
export const examples = {
  basicArabicSearch: () => search('محمد'),
  basicEnglishSearch: () => search('Mishary'),
  transliterationVariants: () => ['Mohammed', 'Muhammad'].map(v => search(v, { limit: 1 })),
  autocomplete: (partial: string) => getSuggestions(partial, 5),
  findSimilar: (name: string) => findSimilar(name, 3),
};
