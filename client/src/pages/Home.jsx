import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../components/context/UserContext";
import Layout from "../components/Layout";
import Feed from "../components/homeComponents/Feed";
import SmartLeagueTable from "../components/homeComponents/SmartLeagueTable";
import Community from "../components/homeComponents/Community";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import teamColors from "../utils/teamStyles";
import io from "socket.io-client";
import "../index.css";

const Home = () => {
  const { user, loading } = useUser();
  const [selectedTab, setSelectedTab] = useState("feed");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [conversations, setConversations] = useState({});
  const chatRef = useRef(null);

  const colors = teamColors[user?.favoriteTeam || "הפועל תל אביב"];

  // Initialize Socket.IO connection
  useEffect(() => {
    if (user && !socket) {
      const newSocket = io(process.env.REACT_APP_SERVER_URL || "http://localhost:3001", {
        auth: {
          token: localStorage.getItem("accessToken"),
          userId: user._id,
          userName: user.name,
          userAvatar: user.profilePicture
        },
        transports: ['websocket']
      });

      newSocket.on("connect", () => {
        console.log("Connected to chat server");
        newSocket.emit("user-online", user._id);
      });

      newSocket.on("online-users", (users) => {
        setOnlineUsers(users);
      });

      newSocket.on("user-connected", (userData) => {
        setOnlineUsers(prev => [...prev.filter(u => u.id !== userData.id), userData]);
      });

      newSocket.on("user-disconnected", (userId) => {
        setOnlineUsers(prev => prev.filter(u => u.id !== userId));
      });

      newSocket.on("receive-message", (messageData) => {
        const { from, to, message, timestamp, _id } = messageData;
        const chatId = from === user._id ? to : from;
        
        setConversations(prev => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), {
            _id,
            from,
            to,
            message,
            timestamp,
            read: false
          }]
        }));

        // Update unread count if chat is not active
        if (activeChatUser?.id !== chatId) {
          setUnreadMessages(prev => ({
            ...prev,
            [chatId]: (prev[chatId] || 0) + 1
          }));
        }
      });

      newSocket.on("message-read", ({ chatId, messageIds }) => {
        setConversations(prev => ({
          ...prev,
          [chatId]: prev[chatId]?.map(msg => 
            messageIds.includes(msg._id) ? { ...msg, read: true } : msg
          ) || []
        }));
      });

      newSocket.on("typing", ({ from, typing }) => {
        if (from !== user._id) {
          setOnlineUsers(prev => 
            prev.map(u => u.id === from ? { ...u, typing } : u)
          );
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.emit("user-offline", user._id);
        newSocket.disconnect();
      };
    }
  }, [user, socket]);

  // Handle chat outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsChatOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>טוען...</p>
      </div>
    );
  }

  // Not authenticated
  if (!user) return null;

  const handleChatUserSelect = (selectedUser) => {
    setActiveChatUser(selectedUser);
    setUnreadMessages(prev => ({ ...prev, [selectedUser.id]: 0 }));
    
    // Mark messages as read
    if (socket && conversations[selectedUser.id]) {
      const unreadMessageIds = conversations[selectedUser.id]
        .filter(msg => !msg.read && msg.from === selectedUser.id)
        .map(msg => msg._id);
      
      if (unreadMessageIds.length > 0) {
        socket.emit("mark-messages-read", {
          chatId: selectedUser.id,
          messageIds: unreadMessageIds
        });
      }
    }
  };

  const sendMessage = (message) => {
    if (!socket || !activeChatUser || !message.trim()) return;

    const messageData = {
      from: user._id,
      to: activeChatUser.id,
      message: message.trim(),
      timestamp: new Date()
    };

    socket.emit("send-message", messageData);
    
    // Add to local state immediately
    setConversations(prev => ({
      ...prev,
      [activeChatUser.id]: [...(prev[activeChatUser.id] || []), {
        ...messageData,
        _id: Date.now(), // Temporary ID
        read: false
      }]
    }));
  };

  const handleTyping = (isTyping) => {
    if (socket && activeChatUser) {
      socket.emit("typing", {
        to: activeChatUser.id,
        typing: isTyping
      });
    }
  };

  const totalUnread = Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);

  return (
    <Layout>
      {/* Main content area */}
      <div className="flex justify-center my-6">
        <div
          className="tab-wrapper"
          style={{
            width: "100%",
            backgroundColor: "var(--card-bg)",
            padding: "1rem",
            borderRadius: "1rem",
            display: "flex",
            alignItems: "center",
            margin: "0 auto",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          {[
            { key: "feed", label: "פיד" },
            { key: "groups", label: "קבוצות" },
            { key: "tickets", label: "כרטיסים" },
            { key: "table", label: "טבלה" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`custom-tab-button flex-1 ${
                selectedTab !== tab.key ? "inactive" : ""
              }`}
              style={
                selectedTab === tab.key
                  ? { backgroundColor: colors.primary }
                  : {}
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="transition-all duration-500 ease-in-out">
        {selectedTab === "feed" && (
          <div key="feed" className="animate-fade-in">
            <Feed user={user} colors={colors} />
          </div>
        )}
        {selectedTab === "table" && (
          <div key="table" className="animate-fade-in">
            <SmartLeagueTable />
          </div>
        )}
        {selectedTab === "groups" && <Community colors={colors} />}
        {selectedTab === "tickets" && (
          <div
            key="tickets"
            className="animate-fade-in text-center text-gray-500"
          >
            כרטיסים - בקרוב
          </div>
        )}
      </div>

      {/* Chat feature */}
      <div className="fixed bottom-4 left-4 z-50" ref={chatRef}>
        {/* Chat toggle button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="relative p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-200"
          style={{ backgroundColor: colors.primary }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9.89 8a9.863 9.863 0 01-4.83-1.22L3 20l1.22-3.28A9.863 9.863 0 013 12c0-5.472 4.018-9.89 9.01-9.89S21 7.528 21 12z"
            />
          </svg>
          {totalUnread > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </button>

        {/* Chat interface */}
        {isChatOpen && (
          <div className="mb-4 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            <div className="flex h-96 w-80">
              {/* Chat list */}
              {!activeChatUser ? (
                <ChatList
                  onlineUsers={onlineUsers}
                  currentUser={user}
                  unreadMessages={unreadMessages}
                  onUserSelect={handleChatUserSelect}
                />
              ) : (
                <ChatWindow
                  chatUser={activeChatUser}
                  currentUser={user}
                  messages={conversations[activeChatUser.id] || []}
                  onSendMessage={sendMessage}
                  onTyping={handleTyping}
                  onBack={() => setActiveChatUser(null)}
                  isTyping={activeChatUser.typing}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;