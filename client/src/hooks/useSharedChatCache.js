// client/src/hooks/useSharedChatCache.js
import { useRef, useCallback } from 'react';
import api from '../utils/api';

// Singleton cache that persists across all components
const globalChatCache = {
  chatHistories: new Map(), // userId -> messages[]
  recentChats: null,        // cached recent chats
  lastRecentChatsLoad: null // timestamp of last load
};

export const useSharedChatCache = () => {
  const cacheRef = useRef(globalChatCache);

  // Get cached chat history
  const getCachedChatHistory = useCallback((userId) => {
    return cacheRef.current.chatHistories.get(userId);
  }, []);

  // Load chat history with caching
  const loadChatHistory = useCallback(async (userId) => {
    // Check cache first
    const cached = cacheRef.current.chatHistories.get(userId);
    if (cached) {

      return { data: cached, fromCache: true };
    }

    // Load from API
    try {

      const res = await api.get(`/api/messages/history/${userId}`);
      if (res.data.success) {
        const messages = res.data.messages || [];
        // Store in cache
        cacheRef.current.chatHistories.set(userId, messages);
        return { data: messages, fromCache: false };
      }
      return { data: [], fromCache: false };
    } catch (err) {
      console.error('Failed to load chat history:', err);
      return { data: [], fromCache: false };
    }
  }, []);

  // Add message to cache and return updated messages
  const addMessageToCache = useCallback((userId, message) => {
    const existing = cacheRef.current.chatHistories.get(userId) || [];
    const updated = [...existing, message];
    cacheRef.current.chatHistories.set(userId, updated);

    return updated;
  }, []);

  // Get cached recent chats
  const getCachedRecentChats = useCallback(() => {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    if (cacheRef.current.recentChats && 
        cacheRef.current.lastRecentChatsLoad > fiveMinutesAgo) {

      return { data: cacheRef.current.recentChats, fromCache: true };
    }
    return null;
  }, []);

  // Load recent chats with caching
  const loadRecentChats = useCallback(async () => {
    // Check cache first
    const cached = getCachedRecentChats();
    if (cached) {
      return cached;
    }

    // Load from API
    try {

      const res = await api.get('/api/messages/recent');
      if (res.data.success) {
        const chats = res.data.recentChats || [];
        // Store in cache
        cacheRef.current.recentChats = chats;
        cacheRef.current.lastRecentChatsLoad = Date.now();
        return { data: chats, fromCache: false };
      }
      return { data: [], fromCache: false };
    } catch (err) {
      console.error('Failed to load recent chats:', err);
      return { data: [], fromCache: false };
    }
  }, [getCachedRecentChats]);

  // Invalidate recent chats cache (when new message arrives)
  const invalidateRecentChats = useCallback(() => {
    cacheRef.current.recentChats = null;
    cacheRef.current.lastRecentChatsLoad = null;

  }, []);

  // Clear specific chat cache
  const clearChatCache = useCallback((userId) => {
    cacheRef.current.chatHistories.delete(userId);

  }, []);

  // Clear all cache
  const clearAllCache = useCallback(() => {
    cacheRef.current.chatHistories.clear();
    cacheRef.current.recentChats = null;
    cacheRef.current.lastRecentChatsLoad = null;

  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    return {
      cachedChats: cacheRef.current.chatHistories.size,
      hasRecentChats: !!cacheRef.current.recentChats,
      recentChatsAge: cacheRef.current.lastRecentChatsLoad 
        ? Date.now() - cacheRef.current.lastRecentChatsLoad 
        : null
    };
  }, []);

  return {
    getCachedChatHistory,
    loadChatHistory,
    addMessageToCache,
    getCachedRecentChats,
    loadRecentChats,
    invalidateRecentChats,
    clearChatCache,
    clearAllCache,
    getCacheStats
  };
};