// client/src/components/layout/Header.js - OPTIMIZED VERSION
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import {
  MessageCircle,
  Bell,
  Settings,
  X,
  ArrowLeft,
  Search,
  Loader,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/index.css";
import { useChat } from "../../context/ChatContext";

// Lazy load ChatModal for better performance
const ChatModal = lazy(() => import("../chat/ChatModal"));

// Memoized components to prevent unnecessary re-renders
const NotificationItem = React.memo(
  ({ notification, onOpenChat, onClearNotification, formatTime }) => (
    <div
      className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
      onClick={() => {
        const chatUser = {
          _id: notification.senderId,
          name: notification.senderName,
          profilePicture: notification.senderAvatar,
        };
        onOpenChat(chatUser);
        onClearNotification(notification.id);
      }}
    >
      <div className="flex items-start gap-3">
        <img
          src={notification.senderAvatar || "/defaultProfilePic.png"}
          alt={notification.senderName}
          className="w-8 h-8 rounded-full object-cover"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium text-gray-900 truncate text-sm">
              {notification.senderName}
            </p>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatTime(notification.timestamp)}
            </span>
          </div>
          <p className="text-xs text-gray-600 truncate">
            {notification.content}
          </p>
        </div>
      </div>
    </div>
  )
);

const RecentChatItem = React.memo(({ chat, onOpenChat, formatTime }) => (
  <div
    onClick={() => onOpenChat(chat.user)}
    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
  >
    <img
      src={chat.user.profilePicture || "/defaultProfilePic.png"}
      alt={chat.user.name}
      className="w-8 h-8 rounded-full object-cover"
      loading="lazy"
    />
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 truncate text-sm">
        {chat.user.name}
      </p>
      {chat.lastMessage && (
        <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
      )}
    </div>
    {chat.lastMessageTime && (
      <span className="text-xs text-gray-400 flex-shrink-0">
        {formatTime(chat.lastMessageTime)}
      </span>
    )}
  </div>
));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-6">
    <Loader className="animate-spin h-5 w-5 text-gray-400" />
    <span className="ml-2 text-gray-500">טוען...</span>
  </div>
);

