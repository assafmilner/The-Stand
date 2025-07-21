import React, { useState, useEffect } from "react";
import { Filter, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TicketCard from "./TicketCard";
import api from "../../utils/api";

/**
 * TicketMarketplace component
 *
 * Displays all available tickets in a public marketplace.
 * - Users can filter tickets by price, date, and game type (home/away)
 * - Supports dynamic filtering and restoration of full list
 * - Displays cards using the TicketCard component
 *
 * Design:
 * - Filter controls with toggles and form inputs
 * - Responsive grid layout for tickets
 * - Conditional rendering for errors, empty results, and loading state
 */

const TicketMarketplace = ({ colors }) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    priceMin: "",
    priceMax: "",
    isHomeGame: false,
    isAwayGame: false,
  });

  /**
   * useEffect
   *
   * Fetches all tickets on component mount.
   */

  useEffect(() => {
    fetchTickets();
  }, []);

  /**
   * fetchTickets
   *
   * Calls the backend with query params derived from the filter state.
   * Updates both tickets and full backup list (if no filters applied).
   */

  const fetchTickets = async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (
          ["isHomeGame", "isAwayGame"].includes(key) ||
          value === "" ||
          value === false
        )
          return;
        queryParams.append(key, value);
      });

      const response = await api.get(`/api/tickets?${queryParams.toString()}`);
      const fetched = response.data.tickets || [];

      setTickets(fetched);

      // ✅ שמירה של הרשימה המלאה אם אין סינון פעיל
      const hasFilters = Object.values(filters).some((value) => !!value);
      if (!hasFilters) {
        setAllTickets(fetched);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("שגיאה בטעינת כרטיסים");
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleFilterChange
   *
   * Updates the filters object in state by key.
   */

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  /**
   * applyFilters
   *
   * Applies current filters by re-fetching from backend.
   */

  const applyFilters = () => {
    fetchTickets();
    setShowFilters(false);
  };

  /**
   * clearFilters
   *
   * Resets all filters and restores original unfiltered list.
   */

  const clearFilters = () => {
    const cleared = {
      dateFrom: "",
      dateTo: "",
      priceMin: "",
      priceMax: "",
      isHomeGame: false,
      isAwayGame: false,
    };
    setFilters(cleared);
    setTickets(allTickets);
  };

  /**
   * clearFilters
   *
   * Resets all filters and restores original unfiltered list.
   */

  const hasActiveFilters = Object.values(filters).some((value) => !!value);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold" style={{ color: colors.primary }}>
          שוק הכרטיסים
        </h2>
        <button
          onClick={() => navigate("/create-ticket")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colors.primary }}
        >
          <Plus size={18} />
          מכור כרטיס
        </button>
      </div>

      <div className="rounded-lg shadow-sm border border-gray-200 p-4 bg-white w-fit">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-medium transition-colors ${
              showFilters
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Filter size={18} />
            סינון
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                פעיל
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-sm underline">
              נקה סינון
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                מחיר מקסימלי (₪)
              </label>
              <input
                type="number"
                placeholder="עד..."
                value={filters.priceMax}
                onChange={(e) => handleFilterChange("priceMax", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="home-game"
                type="checkbox"
                checked={filters.isHomeGame}
                onChange={(e) => {
                  handleFilterChange("isHomeGame", e.target.checked);
                  setTimeout(fetchTickets, 0);
                }}
              />
              <label htmlFor="home-game">משחק בית</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="away-game"
                type="checkbox"
                checked={filters.isAwayGame}
                onChange={(e) => {
                  handleFilterChange("isAwayGame", e.target.checked);
                  setTimeout(fetchTickets, 0);
                }}
              />
              <label htmlFor="away-game">משחק חוץ</label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                טווח תאריכים
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    handleFilterChange("dateFrom", e.target.value)
                  }
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
                <span className="flex items-center text-gray-500">עד</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex items-end gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                החל סינון
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-center">{error}</p>
          <button
            onClick={() => fetchTickets()}
            className="mt-2 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      )}

      {tickets.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            אין כרטיסים זמינים
          </h3>
          <p className="text-gray-500 mb-4">
            נסה לעדכן את הסינון או לבדוק שוב מאוחר יותר
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              showSellerInfo={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketMarketplace;
