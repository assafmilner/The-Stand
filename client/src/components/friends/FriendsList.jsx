import React, { useState, lazy, Suspense } from "react";
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
import { useChat } from "../../context/ChatContext";
import DeleteConfirmationModal from "../modal/DeleteConfirmationModal";

const ChatModal = lazy(() => import("../chat/ChatModal"));

/**
 * FriendsList displays a list of current friends with optional actions like:
 * - Viewing profile
 * - Sending message (opens chat modal)
 * - Removing friend (opens confirmation modal)
 *
 * Props:
 * - friends: array - list of user objects
 * - loading: boolean - shows skeletons when true
 * - showActions: boolean - toggle quick actions and menu
 * - showRemove: boolean - whether to show "Remove Friend"
 * - showMessage: boolean - whether to show "Send Message"
 * - colors: object - styling (e.g. based on favorite team)
 * - onFriendRemoved: function - called after removing a friend
 * - onMessageClick: function - optional callback for handling message button
 * - emptyMessage / emptySubMessage: fallback text when list is empty
 */
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
}) => {
  const navigate = useNavigate();
  const { removeFriend, requestLoading } = useFriends();
  const { markAsRead } = useChat();

  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [friendToDelete, setFriendToDelete] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatWithFriend, setChatWithFriend] = useState(null);

  /**
   * Opens the delete confirmation modal.
   */
  const handleRemoveFriend = (friend) => {
    setFriendToDelete(friend);
    setIsDeleteModalOpen(true);
    setActionMenuOpen(null);
  };

  /**
   * Confirms and executes the actual deletion.
   */
  const confirmDeleteFriend = async () => {
    if (!friendToDelete) return;
    const result = await removeFriend(friendToDelete._id);
    if (result.success) onFriendRemoved?.(friendToDelete);
    else alert(result.error);
    setFriendToDelete(null);
  };

  /**
   * Closes the delete modal and resets state.
   */
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setFriendToDelete(null);
  };

  /**
   * Handles message click - either with external handler or opens chat modal.
   */
  const handleMessageClick = (friend) => {
    if (onMessageClick) {
      onMessageClick(friend);
    } else {
      if (!friend || !friend._id) {
        alert("שגיאה: לא ניתן לפתוח צ'אט עם החבר");
        return;
      }
      setChatWithFriend({
        _id: friend._id,
        name: friend.name,
        profilePicture: friend.profilePicture,
      });
      setIsChatModalOpen(true);
    }
    setActionMenuOpen(null);
  };

  const closeChatModal = () => {
    setIsChatModalOpen(false);
    setChatWithFriend(null);
  };

  const handleProfileClick = (friend) => {
    navigate(`/profile/${friend._id}`);
    setActionMenuOpen(null);
  };

  const formatJoinDate = (date) =>
    new Date(date).toLocaleDateString("he-IL", { year: "numeric", month: "long" });

  const formatFriendshipDate = (date) =>
    new Date(date).toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  /**
   * Skeleton loading cards
   */
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

  /**
   * Empty state fallback
   */
  if (friends.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <Users size={48} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500 text-sm">{emptySubMessage}</p>
      </div>
    );
  }

  /**
   * Main list UI
   */
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
                <div className="cursor-pointer" onClick={() => handleProfileClick(friend)}>
                  <img
                    src={friend.profilePicture || "/defaultProfilePic.png"}
                    alt={friend.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 hover:border-gray-300 transition-colors"
                  />
                </div>

                {/* User Info and Actions */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
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
                            <span>חברים מאז {formatFriendshipDate(friend.friendshipDate)}</span>
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

                    {/* Action Menu */}
                    {showActions && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActionMenuOpen(actionMenuOpen === friend._id ? null : friend._id)
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
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <User size={16} />
                                צפה בפרופיל
                              </button>
                              {showMessage && (
                                <button
                                  onClick={() => handleMessageClick(friend)}
                                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
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

                  {/* Quick Action Buttons */}
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
        {actionMenuOpen && (
          <div
            className="fixed inset-0 z-5"
            onClick={() => setActionMenuOpen(null)}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
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

      {/* Chat Modal */}
      {isChatModalOpen && chatWithFriend && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg">
                <p>טוען צ'אט...</p>
              </div>
            </div>
          }
        >
          <ChatModal
            isOpen={isChatModalOpen}
            onClose={closeChatModal}
            otherUser={chatWithFriend}
            onMarkAsRead={markAsRead}
          />
        </Suspense>
      )}
    </>
  );
};

export default FriendsList;