const Header = ({ user }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [dropdownLoaded, setDropdownLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const {
    unreadCount,
    notifications,
    recentChats,
    recentChatsLoading,
    isSocketConnected,
    loadRecentChats,
    markAsRead,
    clearNotification,
  } = useChat();

  // Memoized time formatters to prevent recreating on every render
  const formatters = useMemo(
    () => ({
      formatNotificationTime: (date) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        if (diffInMinutes < 1) return "עכשיו";
        if (diffInMinutes < 60) return `לפני ${diffInMinutes} דקות`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
        return new Date(date).toLocaleDateString("he-IL");
      },

      formatLastMessageTime: (date) => {
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
      },
    }),
    []
  );

  // Filter recent chats based on search query
  const filteredRecentChats = useMemo(() => {
    if (!searchQuery.trim()) return recentChats;

    return recentChats.filter(
      (chat) =>
        chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recentChats, searchQuery]);

  // Memoized notification count for badge
  const notificationBadge = useMemo(() => {
    if (unreadCount === 0) return null;
    return unreadCount > 9 ? "9+" : unreadCount.toString();
  }, [unreadCount]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSearchQuery("");
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  // Handle custom events from toast notifications
  useEffect(() => {
    const handleOpenChat = (event) => {
      const { user: chatUser } = event.detail;
      handleOpenChatModal(chatUser);
    };

    window.addEventListener("openChat", handleOpenChat);
    return () => window.removeEventListener("openChat", handleOpenChat);
  }, []);

  // Debounced search
  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      // Here you could implement server-side search if needed
      console.log("Searching for:", query);
    }, 300);
  }, []);

  // Optimized dropdown toggle
  const handleDropdownToggle = useCallback(async () => {
    const newShowState = !showDropdown;
    setShowDropdown(newShowState);

    if (newShowState && !dropdownLoaded) {
      setDropdownLoaded(true);
      await loadRecentChats();
    }
  }, [showDropdown, dropdownLoaded, loadRecentChats]);

  // Handle opening chat modal
  const handleOpenChatModal = useCallback(
    (chatUser) => {
      setSelectedChatUser(chatUser);
      setIsChatOpen(true);
      setShowDropdown(false);
      setSearchQuery("");
      markAsRead(chatUser._id);
    },
    [markAsRead]
  );

  // Handle closing chat modal
  const handleCloseChatModal = useCallback(() => {
    setIsChatOpen(false);
    setSelectedChatUser(null);
  }, []);

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    markAsRead();
  }, [markAsRead]);

  // Handle navigation to messages page
  const handleNavigateToMessages = useCallback(() => {
    navigate("/messages");
    setShowDropdown(false);
    setSearchQuery("");
  }, [navigate]);

  // Handle navigation to settings
  const handleNavigateToSettings = useCallback(() => {
    navigate("/settings");
  }, [navigate]);

  // Handle navigation to profile
  const handleNavigateToProfile = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  // Handle navigation to home
  const handleNavigateToHome = useCallback(() => {
    navigate("/home");
  }, [navigate]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <header className="top-navbar">
        <div className="navbar-content">
          {/* Left icons */}
          <div className="navbar-icons">
            <button
              className="icon-button"
              aria-label="הגדרות"
              onClick={handleNavigateToSettings}
            >
              <Settings size={20} />
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                className="icon-button relative"
                aria-label="הודעות"
                onClick={handleDropdownToggle}
              >
                <MessageCircle size={20} />
                {/* Connection indicator */}
                <div
                  className={`absolute -top-1 -left-1 w-3 h-3 rounded-full ${
                    isSocketConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                {/* Notification badge */}
                {notificationBadge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                    {notificationBadge}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900">הודעות</h3>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isSocketConnected ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            סמן הכל כנקרא
                          </button>
                        )}
                        <button onClick={() => setShowDropdown(false)}>
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Search bar */}
                    <div className="relative">
                      <Search
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="text"
                        placeholder="חפש שיחות..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="max-h-64 overflow-y-auto">
                    {recentChatsLoading ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        {/* Recent Chats */}
                        {filteredRecentChats.length > 0 && (
                          <div className="p-3 border-b border-gray-100">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                              {searchQuery
                                ? `תוצאות חיפוש (${filteredRecentChats.length})`
                                : "שיחות אחרונות"}
                            </h4>
                            <div className="space-y-1">
                              {filteredRecentChats.map((chat) => (
                                <RecentChatItem
                                  key={chat.user._id}
                                  chat={chat}
                                  onOpenChat={handleOpenChatModal}
                                  formatTime={formatters.formatLastMessageTime}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* New Notifications */}
                        {notifications.length > 0 && (
                          <div className="p-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                              הודעות חדשות ({notifications.length})
                            </h4>
                            <div className="space-y-1">
                              {notifications.slice(0, 5).map((notification) => (
                                <NotificationItem
                                  key={notification.id}
                                  notification={notification}
                                  onOpenChat={handleOpenChatModal}
                                  onClearNotification={clearNotification}
                                  formatTime={formatters.formatNotificationTime}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Empty State */}
                        {!recentChatsLoading &&
                          filteredRecentChats.length === 0 &&
                          notifications.length === 0 && (
                            <div className="p-6 text-center text-gray-500">
                              <MessageCircle
                                size={32}
                                className="mx-auto mb-2 text-gray-300"
                              />
                              <p className="font-medium">
                                {searchQuery ? "לא נמצאו תוצאות" : "אין הודעות"}
                              </p>
                              <p className="text-sm">
                                {searchQuery
                                  ? "נסה מילות חיפוש אחרות"
                                  : "התחל שיחה עם אוהדים"}
                              </p>
                            </div>
                          )}
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-gray-100">
                    <button
                      onClick={handleNavigateToMessages}
                      className="w-full text-center text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      צפה בכל ההודעות
                      <ArrowLeft size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              className="icon-button"
              aria-label="התראות"
              onClick={() => {
                /* Handle notifications */
              }}
            >
              <Bell size={20} />
            </button>
          </div>

          {/* Search bar */}
          <div className="navbar-search">
            <input
              type="text"
              placeholder="חפש אוהדים, קבוצות או פוסטים..."
              onFocus={() => {
                /* Handle search focus */
              }}
            />
          </div>

          {/* Logo and Profile */}
          <div className="navbar-logo">
            <span
              className="logo-text tracking-wide cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleNavigateToHome}
            >
              היציע
            </span>
            <button
              className="logo-circle hover:opacity-80 transition-opacity"
              onClick={handleNavigateToProfile}
            >
              <img
                src={user?.profilePicture || "/defaultProfilePic.png"}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
                loading="lazy"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Modal */}
      {isChatOpen && selectedChatUser && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6">
                <LoadingSpinner />
              </div>
            </div>
          }
        >
          <ChatModal
            isOpen={isChatOpen}
            onClose={handleCloseChatModal}
            otherUser={selectedChatUser}
            onMarkAsRead={markAsRead}
          />
        </Suspense>
      )}
    </>
  );
};

export default React.memo(Header);
