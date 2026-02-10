/**
 * Name Mappings Database
 * Maps Arabic names to their English equivalents with transliteration variants
 */

export interface NameMapping {
  arabic: string;
  arabicVariants: string[];
  english: string;
  englishVariants: string[];
  aliases: string[];
  id: string;
}

export interface SearchResult {
  mapping: NameMapping;
  score: number;
  matchType: 'exact' | 'fuzzy' | 'partial' | 'variant';
  matchedVariant?: string;
}

/**
 * Comprehensive database of sheikh/reciter name mappings
 */
export const nameMappings: NameMapping[] = [
  // Saud Al-Shuraim
  {
    id: 'saud-al-shuraim',
    arabic: 'سعود الشريم',
    arabicVariants: ['سعود بن ابراهيم الشريم', 'الشيخ سعود الشريم'],
    english: 'Saud Al-Shuraim',
    englishVariants: [
      'Saud Al Shuraim',
      'Saud Al-Shuraym',
      'Saud Shuraim',
      'Saud Alshuraim',
      'Saud Bin Ibrahim Al Shuraim',
    ],
    aliases: ['shuraim', 'الشريم'],
  },

  // Mishary Al-Afasy
  {
    id: 'mishary-al-afasy',
    arabic: 'مشاري العفاسي',
    arabicVariants: ['مشاري راشد العفاسي', 'الشيخ مشاري العفاسي'],
    english: 'Mishary Al-Afasy',
    englishVariants: [
      'Mishary Al Afasy',
      'Mishary Rashid Al-Afasy',
      'Mishary Alafasy',
      'Mishary Rashid Alafasy',
      'Mishary El-Afasy',
      'Afasy',
    ],
    aliases: ['afasy', 'العفاسي'],
  },

  // Mahmoud Khalil Al-Husary
  {
    id: 'mahmoud-al-husary',
    arabic: 'محمود خليل الحصري',
    arabicVariants: ['الشيخ محمود خليل الحصري', 'الحصري'],
    english: 'Mahmoud Khalil Al-Husary',
    englishVariants: [
      'Mahmoud Al-Husary',
      'Mahmoud Al Husary',
      'Mahmoud Husary',
      'Mahmoud Khalil Al-Hussary',
      'Al-Husary',
      'Al Husary',
      'Husary',
    ],
    aliases: ['husary', 'الحصري', 'hussary'],
  },

  // Abdul Rahman Al-Sudais
  {
    id: 'abdul-rahman-al-sudais',
    arabic: 'عبد الرحمن السديس',
    arabicVariants: ['الشيخ عبد الرحمن السديس', 'عبدالرحمن السديس'],
    english: 'Abdul Rahman Al-Sudais',
    englishVariants: [
      'Abdulrahman Al-Sudais',
      'Abdurrahman Al-Sudais',
      'Abdul Rahman Al Sudais',
      'Abdulrahman Al Sudais',
      'Abdurrahman Al Sudais',
      'Al-Sudais',
      'Al Sudais',
      'Sudais',
    ],
    aliases: ['sudais', 'السديس'],
  },

  // Muhammad Al-Minshawi
  {
    id: 'muhammad-al-minshawi',
    arabic: 'محمد صديق المنشاوي',
    arabicVariants: ['الشيخ محمد المنشاوي', 'المنشاوي', 'محمد المنشاوي'],
    english: 'Muhammad Al-Minshawi',
    englishVariants: [
      'Mohammed Al-Minshawi',
      'Mohamed Al-Minshawi',
      'Muhammad Al Minshawi',
      'Mohammed Al Minshawi',
      'Al-Minshawi',
      'Al Minshawi',
      'Minshawi',
    ],
    aliases: ['minshawi', 'المنشاوي'],
  },

  // Muhammad Siddiq Al-Minshawi (full name variant)
  {
    id: 'muhammad-siddiq-al-minshawi',
    arabic: 'محمد صديق المنشاوي',
    arabicVariants: ['الشيخ محمد صديق المنشاوي'],
    english: 'Muhammad Siddiq Al-Minshawi',
    englishVariants: [
      'Mohammed Siddiq Al-Minshawi',
      'Mohamed Siddiq Al-Minshawi',
      'Muhammed Siddiq Al-Minshawi',
      'Muhammad Sadiq Al-Minshawi',
    ],
    aliases: ['siddiq minshawi'],
  },

  // Abu Bakr Al-Shatri
  {
    id: 'abu-bakr-al-shatri',
    arabic: 'أبو بكر الشاطري',
    arabicVariants: ['الشيخ أبو بكر الشاطري', 'الشاطري'],
    english: 'Abu Bakr Al-Shatri',
    englishVariants: [
      'Abu Bakr Ash-Shatri',
      'Abu Bakr Al Shatri',
      'Abubakr Al-Shatri',
      'Al-Shatri',
      'Al Shatri',
      'Shatri',
    ],
    aliases: ['shatri', 'الشاطري'],
  },

  // Yasser Al-Dosari
  {
    id: 'yasser-al-dosari',
    arabic: 'ياسر الدوسري',
    arabicVariants: ['الشيخ ياسر الدوسري', 'ياسر بن راشد الدوسري'],
    english: 'Yasser Al-Dosari',
    englishVariants: [
      'Yasser Al Dosari',
      'Yasser Aldosari',
      'Yaser Al-Dosari',
      'Yassir Al-Dosari',
      'Al-Dosari',
      'Al Dosari',
      'Dosari',
    ],
    aliases: ['dosari', 'الدوسري'],
  },

  // Maher Al-Muaiqly
  {
    id: 'maher-al-muaiqly',
    arabic: 'ماهر المعيقلي',
    arabicVariants: ['الشيخ ماهر المعيقلي', 'ماهر بن حمد المعيقلي'],
    english: 'Maher Al-Muaiqly',
    englishVariants: [
      'Maher Al Muaiqly',
      'Maher Al-Muaiqli',
      'Maher Muaiqly',
      'Maher Al-Muaqily',
      'Al-Muaiqly',
      'Al Muaiqly',
      'Muaiqly',
    ],
    aliases: ['muaiqly', 'المعيقلي', 'muaiqli'],
  },

  // Nasser Al-Qatami
  {
    id: 'nasser-al-qatami',
    arabic: 'ناصر القطامي',
    arabicVariants: ['الشيخ ناصر القطامي'],
    english: 'Nasser Al-Qatami',
    englishVariants: [
      'Nasser Al Qatami',
      'Naser Al-Qatami',
      'Nassir Al-Qatami',
      'Al-Qatami',
      'Al Qatami',
      'Qatami',
    ],
    aliases: ['qatami', 'القطامي'],
  },

  // Salah Al-Budair
  {
    id: 'salah-al-budair',
    arabic: 'صلاح البدير',
    arabicVariants: ['الشيخ صلاح البدير', 'صلاح بن محمد البدير'],
    english: 'Salah Al-Budair',
    englishVariants: [
      'Salah Al Budair',
      'Salah Albudair',
      'Salah Al-Budeir',
      'Salah Al-Budayr',
      'Al-Budair',
      'Al Budair',
      'Budair',
    ],
    aliases: ['budair', 'البدير'],
  },

  // Ahmed Al-Ajmi
  {
    id: 'ahmed-al-ajmi',
    arabic: 'أحمد بن علي العجمي',
    arabicVariants: ['الشيخ أحمد العجمي', 'أحمد العجمي'],
    english: 'Ahmed Al-Ajmi',
    englishVariants: [
      'Ahmad Al-Ajmi',
      'Ahmed Al Ajmi',
      'Ahmad Al Ajmi',
      'Ahmed Alajmi',
      'Ahmed Al-Ajamy',
      'Al-Ajmi',
      'Al Ajmi',
      'Ajmi',
    ],
    aliases: ['ajmi', 'العجمي'],
  },

  // Fares Abbad
  {
    id: 'fares-abbad',
    arabic: 'فارس عباد',
    arabicVariants: ['الشيخ فارس عباد'],
    english: 'Fares Abbad',
    englishVariants: [
      'Faris Abbad',
      'Fares Abad',
      'Faris Abad',
      'Fares Abbadi',
      'Abbad',
    ],
    aliases: ['abbad', 'عباد'],
  },

  // Saad Al-Ghamdi
  {
    id: 'saad-al-ghamdi',
    arabic: 'سعد الغامدي',
    arabicVariants: ['الشيخ سعد الغامدي', 'سعد بن سعيد الغامدي'],
    english: 'Saad Al-Ghamdi',
    englishVariants: [
      'Saad Al Ghamdi',
      'Saad Alghamdi',
      'Saad El-Ghamdi',
      'Saad Al-Ghamidi',
      'Al-Ghamdi',
      'Al Ghamdi',
      'Ghamdi',
    ],
    aliases: ['ghamdi', 'الغامدي'],
  },

  // Muhammad Al-Muhaysini
  {
    id: 'muhammad-al-muhaysini',
    arabic: 'محمد المحيسني',
    arabicVariants: ['الشيخ محمد المحيسني'],
    english: 'Muhammad Al-Muhaysini',
    englishVariants: [
      'Mohammed Al-Muhaysini',
      'Mohamed Al-Muhaysini',
      'Muhammad Al Muhaysini',
      'Al-Muhaysini',
      'Al Muhaysini',
      'Muhaysini',
    ],
    aliases: ['muhaysini', 'المحيسني'],
  },

  // Abdul Basit Abdus Samad
  {
    id: 'abdul-basit-abdus-samad',
    arabic: 'عبد الباسط عبد الصمد',
    arabicVariants: ['الشيخ عبد الباسط عبد الصمد', 'عبدالباسط عبدالصمد'],
    english: 'Abdul Basit Abdus Samad',
    englishVariants: [
      'Abdulbasit Abdus Samad',
      'Abdul Basit Abdus-Samad',
      'Abdulbasit Abdussamad',
      'Abdul Basit',
      'Abdulbasit',
      'Abd El-Basit',
      'Abdul Baset',
    ],
    aliases: ['abdul basit', 'عبد الباسط', 'abdussamad', 'abdus samad'],
  },

  // Hani Ar-Rifai
  {
    id: 'hani-ar-rifai',
    arabic: 'هاني الرفاعي',
    arabicVariants: ['الشيخ هاني الرفاعي'],
    english: 'Hani Ar-Rifai',
    englishVariants: [
      'Hani Al-Rifai',
      'Hani Ar Rifai',
      'Hani Al Rifai',
      'Hany Ar-Rifai',
      'Al-Rifai',
      'Ar-Rifai',
      'Rifai',
    ],
    aliases: ['rifai', 'الرفاعي'],
  },

  // Muhammad Al-Jibril
  {
    id: 'muhammad-al-jibril',
    arabic: 'محمد جبريل',
    arabicVariants: ['الشيخ محمد جبريل', 'محمد سعيد جبريل'],
    english: 'Muhammad Al-Jibril',
    englishVariants: [
      'Mohammed Al-Jibril',
      'Mohamed Al-Jibril',
      'Muhammad Jibril',
      'Mohammed Jibril',
      'Muhammad Aljibril',
      'Jibril',
    ],
    aliases: ['jibril', 'جبريل', 'gabriel'],
  },

  // Khalid Al-Jalil
  {
    id: 'khalid-al-jalil',
    arabic: 'خالد الجليل',
    arabicVariants: ['الشيخ خالد الجليل'],
    english: 'Khalid Al-Jalil',
    englishVariants: [
      'Khaled Al-Jalil',
      'Khalid Al Jalil',
      'Khaled Al Jalil',
      'Khalid Aljalil',
      'Al-Jalil',
      'Al Jalil',
      'Jalil',
    ],
    aliases: ['jalil', 'الجليل'],
  },

  // Abdullah Al-Matroud
  {
    id: 'abdullah-al-matroud',
    arabic: 'عبد الله المطرود',
    arabicVariants: ['الشيخ عبد الله المطرود', 'عبدالله المطرود'],
    english: 'Abdullah Al-Matroud',
    englishVariants: [
      'Abdullah Al Matroud',
      'Abdullah Almatroud',
      'Abdallah Al-Matroud',
      'Al-Matroud',
      'Al Matroud',
      'Matroud',
    ],
    aliases: ['matroud', 'المطرود'],
  },

  // Muhammad Ayyub
  {
    id: 'muhammad-ayyub',
    arabic: 'محمد أيوب',
    arabicVariants: ['الشيخ محمد أيوب'],
    english: 'Muhammad Ayyub',
    englishVariants: [
      'Mohammed Ayyub',
      'Mohamed Ayyub',
      'Muhammad Ayub',
      'Mohammed Ayub',
      'Muhammad Ayoub',
      'Ayyub',
      'Ayub',
    ],
    aliases: ['ayyub', 'أيوب', 'ayoub'],
  },

  // Mustafa Al-Lahoni
  {
    id: 'mustafa-al-lahoni',
    arabic: 'مصطفى اللحوني',
    arabicVariants: ['الشيخ مصطفى اللحوني'],
    english: 'Mustafa Al-Lahoni',
    englishVariants: [
      'Mustafa Al Lahoni',
      'Mostafa Al-Lahoni',
      'Mustafa Al-Lahouni',
      'Al-Lahoni',
      'Al Lahoni',
      'Lahoni',
    ],
    aliases: ['lahoni', 'اللحوني'],
  },

  // Ibrahim Al-Akhdar
  {
    id: 'ibrahim-al-akhdar',
    arabic: 'إبراهيم الأخضر',
    arabicVariants: ['الشيخ إبراهيم الأخضر'],
    english: 'Ibrahim Al-Akhdar',
    englishVariants: [
      'Ibrahim Al Akhdar',
      'Ibrahim Alakhdar',
      'Ibrahim Al-Akhadar',
      'Al-Akhdar',
      'Al Akhdar',
      'Akhdar',
    ],
    aliases: ['akhdar', 'الأخضر'],
  },

  // Ali Al-Hudhaifi
  {
    id: 'ali-al-hudhaifi',
    arabic: 'علي الحذيفي',
    arabicVariants: ['الشيخ علي الحذيفي', 'علي بن عبد الرحمن الحذيفي'],
    english: 'Ali Al-Hudhaifi',
    englishVariants: [
      'Ali Al Hudhaifi',
      'Ali Alhudhaifi',
      'Ali Al-Hudaifi',
      'Ali Al-Huthayfi',
      'Al-Hudhaifi',
      'Al Hudhaifi',
      'Hudhaifi',
    ],
    aliases: ['hudhaifi', 'الحذيفي', 'hudaifi'],
  },

  // Bandar Baleelah
  {
    id: 'bandar-baleelah',
    arabic: 'بندر بليلة',
    arabicVariants: ['الشيخ بندر بليلة'],
    english: 'Bandar Baleelah',
    englishVariants: [
      'Bandar Balilah',
      'Bandar Baleela',
      'Bander Baleelah',
      'Baleelah',
      'Balilah',
    ],
    aliases: ['baleelah', 'بليلة', 'balilah'],
  },

  // Yasser Salama
  {
    id: 'yasser-salama',
    arabic: 'ياسر سلامة',
    arabicVariants: ['الشيخ ياسر سلامة'],
    english: 'Yasser Salama',
    englishVariants: [
      'Yaser Salama',
      'Yassir Salama',
      'Yasser Salameh',
      'Salama',
    ],
    aliases: ['salama', 'سلامة', 'salameh'],
  },

  // Idrees Abkar
  {
    id: 'idrees-abkar',
    arabic: 'إدريس أبكر',
    arabicVariants: ['الشيخ إدريس أبكر', 'إدريس بن عبد الكريم أبكر'],
    english: 'Idrees Abkar',
    englishVariants: [
      'Idris Abkar',
      'Idrees Abkar',
      'Idris Abkar',
      'Idrees Bukur',
      'Abkar',
    ],
    aliases: ['abkar', 'أبكر'],
  },

  // Mansour Al-Salimi
  {
    id: 'mansour-al-salimi',
    arabic: 'منصور السالمي',
    arabicVariants: ['الشيخ منصور السالمي'],
    english: 'Mansour Al-Salimi',
    englishVariants: [
      'Mansour Al Salimi',
      'Mansur Al-Salimi',
      'Mansour Alsalimi',
      'Al-Salimi',
      'Al Salimi',
      'Salimi',
    ],
    aliases: ['salimi', 'السالمي'],
  },

  // Hazza Al-Balushi
  {
    id: 'hazza-al-balushi',
    arabic: 'هزاع البلوشي',
    arabicVariants: ['الشيخ هزاع البلوشي'],
    english: 'Hazza Al-Balushi',
    englishVariants: [
      'Hazza Al Balushi',
      'Haza Al-Balushi',
      'Hazza Albalushi',
      'Al-Balushi',
      'Al Balushi',
      'Balushi',
    ],
    aliases: ['balushi', 'البلوشي'],
  },

  // Muhammad Al-Majid
  {
    id: 'muhammad-al-majid',
    arabic: 'محمد الماجد',
    arabicVariants: ['الشيخ محمد الماجد'],
    english: 'Muhammad Al-Majid',
    englishVariants: [
      'Mohammed Al-Majid',
      'Mohamed Al-Majid',
      'Muhammad Al Majid',
      'Mohammed Al Majid',
      'Al-Majid',
      'Al Majid',
      'Majid',
    ],
    aliases: ['majid', 'الماجد'],
  },

  // Tawfeeq As-Sayegh
  {
    id: 'tawfeeq-as-sayegh',
    arabic: 'توفيق الصايغ',
    arabicVariants: ['الشيخ توفيق الصايغ', 'توفيق بن سعيد الصايغ'],
    english: 'Tawfeeq As-Sayegh',
    englishVariants: [
      'Tawfiq As-Sayegh',
      'Tawfeeq Al-Sayegh',
      'Tawfeeq As Sayegh',
      'Tawfiq As Sayegh',
      'As-Sayegh',
      'Al-Sayegh',
      'Sayegh',
    ],
    aliases: ['sayegh', 'الصايغ'],
  },

  // Raad Al-Kurdi
  {
    id: 'raad-al-kurdi',
    arabic: 'رائد الكردي',
    arabicVariants: ['الشيخ رائد الكردي'],
    english: 'Raad Al-Kurdi',
    englishVariants: [
      'Raad Al Kurdi',
      'Raad Alkurdi',
      'Raed Al-Kurdi',
      'Rad Al-Kurdi',
      'Al-Kurdi',
      'Al Kurdi',
      'Kurdi',
    ],
    aliases: ['kurdi', 'الكردي'],
  },

  // Omar Al-Dinizaz
  {
    id: 'omar-al-dinizaz',
    arabic: 'عمر الدينيزاز',
    arabicVariants: ['الشيخ عمر الدينيزاز'],
    english: 'Omar Al-Dinizaz',
    englishVariants: [
      'Omar Al Dinizaz',
      'Umar Al-Dinizaz',
      'Omar Aldinizaz',
      'Al-Dinizaz',
      'Al Dinizaz',
      'Dinizaz',
    ],
    aliases: ['dinizaz', 'الدينيزاز'],
  },

  // Abdul Wadud Haneef
  {
    id: 'abdul-wadud-haneef',
    arabic: 'عبد الودود حنيف',
    arabicVariants: ['الشيخ عبد الودود حنيف'],
    english: 'Abdul Wadud Haneef',
    englishVariants: [
      'Abdulwadud Haneef',
      'Abdul Wadood Haneef',
      'Abdul Wadud Hanif',
      'Abdulwadud Hanif',
    ],
    aliases: ['haneef', 'حنيف', 'wadud', 'الودود'],
  },

  // Ali Jaber
  {
    id: 'ali-jaber',
    arabic: 'علي جابر',
    arabicVariants: ['الشيخ علي جابر', 'علي بن عبد الرحمن جابر'],
    english: 'Ali Jaber',
    englishVariants: [
      'Ali Jabir',
      'Ali Jaber',
      'Ali Gaaber',
      'Jaber',
      'Jabir',
    ],
    aliases: ['jaber', 'جابر', 'jabir'],
  },
];

