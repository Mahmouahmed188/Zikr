export interface Surah {
  id: number;
  name: string;
  englishName?: string;
  verses?: number;
  revelationType?: 'Makki' | 'Madani';
  audioUrl?: string;
  arabicName?: string;
  script?: string;
  name_ar?: string;
  name_en?: string;
  verses_count?: number;
  revelation_place?: string;
  page?: number;
  juz?: number;
  hizb?: number;
}

export interface Reciter {
  id: number;
  name: string;
  letter: string;
  moshaf: Moshaf[];
  arabicName?: string;
  englishName?: string;
  transliterationKey?: string;
  nameVariants?: string[];
  biography?: string;
  imageUrl?: string;
  name_ar?: string;
  name_en?: string;
  server?: string;
  count?: number;
  rewaya?: string;
}

export interface Moshaf {
  id: number;
  name: string;
  server: string;
  surah_total: number;
  surah_list: string;
  surahs?: number[];
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentReciter: Reciter | null;
  currentSurah: Surah | null;
  isLooping: boolean;
}

export type Theme = 'light' | 'dark';
export type Language = 'eng' | 'ar';

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface RecitersResponse {
  reciters: Reciter[];
}

export interface SurahsResponse {
  suwar: Surah[];
}

export interface AudioUrlResponse {
  audioUrl: string;
}

export interface AppState {
  language: Language;
  lastPlayedSurah?: number;
  lastReciterId?: number;
  volume: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

export interface SearchFilters {
  query: string;
  language?: Language;
}

export interface SurahWithResources {
  id: number;
  name: string;
  englishName?: string;
  verses?: number;
  revelationType?: 'Makki' | 'Madani';
  audioUrl: string | null;
  imageUrl: string;
  arabicName?: string;
  script?: string;
  name_ar?: string;
  name_en?: string;
  verses_count?: number;
  revelation_place?: string;
  page?: number;
  juz?: number;
  hizb?: number;
  matchScore?: number;
  matchedField?: string;
}

export interface ReciterWithResources extends Reciter {
  imageUrl: string;
  moshafWithAudio?: MoshafWithAudio[];
  matchScore?: number;
  matchedField?: string;
}

export interface MoshafWithAudio {
  id: number;
  name: string;
  server: string;
  surah_total: number;
  surah_list: string;
  surahs: SurahAudioInfo[];
}

export interface SurahAudioInfo {
  id: number;
  surahInfo?: Surah;
  audioUrl: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface SearchOptions {
  limit?: number;
  minScore?: number;
  includePartial?: boolean;
  includeInitials?: boolean;
}

export interface UnifiedSearchResult {
  suwar: SurahWithResources[];
  reciters: ReciterWithResources[];
  query: string;
}

export type RecitationType = 'murattal' | 'mujawwad' | 'other' | 'all';

export type CompletionLevel = 'full' | 'high' | 'low' | 'all';

export type SortOption = 'name-asc' | 'name-desc' | 'surahs-desc' | 'surahs-asc';

export interface ReciterFilters {
  recitationType: RecitationType;
  rewaya: string;
  completionLevel: CompletionLevel;
  sortBy: SortOption;
}
