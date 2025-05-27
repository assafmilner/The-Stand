// client/src/hooks/useChatLogic.js
import { useState, useEffect, useCallback } from "react";
import socketService from "../services/socketService";
import { useSharedChatCache } from "./useSharedChatCache";

export default function useChatLogic({ user, otherUserId, isOpen, onMarkAsRead }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    loadChatHistory,
    addMessageToCache,
    invalidateRecentChats
  } = useSharedChatCache();

  // Load chat history with caching
  const loadMessages = useCallback(async () => {
    if (!otherUserId || !isOpen || loading) return;

    setLoading(true);
    try {
      const result = await loadChatHistory(otherUserId);
      setMessages(result.data);
      
      
      onMarkAsRead?.(otherUserId);
    } catch (err) {
      console.error("Failed to load chat history:", err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [otherUserId, isOpen, loading, loadChatHistory, onMarkAsRead]);

  // Send message function
  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !otherUserId) return;
    
    socketService.sendMessage(otherUserId, newMessage.trim());
    setNewMessage("");
  }, [newMessage, otherUserId]);

  // Auto scroll function
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      const el = document.getElementById("chat-bottom-anchor");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!isOpen || !otherUserId) return;

    const token = localStorage.getItem("accessToken");
    if (token && !socketService.isSocketConnected()) {
      socketService.connect(token);
    }

    const handleReceiveMessage = (msg) => {
      if (msg.senderId._id === otherUserId) {
        // Update cache and get updated messages
        const updatedMessages = addMessageToCache(otherUserId, msg);
        setMessages(updatedMessages);
        
        onMarkAsRead?.(otherUserId);
        invalidateRecentChats();
        scrollToBottom();
      }
    };

    const handleMessageSent = (msg) => {
      if (msg.receiverId._id === otherUserId) {
        // Update cache and get updated messages
        const updatedMessages = addMessageToCache(otherUserId, msg);
        setMessages(updatedMessages);
        
        invalidateRecentChats();
        scrollToBottom();
      }
    };

    const handleMessageError = (err) => {
      console.error("Message send error:", err);
      alert("שליחת ההודעה נכשלה");
    };

    socketService.onReceiveMessage(handleReceiveMessage);
    socketService.onMessageSent(handleMessageSent);
    socketService.onMessageError(handleMessageError);

    // Load messages when chat opens
    loadMessages();

    return () => {
      socketService.removeAllListeners();
    };
  }, [isOpen, otherUserId, onMarkAsRead, loadMessages, addMessageToCache, invalidateRecentChats, scrollToBottom]);

  // Reset when closing chat
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setNewMessage("");
      setLoading(false);
    }
  }, [isOpen]);

  // Auto scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  return {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    loading,
    scrollToBottom
  };
}