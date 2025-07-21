import React from "react";
import { useNavigate } from "react-router-dom";
import { User, MessageSquare, Ticket, ArrowLeft, Loader2 } from "lucide-react";
import teamNameMap from "../../utils/teams-hebrew";

/**
 * SearchDropdown displays categorized quick search results (users, posts, tickets).
 *
 * Props:
 * - results: object containing users, posts, tickets arrays
 * - loading: whether the search is currently loading
 * - query: the current search string
 * - onClose: callback to close the dropdown
 * - onSeeAllResults: callback to navigate to full results page
 */
const SearchDropdown = ({
  results,
  loading,
  query,
  onClose,
  onSeeAllResults,
}) => {
  const navigate = useNavigate();

  /**
   * Navigate to selected user's profile and close dropdown.
   */
  const handleUserClick = (user) => {
    navigate(`/profile/${user._id}`);
    onClose();
  };

  /**
   * Placeholder click handler for posts (can be extended to navigate).
   */
  const handlePostClick = (post) => {
    console.log("Post clicked:", post);
    onClose();
  };

  /**
   * Navigate to selected ticket's detail page and close dropdown.
   */
  const handleTicketClick = (ticket) => {
    navigate(`/tickets/${ticket._id}`);
    onClose();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("he-IL");
  };

  const formatPrice = (price) => {
    return `₪${price.toFixed(0)}`;
  };

  /**
   * Translates a team name from English to Hebrew (fallbacks to original if not found).
   */
  const getTeamName = (englishName) => {
    return teamNameMap[englishName]?.name || englishName;
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border z-50 max-h-96 overflow-hidden">
      {/* Loading state */}
      {loading ? (
        <div className="p-6 text-center text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p>מחפש...</p>
        </div>
      ) : // Empty state
      !results ||
        (!results.users?.length &&
          !results.posts?.length &&
          !results.tickets?.length) ? (
        <div className="p-6 text-center text-gray-500">
          <p className="font-medium">לא נמצאו תוצאות</p>
          <p className="text-sm">נסה מילות חיפוש אחרות</p>
        </div>
      ) : (
        // Result sections
        <div className="max-h-80 overflow-y-auto">
          {/* Users Section */}
          {results.users?.length > 0 && (
            <div className="p-3 border-b">
              <div className="flex items-center gap-2 mb-3">
                <User size={16} className="text-blue-600" />
                <h4 className="text-sm font-medium text-gray-700">
                  משתמשים ({results.users.length})
                </h4>
              </div>
              {results.users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors mb-1"
                >
                  <img
                    src={user.profilePicture || "/defaultProfilePic.png"}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.favoriteTeam} • {user.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Posts Section */}
          {results.posts?.length > 0 && (
            <div className="p-3 border-b">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={16} className="text-green-600" />
                <h4 className="text-sm font-medium text-gray-700">
                  פוסטים ({results.posts.length})
                </h4>
              </div>
              {results.posts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => handlePostClick(post)}
                  className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors mb-1"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        post.authorId?.profilePicture ||
                        "/defaultProfilePic.png"
                      }
                      alt={post.authorId?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 truncate text-sm">
                          {post.authorId?.name}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {post.content.slice(0, 80)}...
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tickets Section */}
          {results.tickets?.length > 0 && (
            <div className="p-3 border-b">
              <div className="flex items-center gap-2 mb-3">
                <Ticket size={16} className="text-purple-600" />
                <h4 className="text-sm font-medium text-gray-700">
                  כרטיסים ({results.tickets.length})
                </h4>
              </div>
              {results.tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => handleTicketClick(ticket)}
                  className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors mb-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm">
                        {getTeamName(ticket.homeTeam)} נגד{" "}
                        {getTeamName(ticket.awayTeam)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatDate(ticket.date)}</span>
                        <span>•</span>
                        <span>מוכר: {ticket.sellerId?.name}</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm text-green-600">
                        {formatPrice(ticket.price)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {ticket.quantity} כרטיסים
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* "See All Results" Button */}
      {results &&
        (results.users?.length > 0 ||
          results.posts?.length > 0 ||
          results.tickets?.length > 0) && (
          <div className="p-3">
            <button
              onClick={onSeeAllResults}
              className="w-full text-center font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              הצג את כל התוצאות עבור "{query}"
              <ArrowLeft size={14} />
            </button>
          </div>
        )}
    </div>
  );
};

export default SearchDropdown;
