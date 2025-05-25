import React, { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import api from "../utils/api";
import { MessageCircle, Clock, Search, Users } from "lucide-react";
import ChatModal from "../components/chat/ChatModal";
import { useUser } from "../context/UserContext";
import { useMessageNotifications } from "../hooks/useMessageNotifications";
import teamColors from "../utils/teamStyles";

const Messages = () => {
  const { user } = useUser();
  const [chatUsers, setChatUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const colors = teamColors[user?.favoriteTeam || "הפועל תל אביב"];

  // Get the markAsRead function from notifications hook
  const { markAsRead } = useMessageNotifications(user);

  useEffect(() => {
    fetchChatUsers();
  }, []);

  const fetchChatUsers = async () => {
    try {
      const response = await api.get("/api/messages/chats");
      if (response.data.success) {
        setChatUsers(response.data.chatUsers);
      }
    } catch (error) {
      console.error("Error fetching chat users:", error);
    } finally {
      setLoading(false);
    }
  };

  const openChat = (chatUser) => {
    setSelectedUser(chatUser);
    setIsChatOpen(true);
  };

  const handleCloseChatModal = () => {
    setIsChatOpen(false);
    setSelectedUser(null);
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMs = now - messageDate;
    const diffInHours = diffInMs / (1000 * 60 * 60);

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
        month: "numeric",
      });
    }
  };

  const filteredChatUsers = chatUsers.filter((chatUser) =>
    chatUser.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="dashboard-card text-center">
          <div
            className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full mb-4"
            style={{ borderColor: colors.primary }}
          ></div>
          <p className="text-gray-600">טוען הודעות...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-6-y">
        {/* Header Section */}
        <div
          className="dashboard-card mb-6"
          style={{ borderTop: `4px solid ${colors.primary}` }}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <MessageCircle size={32} style={{ color: colors.primary }} />
              </div>
              הודעות
            </h1>
            <div className="flex items-center gap-2 text-gray-500">
              <Users size={18} />
              <span>{chatUsers.length} שיחות</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="חפש שיחות..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                focusRingColor: colors.primary,
                borderColor: searchTerm ? colors.primary : undefined,
              }}
            />
          </div>
        </div>

        {/* Messages List */}
        <div className="dashboard-card">
          {filteredChatUsers.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="p-4 rounded-full mx-auto mb-6 w-24 h-24 flex items-center justify-center"
                style={{ backgroundColor: `${colors.primary}10` }}
              >
                <MessageCircle size={48} style={{ color: colors.primary }} />
              </div>
              <h2 className="text-2xl font-bold text-gray-600 mb-4">
                {searchTerm ? "לא נמצאו שיחות" : "אין עדיין שיחות"}
              </h2>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? "נסה לחפש משהו אחר"
                  : "התחל לשוחח עם אוהדים אחרים!"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => (window.location.href = "/home")}
                  className="px-6 py-3 text-white rounded-lg transition-colors font-medium"
                  style={{ backgroundColor: colors.primary }}
                >
                  גלה אוהדים חדשים
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                {searchTerm
                  ? `תוצאות חיפוש (${filteredChatUsers.length})`
                  : "שיחות אחרונות"}
              </h3>

              {filteredChatUsers.map((chatUser, index) => (
                <div
                  key={chatUser.user._id}
                  onClick={() => openChat(chatUser.user)}
                  className="group p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                  style={{
                    "&:hover": {
                      borderColor: `${colors.primary}40`,
                      boxShadow: `0 4px 12px ${colors.primary}20`,
                    },
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar with online indicator */}
                    <div className="relative">
                      <img
                        src={
                          chatUser.user.profilePicture ||
                          "http://localhost:3001/assets/defaultProfilePic.png"
                        }
                        alt={chatUser.user.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      {/* Online indicator (placeholder) */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {chatUser.user.name}
                        </h3>
                        {chatUser.lastMessageTime && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock size={14} />
                            <span className="font-medium">
                              {formatTime(chatUser.lastMessageTime)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Last message preview */}
                      {chatUser.lastMessage && (
                        <p className="text-gray-600 text-sm truncate mb-1">
                          {chatUser.lastMessage}
                        </p>
                      )}

                      {/* User info */}
                      <p className="text-xs text-gray-400">
                        {chatUser.user.favoriteTeam
                          ? `אוהד ${chatUser.user.favoriteTeam}`
                          : "אוהד כדורגל"}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: colors.primary }}
                      ></div>
                      {/* Placeholder for unread count */}
                      {Math.random() > 0.7 && (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: colors.primary }}
                        >
                          {Math.floor(Math.random() * 3) + 1}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Modal with markAsRead function */}
        <ChatModal
          isOpen={isChatOpen}
          onClose={handleCloseChatModal}
          otherUser={selectedUser}
          onMarkAsRead={markAsRead}
        />
      </div>
    </Layout>
  );
};

export default Messages;
