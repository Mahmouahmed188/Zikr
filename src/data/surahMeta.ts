// A condensed list of Surah metadata (1-114) for display purposes
// In a real app, this might come from api.quran.com or a full JSON file.
// For brevity, I'll include a few and a generator or placeholder logic.


export const surahMetadata: Record<number, { englishName: string; verses: number; type: 'Makki' | 'Madani'; meaning: string; arabicName: string; script: string }> = {
    1: { englishName: "Al-Fatihah", verses: 7, type: 'Makki', meaning: "The Opening", arabicName: "الفاتحة", script: "س" },
    2: { englishName: "Al-Baqarah", verses: 286, type: 'Madani', meaning: "The Cow", arabicName: "البقرة", script: "ا" },
    3: { englishName: "Ali 'Imran", verses: 200, type: 'Madani', meaning: "Family of Imran", arabicName: "آل عمران", script: "آ" },
    4: { englishName: "An-Nisa", verses: 176, type: 'Madani', meaning: "The Women", arabicName: "النساء", script: "ن" },
    5: { englishName: "Al-Ma'idah", verses: 120, type: 'Madani', meaning: "The Table Spread", arabicName: "المائدة", script: "م" },
    6: { englishName: "Al-An'am", verses: 165, type: 'Makki', meaning: "The Cattle", arabicName: "الأنعام", script: "ع" },
    7: { englishName: "Al-A'raf", verses: 206, type: 'Makki', meaning: "The Heights", arabicName: "الأعراف", script: "ص" },
    8: { englishName: "Al-Anfal", verses: 75, type: 'Madani', meaning: "The Spoils of War", arabicName: "الأنفال", script: "ف" },
    9: { englishName: "At-Tawbah", verses: 129, type: 'Madani', meaning: "The Repentance", arabicName: "التوبة", script: "ب" },
    10: { englishName: "Yunus", verses: 109, type: 'Makki', meaning: "Jonah", arabicName: "يونس", script: "ي" },
    18: { englishName: "Al-Kahf", verses: 110, type: 'Makki', meaning: "The Cave", arabicName: "الكهف", script: "ك" },
    36: { englishName: "Ya-Sin", verses: 83, type: 'Makki', meaning: "Ya-Sin", arabicName: "يس", script: "ي" },
    55: { englishName: "Ar-Rahman", verses: 78, type: 'Madani', meaning: "The Beneficent", arabicName: "الرحمن", script: "ر" },
    67: { englishName: "Al-Mulk", verses: 30, type: 'Makki', meaning: "The Sovereignty", arabicName: "الملك", script: "م" },
    112: { englishName: "Al-Ikhlas", verses: 4, type: 'Makki', meaning: "The Sincerity", arabicName: "الإخلاص", script: "خ" },
    113: { englishName: "Al-Falaq", verses: 5, type: 'Makki', meaning: "The Daybreak", arabicName: "الفلق", script: "ق" },
    114: { englishName: "An-Nas", verses: 6, type: 'Makki', meaning: "The Mankind", arabicName: "الناس", script: "ن" },
};


export const getSurahMeta = (id: number) => {
    return surahMetadata[id] || {
        englishName: `Surah ${id}`,
        verses: 0,
        type: 'Makki',
        meaning: "",
        arabicName: "سورة",
        script: "س"
    };
};
