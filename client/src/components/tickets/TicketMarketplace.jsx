// client/src/components/tickets/TicketMarketplace.jsx
import React, { useState, useEffect } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import TicketCard from "./TicketCard";
import api from "../../utils/api";
import teamNameMap from "../../utils/teams-hebrew";

const TicketMarketplace = ({ colors }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    isHomeGame: false,
    isAwayGame: false,
    stadium: "",
    dateFrom: "",
    dateTo: "",
    priceMin: "",
    priceMax: "",
  });

  // Get unique stadiums for filter dropdown
  const [stadiumOptions, setStadiumOptions] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async (filterParams = {}) => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams();
      const currentFilters = { ...filters, ...filterParams };

      // Get user's favorite team in English for filtering
      const reverseTeamMap = Object.entries(teamNameMap).reduce(
        (acc, [eng, data]) => {
          acc[data.name] = eng;
          return acc;
        },
        {}
      );
      const favoriteTeamEnglish = reverseTeamMap[user?.favoriteTeam];

      // Handle home/away game filtering
      if (currentFilters.isHomeGame && !currentFilters.isAwayGame) {
        queryParams.append("homeTeam", favoriteTeamEnglish);
      } else if (currentFilters.isAwayGame && !currentFilters.isHomeGame) {
        queryParams.append("awayTeam", favoriteTeamEnglish);
      } else if (currentFilters.isHomeGame && currentFilters.isAwayGame) {
        // Both checked - show all games of favorite team (will be handled by OR logic in backend)
        queryParams.append("teamName", favoriteTeamEnglish);
      } else {
        // Neither checked - show all games of favorite team
        queryParams.append("teamName", favoriteTeamEnglish);
      }

      // Add other non-empty filters to query
      ["stadium", "dateFrom", "dateTo", "priceMin", "priceMax"].forEach(
        (key) => {
          if (currentFilters[key] && currentFilters[key].toString().trim()) {
            queryParams.append(key, currentFilters[key]);
          }
        }
      );

      const response = await api.get(`/api/tickets?${queryParams.toString()}`);
      setTickets(response.data.tickets || []);

      // Extract unique stadiums for filter dropdown
      const uniqueStadiums = [
        ...new Set(response.data.tickets.map((t) => t.stadium)),
      ];
      setStadiumOptions(uniqueStadiums);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("שגיאה בטעינת כרטיसים");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    fetchTickets(filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const emptyFilters = {
      isHomeGame: false,
      isAwayGame: false,
      stadium: "",
      dateFrom: "",
      dateTo: "",
      priceMin: "",
      priceMax: "",
    };
    setFilters(emptyFilters);
    fetchTickets();
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value && value.toString().trim()
  );

  if (loading && tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p>טוען כרטיסים...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>
          כרטיסים למשחקי {user?.favoriteTeam}
        </h2>
        <button
          onClick={() => navigate("/create-ticket")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colors.primary }}
        >
          <Plus size={18} />
          מכור כרטיס
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
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
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              נקה סינון
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סוג משחק
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isHomeGame}
                    onChange={(e) =>
                      handleFilterChange("isHomeGame", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ml-2"
                  />
                  <span className="text-sm">
                    משחקי בית של {user?.favoriteTeam}
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isAwayGame}
                    onChange={(e) =>
                      handleFilterChange("isAwayGame", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ml-2"
                  />
                  <span className="text-sm">
                    משחקי חוץ של {user?.favoriteTeam}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                אצטדיון
              </label>
              <select
                value={filters.stadium}
                onChange={(e) => handleFilterChange("stadium", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">כל האצטדיונים</option>
                {stadiumOptions.map((stadium) => (
                  <option key={stadium} value={stadium}>
                    {stadium}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                מחיר מקסימלי (₪)
              </label>
              <input
                type="number"
                placeholder="עד..."
                value={filters.priceMax}
                onChange={(e) => handleFilterChange("priceMax", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                טווח תאריכים
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    handleFilterChange("dateFrom", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="מתאריך"
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="עד תאריך"
                />
              </div>
            </div>

            <div className="md:col-span-4 flex justify-center">
              <button
                onClick={applyFilters}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                החל סינון
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
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

      {/* Tickets Grid */}
      {tickets.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            אין כרטיסים זמינים
          </h3>
          <p className="text-gray-500 mb-4">
            {hasActiveFilters
              ? "לא נמצאו כרטיסים המתאימים לקריטריונים שבחרת"
              : "אין כרטיסים למכירה כרגע"}
          </p>
          <button
            onClick={() => navigate("/create-ticket")}
            className="px-6 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: colors.primary }}
          >
            היה הראשון למכור כרטיס
          </button>
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

      {/* Loading More */}
      {loading && tickets.length > 0 && (
        <div className="text-center py-4">
          <div className="loading-spinner mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default TicketMarketplace;
