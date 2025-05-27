// client/src/context/ChatContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "../utils/api";
import socketService from "../services/socketService";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRecentChats = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await api.get("/api/messages/recent");
      if (res.data.success) {
        setRecentChats(res.data.recentChats || []);
      }
    } catch (err) {
      console.error("Failed to load recent chats", err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const markAsRead = useCallback((senderId = null) => {
    if (senderId) {
      setNotifications((prev) => prev.filter((n) => n.senderId !== senderId));
    } else {
      setNotifications([]);
    }
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => {
      const exists = prev.some((n) => n.senderId === notification.senderId);
      if (exists) return prev;
      return [
        ...prev,
        {
          id: Date.now(),
          senderId: notification.senderId,
          senderName: notification.senderName,
          senderAvatar: notification.senderAvatar,
          content: notification.content,
          timestamp: new Date(notification.timestamp),
        },
      ];
    });
  }, []);

  const showToast = useCallback((message) => {
    if (window.location.pathname === "/messages") return;

    const toast = document.createElement("div");
    toast.className =
      "fixed top-6 left-6 bg-white shadow-lg border border-gray-300 px-4 py-3 rounded-lg z-50";
    toast.style.direction = "rtl";
    toast.innerHTML = `
      <div>
        <strong>${message.senderName}</strong><br/>
        <span style="font-size: 0.875rem;">${message.content.slice(0, 50)}${
      message.content.length > 50 ? "..." : ""
    }</span>
      </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const initSocket = async () => {
      try {
        await socketService.connect(token);

        socketService.onReceiveMessage((msg) => {
          loadRecentChats();

          const notification = {
            senderId: msg.senderId._id,
            senderName: msg.senderId.name,
            senderAvatar: msg.senderId.profilePicture,
            content: msg.content,
            timestamp: msg.createdAt,
          };

          addNotification(notification);
          showToast(notification);
        });
      } catch (error) {
        console.error("Socket connection failed:", error);
      }
    };

    initSocket();

    return () => {
      socketService.removeAllListeners();
    };
  }, [loadRecentChats, addNotification, showToast]);

  const value = {
    notifications,
    unreadCount: notifications.length,
    recentChats,
    loading,
    loadRecentChats,
    markAsRead,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};
