// client/src/hooks/useChatLogic.js - OPTIMIZED VERSION
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import socketService from "../services/socketService";
import api from "../utils/api";

// Message cache to prevent duplicate API calls
const messageCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function useChatLogic({ user, otherUserId, isOpen, onMarkAsRead }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Refs for cleanup and state management
  const abortControllerRef = useRef(null);
  const isInitializedRef = useRef(false);
  const messagesRef = useRef([]);
  const scrollTimeoutRef = useRef(null);
  const lastMessageCountRef = useRef(0);

  // Keep messages ref in sync for socket callbacks
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Memoized cache key
  const cacheKey = useMemo(() => 
    otherUserId ? `chat_${user?.id || user?._id}_${otherUserId}` : null, 
    [user, otherUserId]
  );

  // Debounced scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      const element = document.getElementById("chat-bottom-anchor");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }, 100);
  }, []);

  // Optimized message loading with caching
  const loadChatHistory = useCallback(async () => {
    if (!otherUserId || !isOpen || loading) return;

    // Check cache first
    if (cacheKey && messageCache.has(cacheKey)) {
      const cached = messageCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        setMessages(cached.data);
        onMarkAsRead?.(otherUserId);
        return;
      }
      messageCache.delete(cacheKey);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/messages/history/${otherUserId}`, {
        signal: abortControllerRef.current.signal
      });

      if (response.data.success) {
        const newMessages = response.data.messages || [];
        setMessages(newMessages);
        
        // Cache the result
        if (cacheKey) {
          messageCache.set(cacheKey, {
            data: newMessages,
            timestamp: Date.now()
          });
        }

        onMarkAsRead?.(otherUserId);
        
        // Scroll to bottom if new messages
        if (newMessages.length !== lastMessageCountRef.current) {
          lastMessageCountRef.current = newMessages.length;
          scrollToBottom();
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Failed to load chat history:", err);
        setError("Failed to load messages");
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [otherUserId, isOpen, loading, cacheKey, onMarkAsRead, scrollToBottom]);

  // Optimized message sending
  const sendMessage = useCallback(async () => {
    const content = newMessage.trim();
    if (!content || !otherUserId || !socketService.isSocketConnected()) return;

    const tempId = socketService.sendMessage(otherUserId, content);
    
    // Optimistic update
    const optimisticMessage = {
      _id: tempId,
      content,
      senderId: { _id: user?.id || user?._id, name: user?.name },
      receiverId: { _id: otherUserId },
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage("");
    scrollToBottom();

    // Clear cache to force refresh on next load
    if (cacheKey) {
      messageCache.delete(cacheKey);
    }
  }, [newMessage, otherUserId, user, scrollToBottom, cacheKey]);

  // Socket event handlers with proper cleanup
  const handleMessageReceived = useCallback((message) => {
    if (message.senderId._id === otherUserId || message.receiverId._id === otherUserId) {
      setMessages(prev => {
        // Remove any optimistic message that matches
        const filtered = prev.filter(m => !m.isOptimistic || m.content !== message.content);
        return [...filtered, message];
      });
      
      if (onMarkAsRead && isOpen && message.senderId._id === otherUserId) {
        onMarkAsRead(otherUserId);
      }
      
      scrollToBottom();
      
      // Update cache
      if (cacheKey) {
        messageCache.delete(cacheKey);
      }
    }
  }, [otherUserId, isOpen, onMarkAsRead, scrollToBottom, cacheKey]);

  const handleMessageSentConfirmed = useCallback((message) => {
    setMessages(prev => {
      // Replace optimistic message with confirmed one
      return prev.map(m => 
        m.isOptimistic && m.content === message.content ? message : m
      );
    });
    
    // Update cache
    if (cacheKey) {
      messageCache.delete(cacheKey);
    }
  }, [cacheKey]);

  const handleMessageError = useCallback((error) => {
    console.error("Message send error:", error);
    setError("Failed to send message");
    
    // Remove failed optimistic messages
    setMessages(prev => prev.filter(m => !m.isOptimistic));
  }, []);

  const handleConnectionStatus = useCallback((status) => {
    setIsConnected(status);
  }, []);

  // Socket connection and event setup
  useEffect(() => {
    if (!isOpen || !otherUserId) {
      setMessages([]);
      isInitializedRef.current = false;
      return;
    }

    const initializeChat = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        // Connect socket if not connected
        if (!socketService.isSocketConnected()) {
          await socketService.connect(token);
        }

        // Set up event listeners
        socketService.on('message_received', handleMessageReceived);
        socketService.on('message_sent_confirmed', handleMessageSentConfirmed);
        socketService.on('message_send_error', handleMessageError);
        
        setIsConnected(socketService.isSocketConnected());

        // Load chat history
        if (!isInitializedRef.current) {
          await loadChatHistory();
          isInitializedRef.current = true;
        }

      } catch (error) {
        console.error("Failed to initialize chat:", error);
        setError("Failed to connect to chat");
      }
    };

    initializeChat();

    // Cleanup function
    return () => {
      socketService.off('message_received', handleMessageReceived);
      socketService.off('message_sent_confirmed', handleMessageSentConfirmed);
      socketService.off('message_send_error', handleMessageError);
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isOpen, otherUserId, handleMessageReceived, handleMessageSentConfirmed, handleMessageError, loadChatHistory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Clear error after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    loading,
    error,
    isConnected,
    scrollToBottom,
    reloadHistory: loadChatHistory
  };
}

// Cache cleanup utility
export const clearMessageCache = () => {
  messageCache.clear();
};