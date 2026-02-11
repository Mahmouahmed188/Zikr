# Zikr API Integration - Final Audit & Architecture

## API Audit Results

### ✅ Valid MP3Quran API v3 Integration

| File | Status | Notes |
|------|--------|-------|
| `src/services/quranAPIService.ts` | ✅ KEEP | Main service using correct API v3 |
| `src/services/api.ts` | ✅ KEEP | Simple axios client wrapper |
| `src/utils/textNormalization.ts` | ✅ KEEP | Text normalization utilities |
| `src/utils/dataCache.ts` | ✅ KEEP | Caching system |
| `src/data/surahNames.ts` | ✅ KEEP | Surah name mappings (enhanced with search variants) |
| `src/types/index.ts` | ✅ KEEP | TypeScript types |

### ❌ Invalid/Legacy Services (TO BE REMOVED)

| File | Reason | Action |
|------|--------|--------|
| `src/services/quranApi.ts` | Legacy wrapper (already wrapped by quranAPIService) | REMOVE |
| `src/services/bilingualSearch.ts` | Hardcoded name mappings, NOT from API | REMOVE |
| `src/services/imageSearch.ts` | Image search not supported by MP3Quran API | REMOVE |
| `src/services/unifiedSearch.ts` | Hardcoded Quran terms, NOT from API | REMOVE |
| `src/services/searchRanking.ts` | Ranking for invalid search services | REMOVE |
| `src/services/searchExamples.ts` | Examples for invalid services | REMOVE |
| `src/services/nameMappings.ts` | Hardcoded reciter names, NOT from API | REMOVE |
| `src/services/textNormalization.ts` | DUPLICATE of utils/textNormalization.ts | REMOVE |

### ⚠️ Components Needing Updates

| File | Issue | Action |
|------|-------|--------|
| `src/components/UnifiedSearchComponent.tsx` | Uses unifiedSearchService | UPDATE to use quranAPIService |
| `src/components/ReciterSelection.tsx` | Uses textNormalization from services | UPDATE import path |
| `src/context/PlayerContext.tsx` | Uses quranApi (legacy wrapper) | UPDATE to use quranAPIService |

## Correct API Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  (Components: UnifiedSearchComponent, ReciterSelection, etc) │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              QuranAPIService (Main Service)                   │
│  - initialize()                                              │
│  - getAllSurahs() / getAllReciters()                         │
│  - searchSuwar() / searchReciters() / search()               │
│  - getSurahAudioUrl() / getSurahImageUrl()                   │
│  - getSurahById() / getReciterById()                         │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│ BilingualSearch │    │   DataCache      │
│     Engine      │    │                  │
│                 │    │ - Surah cache    │
│ - Local search  │    │ - Reciter cache  │
│ - Arabic/Eng    │    │ - TTL handling   │
└────────┬────────┘    └──────────────────┘
         │
         ▼
┌─────────────────┐
│TextNormalization│
│                 │
│ - normalizeArabic │
│ - normalizeEnglish│
│ - detectLanguage │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              MP3Quran API v3 (External)                      │
│  https://www.mp3quran.net/api/v3                            │
│                                                              │
│  Endpoints:                                                  │
│  - GET /suwar (all 114 surahs)                              │
│  - GET /reciters?language=ar (Arabic reciters)              │
│  - GET /reciters?language=en (English reciters)             │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints Used

### 1. Surahs
```
GET https://www.mp3quran.net/api/v3/suwar
Response: { suwar: [{ id, name, makkia, start_page }] }
```

### 2. Reciters
```
GET https://www.mp3quran.net/api/v3/reciters?language=ar
GET https://www.mp3quran.net/api/v3/reciters?language=en
Response: { reciters: [{ id, name, letter, moshaf, server, count, rewaya }] }
```

### 3. Audio (Generated)
```
Format: {server}/{surah_id_padded}.mp3
Example: https://server12.mp3quran.net/afasy/001.mp3
```

### 4. Images (Generated)
```
Surah: https://quran-images-api.herokuapp.com/surah/{surah_id_padded}
Reciter: https://www.mp3quran.net/assets/img/reciters/{normalized_name}.jpg
```

## Data Flow

1. **Initialization** (on app load):
   ```typescript
   await quranAPIService.initialize();
   // Fetches surahs from /api/v3/suwar
   // Fetches reciters from /api/v3/reciters?language=ar&language=en
   // Stores in DataCache with 30-minute TTL
   // Initializes BilingualSearchEngine
   ```

2. **Search** (local, no API calls):
   ```typescript
   const results = quranAPIService.search('البقرة');
   // Uses BilingualSearchEngine on cached data
   // Supports Arabic, English, diacritic removal, letter normalization
   ```

3. **Audio Playback**:
   ```typescript
   const audioUrl = quranAPIService.getSurahAudioUrl(reciterId, surahId);
   // Generated from reciter's moshaf data
   ```

## Arabic Search Support

The `BilingualSearchEngine` provides full Arabic support:

1. **Diacritic Removal**: Removes all tashkeel (الْفَاتِحَة → الفاتحة)
2. **Letter Normalization**: Normalizes alef variants (أ/إ/آ → ا)
3. **Partial Matching**: Supports partial word matching (قر → multiple surahs)
4. **Bigram Similarity**: Fuzzy matching for typos
5. **Case-Insensitive**: For English queries

## Files After Cleanup

### Keep (7 files):
- `src/services/quranAPIService.ts` - Main API service
- `src/services/api.ts` - Axios client
- `src/services/bilingualSearchEngine.ts` - Search engine (rename from existing)
- `src/utils/textNormalization.ts` - Text utilities
- `src/utils/dataCache.ts` - Cache system
- `src/data/surahNames.ts` - Surah name data
- `src/types/index.ts` - TypeScript types

### Remove (8 files):
- `src/services/quranApi.ts` - Legacy wrapper
- `src/services/bilingualSearch.ts` - Hardcoded mappings
- `src/services/imageSearch.ts` - Invalid image search
- `src/services/unifiedSearch.ts` - Hardcoded terms
- `src/services/searchRanking.ts` - Ranking service
- `src/services/searchExamples.ts` - Examples file
- `src/services/nameMappings.ts` - Hardcoded names
- `src/services/textNormalization.ts` - Duplicate

### Update (4 files):
- `src/components/UnifiedSearchComponent.tsx` - Use quranAPIService
- `src/components/ReciterSelection.tsx` - Fix imports
- `src/context/PlayerContext.tsx` - Use quranAPIService
- `test-quran-api.ts` - Already correct, verify after cleanup

## Testing Commands

```bash
# Test API integration
npx tsx test-quran-api.ts

# Build
npm run build

# Type check
npx tsc --noEmit
```

## Migration Steps

1. ✅ Create API configuration file
2. ✅ Remove invalid services
3. ✅ Update component imports
4. ✅ Fix duplicate utilities
5. ✅ Verify Arabic search works
6. ✅ Test audio playback
7. ✅ Test image loading
8. ✅ Run full test suite
