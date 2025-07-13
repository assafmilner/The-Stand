import { useRef, useCallback } from 'react';
import api from '../utils/api';

const globalChatCache = {
  chatHistories: new Map(),
  recentChats: null,
  lastRecentChatsLoad: null,
  listeners: new Map(),
};

export const useSharedChatCache = () => {
  const cacheRef = useRef(globalChatCache);

  const notifyListeners = useCallback((userId) => {
    const set = cacheRef.current.listeners.get(userId);
    if (set) {
      for (const cb of set) cb(cacheRef.current.chatHistories.get(userId) || []);
    }
  }, []);

  const subscribeToUserMessages = useCallback((userId, callback) => {
    if (!cacheRef.current.listeners.has(userId)) {
      cacheRef.current.listeners.set(userId, new Set());
    }
    cacheRef.current.listeners.get(userId).add(callback);

    return () => {
      cacheRef.current.listeners.get(userId)?.delete(callback);
    };
  }, []);

  const getCachedChatHistory = useCallback((userId) => {
    return cacheRef.current.chatHistories.get(userId);
  }, []);

  const loadChatHistory = useCallback(async (userId, forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = cacheRef.current.chatHistories.get(userId);
      if (cached) return { data: cached, fromCache: true };
    }

    try {
      const res = await api.get(`/api/messages/history/${userId}`);
      if (res.data.success) {
        const messages = res.data.messages || [];
        cacheRef.current.chatHistories.set(userId, messages);
        notifyListeners(userId); // ✅
        return { data: messages, fromCache: false };
      }
      return { data: [], fromCache: false };
    } catch (err) {
      console.error('Failed to load chat history:', err);
      return { data: [], fromCache: false };
    }
  }, [notifyListeners]);

  const addMessageToCache = useCallback((userId, message) => {
    const existing = cacheRef.current.chatHistories.get(userId) || [];
    const exists = existing.find((m) => m._id === message._id);
    if (exists) return existing;

    const updated = [...existing, message].sort((a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt)
    );
    cacheRef.current.chatHistories.set(userId, updated);
    notifyListeners(userId); // ✅
    return updated;
  }, [notifyListeners]);

  const getCachedRecentChats = useCallback(() => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (
      cacheRef.current.recentChats &&
      cacheRef.current.lastRecentChatsLoad > fiveMinutesAgo
    ) {
      return { data: cacheRef.current.recentChats, fromCache: true };
    }
    return null;
  }, []);

  const loadRecentChats = useCallback(async () => {
    const cached = getCachedRecentChats();
    if (cached) return cached;

    try {
      const res = await api.get('/api/messages/recent');
      if (res.data.success) {
        const chats = res.data.recentChats || [];
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

  const invalidateRecentChats = useCallback(() => {
    cacheRef.current.recentChats = null;
    cacheRef.current.lastRecentChatsLoad = null;
  }, []);

  const clearChatCache = useCallback((userId) => {
    cacheRef.current.chatHistories.delete(userId);
  }, []);

  const clearAllCache = useCallback(() => {
    cacheRef.current.chatHistories.clear();
    cacheRef.current.recentChats = null;
    cacheRef.current.lastRecentChatsLoad = null;
    cacheRef.current.listeners.clear();
  }, []);

  const getCacheStats = useCallback(() => {
    return {
      cachedChats: cacheRef.current.chatHistories.size,
      hasRecentChats: !!cacheRef.current.recentChats,
      recentChatsAge: cacheRef.current.lastRecentChatsLoad
        ? Date.now() - cacheRef.current.lastRecentChatsLoad
        : null,
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
    getCacheStats,
    subscribeToUserMessages,
  };
};
