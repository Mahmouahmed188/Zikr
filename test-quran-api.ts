import QuranAPIService from './src/services/quranAPIService';

declare const process: {
  exit: (code?: number) => never;
};

async function testQuranAPI() {
  console.log('=== MP3Quran API Integration Test ===\n');

  const api = new QuranAPIService();

  try {
    console.log('1. Initializing API...');
    await api.initialize();
    console.log('   ✓ API initialized successfully\n');

    console.log('2. Testing Arabic Surah Search');
    const arabicSurahResults = api.searchSuwar('البقرة', { limit: 5 });
    console.log(`   Query: "البقرة"`);
    console.log(`   Results: ${arabicSurahResults.length} found`);
    arabicSurahResults.forEach(s => {
      console.log(`   - ${s.name_ar} (${s.name_en}) - Score: ${Math.round(s.matchScore || 0)}%`);
    });
    console.log('');

    console.log('3. Testing English Surah Search');
    const englishSurahResults = api.searchSuwar('cow', { limit: 5 });
    console.log(`   Query: "cow"`);
    console.log(`   Results: ${englishSurahResults.length} found`);
    englishSurahResults.forEach(s => {
      console.log(`   - ${s.name_en} (${s.name_ar}) - Score: ${Math.round(s.matchScore || 0)}%`);
    });
    console.log('');

    console.log('4. Testing Arabic Diacritic Search');
    const diacriticResults = api.searchSuwar('الْفَاتِحَة', { limit: 5 });
    console.log(`   Query: "الْفَاتِحَة" (with diacritics)`);
    console.log(`   Results: ${diacriticResults.length} found`);
    diacriticResults.forEach(s => {
      console.log(`   - ${s.name_ar} (${s.name_en}) - Score: ${Math.round(s.matchScore || 0)}%`);
    });
    console.log('');

    console.log('5. Testing Arabic Letter Normalization');
    const letterResults = api.searchSuwar('آل عمران', { limit: 5 });
    console.log(`   Query: "آل عمران" (with Alef variations)`);
    console.log(`   Results: ${letterResults.length} found`);
    letterResults.forEach(s => {
      console.log(`   - ${s.name_ar} (${s.name_en}) - Score: ${Math.round(s.matchScore || 0)}%`);
    });
    console.log('');

    console.log('6. Testing Arabic Reciter Search');
    const arabicReciterResults = api.searchReciters('العفاسي', { limit: 5 });
    console.log(`   Query: "العفاسي"`);
    console.log(`   Results: ${arabicReciterResults.length} found`);
    arabicReciterResults.forEach(r => {
      console.log(`   - ${r.name_ar || r.name} (${r.name_en || ''}) - Score: ${Math.round(r.matchScore || 0)}%`);
    });
    console.log('');

    console.log('7. Testing English Reciter Search');
    const englishReciterResults = api.searchReciters('abdulbasit', { limit: 5 });
    console.log(`   Query: "abdulbasit"`);
    console.log(`   Results: ${englishReciterResults.length} found`);
    englishReciterResults.forEach(r => {
      console.log(`   - ${r.name_en || r.name} (${r.name_ar || ''}) - Score: ${Math.round(r.matchScore || 0)}%`);
    });
    console.log('');

    console.log('8. Testing Comprehensive Search');
    const comprehensiveResults = api.search('rahman');
    console.log(`   Query: "rahman"`);
    console.log(`   Surahs: ${comprehensiveResults.suwar.length} found`);
    console.log(`   Reciters: ${comprehensiveResults.reciters.length} found`);
    comprehensiveResults.suwar.forEach(s => {
      console.log(`   - Surah: ${s.name_ar} (${s.name_en}) - Score: ${Math.round(s.matchScore || 0)}%`);
    });
    comprehensiveResults.reciters.forEach(r => {
      console.log(`   - Reciter: ${r.name_ar || r.name} - Score: ${Math.round(r.matchScore || 0)}%`);
    });
    console.log('');

    console.log('9. Testing Audio URL Generation');
    const audioUrl = api.getSurahAudioUrl(1, 2);
    console.log(`   Getting audio for Surah Al-Baqarah (ID: 2) from Alafasy (ID: 1)`);
    console.log(`   Audio URL: ${audioUrl || 'Not available'}`);
    console.log('');

    console.log('10. Testing Image URL Generation');
    const imageUrl = api.getSurahImageUrl(2);
    console.log(`   Getting image for Surah Al-Baqarah (ID: 2)`);
    console.log(`   Image URL: ${imageUrl}`);
    console.log('');

    console.log('11. Testing Surah with Resources');
    const surahWithResources = api.getSurahWithResources(1, 1);
    console.log(`   Getting Surah Al-Fatiha (ID: 1) with resources`);
    if (surahWithResources) {
      console.log(`   - Arabic: ${surahWithResources.name_ar}`);
      console.log(`   - English: ${surahWithResources.name_en}`);
      console.log(`   - Audio: ${surahWithResources.audioUrl || 'N/A'}`);
      console.log(`   - Image: ${surahWithResources.imageUrl}`);
    }
    console.log('');

    console.log('12. Testing Reciter with Resources');
    const reciterWithResources = api.getReciterWithResources(1);
    console.log(`   Getting Reciter Alafasy (ID: 1) with resources`);
    if (reciterWithResources) {
      console.log(`   - Name: ${reciterWithResources.name_ar || reciterWithResources.name}`);
      console.log(`   - English: ${reciterWithResources.name_en || ''}`);
      console.log(`   - Image: ${reciterWithResources.imageUrl}`);
      console.log(`   - Moshaf count: ${reciterWithResources.moshaf?.length || 0}`);
    }
    console.log('');

    console.log('13. Testing Edge Cases');
    console.log('   a) Empty query:');
    const emptyResults = api.search('');
    console.log(`      Surahs: ${emptyResults.suwar.length}, Reciters: ${emptyResults.reciters.length}`);

    console.log('   b) Non-existent surah:');
    const noResults = api.search('xyznonexistent');
    console.log(`      Surahs: ${noResults.suwar.length}, Reciters: ${noResults.reciters.length}`);

    console.log('   c) Partial match:');
    const partialResults = api.searchSuwar('قر', { minScore: 10 });
    console.log(`      Partial matches for "قر": ${partialResults.length}`);
    console.log('');

    console.log('14. Cache Statistics');
    const cacheStats = api.getCacheStats();
    console.log(`   Surah cache: ${cacheStats.suwar.size} items, ${cacheStats.suwar.expired} expired`);
    console.log(`   Reciter cache: ${cacheStats.reciters.size} items, ${cacheStats.reciters.expired} expired`);
    console.log('');

    console.log('15. Testing Get All Surahs and Reciters');
    const allSurahs = api.getAllSurahs();
    const allReciters = api.getAllReciters();
    console.log(`   Total surahs: ${allSurahs.length}`);
    console.log(`   Total reciters: ${allReciters.length}`);
    console.log('');

    console.log('=== All Tests Completed Successfully ===');

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testQuranAPI();