/**
 * Build a reverse lookup map for quick searching
 */
export function buildSearchIndex(): Map<string, NameMapping[]> {
  const index = new Map<string, NameMapping[]>();

  for (const mapping of nameMappings) {
    // Index Arabic names
    const arabicTerms = [mapping.arabic, ...mapping.arabicVariants];
    for (const term of arabicTerms) {
      const normalized = normalizeArabicTerm(term);
      addToIndex(index, normalized, mapping);
    }

    // Index English names
    const englishTerms = [mapping.english, ...mapping.englishVariants];
    for (const term of englishTerms) {
      const normalized = normalizeEnglishTerm(term);
      addToIndex(index, normalized, mapping);
    }

    // Index aliases
    for (const alias of mapping.aliases) {
      const normalized = alias.toLowerCase().trim();
      addToIndex(index, normalized, mapping);
    }
  }

  return index;
}

function normalizeArabicTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/[\u0640-\u064F]/g, '') // Remove tashkeel
    .replace(/[\u0650-\u065F]/g, '') // Remove kasra and damma
    .replace(/[\u064E]/g, '') // Remove fatha
    .replace(/[\u0670]/g, '') // Remove dagger alif
    .replace(/[\u064B-\u0652]/g, '') // Remove all diacritics
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeEnglishTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function addToIndex(
  index: Map<string, NameMapping[]>,
  key: string,
  mapping: NameMapping
): void {
  if (!index.has(key)) {
    index.set(key, []);
  }
  const mappings = index.get(key)!;
  if (!mappings.find((m) => m.id === mapping.id)) {
    mappings.push(mapping);
  }
}

/**
 * Get all name mappings
 */
export function getAllMappings(): NameMapping[] {
  return [...nameMappings];
}

/**
 * Find mapping by ID
 */
export function getMappingById(id: string): NameMapping | undefined {
  return nameMappings.find((m) => m.id === id);
}

/**
 * Get all Arabic names (for dropdown suggestions)
 */
export function getAllArabicNames(): { id: string; name: string }[] {
  return nameMappings.map((m) => ({
    id: m.id,
    name: m.arabic,
  }));
}

/**
 * Get all English names (for dropdown suggestions)
 */
export function getAllEnglishNames(): { id: string; name: string }[] {
  return nameMappings.map((m) => ({
    id: m.id,
    name: m.english,
  }));
}
