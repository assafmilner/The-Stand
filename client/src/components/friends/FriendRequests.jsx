import React, { useState } from "react";
import {
  Check,
  X,
  Clock,
  User,
  MessageCircle,
  UserPlus,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFriends } from "../../hooks/useFriends";

/**
 * FriendRequests renders a list of incoming or outgoing friend requests.
 * It supports accepting, rejecting, and visual feedback per request type.
 *
 * Props:
 * - requests: array - list of friend request objects
 * - type: string - 'received' or 'sent'
 * - loading: boolean - whether to show loading skeletons
 * - colors: object - primary color styling per team
 * - onRequestHandled: function - callback after accept/reject
 * - emptyMessage: string - custom empty state title
 * - emptySubMessage: string - custom empty state description
 */
const FriendRequests = ({
  requests = [],
  type = "received",
  loading = false,
  colors,
  onRequestHandled,
  emptyMessage,
  emptySubMessage,
}) => {
  const navigate = useNavigate();
  const { acceptFriendRequest, rejectFriendRequest, requestLoading } =
    useFriends();
  const [processingRequest, setProcessingRequest] = useState(null);

  const handleAcceptRequest = async (request) => {
    setProcessingRequest(request.id);
    const result = await acceptFriendRequest(request.id);
    if (result.success) onRequestHandled?.(request, "accepted");
    else alert(result.error);
    setProcessingRequest(null);
  };

  const handleRejectRequest = async (request) => {
    setProcessingRequest(request.id);
    const result = await rejectFriendRequest(request.id);
    if (result.success) onRequestHandled?.(request, "rejected");
    else alert(result.error);
    setProcessingRequest(null);
  };

  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const formatDate = (date) => {
    const now = new Date();
    const requestDate = new Date(date);
    const diffInHours = Math.floor((now - requestDate) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return "לפני כמה דקות";
    if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
    if (diffInDays === 1) return "אתמול";
    if (diffInDays < 7) return `לפני ${diffInDays} ימים`;

    return requestDate.toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      year:
        requestDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // Show loading placeholders
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
              {type === "received" && (
                <div className="flex gap-2">
                  <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <UserPlus size={48} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {emptyMessage ||
            (type === "received"
              ? "אין בקשות חברות חדשות"
              : "לא שלחת בקשות חברות")}
        </h3>
        <p className="text-gray-500 text-sm">
          {emptySubMessage ||
            (type === "received"
              ? "בקשות חברות שיישלחו אליך יופיעו כאן"
              : "בקשות ששלחת לאחרים יופיעו כאן")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const user = type === "received" ? request.sender : request.receiver;
        const isProcessing = processingRequest === request.id;

        return (
          <div
            key={request.id}
            className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Profile Picture */}
                <div
                  className="cursor-pointer"
                  onClick={() => handleProfileClick(user._id)}
                >
                  <img
                    src={user.profilePicture || "/defaultProfilePic.png"}
                    alt={user.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 hover:border-gray-300 transition-colors"
                  />
                </div>

                {/* Request Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors mb-1"
                        onClick={() => handleProfileClick(user._id)}
                      >
                        {user.name}
                      </h3>
                      <p
                        className="text-sm mb-2"
                        style={{ color: colors?.primary || "#3B82F6" }}
                      >
                        אוהד {user.favoriteTeam}
                      </p>

                      <div className="space-y-1 text-xs text-gray-500">
                        {user.location && (
                          <div className="flex items-center gap-1">
                            <span>📍 {user.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>
                            {type === "received"
                              ? `שלח בקשה ${formatDate(request.createdAt)}`
                              : `נשלח ${formatDate(request.createdAt)}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2">
                      {type === "received" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request)}
                            disabled={isProcessing || requestLoading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                            ) : (
                              <Check size={14} />
                            )}
                            <span className="text-xs">אשר</span>
                          </button>

                          <button
                            onClick={() => handleRejectRequest(request)}
                            disabled={isProcessing || requestLoading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                            ) : (
                              <X size={14} />
                            )}
                            <span className="text-xs">דחה</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">
                          <Clock size={14} />
                          <span className="text-xs font-medium">
                            ממתין לתגובה
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleProfileClick(user._id)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <User size={14} />
                      צפה בפרופיל
                    </button>

                    {type === "received" && (
                      <button
                        onClick={() =>
                          navigate("/messages", {
                            state: { selectedUser: user },
                          })
                        }
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <MessageCircle size={14} />
                        שלח הודעה
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FriendRequests;
