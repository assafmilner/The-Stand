import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Layout from "../components/layout/Layout";
import api from "../utils/api";
import { MessageCircle, Clock, Search, Users } from "lucide-react";
import ChatModal from "../components/chat/ChatModal";
import { useUser } from "../context/UserContext";
import { useChat } from "../context/ChatContext";
import teamColors from "../utils/teamStyles";

const Messages = React.memo(() => {
  const { user } = useUser();
  const [chatUsers, setChatUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Use refs to prevent race conditions and unnecessary re-renders
  const dataLoadedRef = useRef(false);
  const mountedRef = useRef(true);
  const currentRequestRef = useRef(null);

  const colors = useMemo(
    () => teamColors[user?.favoriteTeam || "הפועל תל אביב"],
    [user?.favoriteTeam]
  );

  // Get functions from chat context
  const { markAsRead, initializeSocket } = useChat();

  // Initialize socket connection once
  useEffect(() => {
    if (user) {
      initializeSocket(user);
    }
  }, [user, initializeSocket]);

  // Optimized fetch function with proper cleanup
  const fetchChatUsers = useCallback(async () => {
    if (dataLoadedRef.current || loading) return;

    // Cancel previous request if exists
    if (currentRequestRef.current) {
      currentRequestRef.current.cancel = true;
    }

    const requestId = { cancel: false };
    currentRequestRef.current = requestId;

    setLoading(true);

    try {
      const response = await api.get("/api/messages/chats");

      // Check if request was cancelled or component unmounted
      if (requestId.cancel || !mountedRef.current) return;

      if (response.data.success) {
        setChatUsers(response.data.chatUsers || []);
        dataLoadedRef.current = true;
      }
    } catch (error) {
      console.error("Error fetching chat users:", error);
      if (!requestId.cancel && mountedRef.current) {
        setChatUsers([]);
        dataLoadedRef.current = true; // Still mark as loaded to prevent retries
      }
    } finally {
      if (!requestId.cancel && mountedRef.current) {
        setLoading(false);
      }
      currentRequestRef.current = null;
    }
  }, []); // Empty dependencies - only create once

  // Load data only once on mount
  useEffect(() => {
    fetchChatUsers();
  }, []); // Empty dependencies

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cancel any pending requests
      if (currentRequestRef.current) {
        currentRequestRef.current.cancel = true;
        currentRequestRef.current = null;
      }
    };
  }, []);

  // Memoized handlers to prevent re-renders
  const openChat = useCallback((chatUser) => {
    setSelectedUser(chatUser);
    setIsChatOpen(true);
  }, []);

  const handleCloseChatModal = useCallback(() => {
    setIsChatOpen(false);
    setSelectedUser(null);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Memoized time formatter
  const formatTime = useCallback((date) => {
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
  }, []);

  // Memoized filtered chat users
  const filteredChatUsers = useMemo(
    () =>
      chatUsers.filter((chatUser) =>
        chatUser.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [chatUsers, searchTerm]
  );

  // Memoized chat user component to prevent re-renders
  const ChatUserItem = React.memo(
    ({ chatUser, onOpenChat, formatTime, colors }) => (
      <div
        onClick={() => onOpenChat(chatUser.user)}
        className="group p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={
                chatUser.user.profilePicture ||
                "http://localhost:3001/assets/defaultProfilePic.png"
              }
              alt={chatUser.user.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
            />
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

            {chatUser.lastMessage && (
              <p className="text-gray-600 text-sm truncate mb-1">
                {chatUser.lastMessage}
              </p>
            )}

            <p className="text-xs text-gray-400">
              {chatUser.user.favoriteTeam
                ? `אוהד ${chatUser.user.favoriteTeam}`
                : "אוהד כדורגל"}
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div
              className="w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: colors.primary }}
            ></div>
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
    )
  );

  ChatUserItem.displayName = "ChatUserItem";

  // Show loading only on initial load
  if (loading && !dataLoadedRef.current) {
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
              onChange={handleSearchChange}
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

              {filteredChatUsers.map((chatUser) => (
                <ChatUserItem
                  key={chatUser.user._id}
                  chatUser={chatUser}
                  onOpenChat={openChat}
                  formatTime={formatTime}
                  colors={colors}
                />
              ))}
            </div>
          )}
        </div>

        {/* Chat Modal - Only render when needed */}
        {isChatOpen && selectedUser && (
          <ChatModal
            isOpen={isChatOpen}
            onClose={handleCloseChatModal}
            otherUser={selectedUser}
            onMarkAsRead={markAsRead}
          />
        )}
      </div>
    </Layout>
  );
});

Messages.displayName = "Messages";

export default Messages;
