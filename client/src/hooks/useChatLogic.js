import { useState, useEffect, useCallback } from "react";
import socketService from "../services/socketService";
import { useSharedChatCache } from "./useSharedChatCache";

/**
 * useChatLogic
 *
 * Custom React hook for managing real-time chat logic between two users.
 * Features:
 * - Socket.io integration for sending and receiving messages
 * - Caches chat history using shared chat cache
 * - Handles scroll behavior and error states
 *
 * Params:
 * @param {Object} user - current logged-in user
 * @param {string} otherUserId - ID of the user on the other side of the chat
 * @param {boolean} isOpen - whether the chat is currently visible
 * @param {function} onMarkAsRead - callback to mark messages as read
 */
export default function useChatLogic({
  user,
  otherUserId,
  isOpen,
  onMarkAsRead,
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { loadChatHistory, addMessageToCache, invalidateRecentChats } =
    useSharedChatCache();

  /**
   * loadMessages
   *
   * Loads the chat history from cache or server.
   * Prevents duplicate loads when already loading.
   */
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

  /**
   * sendMessage
   *
   * Sends a trimmed message via socket.
   */
  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !otherUserId) return;
    socketService.sendMessage(otherUserId, newMessage.trim());
    setNewMessage("");
  }, [newMessage, otherUserId]);

  /**
   * scrollToBottom
   *
   * Scrolls chat window to latest message using a DOM anchor.
   */
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      const el = document.getElementById("chat-bottom-anchor");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  /**
   * useEffect: Socket setup and listeners
   *
   * Registers socket events:
   * - onReceiveMessage
   * - onMessageSent
   * - onMessageError
   *
   * Cleans up listeners on unmount.
   */
  useEffect(() => {
    if (!isOpen || !otherUserId) return;

    const token = localStorage.getItem("accessToken");
    if (token && !socketService.isSocketConnected()) {
      socketService.connect(token);
    }

    const handleReceiveMessage = (msg) => {
      if (msg.senderId._id === otherUserId) {
        const updatedMessages = addMessageToCache(otherUserId, msg);
        setMessages(updatedMessages);
        onMarkAsRead?.(otherUserId);
        invalidateRecentChats();
        scrollToBottom();
      }
    };

    const handleMessageSent = (msg) => {
      if (msg.receiverId._id === otherUserId) {
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

    loadMessages();

    return () => {
      socketService.removeAllListeners();
    };
  }, [
    isOpen,
    otherUserId,
    onMarkAsRead,
    loadMessages,
    addMessageToCache,
    invalidateRecentChats,
    scrollToBottom,
  ]);

  /**
   * useEffect: Reset state when chat closes
   */
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setNewMessage("");
      setLoading(false);
    }
  }, [isOpen]);

  /**
   * useEffect: Scroll to bottom on message update
   */
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
    scrollToBottom,
  };
}
