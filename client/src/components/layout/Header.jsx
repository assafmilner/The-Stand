// client/src/components/layout/Header.jsx
import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
import {
  MessageCircle,
  Settings,
  X,
  ArrowLeft,
  Users,
  UserPlus,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/index.css";
import { useChat } from "../../context/ChatContext";
import { useSharedChatCache } from "../../hooks/useSharedChatCache";
import { useFriends } from "../../hooks/useFriends";
import SearchBar from "../search/SearchBar";

const ChatModal = lazy(() => import("../chat/ChatModal"));

const Header = ({ user }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFriendsDropdown, setShowFriendsDropdown] = useState(false); // New state
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const friendsDropdownRef = useRef(null); // New ref

  const { unreadCount, notifications, markAsRead } = useChat();
  const { loadRecentChats, getCacheStats } = useSharedChatCache();

  // Friends functionality
  const {
    receivedRequests,
    receivedRequestsCount,
    getReceivedRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    requestLoading,
  } = useFriends();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        friendsDropdownRef.current &&
        !friendsDropdownRef.current.contains(event.target)
      ) {
        setShowFriendsDropdown(false);
      }
    };

    if (showDropdown || showFriendsDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown, showFriendsDropdown]);

  const handleDropdownToggle = async () => {
    const newShowState = !showDropdown;
    setShowDropdown(newShowState);

    if (newShowState) {
      // Load recent chats (from cache if available)
      setLoading(true);
      try {
        const result = await loadRecentChats();
        setRecentChats(result.data);
      } catch (err) {
        console.error("Failed to load recent chats:", err);
        setRecentChats([]);
      } finally {
        setLoading(false);
      }
    }
  };

  // New function for friends dropdown
  const handleFriendsDropdownToggle = async () => {
    const newShowState = !showFriendsDropdown;
    setShowFriendsDropdown(newShowState);

    if (newShowState) {
      // Load friend requests
      try {
        await getReceivedRequests();
      } catch (err) {
        console.error("Failed to load friend requests:", err);
      }
    }
  };

  const handleOpenChat = (chatUser) => {
    setSelectedChatUser(chatUser);
    setIsChatOpen(true);
    setShowDropdown(false);
    markAsRead(chatUser._id);
  };

  // New functions for friend requests
  const handleAcceptRequest = async (request) => {
    const result = await acceptFriendRequest(request.id);
    if (result.success) {
      // Refresh requests
      getReceivedRequests();
    }
  };

  const handleRejectRequest = async (request) => {
    const result = await rejectFriendRequest(request.id);
    if (result.success) {
      // Refresh requests
      getReceivedRequests();
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "עכשיו";
    if (diffInMinutes < 60) return `לפני ${diffInMinutes} דקות`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `לפני ${diffInHours} שעות`;

    return new Date(date).toLocaleDateString("he-IL");
  };

  const formatLastMessageTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "אתמול";
    } else {
      return messageDate.toLocaleDateString("he-IL", {
        day: "numeric",
        month: "short",
      });
    }
  };

  return (
    <>
      <header className="top-navbar">
        <div className="navbar-content">
          {/* Left icons */}
          <div className="navbar-icons">
            <button
              className="icon-button"
              onClick={() => navigate("/settings")}
            >
              <Settings size={20} />
            </button>

            {/* Messages dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="icon-button relative"
                onClick={handleDropdownToggle}
              >
                <MessageCircle size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border z-50 max-h-96 overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">הודעות</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAsRead()}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          סמן הכל כנקרא
                        </button>
                      )}
                      <button onClick={() => setShowDropdown(false)}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {loading && (
                      <div className="p-6 text-center text-gray-500">
                        <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-2"></div>
                        טוען שיחות...
                      </div>
                    )}

                    {!loading && recentChats.length > 0 && (
                      <div className="p-3 border-b">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          שיחות אחרונות
                        </h4>
                        {recentChats.slice(0, 5).map((chatUser) => (
                          <div
                            key={chatUser.user._id}
                            onClick={() => handleOpenChat(chatUser.user)}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors mb-1"
                          >
                            <img
                              src={
                                chatUser.user.profilePicture ||
                                "/defaultProfilePic.png"
                              }
                              alt={chatUser.user.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate text-sm">
                                {chatUser.user.name}
                              </p>
                              {chatUser.lastMessage && (
                                <p className="text-xs text-gray-500 truncate">
                                  {chatUser.lastMessage.slice(0, 30)}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end">
                              {chatUser.lastMessageTime && (
                                <span className="text-xs text-gray-400">
                                  {formatLastMessageTime(
                                    chatUser.lastMessageTime
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {notifications.length > 0 && (
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          הודעות חדשות
                        </h4>
                        {notifications.slice(0, 3).map((notification) => (
                          <div
                            key={notification.id}
                            className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer mb-2"
                            onClick={() => {
                              const chatUser = {
                                _id: notification.senderId,
                                name: notification.senderName,
                                profilePicture: notification.senderAvatar,
                              };
                              handleOpenChat(chatUser);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={
                                  notification.senderAvatar ||
                                  "/defaultProfilePic.png"
                                }
                                alt={notification.senderName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-medium text-gray-900 truncate text-sm">
                                    {notification.senderName}
                                  </p>
                                  <span className="text-xs text-gray-500">
                                    {formatTime(notification.timestamp)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 truncate">
                                  {notification.content.slice(0, 40)}...
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!loading &&
                      recentChats.length === 0 &&
                      notifications.length === 0 && (
                        <div className="p-6 text-center text-gray-500">
                          <MessageCircle
                            size={32}
                            className="mx-auto mb-2 text-gray-300"
                          />
                          <p className="font-medium">אין הודעות</p>
                          <p className="text-sm">התחל שיחה עם אוהדים</p>
                        </div>
                      )}
                  </div>

                  <div className="p-3 border-t">
                    <button
                      onClick={() => {
                        navigate("/messages");
                        setShowDropdown(false);
                      }}
                      className="w-full text-center font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      צפה בכל ההודעות
                      <ArrowLeft size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Friends dropdown - NEW */}
            <div className="relative" ref={friendsDropdownRef}>
              <button
                className="icon-button relative"
                onClick={handleFriendsDropdownToggle}
              >
                <Users size={20} />
                {receivedRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {receivedRequestsCount > 9 ? "9+" : receivedRequestsCount}
                  </span>
                )}
              </button>

              {showFriendsDropdown && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border z-50 max-h-96 overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">בקשות חברות</h3>
                    <button onClick={() => setShowFriendsDropdown(false)}>
                      <X size={16} />
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {receivedRequests.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <UserPlus
                          size={32}
                          className="mx-auto mb-2 text-gray-300"
                        />
                        <p className="font-medium">אין בקשות חברות חדשות</p>
                        <p className="text-sm">בקשות חברות יופיעו כאן</p>
                      </div>
                    ) : (
                      <div className="p-3">
                        {receivedRequests.slice(0, 5).map((request) => (
                          <div
                            key={request.id}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg mb-2"
                          >
                            <img
                              src={
                                request.sender.profilePicture ||
                                "/defaultProfilePic.png"
                              }
                              alt={request.sender.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate text-sm">
                                {request.sender.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                אוהד {request.sender.favoriteTeam}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatTime(new Date(request.createdAt))}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleAcceptRequest(request)}
                                disabled={requestLoading}
                                className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                                title="אשר"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request)}
                                disabled={requestLoading}
                                className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                                title="דחה"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t">
                    <button
                      onClick={() => {
                        navigate("/friends");
                        setShowFriendsDropdown(false);
                      }}
                      className="w-full text-center font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      צפה בכל הבקשות
                      <ArrowLeft size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="navbar-search">
            <SearchBar />
          </div>

          <div className="navbar-logo">
            <span
              className="logo-text tracking-wide"
              onClick={() => navigate("/home")}
            >
              היציע
            </span>
            <button
              className="logo-circle"
              onClick={() => navigate("/profile")}
            >
              <img
                src={user?.profilePicture || "/defaultProfilePic.png"}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Modal */}
      {isChatOpen && selectedChatUser && (
        <Suspense fallback={<div>טוען צ'אט...</div>}>
          <ChatModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            otherUser={selectedChatUser}
            onMarkAsRead={markAsRead}
          />
        </Suspense>
      )}
    </>
  );
};

export default Header;
