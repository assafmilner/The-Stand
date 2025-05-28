// client/src/hooks/useSearch.js
import { useState, useCallback, useRef } from 'react';
import api from '../utils/api';

export const useSearch = () => {
  const [quickResults, setQuickResults] = useState(null);
  const [fullResults, setFullResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // For debouncing
  const debounceRef = useRef(null);

  // Quick search for dropdown (debounced)
  const performQuickSearch = useCallback((query) => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout
    debounceRef.current = setTimeout(async () => {
      if (!query || query.length < 2) {
        setQuickResults(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/api/search/quick?q=${encodeURIComponent(query)}`);
        if (response.data.success) {
          setQuickResults(response.data.results);
        } else {
          setError('Search failed');
          setQuickResults(null);
        }
      } catch (err) {
        console.error('Quick search error:', err);
        setError('Search failed');
        setQuickResults(null);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce
  }, []);

  // Full search for results page
  const performFullSearch = useCallback(async (query, filters = {}) => {
    if (!query || query.length < 2) {
      setFullResults(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query,
        ...filters
      });

      const response = await api.get(`/api/search/full?${params}`);
      
      if (response.data.success) {
        setFullResults(response.data);
      } else {
        setError('Search failed');
        setFullResults(null);
      }
    } catch (err) {
      console.error('Full search error:', err);
      setError('Search failed');
      setFullResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear results
  const clearResults = useCallback(() => {
    setQuickResults(null);
    setFullResults(null);
    setError(null);
    
    // Clear any pending debounced search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Get total results count
  const getTotalResultsCount = useCallback(() => {
    if (!quickResults && !fullResults) return 0;
    
    const results = fullResults?.results || quickResults;
    if (!results) return 0;
    
    return (results.users?.length || 0) + 
           (results.posts?.length || 0) + 
           (results.tickets?.length || 0);
  }, [quickResults, fullResults]);

  return {
    // State
    quickResults,
    fullResults,
    loading,
    error,
    
    // Actions
    performQuickSearch,
    performFullSearch,
    clearResults,
    
    // Helpers
    getTotalResultsCount
  };
};