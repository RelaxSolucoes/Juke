import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from '../utils/validation';

interface UseDebouncedSearchOptions<T> {
  searchFn: (query: string) => Promise<T[]>;
  delay?: number;
  minLength?: number;
  initialResults?: T[];
}

interface UseDebouncedSearchReturn<T> {
  query: string;
  results: T[];
  isSearching: boolean;
  error: string | null;
  setQuery: (query: string) => void;
  clearResults: () => void;
  retry: () => void;
}

/**
 * Hook for debounced search functionality
 * Automatically debounces search queries and manages loading/error states
 */
export const useDebouncedSearch = <T>({
  searchFn,
  delay = 300,
  minLength = 1,
  initialResults = []
}: UseDebouncedSearchOptions<T>): UseDebouncedSearchReturn<T> => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>(initialResults);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of the latest search request to avoid race conditions
  const searchIdRef = useRef(0);

  const performSearch = useCallback(async (searchQuery: string, searchId: number) => {
    if (searchQuery.length < minLength) {
      setResults(initialResults);
      setIsSearching(false);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const searchResults = await searchFn(searchQuery);
      
      // Check if this is still the latest search request
      if (searchId === searchIdRef.current) {
        setResults(searchResults);
        setIsSearching(false);
      }
    } catch (err) {
      // Only update error if this is still the latest search request
      if (searchId === searchIdRef.current) {
        setError(err instanceof Error ? err.message : 'Erro na busca');
        setResults([]);
        setIsSearching(false);
      }
    }
  }, [searchFn, minLength, initialResults]);

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string, searchId: number) => {
      performSearch(searchQuery, searchId);
    }, delay),
    [performSearch, delay]
  );

  // Effect to trigger search when query changes
  useEffect(() => {
    const currentSearchId = ++searchIdRef.current;
    
    if (query.trim() === '') {
      setResults(initialResults);
      setIsSearching(false);
      setError(null);
      return;
    }

    debouncedSearch(query.trim(), currentSearchId);
  }, [query, debouncedSearch, initialResults]);

  const handleSetQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clearResults = useCallback(() => {
    setQuery('');
    setResults(initialResults);
    setError(null);
    setIsSearching(false);
  }, [initialResults]);

  const retry = useCallback(() => {
    if (query.trim()) {
      const currentSearchId = ++searchIdRef.current;
      performSearch(query.trim(), currentSearchId);
    }
  }, [query, performSearch]);

  return {
    query,
    results,
    isSearching,
    error,
    setQuery: handleSetQuery,
    clearResults,
    retry
  };
}; 