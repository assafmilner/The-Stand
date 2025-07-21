import { useRef, useCallback } from "react";
import api from "../utils/api";

const globalChatCache = {
  chatHistories: new Map(),
  recentChats: null,
  lastRecentChatsLoad: null,
  listeners: new Map(),
};

/**
 * useSharedChatCache
 *
 * Custom hook that exposes a global chat cache.
 * Handles caching of chat history, recent chats, and listeners for real-time updates.
 *
 * Useful for performance optimization and consistent messaging state across components.
 */
export const useSharedChatCache = () => {
  const cacheRef = useRef(globalChatCache);

  /**
   * notifyListeners
   *
   * Notifies subscribed components about new messages for a given userId.
   */
  const notifyListeners = useCallback((userId) => {
    const set = cacheRef.current.listeners.get(userId);
    if (set) {
      for (const cb of set)
        cb(cacheRef.current.chatHistories.get(userId) || []);
    }
  }, []);

  /**
   * subscribeToUserMessages
   *
   * Allows components to subscribe to updates on specific userId chat history.
   * Returns an unsubscribe function.
   */
  const subscribeToUserMessages = useCallback((userId, callback) => {
    if (!cacheRef.current.listeners.has(userId)) {
      cacheRef.current.listeners.set(userId, new Set());
    }
    cacheRef.current.listeners.get(userId).add(callback);

    return () => {
      cacheRef.current.listeners.get(userId)?.delete(callback);
    };
  }, []);

  /**
   * getCachedChatHistory
   *
   * Returns chat messages from cache for a specific user.
   */
  const getCachedChatHistory = useCallback((userId) => {
    return cacheRef.current.chatHistories.get(userId);
  }, []);

  /**
   * loadChatHistory
   *
   * Loads chat history from server, caches it, and notifies listeners.
   * Returns cached data if already present unless forceRefresh is true.
   */
  const loadChatHistory = useCallback(
    async (userId, forceRefresh = false) => {
      if (!forceRefresh) {
        const cached = cacheRef.current.chatHistories.get(userId);
        if (cached) return { data: cached, fromCache: true };
      }

      try {
        const res = await api.get(`/api/messages/history/${userId}`);
        if (res.data.success) {
          const messages = res.data.messages || [];
          cacheRef.current.chatHistories.set(userId, messages);
          notifyListeners(userId);
          return { data: messages, fromCache: false };
        }
        return { data: [], fromCache: false };
      } catch (err) {
        console.error("Failed to load chat history:", err);
        return { data: [], fromCache: false };
      }
    },
    [notifyListeners]
  );

  /**
   * addMessageToCache
   *
   * Adds a message to the user's chat history and notifies listeners.
   * Avoids duplicates.
   */
  const addMessageToCache = useCallback(
    (userId, message) => {
      const existing = cacheRef.current.chatHistories.get(userId) || [];
      const exists = existing.find((m) => m._id === message._id);
      if (exists) return existing;

      const updated = [...existing, message].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      cacheRef.current.chatHistories.set(userId, updated);
      notifyListeners(userId);
      return updated;
    },
    [notifyListeners]
  );

  /**
   * getCachedRecentChats
   *
   * Returns recent chats from cache if still fresh (under 5 minutes old).
   */
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

  /**
   * loadRecentChats
   *
   * Loads recent chats from server and caches them.
   */
  const loadRecentChats = useCallback(async () => {
    const cached = getCachedRecentChats();
    if (cached) return cached;

    try {
      const res = await api.get("/api/messages/recent");
      if (res.data.success) {
        const chats = res.data.recentChats || [];
        cacheRef.current.recentChats = chats;
        cacheRef.current.lastRecentChatsLoad = Date.now();
        return { data: chats, fromCache: false };
      }
      return { data: [], fromCache: false };
    } catch (err) {
      console.error("Failed to load recent chats:", err);
      return { data: [], fromCache: false };
    }
  }, [getCachedRecentChats]);

  /**
   * invalidateRecentChats
   *
   * Clears recent chats from cache (will be re-fetched next time).
   */
  const invalidateRecentChats = useCallback(() => {
    cacheRef.current.recentChats = null;
    cacheRef.current.lastRecentChatsLoad = null;
  }, []);

  /**
   * clearChatCache
   *
   * Clears chat history for a specific user from the cache.
   */
  const clearChatCache = useCallback((userId) => {
    cacheRef.current.chatHistories.delete(userId);
  }, []);

  /**
   * clearAllCache
   *
   * Clears all cached data (chat history, recent chats, listeners).
   */
  const clearAllCache = useCallback(() => {
    cacheRef.current.chatHistories.clear();
    cacheRef.current.recentChats = null;
    cacheRef.current.lastRecentChatsLoad = null;
    cacheRef.current.listeners.clear();
  }, []);

  /**
   * getCacheStats
   *
   * Returns debug info on cache size and recent chat freshness.
   */
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
