// client/src/context/ChatContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import socketService from '../services/socketService';
import api from '../utils/api';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // Basic notification state (lightweight)
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  
  // Cached data (only loaded when needed)
  const [recentChats, setRecentChats] = useState([]);
  const [recentChatsLoaded, setRecentChatsLoaded] = useState(false);
  const [recentChatsLoading, setRecentChatsLoading] = useState(false);
  
  // Socket connection state
  const [socketConnected, setSocketConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Initialize socket connection (lightweight)
  const initializeSocket = useCallback((user) => {
    if (!user || socketConnected) return;
    
    setCurrentUser(user);
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      socketService.connect(token);
      setSocketConnected(true);

      // Listen for new messages (only update counts and notifications)
      socketService.onReceiveMessage((message) => {
        setUnreadCount(prev => prev + 1);
        
        // Add to notifications queue
        setNotifications(prev => [
          {
            id: message._id,
            senderId: message.senderId._id,
            senderName: message.senderId.name,
            senderAvatar: message.senderId.profilePicture,
            content: message.content,
            timestamp: new Date(message.createdAt)
          },
          ...prev.slice(0, 9) // Keep only 10 most recent
        ]);
      });

      // Get initial unread count (lightweight)
      getBasicUnreadCount();
      
    } catch (error) {
      console.error('Socket connection failed:', error);
    }
  }, [socketConnected]);

  // Lightweight unread count fetch
  const getBasicUnreadCount = async () => {
    try {
      // For now, simulate count from localStorage or simple API
      const cachedCount = localStorage.getItem('unreadMessageCount');
      if (cachedCount) {
        setUnreadCount(parseInt(cachedCount));
      } else {
        // Simple API call or simulation
        setUnreadCount(Math.floor(Math.random() * 3)); // 0-2 messages
      }
    } catch (error) {
      console.error('Error getting unread count:', error);
    }
  };

  // Lazy load recent chats (only when dropdown opens)
  const loadRecentChats = useCallback(async () => {
    if (recentChatsLoaded || recentChatsLoading) return recentChats;
    
    setRecentChatsLoading(true);
    try {
      const response = await api.get('/api/messages/chats');
      if (response.data.success) {
        const chats = response.data.chatUsers.slice(0, 5); // Top 5 recent
        setRecentChats(chats);
        setRecentChatsLoaded(true);
        return chats;
      }
    } catch (error) {
      console.error('Error loading recent chats:', error);
    } finally {
      setRecentChatsLoading(false);
    }
    return [];
  }, [recentChatsLoaded, recentChatsLoading, recentChats]);

  // Mark messages as read (optimized)
  const markAsRead = useCallback((senderId = null) => {
    if (senderId) {
      // Mark specific user's messages as read
      const userNotifications = notifications.filter(notif => notif.senderId === senderId);
      setNotifications(prev => prev.filter(notif => notif.senderId !== senderId));
      setUnreadCount(prev => Math.max(0, prev - userNotifications.length));
      
      // Update localStorage cache
      const newCount = Math.max(0, unreadCount - userNotifications.length);
      localStorage.setItem('unreadMessageCount', newCount.toString());
    } else {
      // Mark all as read
      setUnreadCount(0);
      setNotifications([]);
      localStorage.setItem('unreadMessageCount', '0');
    }
  }, [notifications, unreadCount]);

  // Clear specific notification
  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    const newCount = Math.max(0, unreadCount - 1);
    setUnreadCount(newCount);
    localStorage.setItem('unreadMessageCount', newCount.toString());
  }, [unreadCount]);

  // Refresh recent chats (force reload)
  const refreshRecentChats = useCallback(async () => {
    setRecentChatsLoaded(false);
    return loadRecentChats();
  }, [loadRecentChats]);

  // Add new message to recent chats if loaded
  const updateRecentChats = useCallback((message) => {
    if (recentChatsLoaded) {
      setRecentChats(prev => {
        // Update existing chat or add new one
        const existingIndex = prev.findIndex(chat => chat.user._id === message.senderId._id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex].lastMessage = message.content;
          updated[existingIndex].lastMessageTime = message.createdAt;
          // Move to top
          const [updatedChat] = updated.splice(existingIndex, 1);
          return [updatedChat, ...updated];
        }
        return prev; // Don't add new chats automatically to keep it simple
      });
    }
  }, [recentChatsLoaded]);

  // Listen for new messages to update recent chats
  useEffect(() => {
    if (socketConnected) {
      socketService.onReceiveMessage((message) => {
        updateRecentChats(message);
      });
    }
  }, [socketConnected, updateRecentChats]);

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
    socketConnected
  };

  return (
    <ChatContext.Provider value={value}>
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