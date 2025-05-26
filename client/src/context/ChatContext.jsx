// client/src/context/ChatContext.js - OPTIMIZED VERSION
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef
} from "react";
import api from "../utils/api";
import socketService from "../services/socketService";

const ChatContext = createContext();

// Notification management utilities
const NOTIFICATION_LIFETIME = 5000; // 5 seconds
const MAX_NOTIFICATIONS = 50; // Prevent memory bloat

export const ChatProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentChats, setRecentChats] = useState([]);
  const [recentChatsLoading, setRecentChatsLoading] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Refs for preventing race conditions and managing cleanup
  const loadingRef = useRef(false);
  const notificationTimeouts = useRef(new Map());
  const toastContainer = useRef(null);

  // Debounced notification count update
  const updateUnreadCount = useCallback(() => {
    const uniqueSenders = new Set(notifications.map(n => n.senderId));
    setUnreadCount(uniqueSenders.size);
  }, [notifications]);

  useEffect(() => {
    updateUnreadCount();
  }, [updateUnreadCount]);

  // Optimized recent chats loading with debouncing
  const loadRecentChats = useCallback(async (force = false) => {
    if (loadingRef.current && !force) return;
    
    loadingRef.current = true;
    setRecentChatsLoading(true);
    
    try {
      const response = await api.get("/api/messages/recent");
      if (response.data.success) {
        const chats = response.data.recentChats || [];
        setRecentChats(chats);
      }
    } catch (error) {
      console.error("Failed to load recent chats:", error);
    } finally {
      setRecentChatsLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Optimized mark as read with batch operations
  const markAsRead = useCallback((senderId = null) => {
    if (senderId) {
      setNotifications(prev => {
        const filtered = prev.filter(n => n.senderId !== senderId);
        // Clear timeouts for removed notifications
        prev.filter(n => n.senderId === senderId).forEach(n => {
          if (notificationTimeouts.current.has(n.id)) {
            clearTimeout(notificationTimeouts.current.get(n.id));
            notificationTimeouts.current.delete(n.id);
          }
        });
        return filtered;
      });
    } else {
      // Clear all notifications
      notificationTimeouts.current.forEach(timeout => clearTimeout(timeout));
      notificationTimeouts.current.clear();
      setNotifications([]);
    }
  }, []);

  // Optimized notification clearing
  const clearNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    if (notificationTimeouts.current.has(id)) {
      clearTimeout(notificationTimeouts.current.get(id));
      notificationTimeouts.current.delete(id);
    }
  }, []);

  // Efficient notification management
  const addNotification = useCallback((notification) => {
    const id = `${notification.senderId}_${Date.now()}_${Math.random()}`;
    const newNotification = { ...notification, id, timestamp: new Date() };
    
    setNotifications(prev => {
      // Remove duplicates from same sender with same content
      const filtered = prev.filter(n => 
        !(n.senderId === notification.senderId && n.content === notification.content)
      );
      
      // Limit notifications to prevent memory issues
      const updated = [...filtered, newNotification].slice(-MAX_NOTIFICATIONS);
      return updated;
    });

    // Auto-remove notification after timeout
    const timeout = setTimeout(() => {
      clearNotification(id);
    }, NOTIFICATION_LIFETIME);
    
    notificationTimeouts.current.set(id, timeout);
    
    return id;
  }, [clearNotification]);

  // Optimized toast system
  const showToast = useCallback((message, sender) => {
    // Only show toast if not on messages page
    if (window.location.pathname === "/messages") return;

    // Create toast container if it doesn't exist
    if (!toastContainer.current) {
      toastContainer.current = document.createElement("div");
      toastContainer.current.id = "chat-toast-container";
      toastContainer.current.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 10000;
        pointer-events: none;
      `;
      document.body.appendChild(toastContainer.current);
    }

    const toast = document.createElement("div");
    const messageText = message.length > 50 ? message.slice(0, 50) + "..." : message;
    
    toast.style.cssText = `
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      animation: slideInLeft 0.3s ease-out;
      pointer-events: auto;
      cursor: pointer;
      transition: opacity 0.3s ease;
      direction: rtl;
    `;
    
    toast.innerHTML = `
      <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
        ${sender.name || 'משתמש'}
      </div>
      <div style="font-size: 12px; color: #6b7280;">
        ${messageText}
      </div>
    `;

    // Add click handler to open chat
    toast.onclick = () => {
      // Emit event for components to handle
      window.dispatchEvent(new CustomEvent('openChat', { 
        detail: { userId: sender._id || sender.senderId, user: sender }
      }));
      toast.remove();
    };

    toastContainer.current.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 4000);
  }, []);

  // Socket event handlers
  const handleMessageReceived = useCallback((message) => {
    // Update recent chats
    loadRecentChats(true);
    
    // Add notification if not already present
    const existingNotification = notifications.find(n => n.senderId === message.senderId._id);
    if (!existingNotification) {
      addNotification({
        senderId: message.senderId._id,
        senderName: message.senderId.name,
        senderAvatar: message.senderId.profilePicture,
        content: message.content
      });
    }

    // Show toast notification
    showToast(message.content, message.senderId);
  }, [loadRecentChats, notifications, addNotification, showToast]);

  const handleNotificationReceived = useCallback((notification) => {
    addNotification(notification);
    showToast(notification.content, {
      _id: notification.senderId,
      name: notification.senderName,
      profilePicture: notification.senderAvatar
    });
  }, [addNotification, showToast]);

  // Socket connection management
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const initializeSocket = async () => {
      try {
        await socketService.connect(token);
        setIsSocketConnected(true);
        
        // Set up event listeners
        socketService.on('message_received', handleMessageReceived);
        socketService.on('notification_received', handleNotificationReceived);
        
        // Monitor connection status
        const checkConnection = () => {
          setIsSocketConnected(socketService.isSocketConnected());
        };
        
        const connectionInterval = setInterval(checkConnection, 5000);
        
        return () => {
          clearInterval(connectionInterval);
        };
        
      } catch (error) {
        console.error("Failed to initialize socket:", error);
        setIsSocketConnected(false);
      }
    };

    const cleanup = initializeSocket();

    return () => {
      socketService.off('message_received', handleMessageReceived);
      socketService.off('notification_received', handleNotificationReceived);
      cleanup?.then?.(fn => fn?.());
    };
  }, [handleMessageReceived, handleNotificationReceived]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all notification timeouts
      notificationTimeouts.current.forEach(timeout => clearTimeout(timeout));
      notificationTimeouts.current.clear();
      
      // Remove toast container
      if (toastContainer.current && toastContainer.current.parentNode) {
        toastContainer.current.parentNode.removeChild(toastContainer.current);
      }
    };
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    notifications,
    unreadCount,
    recentChats,
    recentChatsLoading,
    isSocketConnected,
    loadRecentChats,
    markAsRead,
    clearNotification,
    addNotification,
    showToast
  }), [
    notifications,
    unreadCount,
    recentChats,
    recentChatsLoading,
    isSocketConnected,
    loadRecentChats,
    markAsRead,
    clearNotification,
    addNotification,
    showToast
  ]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInLeft {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);