import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "../utils/api";
import socketService from "../services/socketService";
import { useUser } from "./UserContext";

/**
 * ChatContext
 *
 * Provides global chat functionality and real-time socket integration.
 * Features:
 * - Live notifications
 * - Caching of recent messages per user
 * - Socket connection lifecycle and message handlers
 */

const ChatContext = createContext();

/**
 * ChatProvider
 *
 * Wraps the app and makes chat state & methods available to all children.
 * Handles:
 * - Notifications
 * - Recent chats
 * - Socket connection
 * - Chat message caching
 */

export const ChatProvider = ({ children }) => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatCache, setChatCache] = useState(new Map());

  /**
   * loadRecentChats
   *
   * Fetches the latest chats from the server for display in sidebar.
   * Prevents multiple concurrent loads.
   */

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

  /**
   * markAsRead
   *
   * Clears notifications from a specific sender or all.
   */

  const markAsRead = useCallback((senderId = null) => {
    if (senderId) {
      setNotifications((prev) => prev.filter((n) => n.senderId !== senderId));
    } else {
      setNotifications([]);
    }
  }, []);

  /**
   * setActiveChat
   *
   * Marks a chat as currently opened (prevents duplicate notifications).
   */

  const setActiveChat = useCallback((chatId) => {
    setActiveChatId(chatId);
  }, []);

  /**
   * addMessageToGlobalCache
   *
   * Caches a new message by chat ID (other user’s ID).
   * Prevents duplicates and keeps messages sorted chronologically.
   */

  const addMessageToGlobalCache = useCallback(
    (message) => {
      const chatId =
        message.senderId._id === activeChatId
          ? message.receiverId._id
          : message.senderId._id;

      setChatCache((prev) => {
        const newCache = new Map(prev);
        const existingMessages = newCache.get(chatId) || [];

        const messageExists = existingMessages.some(
          (msg) => msg._id === message._id
        );
        if (!messageExists) {
          const updatedMessages = [...existingMessages, message].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
          newCache.set(chatId, updatedMessages);
        }

        return newCache;
      });
    },
    [activeChatId]
  );

  /**
   * getCachedMessages
   *
   * Returns cached messages for a given chat.
   */

  const getCachedMessages = useCallback(
    (chatId) => {
      return chatCache.get(chatId) || [];
    },
    [chatCache]
  );

  /**
   * updateRecentChat
   *
   * Updates or prepends a recent chat based on a new incoming message.
   * Keeps list sorted with most recent on top.
   */

  const updateRecentChat = useCallback(
    (message) => {
      setRecentChats((prev) => {
        const updated = [...prev];
        const existingIndex = updated.findIndex(
          (chat) =>
            chat.user._id === message.senderId._id ||
            chat.user._id === message.receiverId._id
        );

        const otherUserId =
          message.senderId._id === activeChatId
            ? message.receiverId._id
            : message.senderId._id;
        const otherUser =
          message.senderId._id === activeChatId
            ? message.receiverId
            : message.senderId;

        if (existingIndex >= 0) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastMessage: message.content,
            lastMessageTime: message.createdAt,
          };
          const updatedChat = updated.splice(existingIndex, 1)[0];
          updated.unshift(updatedChat);
        } else {
          updated.unshift({
            user: otherUser,
            lastMessage: message.content,
            lastMessageTime: message.createdAt,
          });
        }

        return updated.slice(0, 10);
      });
    },
    [activeChatId]
  );

  /**
   * addNotification
   *
   * Adds a new message notification unless chat is open.
   * Updates existing one if already present.
   */

  const addNotification = useCallback(
    (notification) => {
      if (activeChatId === notification.senderId) {
        return;
      }

      setNotifications((prev) => {
        const exists = prev.some((n) => n.senderId === notification.senderId);
        if (exists) {
          return prev.map((n) =>
            n.senderId === notification.senderId
              ? {
                  ...n,
                  content: notification.content,
                  timestamp: new Date(notification.timestamp),
                }
              : n
          );
        }
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
    },
    [activeChatId]
  );

  /**
   * showToast
   *
   * Displays a toast notification for a new message unless on /messages page.
   * Auto-dismisses after 4 seconds.
   */

  const showToast = useCallback(
    (message) => {
      if (activeChatId === message.senderId) {
        return;
      }

      if (window.location.pathname === "/messages") return;

      const toast = document.createElement("div");
      toast.className =
        "fixed bottom-6 left-6 bg-white shadow-lg border border-gray-300 px-4 py-3 rounded-lg z-50";
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
    },
    [activeChatId]
  );

  /**
   * useEffect: Init socket and register listeners on mount (once user is ready)
   */

  useEffect(() => {
    if (!user?._id) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const initSocket = async () => {
      try {
        if (socketService.isSocketConnected()) return;

        await socketService.connect(token);

        socketService.onReceiveMessage((msg) => {
          addMessageToGlobalCache(msg);
          updateRecentChat(msg);

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
  }, [
    user?._id,
    addMessageToGlobalCache,
    updateRecentChat,
    addNotification,
    showToast,
  ]);

  /**
   * Context value exposed to consumers
   */

  const value = {
    notifications,
    unreadCount: notifications.length,
    recentChats,
    loading,
    loadRecentChats,
    markAsRead,
    setActiveChat,
    activeChatId,
    getCachedMessages,
    addMessageToGlobalCache,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

/**
 * useChat
 *
 * Custom hook to consume chat context safely.
 */

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};
