// client/src/context/ChatContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import socketService from "../services/socketService";
import api from "../utils/api";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // Basic notification state (lightweight)
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Cached data (only loaded when needed)
  const [recentChats, setRecentChats] = useState([]);
  const [recentChatsLoading, setRecentChatsLoading] = useState(false);

  // Socket connection state - use refs to prevent unnecessary re-renders
  const socketConnectedRef = useRef(false);
  const currentUserRef = useRef(null);
  const recentChatsLoadedRef = useRef(false);
  const initializingRef = useRef(false);

  // Initialize socket connection (lightweight) - prevent multiple calls
  const initializeSocket = useCallback((user) => {
    if (!user || socketConnectedRef.current || initializingRef.current) return;

    // Check if it's the same user
    if (currentUserRef.current && currentUserRef.current._id === user._id)
      return;

    initializingRef.current = true;
    currentUserRef.current = user;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      initializingRef.current = false;
      return;
    }

    try {
      socketService.connect(token);
      socketConnectedRef.current = true;

      // Listen for new messages (only update counts and notifications)
      socketService.onReceiveMessage((message) => {
        setUnreadCount((prev) => prev + 1);

        // Add to notifications queue
        setNotifications((prev) => [
          {
            id: message._id,
            senderId: message.senderId._id,
            senderName: message.senderId.name,
            senderAvatar: message.senderId.profilePicture,
            content: message.content,
            timestamp: new Date(message.createdAt),
          },
          ...prev.slice(0, 9), // Keep only 10 most recent
        ]);

        // Update recent chats if loaded
        updateRecentChatsIfLoaded(message);
      });

      // Get initial unread count (lightweight)
      getBasicUnreadCount();
    } catch (error) {
      console.error("Socket connection failed:", error);
      socketConnectedRef.current = false;
    } finally {
      initializingRef.current = false;
    }
  }, []); // Empty dependencies to prevent recreation

  // Update recent chats only if already loaded - updated for your server
  const updateRecentChatsIfLoaded = useCallback((message) => {
    if (recentChatsLoadedRef.current) {
      setRecentChats((prev) => {
        // Find existing chat by checking both sender and receiver
        const senderId = message.senderId._id || message.senderId;
        const receiverId = message.receiverId || currentUserRef.current?._id;

        // Determine which user this chat is with (not current user)
        const otherUserId =
          senderId === currentUserRef.current?._id ? receiverId : senderId;

        const existingIndex = prev.findIndex(
          (chat) => chat.user._id === otherUserId
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex].lastMessage = message.content;
          updated[existingIndex].lastMessageTime = message.createdAt;
          // Move to top
          const [updatedChat] = updated.splice(existingIndex, 1);
          return [updatedChat, ...updated];
        }
        return prev; // Don't add new chats automatically
      });
    }
  }, []);

  // Lightweight unread count fetch - using your server's endpoint
  const getBasicUnreadCount = useCallback(async () => {
    try {
      const response = await api.get("/api/messages/unread-count");
      if (response.data.success) {
        setUnreadCount(response.data.count || 0);
      } else {
        // Fallback to cached count
        const cachedCount = localStorage.getItem("unreadMessageCount");
        setUnreadCount(parseInt(cachedCount) || 0);
      }
    } catch (error) {
      console.error("Error getting unread count:", error);
      // Fallback to cached count
      const cachedCount = localStorage.getItem("unreadMessageCount");
      setUnreadCount(parseInt(cachedCount) || 0);
    }
  }, []);

  // Lazy load recent chats (only when dropdown opens)
  const loadRecentChats = useCallback(async () => {
    if (recentChatsLoadedRef.current || recentChatsLoading) {
      return recentChats;
    }

    setRecentChatsLoading(true);
    try {
      const response = await api.get("/api/messages/chats");
      if (response.data.success) {
        const chats = response.data.chatUsers.slice(0, 5); // Top 5 recent
        setRecentChats(chats);
        recentChatsLoadedRef.current = true;
        return chats;
      }
    } catch (error) {
      console.error("Error loading recent chats:", error);
    } finally {
      setRecentChatsLoading(false);
    }
    return [];
  }, [recentChats, recentChatsLoading]);

  // Mark messages as read (optimized)
  const markAsRead = useCallback(
    (senderId = null) => {
      if (senderId) {
        // Mark specific user's messages as read
        setNotifications((prev) => {
          const userNotifications = prev.filter(
            (notif) => notif.senderId === senderId
          );
          const remainingNotifications = prev.filter(
            (notif) => notif.senderId !== senderId
          );

          // Update unread count
          setUnreadCount((current) =>
            Math.max(0, current - userNotifications.length)
          );

          return remainingNotifications;
        });
      } else {
        // Mark all as read
        setUnreadCount(0);
        setNotifications([]);
      }

      // Update localStorage
      const newCount = senderId
        ? Math.max(
            0,
            unreadCount -
              notifications.filter((n) => n.senderId === senderId).length
          )
        : 0;
      localStorage.setItem("unreadMessageCount", newCount.toString());
    },
    [unreadCount, notifications]
  );

  // Clear specific notification
  const clearNotification = useCallback(
    (notificationId) => {
      setNotifications((prev) => {
        const filtered = prev.filter((notif) => notif.id !== notificationId);
        const newCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newCount);
        localStorage.setItem("unreadMessageCount", newCount.toString());
        return filtered;
      });
    },
    [unreadCount]
  );

  // Refresh recent chats (force reload)
  const refreshRecentChats = useCallback(async () => {
    recentChatsLoadedRef.current = false;
    return loadRecentChats();
  }, [loadRecentChats]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketConnectedRef.current) {
        socketService.disconnect();
        socketConnectedRef.current = false;
      }
    };
  }, []);

  const value = {
    // Basic state (always available)
    unreadCount,
    notifications,

    // Lazy-loaded data
    recentChats,
    recentChatsLoading,

    // Actions
    initializeSocket,
    loadRecentChats,
    markAsRead,
    clearNotification,
    refreshRecentChats,

    // Status
    socketConnected: socketConnectedRef.current,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
