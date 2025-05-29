// client/src/components/friends/FriendsList.jsx
import React, { useState } from "react";
import {
  Users,
  MessageCircle,
  UserMinus,
  MapPin,
  Calendar,
  MoreVertical,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFriends } from "../../hooks/useFriends";
import DeleteConfirmationModal from "../modal/DeleteConfirmationModal";
import ChatModal from "../chat/ChatModal";

const FriendsList = ({
  friends = [],
  loading = false,
  showActions = true,
  showRemove = true,
  showMessage = true,
  colors,
  onFriendRemoved,
  onMessageClick,
  emptyMessage = "אין חברים להצגה",
  emptySubMessage = "חברים שתוסיף יופיעו כאן",
  currentUser, // המשתמש הנוכחי למודאל הצ'אט
}) => {
  const navigate = useNavigate();
  const { removeFriend, requestLoading } = useFriends();
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  
  // State למודאלים
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [friendToDelete, setFriendToDelete] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatWithFriend, setChatWithFriend] = useState(null);

  // פתיחת מודאל המחיקה
  const handleRemoveFriend = (friend) => {
    setFriendToDelete(friend);
    setIsDeleteModalOpen(true);
    setActionMenuOpen(null);
  };

  // ביצוע המחיקה בפועל
  const confirmDeleteFriend = async () => {
    if (!friendToDelete) return;
    
    const result = await removeFriend(friendToDelete._id);
    if (result.success) {
      onFriendRemoved?.(friendToDelete);
    } else {
      alert(result.error);
    }
    
    setFriendToDelete(null);
  };

  // סגירת מודאל המחיקה
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setFriendToDelete(null);
  };

  // טיפול בלחיצה על הודעה
  const handleMessageClick = (friend) => {
    if (onMessageClick) {
      // אם יש callback מותאם אישית
      onMessageClick(friend);
    } else if (currentUser) {
      // אם יש משתמש נוכחי - פתח מודאל צ'אט
      setChatWithFriend(friend);
      setIsChatModalOpen(true);
    } else {
      // Default behavior - navigate to messages page with user selected
      navigate("/messages", { state: { selectedUser: friend } });
    }
    setActionMenuOpen(null);
  };

  // סגירת מודאל הצ'אט
  const closeChatModal = () => {
    setIsChatModalOpen(false);
    setChatWithFriend(null);
  };

  const handleProfileClick = (friend) => {
    navigate(`/profile/${friend._id}`);
    setActionMenuOpen(null);
  };

  const formatJoinDate = (date) => {
    return new Date(date).toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
    });
  };

  const formatFriendshipDate = (date) => {
    return new Date(date).toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <Users size={48} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-500 text-sm">{emptySubMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {friends.map((friend) => (
          <div
            key={friend._id}
            className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Profile Picture */}
                <div
                  className="cursor-pointer"
                  onClick={() => handleProfileClick(friend)}
                >
                  <img
                    src={friend.profilePicture || "/defaultProfilePic.png"}
                    alt={friend.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 hover:border-gray-300 transition-colors"
                  />
                </div>

                {/* Friend Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Name and Team */}
                      <h3
                        className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                        onClick={() => handleProfileClick(friend)}
                      >
                        {friend.name}
                      </h3>
                      <p
                        className="text-sm text-gray-600 mb-2"
                        style={{ color: colors?.primary }}
                      >
                        אוהד {friend.favoriteTeam}
                      </p>

                      {/* Additional Info */}
                      <div className="space-y-1 text-xs text-gray-500">
                        {friend.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span>{friend.location}</span>
                          </div>
                        )}

                        {friend.friendshipDate && (
                          <div className="flex items-center gap-1">
                            <Users size={12} />
                            <span>
                              חברים מאז{" "}
                              {formatFriendshipDate(friend.friendshipDate)}
                            </span>
                          </div>
                        )}

                        {friend.createdAt && (
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>הצטרף {formatJoinDate(friend.createdAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Menu */}
                    {showActions && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActionMenuOpen(
                              actionMenuOpen === friend._id ? null : friend._id
                            )
                          }
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full bg-transparent transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {actionMenuOpen === friend._id && (
                          <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                            <div className="py-1">
                              <button
                                onClick={() => handleProfileClick(friend)}
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 bg-transparent transition-colors"
                              >
                                <User size={16} />
                                צפה בפרופיל
                              </button>

                              {showMessage && (
                                <button
                                  onClick={() => handleMessageClick(friend)}
                                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 bg-transparent transition-colors"
                                >
                                  <MessageCircle size={16} />
                                  שלח הודעה
                                </button>
                              )}

                              {showRemove && (
                                <>
                                  <hr className="my-1" />
                                  <button
                                    onClick={() => handleRemoveFriend(friend)}
                                    disabled={requestLoading}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 bg-transparent transition-colors disabled:opacity-50"
                                  >
                                    <UserMinus size={16} />
                                    {requestLoading ? "מסיר..." : "הסר חבר"}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions Row */}
                  {showActions && (
                    <div className="flex gap-2 mt-3">
                      {showMessage && (
                        <button
                          onClick={() => handleMessageClick(friend)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <MessageCircle size={14} />
                          הודעה
                        </button>
                      )}

                      <button
                        onClick={() => handleProfileClick(friend)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <User size={14} />
                        פרופיל
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Click outside handler for action menu */}
        {actionMenuOpen && (
          <div
            className="fixed inset-0 z-5"
            onClick={() => setActionMenuOpen(null)}
          />
        )}
      </div>

      {/* מודאל אישור מחיקה */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteFriend}
        title="הסר חבר"
        message={
          friendToDelete 
            ? `האם אתה בטוח שברצונך להסיר את ${friendToDelete.name} מרשימת החברים שלך?`
            : "האם אתה בטוח שברצונך להסיר את החבר הזה?"
        }
        confirmText="הסר חבר"
        cancelText="ביטול"
        type="danger"
      />

      {/* מודאל צ'אט - מופיע רק אם יש משתמש נוכחי */}
      {currentUser && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={closeChatModal}
          selectedUser={chatWithFriend}
          currentUser={currentUser}
        />
      )}
    </>
  );
};

export default FriendsList;