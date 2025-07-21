import { useState, useCallback, useRef } from "react";
import api from "../utils/api";

/**
 * useSearch
 *
 * Custom React hook for handling search functionality in two modes:
 * - Quick Search (debounced, for dropdown)
 * - Full Search (with optional filters, for results page)
 *
 * Also provides helper functions to clear and count results.
 */
export const useSearch = () => {
  const [quickResults, setQuickResults] = useState(null);
  const [fullResults, setFullResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ref used to debounce quick search
  const debounceRef = useRef(null);

  /**
   * performQuickSearch
   *
   * Debounced API call to `/api/search/quick?q=...`.
   * Used to populate search suggestions dropdown.
   */
  const performQuickSearch = useCallback((query) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (!query || query.length < 2) {
        setQuickResults(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get(
          `/api/search/quick?q=${encodeURIComponent(query)}`
        );
        if (response.data.success) {
          setQuickResults(response.data.results);
        } else {
          setError("Search failed");
          setQuickResults(null);
        }
      } catch (err) {
        console.error("Quick search error:", err);
        setError("Search failed");
        setQuickResults(null);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce timeout
  }, []);

  /**
   * performFullSearch
   *
   * Performs full search using filters.
   * Sends request to `/api/search/full?q=...&filters`.
   */
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
        ...filters,
      });

      const response = await api.get(`/api/search/full?${params}`);

      if (response.data.success) {
        setFullResults(response.data);
      } else {
        setError("Search failed");
        setFullResults(null);
      }
    } catch (err) {
      console.error("Full search error:", err);
      setError("Search failed");
      setFullResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * clearResults
   *
   * Resets all result states and cancels any pending quick search.
   */
  const clearResults = useCallback(() => {
    setQuickResults(null);
    setFullResults(null);
    setError(null);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  /**
   * getTotalResultsCount
   *
   * Helper to count total number of results across all types.
   */
  const getTotalResultsCount = useCallback(() => {
    if (!quickResults && !fullResults) return 0;

    const results = fullResults?.results || quickResults;
    if (!results) return 0;

    return (
      (results.users?.length || 0) +
      (results.posts?.length || 0) +
      (results.tickets?.length || 0)
    );
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
    getTotalResultsCount,
  };
};
