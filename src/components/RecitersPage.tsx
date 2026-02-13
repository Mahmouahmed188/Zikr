import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Check, ArrowLeft, Loader2, BookOpen, Filter, X } from 'lucide-react';
import { Reciter, RecitationType, CompletionLevel, SortOption } from '../types';
import { usePlayer } from '../context/PlayerContext';
import {
    normalizeArabic,
    normalizeEnglish,
    detectLanguage
} from '../utils/textNormalization';

interface RecitersPageProps {
    onClose: () => void;
}

const RecitersPage: React.FC<RecitersPageProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const { reciters, currentReciter, setReciter, isDataLoading } = usePlayer();
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        recitationType: 'all' as RecitationType,
        rewaya: 'all',
        completionLevel: 'all' as CompletionLevel,
        sortBy: 'name-asc' as SortOption
    });

    // Refs for click-outside detection
    const filterDropdownRef = useRef<HTMLDivElement>(null);

    // Extract unique rewaya values from reciters
    const availableRewaya = useMemo(() => {
        const rewayaSet = new Set<string>();
        reciters.forEach(reciter => {
            if (reciter.rewaya) {
                rewayaSet.add(reciter.rewaya);
            }
        });
        return Array.from(rewayaSet).sort();
    }, [reciters]);

    // Click outside handler for filter dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
                setShowFilters(false);
            }
        };

        if (showFilters) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showFilters]);

    // Helper: Get total surahs for a reciter
    const getReciterSurahCount = (reciter: Reciter): number => {
        if (!reciter.moshaf || reciter.moshaf.length === 0) return 0;
        const maxSurahs = Math.max(...reciter.moshaf.map(m => m.surah_total || 0));
        return maxSurahs;
    };

    // Helper: Determine recitation type based on moshaf name
    const getRecitationType = (reciter: Reciter): RecitationType => {
        if (!reciter.moshaf || reciter.moshaf.length === 0) return 'other';
        
        const moshafName = (reciter.moshaf[0].name || '').toLowerCase();
        if (moshafName.includes('mujawwad')) return 'mujawwad';
        if (moshafName.includes('murattal')) return 'murattal';
        return 'other';
    };

    // Check if reciter passes all filters
    const reciterPassesFilters = (reciter: Reciter): boolean => {
        const surahCount = getReciterSurahCount(reciter);
        const recitationType = getRecitationType(reciter);

        // Recitation type filter
        if (filters.recitationType !== 'all' && recitationType !== filters.recitationType) {
            return false;
        }

        // Rewaya filter
        if (filters.rewaya !== 'all' && reciter.rewaya !== filters.rewaya) {
            return false;
        }

        // Completion level filter
        if (filters.completionLevel !== 'all') {
            if (filters.completionLevel === 'full' && surahCount !== 114) return false;
            if (filters.completionLevel === 'high' && surahCount <= 60) return false;
            if (filters.completionLevel === 'low' && surahCount >= 60) return false;
        }

        return true;
    };

    // Apply sorting
    const applySorting = (recitersToSort: Reciter[]): Reciter[] => {
        const sorted = [...recitersToSort];
        
        switch (filters.sortBy) {
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            case 'surahs-desc':
                return sorted.sort((a, b) => getReciterSurahCount(b) - getReciterSurahCount(a));
            case 'surahs-asc':
                return sorted.sort((a, b) => getReciterSurahCount(a) - getReciterSurahCount(b));
            default:
                return sorted;
        }
    };

    const filteredReciters = useMemo(() => {
        // Step 1: Apply filters
        let filtered = reciters.filter(reciterPassesFilters);

        // Step 2: If search query exists, apply text search
        if (search.trim()) {
            const trimmedSearch = search.trim();
            const searchLang = detectLanguage(trimmedSearch);

            const normalizedSearch = searchLang === 'arabic'
                ? normalizeArabic(trimmedSearch)
                : normalizeEnglish(trimmedSearch);

            filtered = filtered
                .map(reciter => {
                    const searchTerms = [
                        reciter.name,
                        reciter.letter,
                        reciter.englishName || '',
                        reciter.name_ar || '',
                        reciter.name_en || '',
                        ...(reciter.nameVariants || [])
                    ].filter(Boolean);

                    let score = 0;
                    let matchType: 'exact' | 'prefix' | 'word-start' | 'contains' | null = null;

                    for (const term of searchTerms) {
                        const normalizedTerm = searchLang === 'arabic'
                            ? normalizeArabic(term)
                            : normalizeEnglish(term);

                        if (normalizedSearch.length === 0) continue;

                        if (normalizedTerm === normalizedSearch) {
                            score = 100;
                            matchType = 'exact';
                            break;
                        }

                        if (normalizedTerm.startsWith(normalizedSearch)) {
                            const prefixScore = 90 + (normalizedSearch.length / normalizedTerm.length) * 10;
                            score = Math.max(score, prefixScore);
                            matchType = 'prefix';
                            continue;
                        }

                        const words = normalizedTerm.split(/\s+/);
                        for (const word of words) {
                            if (word.startsWith(normalizedSearch)) {
                                score = Math.max(score, 75 + (normalizedSearch.length / word.length) * 15);
                                matchType = 'word-start';
                                break;
                            }
                        }

                        if (normalizedTerm.includes(normalizedSearch)) {
                            const containsScore = 50 + (normalizedSearch.length / normalizedTerm.length) * 20;
                            score = Math.max(score, containsScore);
                            if (!matchType) matchType = 'contains';
                        }
                    }

                    return { reciter, score, matchType };
                })
                .filter(({ score, matchType }) => score > 0 && matchType !== null)
                .sort((a, b) => b.score - a.score)
                .map(({ reciter }) => reciter);
        }

        // Step 3: Apply sorting
        return applySorting(filtered);
    }, [reciters, search, filters, availableRewaya]);

    // Clear all filters
    const clearAllFilters = () => {
        setFilters({
            recitationType: 'all',
            rewaya: 'all',
            completionLevel: 'all',
            sortBy: 'name-asc'
        });
    };

    // Check if any filters are active
    const hasActiveFilters = filters.recitationType !== 'all' || 
                             filters.rewaya !== 'all' || 
                             filters.completionLevel !== 'all' ||
                             filters.sortBy !== 'name-asc';

    // Count of active filters
    const activeFilterCount = [
        filters.recitationType !== 'all',
        filters.rewaya !== 'all',
        filters.completionLevel !== 'all',
        filters.sortBy !== 'name-asc'
    ].filter(Boolean).length;

    const handleSelectReciter = (reciter: Reciter) => {
        setReciter(reciter);
        onClose();
    };

    return (
        <div className="flex flex-col h-full animate-fade-in"
            style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* Header */}
            <header className="flex items-center gap-3 p-6 border-b"
                style={{ borderColor: 'var(--border-color)' }}>
                <button
                    onClick={onClose}
                    className="p-2.5 rounded-full glass hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft size={20} style={{ color: 'var(--text-primary)' }} />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-semibold tracking-tight gold-text">{t('reciter.selectReciter')}</h1>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {t('reciter.recitersAvailable', { count: reciters.length })}
                    </p>
                </div>
            </header>

            {/* Search */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-muted)' }} size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('reciter.searchPlaceholder')}
                        className="w-full h-11 pl-11 pr-12 rounded-xl theme-input text-sm"
                        autoFocus
                    />
                    {/* Filter button */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearAllFilters}
                                className="p-1.5 rounded-md hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                                title="Clear all filters"
                            >
                                <X size={14} />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-1.5 rounded-md transition-colors ${showFilters || hasActiveFilters ? 'bg-primary/20' : 'hover:bg-white/10 dark:hover:bg-white/10'}`}
                            style={{ color: showFilters || hasActiveFilters ? '#C5A059' : 'var(--text-muted)' }}
                            title="Filter reciters"
                        >
                            <Filter size={14} />
                        </button>
                    </div>

                    {/* Filter Dropdown */}
                    {showFilters && (
                        <div 
                            ref={filterDropdownRef}
                            className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl p-4 border z-50 animate-fade-in"
                            style={{ borderColor: 'var(--glass-border)' }}
                        >
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        Filter Reciters
                                    </span>
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-xs px-2 py-1 rounded-md hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
                                            style={{ color: '#C5A059' }}
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>

                                {/* Recitation Type Filter */}
                                <div>
                                    <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>
                                        Recitation Type
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['all', 'murattal', 'mujawwad'] as RecitationType[]).map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFilters(prev => ({ ...prev, recitationType: type }))}
                                                className={`text-xs py-2 px-3 rounded-lg capitalize transition-colors ${
                                                    filters.recitationType === type
                                                        ? 'bg-primary/20 text-primary font-medium'
                                                        : 'bg-white/20 dark:bg-white/10 text-secondary'
                                                }`}
                                                style={{
                                                    color: filters.recitationType === type ? '#C5A059' : 'var(--text-secondary)'
                                                }}
                                            >
                                                {type === 'all' ? 'All' : type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Rewaya Filter */}
                                {availableRewaya.length > 0 && (
                                    <div>
                                        <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>
                                            Rewaya
                                        </label>
                                        <select
                                            value={filters.rewaya}
                                            onChange={(e) => setFilters(prev => ({ ...prev, rewaya: e.target.value }))}
                                            className="w-full h-9 px-3 rounded-lg text-xs theme-input"
                                        >
                                            <option value="all">All Rewaya</option>
                                            {availableRewaya.map(rewaya => (
                                                <option key={rewaya} value={rewaya}>
                                                    {rewaya}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Completion Level Filter */}
                                <div>
                                    <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>
                                        Completion Level
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['all', 'full', 'high', 'low'] as CompletionLevel[]).map(level => (
                                            <button
                                                key={level}
                                                type="button"
                                                onClick={() => setFilters(prev => ({ ...prev, completionLevel: level }))}
                                                className={`text-xs py-2 px-3 rounded-lg capitalize transition-colors ${
                                                    filters.completionLevel === level
                                                        ? 'bg-primary/20 text-primary font-medium'
                                                        : 'bg-white/20 dark:bg-white/10 text-secondary'
                                                }`}
                                                style={{
                                                    color: filters.completionLevel === level ? '#C5A059' : 'var(--text-secondary)'
                                                }}
                                            >
                                                {level === 'all' ? 'All' : level === 'full' ? '114 Surahs' : level === 'high' ? '> 60 Surahs' : '< 60 Surahs'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sort By Filter */}
                                <div>
                                    <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>
                                        Sort By
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {([
                                            { value: 'name-asc', label: 'Name (A-Z)' },
                                            { value: 'name-desc', label: 'Name (Z-A)' },
                                            { value: 'surahs-desc', label: 'Most Surahs' },
                                            { value: 'surahs-asc', label: 'Fewest Surahs' }
                                        ] as const).map(({ value, label }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setFilters(prev => ({ ...prev, sortBy: value as SortOption }))}
                                                className={`text-xs py-2 px-3 rounded-lg transition-colors ${
                                                    filters.sortBy === value
                                                        ? 'bg-primary/20 text-primary font-medium'
                                                        : 'bg-white/20 dark:bg-white/10 text-secondary'
                                                }`}
                                                style={{
                                                    color: filters.sortBy === value ? '#C5A059' : 'var(--text-secondary)'
                                                }}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {search && (
                    <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <BookOpen size={12} />
                        <span>
                            {detectLanguage(search) === 'arabic'
                                ? 'بحث باللغة العربية'
                                : 'English search enabled'}
                        </span>
                    </div>
                )}
                {hasActiveFilters && !showFilters && (
                    <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: '#C5A059' }}>
                        <Filter size={12} />
                        <span>
                            {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                        </span>
                        <button
                            onClick={() => setShowFilters(true)}
                            className="underline hover:opacity-80"
                        >
                            Edit
                        </button>
                    </div>
                )}
            </div>

            {/* Reciters List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                {isDataLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <Loader2 size={32} className="animate-spin" style={{ color: '#C5A059' }} />
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {t('common.loading')}
                        </p>
                    </div>
                ) : filteredReciters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 py-12">
                        <BookOpen size={48} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {search ? t('reciter.noResults') : t('reciter.noRecitersAvailable')}
                        </p>
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="text-sm mt-2 px-4 py-2 rounded-lg border transition-colors"
                                style={{
                                    color: '#C5A059',
                                    borderColor: 'rgba(197, 160, 89, 0.3)'
                                }}
                            >
                                {t('common.clear')}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredReciters.map(reciter => (
                            <button
                                key={reciter.id}
                                onClick={() => handleSelectReciter(reciter)}
                                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${currentReciter?.id === reciter.id
                                    ? 'border'
                                    : 'border border-transparent hover:bg-white/30 dark:hover:bg-white/10'
                                    }`}
                                style={{
                                    backgroundColor: currentReciter?.id === reciter.id
                                        ? 'rgba(197, 160, 89, 0.1)'
                                        : 'var(--bg-card)',
                                    borderColor: currentReciter?.id === reciter.id
                                        ? 'rgba(197, 160, 89, 0.3)'
                                        : undefined
                                }}
                            >
                                <div
                                    className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${currentReciter?.id === reciter.id
                                        ? ''
                                        : ''
                                        }`}
                                    style={{
                                        backgroundColor: currentReciter?.id === reciter.id
                                            ? 'rgba(197, 160, 89, 0.2)'
                                            : 'var(--bg-surface)',
                                        color: currentReciter?.id === reciter.id
                                            ? '#C5A059'
                                            : 'var(--text-muted)'
                                    }}
                                >
                                    {reciter.letter || reciter.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`text-sm font-semibold truncate ${currentReciter?.id === reciter.id ? 'gold-text' : ''
                                        }`}
                                        style={{
                                            color: currentReciter?.id === reciter.id
                                                ? undefined
                                                : 'var(--text-primary)'
                                        }}
                                        lang="ar"
                                    >
                                        {reciter.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                        <BookOpen size={10} />
                                        <span className="truncate">
                                            {reciter.moshaf[0]?.name || t('reciter.unknownStyle')}
                                        </span>
                                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
                                        <span>{reciter.moshaf[0]?.surah_total || 0} {t('reciter.surahs')}</span>
                                    </div>
                                </div>
                                {currentReciter?.id === reciter.id && (
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: 'rgba(197, 160, 89, 0.2)' }}>
                                        <Check size={14} style={{ color: '#C5A059' }} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Current Selection Footer */}
            {currentReciter && (
                <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ backgroundColor: 'rgba(197, 160, 89, 0.1)' }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{
                                backgroundColor: 'rgba(197, 160, 89, 0.2)',
                                color: '#C5A059'
                            }}>
                            {currentReciter.letter || currentReciter.name[0]}
                        </div>
                        <div className="flex-1">
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('reciter.currentlySelected')}</p>
                            <p className="text-sm font-semibold gold-text" lang="ar">{currentReciter.name}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecitersPage;