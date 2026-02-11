const ARABIC_LETTER_MAP: Record<string, string> = {
  'إ': 'ا',
  'أ': 'ا',
  'آ': 'ا',
  'ٱ': 'ا',
  'ٲ': 'ا',
  'ٳ': 'ا',
  'ٴ': 'ء',
  'ة': 'ه',
  'ۀ': 'ه',
  'ى': 'ي',
  'ئ': 'ي',
  'ۓ': 'ي',
  'ڪ': 'ك',
  'ک': 'ك',
  'ۍ': 'ي',
  'ێ': 'ي',
  'ۆ': 'و',
  'ؤ': 'و',
  'ۈ': 'و',
  'ۋ': 'و',
  'ۊ': 'و',
  'ڎ': 'ض',
  'ڍ': 'ض',
  'ڌ': 'ض',
  'ذ': 'د',
  'غ': 'ع',
  'ڠ': 'ع',
  'ڨ': 'ق',
  'گ': 'ك',
  'ڭ': 'ك',
};

const ARABIC_DIACRITICS = [
  '\u064B', '\u064C', '\u064D', '\u064E', '\u064F', '\u0650', '\u0651',
  '\u0652', '\u0653', '\u0654', '\u0655', '\u0656', '\u0657', '\u0658',
  '\u0659', '\u065A', '\u065B', '\u065C', '\u065D', '\u065E', '\u065F',
  '\u0670', '\u0640',
];

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
  'rahman': ['rahman', 'rehman', 'rahmann'],
  'hassan': ['hasan', 'hassane'],
  'saad': ['sa\'ad', 'sad'],
  'tariq': ['tarik', 'tarek'],
  'salim': ['saleem', 'salim'],
  'karim': ['kareem', 'karim'],
};

const ENGLISH_PREFIXES = ['al-', 'el-', 'ul-', 'ar-', 'as-', 'ad-', 'an-'];

export function normalizeArabic(text: string): string {
  if (!text) return '';

  let normalized = text;

  normalized = normalized.replace(/\u0640/g, '');

  const diacriticsPattern = new RegExp(`[${ARABIC_DIACRITICS.join('')}]`, 'g');
  normalized = normalized.replace(diacriticsPattern, '');

  for (const [variant, base] of Object.entries(ARABIC_LETTER_MAP)) {
    normalized = normalized.replace(new RegExp(variant, 'g'), base);
  }

  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

export function normalizeEnglish(text: string): string {
  if (!text) return '';

  let normalized = text.toLowerCase().trim();

  normalized = normalized.replace(/[^\w\s-]/g, ' ');

  ENGLISH_PREFIXES.forEach((prefix) => {
    const regex = new RegExp(`\\b${prefix}\\s*`, 'gi');
    normalized = normalized.replace(regex, '');
  });

  for (const [standard, variants] of Object.entries(ENGLISH_VARIANTS)) {
    variants.forEach((variant) => {
      const regex = new RegExp(`\\b${variant}\\b`, 'gi');
      normalized = normalized.replace(regex, standard);
    });
  }

  normalized = normalized.replace(/-/g, ' ');
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

export function isArabic(text: string): boolean {
  if (!text) return false;
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
}

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

export function normalizeText(text: string): string {
  if (!text) return '';

  const lang = detectLanguage(text);

  if (lang === 'arabic') {
    return normalizeArabic(text);
  }

  return normalizeEnglish(text);
}

export function tokenize(text: string): string[] {
  if (!text) return [];

  const normalized = normalizeText(text);

  return normalized.split(/\s+/).filter((token) => token.length > 0);
}

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

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  const d: number[][] = [];

  for (let i = 0; i <= m; i++) {
    d[i] = [];
    d[i][0] = i;
  }

  for (let j = 0; j <= n; j++) {
    d[0][j] = j;
  }

  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= m; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }

  return d[m][n];
}

export function getBigrams(text: string): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < text.length - 1; i++) {
    bigrams.push(text.substr(i, 2));
  }
  return bigrams;
}

export function extractInitials(text: string): string {
  return text.split(/\s+/).map((word) => word.charAt(0).toUpperCase()).join('');
}

export function matchesInitials(query: string, fullName: string): boolean {
  const initials = extractInitials(fullName);
  return initials.toLowerCase().startsWith(query.toLowerCase());
}
