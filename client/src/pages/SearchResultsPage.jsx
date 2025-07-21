import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  User,
  MessageSquare,
  Ticket,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import { useSearch } from "../hooks/useSearch";
import teamNameMap from "../utils/teams-hebrew";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [selectedTab, setSelectedTab] = useState("all");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const [filters, setFilters] = useState({
    // Posts filter
    contentText: "",
    authorName: "",
    postDateFrom: "",
    postDateTo: "",

    // Users filter
    userName: "",
    gender: "",
    location: "",

    // Tickets filter
    priceMin: "",
    priceMax: "",
    ticketDateFrom: "",
    ticketDateTo: "",
  });

  const { fullResults, loading, performFullSearch } = useSearch();

  useEffect(() => {
    if (query) {
      performFullSearch(query, filters);
    }
  }, [query, filters, performFullSearch]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      contentText: "",
      authorName: "",
      postDateFrom: "",
      postDateTo: "",
      userName: "",
      gender: "",
      location: "",
      priceMin: "",
      priceMax: "",
      ticketDateFrom: "",
      ticketDateTo: "",
    });
  };

  // Check if there are active filters
  const hasActiveFilters = () => {
    return Object.values(filters).some((value) => value !== "");
  };

  const handleUserClick = (user) => {
    navigate(`/profile/${user._id}`);
  };

  const handlePostClick = (post) => {
    console.log("Post clicked:", post);
  };

  const handleTicketClick = (ticket) => {
    navigate(`/tickets/${ticket._id}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("he-IL");
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffInHours = (now - new Date(date)) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return new Date(date).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "אתמול";
    } else {
      return new Date(date).toLocaleDateString("he-IL", {
        day: "numeric",
        month: "short",
      });
    }
  };

  const formatPrice = (price) => {
    return `₪${price.toFixed(0)}`;
  };

  const getTeamName = (englishName) => {
    return teamNameMap[englishName]?.name || englishName;
  };

  const results = fullResults?.results || {};

  const getFilteredResults = () => {
    if (selectedTab === "all") {
      return results;
    } else if (selectedTab === "users") {
      return { users: results.users || [] };
    } else if (selectedTab === "posts") {
      return { posts: results.posts || [] };
    } else if (selectedTab === "tickets") {
      return { tickets: results.tickets || [] };
    }
    return {};
  };

  const filteredResults = getFilteredResults();

  const tabItems = [
    {
      key: "all",
      label: "הכל",
      count:
        (results.users?.length || 0) +
        (results.posts?.length || 0) +
        (results.tickets?.length || 0),
    },
    { key: "users", label: "משתמשים", count: results.users?.length || 0 },
    { key: "posts", label: "פוסטים", count: results.posts?.length || 0 },
    { key: "tickets", label: "כרטיסים", count: results.tickets?.length || 0 },
  ];

  if (!query) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <Search size={48} className="mx-auto mb-4 text-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">חיפוש</h1>
            <p className="text-gray-500">הכנס מילות חיפוש כדי לראות תוצאות</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            תוצאות חיפוש עבור "{query}"
          </h1>
          {fullResults && (
            <p className="text-gray-500">
              נמצאו{" "}
              {(results.users?.length || 0) +
                (results.posts?.length || 0) +
                (results.tickets?.length || 0)}{" "}
              תוצאות
            </p>
          )}
        </div>

        {/* Advanced search button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-colors ${
              showAdvancedSearch
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <SlidersHorizontal size={18} />
            חיפוש מתקדם
            {hasActiveFilters() && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                פעיל
              </span>
            )}
          </button>

          {hasActiveFilters() && (
            <button onClick={clearFilters} className="text-sm underline">
              נקה פילטרים
            </button>
          )}
        </div>

        {/* Advanced search */}
        {showAdvancedSearch && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                חיפוש מתקדם
              </h3>
              <button
                onClick={() => setShowAdvancedSearch(false)}
                className="hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Posts filter */}
              <div className="border-b pb-4">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <MessageSquare size={16} className="text-green-600" />
                  פילטרים לפוסטים
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      חיפוש בתוכן
                    </label>
                    <input
                      type="text"
                      placeholder="מילות מפתח..."
                      value={filters.contentText}
                      onChange={(e) =>
                        handleFilterChange("contentText", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      שם המחבר
                    </label>
                    <input
                      type="text"
                      placeholder="שם משתמש..."
                      value={filters.authorName}
                      onChange={(e) =>
                        handleFilterChange("authorName", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      מתאריך
                    </label>
                    <input
                      type="date"
                      value={filters.postDateFrom}
                      onChange={(e) =>
                        handleFilterChange("postDateFrom", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      עד תאריך
                    </label>
                    <input
                      type="date"
                      value={filters.postDateTo}
                      onChange={(e) =>
                        handleFilterChange("postDateTo", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Users filter */}
              <div className="border-b pb-4">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <User size={16} className="text-blue-600" />
                  פילטרים למשתמשים
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      שם
                    </label>
                    <input
                      type="text"
                      placeholder="שם המשתמש..."
                      value={filters.userName}
                      onChange={(e) =>
                        handleFilterChange("userName", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      מגדר
                    </label>
                    <select
                      value={filters.gender}
                      onChange={(e) =>
                        handleFilterChange("gender", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">הכל</option>
                      <option value="male">גבר</option>
                      <option value="female">אישה</option>
                      <option value="other">אחר</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      איזור
                    </label>
                    <select
                      value={filters.location}
                      onChange={(e) =>
                        handleFilterChange("location", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">הכל</option>
                      <option value="צפון">צפון</option>
                      <option value="מרכז">מרכז</option>
                      <option value="דרום">דרום</option>
                      <option value="ירושלים">ירושלים</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tickets filter */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Ticket size={16} className="text-purple-600" />
                  פילטרים לכרטיסים
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      מחיר מינימלי (₪)
                    </label>
                    <input
                      type="number"
                      placeholder="מ..."
                      value={filters.priceMin}
                      onChange={(e) =>
                        handleFilterChange("priceMin", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      מחיר מקסימלי (₪)
                    </label>
                    <input
                      type="number"
                      placeholder="עד..."
                      value={filters.priceMax}
                      onChange={(e) =>
                        handleFilterChange("priceMax", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      מתאריך
                    </label>
                    <input
                      type="date"
                      value={filters.ticketDateFrom}
                      onChange={(e) =>
                        handleFilterChange("ticketDateFrom", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      עד תאריך
                    </label>
                    <input
                      type="date"
                      value={filters.ticketDateTo}
                      onChange={(e) =>
                        handleFilterChange("ticketDateTo", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {tabItems.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedTab === tab.key
                  ? "bg-primary text-secondary shadow-sm"
                  : "bg-secondary text-primary"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">מחפש...</p>
          </div>
        )}

        {!loading && fullResults && (
          <div className="space-y-6">
            {/* Users Results */}
            {(selectedTab === "all" || selectedTab === "users") &&
              filteredResults.users?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User size={20} className="text-blue-600" />
                    <h2 className="text-lg font-semibold">משתמשים</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredResults.users.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => handleUserClick(user)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <img
                          src={user.profilePicture || "/defaultProfilePic.png"}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user.favoriteTeam}
                          </p>
                          <p className="text-xs text-gray-400">
                            {user.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Posts Results */}
            {(selectedTab === "all" || selectedTab === "posts") &&
              filteredResults.posts?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare size={20} className="text-green-600" />
                    <h2 className="text-lg font-semibold">פוסטים</h2>
                  </div>
                  <div className="space-y-4">
                    {filteredResults.posts.map((post) => (
                      <div
                        key={post._id}
                        onClick={() => handlePostClick(post)}
                        className="p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={
                              post.authorId?.profilePicture ||
                              "/defaultProfilePic.png"
                            }
                            alt={post.authorId?.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-gray-900">
                                {post.authorId?.name}
                              </p>
                              <span className="text-sm text-gray-500">
                                {formatTime(post.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-2">{post.content}</p>
                            {post.media?.length > 0 && (
                              <img
                                src={post.media[0]}
                                alt="Post media"
                                className="w-32 h-24 object-cover rounded-lg"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Tickets Results */}
            {(selectedTab === "all" || selectedTab === "tickets") &&
              filteredResults.tickets?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Ticket size={20} className="text-purple-600" />
                    <h2 className="text-lg font-semibold">כרטיסים</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredResults.tickets.map((ticket) => (
                      <div
                        key={ticket._id}
                        onClick={() => handleTicketClick(ticket)}
                        className="p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">
                            {getTeamName(ticket.homeTeam)} נגד{" "}
                            {getTeamName(ticket.awayTeam)}
                          </h3>
                          <span className="font-bold text-green-600">
                            {formatPrice(ticket.price)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">
                          {formatDate(ticket.date)} • {ticket.time}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          מוכר: {ticket.sellerId?.name}
                        </p>
                        {ticket.notes && (
                          <p className="text-xs text-gray-600 truncate">
                            {ticket.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* No Results */}
            {!loading &&
              !filteredResults.users?.length &&
              !filteredResults.posts?.length &&
              !filteredResults.tickets?.length && (
                <div className="text-center py-12">
                  <Search size={48} className="mx-auto mb-4 text-gray-300" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    לא נמצאו תוצאות
                  </h2>
                  <p className="text-gray-500">
                    נסה מילות חיפוש אחרות או שנה את הפילטרים
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchResultsPage;
