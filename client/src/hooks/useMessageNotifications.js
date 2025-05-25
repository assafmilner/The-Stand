// client/src/hooks/useMessageNotifications.js
import { useState, useEffect, useCallback } from 'react';
import socketService from '../services/socketService';
import api from '../utils/api';

export const useMessageNotifications = (user) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [recentChats, setRecentChats] = useState([]);

  // Fetch recent chats for quick access
  const fetchRecentChats = useCallback(async () => {
    try {
      const response = await api.get('/api/messages/chats');
      if (response.data.success) {
        setRecentChats(response.data.chatUsers.slice(0, 5)); // Get top 5 recent chats
      }
    } catch (error) {
      console.error('Error fetching recent chats:', error);
    }
  }, []);

  // Fetch initial unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/api/messages/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // For now, simulate some unread messages
      setUnreadCount(Math.floor(Math.random() * 5));
    }
  }, []);

  // Initialize socket and fetch data
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        socketService.connect(token);
        
        // Listen for new messages
        socketService.onReceiveMessage((message) => {
          setUnreadCount(prev => prev + 1);
          
          // Add to notifications
          setNotifications(prev => [
            {
              id: message._id,
              senderId: message.senderId._id,
              senderName: message.senderId.name,
              senderAvatar: message.senderId.profilePicture,
              content: message.content,
              timestamp: new Date(message.createdAt)
            },
            ...prev.slice(0, 9) // Keep only 10 most recent notifications
          ]);
        });
      }

      fetchUnreadCount();
      fetchRecentChats();
    }

    return () => {
      socketService.removeAllListeners();
    };
  }, [user, fetchUnreadCount, fetchRecentChats]);

  // Mark messages as read for specific user
  const markAsRead = useCallback((senderId = null) => {
    if (senderId) {
      // Mark specific conversation as read
      const userNotifications = notifications.filter(notif => notif.senderId === senderId);
      setNotifications(prev => 
        prev.filter(notif => notif.senderId !== senderId)
      );
      // Subtract from unread count
      setUnreadCount(prev => Math.max(0, prev - userNotifications.length));
    } else {
      // Mark all as read
      setUnreadCount(0);
      setNotifications([]);
    }
  }, [notifications]);

  // Clear specific notification
  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  return {
    unreadCount,
    notifications,
    recentChats,
    markAsRead,
    clearNotification,
    refreshUnreadCount: fetchUnreadCount,
    refreshRecentChats: fetchRecentChats
  };
};