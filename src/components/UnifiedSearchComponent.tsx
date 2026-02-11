import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Loader2, X, BookOpen, Music } from 'lucide-react';
import QuranAPIService from '../services/quranAPIService';
import { SurahWithResources, ReciterWithResources } from '../types';

interface UnifiedSearchComponentProps {
  onSurahSelect?: (surah: SurahWithResources) => void;
  onReciterSelect?: (reciter: ReciterWithResources) => void;
  placeholder?: string;
  showImages?: boolean;
  maxResults?: number;
  className?: string;
}

interface SearchResult {
  type: 'surah' | 'reciter';
  data: SurahWithResources | ReciterWithResources;
  matchScore: number;
}

const UnifiedSearchComponent: React.FC<UnifiedSearchComponentProps> = ({
  onSurahSelect,
  onReciterSelect,
  placeholder,
  showImages = true,
  maxResults = 10,
  className = ''
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [apiInstance, setApiInstance] = useState<QuranAPIService | null>(null);

  useEffect(() => {
    const initAPI = async () => {
      try {
        const api = new QuranAPIService();
        await api.initialize();
        setApiInstance(api);
      } catch (error) {
        console.error('Failed to initialize API:', error);
      }
    };
    
    initAPI();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 1 && apiInstance) {
        performSearch(query);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, apiInstance]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || !apiInstance) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const searchResults = apiInstance.search(searchQuery, {
        limit: maxResults,
        minScore: 30
      });

      const combinedResults: SearchResult[] = [];

      searchResults.suwar.forEach((surah: SurahWithResources) => {
        combinedResults.push({
          type: 'surah',
          data: surah,
          matchScore: surah.matchScore || 0
        });
      });

      searchResults.reciters.forEach((reciter: ReciterWithResources) => {
        combinedResults.push({
          type: 'reciter',
          data: reciter,
          matchScore: reciter.matchScore || 0
        });
      });

      combinedResults.sort((a, b) => b.matchScore - a.matchScore);
      setResults(combinedResults.slice(0, maxResults));
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    
    if (result.type === 'surah') {
      onSurahSelect?.(result.data as SurahWithResources);
    } else {
      onReciterSelect?.(result.data as ReciterWithResources);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const getResultIcon = (type: 'surah' | 'reciter') => {
    switch (type) {
      case 'reciter':
        return <Music size={16} className="text-primary" />;
      case 'surah':
        return <BookOpen size={16} className="text-emerald-500" />;
      default:
        return <Search size={16} className="text-gray-400" />;
    }
  };

  const getMatchTypeBadge = (matchScore: number) => {
    if (matchScore >= 95) return { label: 'Exact', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    if (matchScore >= 80) return { label: 'Very Good', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
    if (matchScore >= 60) return { label: 'Good', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    return { label: 'Partial', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
  };

  const getResultTitle = (result: SearchResult) => {
    if (result.type === 'surah') {
      const surah = result.data as SurahWithResources;
      return surah.name_en || surah.name;
    } else {
      const reciter = result.data as ReciterWithResources;
      return reciter.name_en || reciter.name;
    }
  };

  const getResultSubtitle = (result: SearchResult) => {
    if (result.type === 'surah') {
      const surah = result.data as SurahWithResources;
      return surah.name_ar || surah.arabicName || surah.name;
    } else {
      const reciter = result.data as ReciterWithResources;
      return reciter.name_ar || reciter.arabicName || reciter.name;
    }
  };

  const getResultImageUrl = (result: SearchResult) => {
    if (result.type === 'surah') {
      const surah = result.data as SurahWithResources;
      return surah.imageUrl;
    } else {
      const reciter = result.data as ReciterWithResources;
      return reciter.imageUrl;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
          size={18} 
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || t('search.placeholder')}
          className="w-full h-11 pl-11 pr-10 rounded-xl theme-input text-sm"
          onFocus={() => results.length > 0 && setShowResults(true)}
          disabled={!apiInstance}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            <span>{t('search.searching')}</span>
          </div>
        </div>
      )}

      {!isSearching && showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {results.map((result, index) => (
              <button
                key={`${result.type}-${(result.data as any).id}-${index}`}
                onClick={() => handleResultClick(result)}
                className="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {getResultIcon(result.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {getResultTitle(result)}
                      </h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getMatchTypeBadge(result.matchScore).className}`}>
                        {getMatchTypeBadge(result.matchScore).label}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {getResultSubtitle(result)}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${result.matchScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round(result.matchScore)}%
                      </span>
                    </div>
                  </div>

                  {showImages && getResultImageUrl(result) && (
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={getResultImageUrl(result)}
                        alt={getResultTitle(result)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={() => setShowResults(false)}
              className="w-full text-xs text-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              {t('search.closeResults')}
            </button>
          </div>
        </div>
      )}

      {!isSearching && showResults && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 z-50">
          <div className="text-center">
            <Search size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('search.noResults')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('search.tryDifferentQuery')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedSearchComponent;
