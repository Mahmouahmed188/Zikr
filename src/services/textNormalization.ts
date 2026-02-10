/**
 * Text Normalization Utilities
 * Provides functions to normalize Arabic and English text for search
 */

/**
 * Arabic letter normalization map
 * Maps variant forms of Arabic letters to their base forms
 */
const ARABIC_LETTER_MAP: Record<string, string> = {
  // Alef variants
  'إ': 'ا',
  'أ': 'ا',
  'آ': 'ا',
  'ٱ': 'ا',
  'ٲ': 'ا',
  'ٳ': 'ا',
  
  // Hamza on its own
  'ٴ': 'ء',
  
  // Ta marbuta and ha
  'ة': 'ه',
  'ۀ': 'ه',
  
  // Ya and alif maqsura variants
  'ى': 'ي',
  'ئ': 'ي',
  'ۓ': 'ي',
  
  // Kaf variants
  'ڪ': 'ك',
  'ک': 'ك',
  
  // Yeh variants
  'ۍ': 'ي',
  'ێ': 'ي',
  
  // Waw variants
  'ۆ': 'و',
  'ؤ': 'و',
  'ۈ': 'و',
  'ۋ': 'و',
  'ۊ': 'و',
  
  // Dad and Dhal variants
  'ڎ': 'ض',
  'ڍ': 'ض',
  'ڌ': 'ض',
  'ذ': 'د',
  
  // Ghain variants
  'غ': 'ع',
  'ڠ': 'ع',
  
  // Additional normalizations
  'ڨ': 'ق',
  'گ': 'ك',
  'ڭ': 'ك',
};

/**
 * Arabic diacritics (tashkeel) to remove
 * Includes fatha, kasra, damma, sukun, tanween, shadda, etc.
 */
const ARABIC_DIACRITICS = [
  '\u064B', // Fathatan
  '\u064C', // Dammatan
  '\u064D', // Kasratan
  '\u064E', // Fatha
  '\u064F', // Damma
  '\u0650', // Kasra
  '\u0651', // Shadda
  '\u0652', // Sukun
  '\u0653', // Maddah
  '\u0654', // Hamza above
  '\u0655', // Hamza below
  '\u0656', // Subscript alef
  '\u0657', // Inverted damma
  '\u0658', // Mark noon ghunna
  '\u0659', // Zwarakay
  '\u065A', // Vowel sign small V above
  '\u065B', // Vowel sign inverted small V above
  '\u065C', // Vowel sign dot below
  '\u065D', // Reversed damma
  '\u065E', // Fatha with two dots
  '\u065F', // Wavy hamza below
  '\u0670', // Superscript alef
  '\u0640', // Tatweel (kashida)
];

/**
 * English common prefixes to handle
 */
const ENGLISH_PREFIXES = ['al-', 'el-', 'ul-', 'ar-', 'as-', 'ad-', 'an-'];

/**
 * Common English transliteration variants
 */
const ENGLISH_VARIANTS: Record<string, string[]> = {
  'abdul': ['abd', 'abdel', 'abdul', 'abdal', 'abdol'],
  'muhammad': ['mohammed', 'mohamed', 'muhammed', 'muhamad', 'mohammad'],
  'ahmed': ['ahmad', 'achmed', 'ahmet'],
  'khalid': ['khaled', 'chalid'],
  'omar': ['umer', 'umar', 'oumar'],
  'ibrahim': ['abraheem', 'ibraheem'],
  'ismail': ['ismail', 'ismael', 'ismaeel'],
  'yusuf': ['youssef', 'yousef', 'yosef', 'joseph'],
  'quran': ['qur\'an', 'quran', 'koran', 'alquran'],
  'sheikh': ['sheik', 'shaykh', 'shaikh', 'cheikh'],
  'imam': ['imaam', 'emam'],
  'rahman': ['rahman', 'rehman', 'rahmann'],
  'hassan': ['hasan', 'hassane'],
  'saad': ['sa\'ad', 'sad'],
  'tariq': ['tarik', 'tarek'],
  'salim': ['saleem', 'salim'],
  'karim': ['kareem', 'karim'],
  'amin': ['ameen', 'amin'],
  'fadel': ['fadal', 'fadel', 'fadl'],
  'hakim': ['hakeem', 'hakim'],
  'jalil': ['jaleel', 'jalil'],
  'nabil': ['nabeele', 'nabil'],
  'qadir': ['kadir', 'qadir', 'kader'],
  'rashid': ['rasheed', 'rashid'],
  'latif': ['lateef', 'latif'],
  'shakur': ['shakoor', 'shakur'],
  'wahid': ['waheed', 'wahid'],
  'majid': ['majeed', 'majid'],
  'baqi': ['baqee', 'baqi'],
  'muttalib': ['muttalib', 'mutallib'],
};

