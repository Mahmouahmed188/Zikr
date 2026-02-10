import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Loader2, X, BookOpen, Music } from 'lucide-react';
import { unifiedSearchService, UnifiedSearchResult } from '../services/unifiedSearch';
import { searchRanker } from '../services/searchRanking';

interface UnifiedSearchComponentProps {
  onResultSelect?: (result: UnifiedSearchResult) => void;
  placeholder?: string;
  showImages?: boolean;
  maxResults?: number;
  className?: string;
}

const UnifiedSearchComponent: React.FC<UnifiedSearchComponentProps> = ({
  onResultSelect,
  placeholder,
  showImages = true,
  maxResults = 10,
  className = ''
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const debouncedQuery = useMemo(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (value: string) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        performSearch(value);
      }, 300);
    };
  }, []);

  useEffect(() => {
    if (query.trim().length >= 1) {
      debouncedQuery(query);
    } else {
      setResults([]);
      setShowResults(false);
    }

    return () => {
      debouncedQuery('');
    };
  }, [query, debouncedQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const searchResults = unifiedSearchService.search(searchQuery, {
        limit: maxResults,
        minScore: 0.3,
        includePartial: true,
        includeInitials: true,
        bilingual: true,
        includeImages: showImages,
        imageLimit: 2,
        includeRelated: true
      });

      const rankedResults = searchRanker.rank(searchResults, searchQuery, {
        boostExactMatches: true,
        boostReciters: 0.1,
        boostQuranTerms: 0.08,
        boostSurahs: 0.05,
        penalizeFuzzy: 0.15,
        languageWeight: 0.1
      });

      setResults(rankedResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: UnifiedSearchResult) => {
    setQuery(result.title.en);
    setShowResults(false);
    onResultSelect?.(result);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const getResultIcon = (type: UnifiedSearchResult['type']) => {
    switch (type) {
      case 'reciter':
        return <Music size={16} className="text-primary" />;
      case 'quran-term':
        return <BookOpen size={16} className="text-amber-500" />;
      case 'surah':
        return <BookOpen size={16} className="text-emerald-500" />;
      default:
        return <Search size={16} className="text-gray-400" />;
    }
  };

  const getMatchTypeBadge = (matchType: UnifiedSearchResult['matchType']) => {
    const badges = {
      exact: { label: 'Exact', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      variant: { label: 'Variant', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      partial: { label: 'Partial', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      fuzzy: { label: 'Similar', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      related: { label: 'Related', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
    };
    
    const badge = badges[matchType];
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
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

      {/* Search Status */}
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            <span>{t('search.searching')}</span>
          </div>
        </div>
      )}

      {/* Search Results */}
      {!isSearching && showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('search.resultsCount', { count: results.length })}
            </p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="mt-0.5 flex-shrink-0">
                    {getResultIcon(result.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {result.title.en}
                      </h4>
                      {getMatchTypeBadge(result.matchType)}
                    </div>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-2">
                      {result.title.ar}
                    </p>

                    {result.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                        {result.description.en}
                      </p>
                    )}

                    {/* Score indicator */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${result.relevanceScore * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round(result.relevanceScore * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Image thumbnail */}
                  {showImages && result.images.length > 0 && (
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={result.images[0].thumbnailUrl || result.images[0].url}
                        alt={result.images[0].altText.en}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
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

      {/* No Results */}
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