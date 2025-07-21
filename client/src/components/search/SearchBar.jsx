import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchDropdown from "./SearchDropdown";
import { useSearch } from "../../hooks/useSearch";

/**
 * SearchBar provides live search functionality with debounced input.
 * - Shows a dropdown with quick results
 * - Navigates to full search page on submit
 *
 * Behavior:
 * - Triggers search after 2+ characters
 * - Closes dropdown when clicking outside
 */
const SearchBar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const { quickResults, loading, performQuickSearch, clearResults } =
    useSearch();

  /**
   * Triggers search when query is at least 2 characters.
   * Clears results when query is cleared.
   */
  useEffect(() => {
    if (query.length >= 2) {
      performQuickSearch(query);
      setIsOpen(true);
    } else {
      clearResults();
      setIsOpen(false);
    }
  }, [query, performQuickSearch, clearResults]);

  /**
   * Closes dropdown when clicking outside the component.
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    clearResults();
    inputRef.current?.focus();
  };

  /**
   * Navigates to the full search results page.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/full-search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const handleSeeAllResults = () => {
    if (query.trim()) {
      navigate(`/full-search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="חפש אוהדים, פוסטים או כרטיסים..."
            className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-right"
            autoComplete="off"
          />
          <Search
            size={18}
            className="absolute  top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-transparent"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown with quick results */}
      {isOpen && (
        <SearchDropdown
          results={quickResults}
          loading={loading}
          query={query}
          onClose={() => setIsOpen(false)}
          onSeeAllResults={handleSeeAllResults}
        />
      )}
    </div>
  );
};

export default SearchBar;