/**
 * Normalize Arabic text for search
 * - Removes diacritics (tashkeel)
 * - Normalizes letter variants
 * - Removes extra whitespace
 * - Removes tatweel
 * 
 * @param text - Arabic text to normalize
 * @returns Normalized text
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';

  let normalized = text;

  // Remove tatweel (kashida) - the elongation character
  normalized = normalized.replace(/\u0640/g, '');

  // Remove all diacritics
  const diacriticsPattern = new RegExp(`[${ARABIC_DIACRITICS.join('')}]`, 'g');
  normalized = normalized.replace(diacriticsPattern, '');

  // Normalize Arabic letter variants
  for (const [variant, base] of Object.entries(ARABIC_LETTER_MAP)) {
    normalized = normalized.replace(new RegExp(variant, 'g'), base);
  }

  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

/**
 * Normalize English text for search
 * - Converts to lowercase
 * - Removes punctuation except hyphens
 * - Normalizes 'al-' prefixes
 * - Expands common transliteration variants
 * - Removes extra whitespace
 * 
 * @param text - English text to normalize
 * @returns Normalized text
 */
export function normalizeEnglish(text: string): string {
  if (!text) return '';

  let normalized = text.toLowerCase().trim();

  // Replace common punctuation with spaces (keep hyphens for now)
  normalized = normalized.replace(/[^\w\s-]/g, ' ');

  // Normalize 'al-' prefixes (handle multiple spaces after)
  ENGLISH_PREFIXES.forEach((prefix) => {
    const regex = new RegExp(`\\b${prefix}\\s*`, 'gi');
    normalized = normalized.replace(regex, '');
  });

  // Expand transliteration variants
  for (const [standard, variants] of Object.entries(ENGLISH_VARIANTS)) {
    variants.forEach((variant) => {
      const regex = new RegExp(`\\b${variant}\\b`, 'gi');
      normalized = normalized.replace(regex, standard);
    });
  }

  // Normalize hyphens (remove them)
  normalized = normalized.replace(/-/g, ' ');

  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

/**
 * Detect if text is primarily Arabic
 * 
 * @param text - Text to check
 * @returns True if text contains Arabic characters
 */
export function isArabic(text: string): boolean {
  if (!text) return false;
  
  // Arabic Unicode ranges
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
}

/**
 * Detect the primary language of the text
 * 
 * @param text - Text to analyze
 * @returns 'arabic', 'english', or 'mixed'
 */
export function detectLanguage(text: string): 'arabic' | 'english' | 'mixed' {
  if (!text) return 'english';

  const arabicCount = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const englishCount = (text.match(/[a-zA-Z]/g) || []).length;
  const totalLetters = arabicCount + englishCount;

  if (totalLetters === 0) return 'english';

  const arabicRatio = arabicCount / totalLetters;
  const englishRatio = englishCount / totalLetters;

  if (arabicRatio > 0.7) return 'arabic';
  if (englishRatio > 0.7) return 'english';
  return 'mixed';
}

/**
 * Get all transliteration variants for a word
 * 
 * @param word - Word to get variants for
 * @returns Array of possible variants
 */
export function getTransliterationVariants(word: string): string[] {
  const normalized = word.toLowerCase().trim();
  
  for (const [standard, variants] of Object.entries(ENGLISH_VARIANTS)) {
    if (standard === normalized || variants.includes(normalized)) {
      return [standard, ...variants];
    }
  }
  
  return [normalized];
}

/**
 * Remove English prefixes like Al-, El-, etc.
 * 
 * @param text - Text to process
 * @returns Text without prefixes
 */
export function removeEnglishPrefixes(text: string): string {
  let result = text.toLowerCase().trim();
  
  ENGLISH_PREFIXES.forEach((prefix) => {
    const regex = new RegExp(`^${prefix}\\s*`, 'i');
    result = result.replace(regex, '');
  });
  
  return result.trim();
}

/**
 * Normalize text regardless of language
 * Automatically detects language and applies appropriate normalization
 * 
 * @param text - Text to normalize
 * @returns Normalized text
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  
  const lang = detectLanguage(text);
  
  if (lang === 'arabic') {
    return normalizeArabic(text);
  }
  
  return normalizeEnglish(text);
}

/**
 * Generate search tokens from text
 * Breaks text into individual searchable words
 * 
 * @param text - Text to tokenize
 * @returns Array of normalized tokens
 */
export function tokenize(text: string): string[] {
  if (!text) return [];
  
  const normalized = normalizeText(text);
  
  // Split on whitespace and filter empty tokens
  return normalized
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

/**
 * Check if two strings are similar (for fuzzy matching)
 * Uses simple character comparison after normalization
 * 
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score (0-1)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 * 
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Edit distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  // Create distance matrix
  const d: number[][] = [];
  
  for (let i = 0; i <= m; i++) {
    d[i] = [];
    d[i][0] = i;
  }
  
  for (let j = 0; j <= n; j++) {
    d[0][j] = j;
  }
  
  // Fill matrix
  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= m; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return d[m][n];
}

/**
 * Export Levenshtein distance for use in other modules
 */
export { levenshteinDistance };

/**
 * Extract initial letters for acronym matching
 * e.g., "Mishary Al-Afasy" -> "MA"
 * 
 * @param text - Text to extract initials from
 * @returns Initials string
 */
export function extractInitials(text: string): string {
  return text
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Check if a query matches initials
 * e.g., "MA" matches "Mishary Al-Afasy"
 * 
 * @param query - Query string (potential initials)
 * @param fullName - Full name to check against
 * @returns True if query matches initials
 */
export function matchesInitials(query: string, fullName: string): boolean {
  const initials = extractInitials(fullName);
  return initials.toLowerCase().startsWith(query.toLowerCase());
}
