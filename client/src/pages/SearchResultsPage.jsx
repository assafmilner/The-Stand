// client/src/pages/SearchResultsPage.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, User, MessageSquare, Ticket } from "lucide-react";
import Layout from "../components/layout/Layout";
import { useSearch } from "../hooks/useSearch";
import teamNameMap from "../utils/teams-hebrew";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [selectedTab, setSelectedTab] = useState("all");
  const [filters, setFilters] = useState({});

  const { fullResults, loading, performFullSearch } = useSearch();

  useEffect(() => {
    if (query) {
      // טוען פעם אחת עם type='all' ואז מסנן בצד הלקוח
      performFullSearch(query, { ...filters, type: "all" });
    }
  }, [query, filters, performFullSearch]); // הסרנו currentPage

  const handleUserClick = (user) => {
    navigate(`/profile/${user._id}`);
  };

  const handlePostClick = (post) => {
    // אם יש לך post viewer modal, פתח אותו
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

  // פונקציה לתרגום שם קבוצה
  const getTeamName = (englishName) => {
    return teamNameMap[englishName]?.name || englishName;
  };

  const results = fullResults?.results || {};
  const pagination = fullResults?.pagination || {};

  // סינון התוצאות לפי הטאב הנבחר
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
      <div className="space-6-y">
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

        {/* Tabs */}
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

        {/* Results */}
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

            {/* Pagination - הוסר כי אנחנו מציגים את כל התוצאות */}
            {/* אם יש יותר מ-50 תוצאות, אפשר להוסיף pagination בעתיד */}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchResultsPage;
