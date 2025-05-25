// client/src/components/layoutComponents/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Bell, Settings, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/index.css";
import { useMessageNotifications } from "../../hooks/useMessageNotifications";
import ChatModal from "../chat/ChatModal";

const Header = ({ user }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const notificationRef = useRef(null);

  const {
    unreadCount,
    notifications,
    recentChats,
    markAsRead,
    clearNotification,
  } = useMessageNotifications(user);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenChat = (chatUser) => {
    setSelectedChatUser(chatUser);
    setIsChatOpen(true);
    setShowNotifications(false);
    // Mark notifications from this user as read
    markAsRead(chatUser._id);
  };

  const handleCloseChatModal = () => {
    setIsChatOpen(false);
    setSelectedChatUser(null);
  };

  const formatNotificationTime = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "עכשיו";
    if (diffInMinutes < 60) return `לפני ${diffInMinutes} דקות`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `לפני ${diffInHours} שעות`;

    return date.toLocaleDateString("he-IL");
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
              aria-label="הגדרות"
              onClick={() => navigate("/settings")}
            >
              <Settings size={20} />
            </button>

            {/* Messages with notification badge and dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                className="icon-button relative"
                aria-label="הודעות"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <MessageCircle size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Chat Dropdown */}
              {showNotifications && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">הודעות</h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAsRead()}
                            className="text-xs"
                          >
                            סמן הכל כנקרא
                          </button>
                        )}
                        <button onClick={() => setShowNotifications(false)}>
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {/* Recent Chats Section */}
                    {recentChats.length > 0 && (
                      <div className="p-3 border-b border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          שיחות אחרונות
                        </h4>
                        <div className="space-y-2">
                          {recentChats.map((chatUser) => (
                            <div
                              key={chatUser.user._id}
                              onClick={() => handleOpenChat(chatUser.user)}
                              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                            >
                              <img
                                src={
                                  chatUser.user.profilePicture ||
                                  "http://localhost:3001/assets/defaultProfilePic.png"
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
                                    {chatUser.lastMessage}
                                  </p>
                                )}
                              </div>
                              {chatUser.lastMessageTime && (
                                <span className="text-xs text-gray-400">
                                  {formatLastMessageTime(
                                    chatUser.lastMessageTime
                                  )}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Notifications Section */}
                    {notifications.length > 0 && (
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          הודעות חדשות
                        </h4>
                        {notifications.map((notification) => (
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
                              clearNotification(notification.id);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={
                                  notification.senderAvatar ||
                                  "http://localhost:3001/assets/defaultProfilePic.png"
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
                                    {formatNotificationTime(
                                      notification.timestamp
                                    )}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 truncate">
                                  {notification.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Empty State */}
                    {recentChats.length === 0 && notifications.length === 0 && (
                      <div className="p-6 text-center text-gray-500">
                        <MessageCircle
                          size={32}
                          className="mx-auto mb-2 text-gray-300"
                        />
                        <p className="font-medium">אין הודעות</p>
                        <p className="text-sm">התחל לשוחח עם אוהדים אחרים</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        navigate("/messages");
                        setShowNotifications(false);
                      }}
                      className="w-full text-center font-medium text-sm flex items-center justify-center gap-2"
                    >
                      צפה בכל ההודעות
                      <ArrowLeft size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="icon-button" aria-label="התראות">
              <Bell size={20} />
            </button>
          </div>

          {/* Search bar */}
          <div className="navbar-search">
            <input type="text" placeholder="חפש אוהדים, קבוצות או פוסטים..." />
          </div>

          {/* Logo + avatar */}
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
                src={
                  user?.profilePicture ||
                  "http://localhost:3001/assets/defaultProfilePic.png"
                }
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={handleCloseChatModal}
        otherUser={selectedChatUser}
      />
    </>
  );
};

export default Header;
