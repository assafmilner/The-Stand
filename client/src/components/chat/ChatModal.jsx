import React, { useState, useEffect, useRef } from "react";
import { X, Send, Minimize2, Maximize2 } from "lucide-react";
import api from "../../utils/api";
import socketService from "../../services/socketService";
import { useUser } from "../../context/UserContext";
import teamColors from "../../utils/teamStyles";

const ChatModal = ({ isOpen, onClose, otherUser, onMarkAsRead }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const colors = teamColors[user?.favoriteTeam || "הפועל תל אביב"];

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load chat history when modal opens
  useEffect(() => {
    if (isOpen && otherUser) {
      loadChatHistory();

      // Mark messages from this user as read
      if (onMarkAsRead && otherUser._id) {
        onMarkAsRead(otherUser._id);
      }

      // Connect socket if not connected
      const token = localStorage.getItem("accessToken");
      if (token) {
        socketService.connect(token);
      }

      // Set up socket listeners
      socketService.onReceiveMessage(handleReceiveMessage);
      socketService.onMessageSent(handleMessageSent);
      socketService.onMessageError(handleMessageError);
    }

    return () => {
      // Clean up socket listeners when modal closes
      socketService.removeAllListeners();
    };
  }, [isOpen, otherUser, onMarkAsRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/messages/history/${otherUser._id}`);
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveMessage = (message) => {
    // Only add message if it's from the current chat partner
    if (message.senderId._id === otherUser._id) {
      setMessages((prev) => [...prev, message]);
      // Also mark as read since the chat is open
      if (onMarkAsRead) {
        onMarkAsRead(otherUser._id);
      }
    }
  };

  const handleMessageSent = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleMessageError = (error) => {
    console.error("Message error:", error);
    alert("Failed to send message");
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    socketService.sendMessage(otherUser._id, newMessage.trim());
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return messageDate.toLocaleDateString("he-IL", {
        day: "numeric",
        month: "short",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
          isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
        } flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b relative"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}15, ${colors.primary}05)`,
            borderColor: `${colors.primary}20`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={
                  otherUser?.profilePicture ||
                  "http://localhost:3001/assets/defaultProfilePic.png"
                }
                alt={otherUser?.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{otherUser?.name}</h3>
              {isTyping && <p className="text-xs text-gray-500">מקליד...</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className=" p-1 rounded-lg  transition-colors"
            >
              {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            <button
              onClick={onClose}
              className=" p-1 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        {!isMinimized && (
          <>
            <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
              {loading ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                  <p>טוען הודעות...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${colors.primary}20` }}
                  >
                    <Send size={24} style={{ color: colors.primary }} />
                  </div>
                  <p className="font-medium">התחל שיחה!</p>
                  <p className="text-sm">שלח הודעה ראשונה ל{otherUser?.name}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isCurrentUser = message.senderId._id === user._id;
                    const showAvatar =
                      index === 0 ||
                      messages[index - 1].senderId._id !== message.senderId._id;

                    return (
                      <div
                        key={message._id || index}
                        className={`flex items-end gap-2 ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isCurrentUser && (
                          <img
                            src={
                              message.senderId.profilePicture ||
                              "http://localhost:3001/assets/defaultProfilePic.png"
                            }
                            alt={message.senderId.name}
                            className={`w-8 h-8 rounded-full object-cover transition-opacity ${
                              showAvatar ? "opacity-100" : "opacity-0"
                            }`}
                          />
                        )}

                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm ${
                            isCurrentUser
                              ? "text-white"
                              : "bg-white text-gray-800 border border-gray-100"
                          }`}
                          style={{
                            backgroundColor: isCurrentUser
                              ? colors.primary
                              : undefined,
                            borderRadius: isCurrentUser
                              ? "20px 20px 6px 20px"
                              : "20px 20px 20px 6px",
                          }}
                        >
                          <p className="text-sm leading-relaxed">
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isCurrentUser ? "text-white/70" : "text-gray-500"
                            }`}
                          >
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`שלח הודעה ל${otherUser?.name}...`}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 resize-none transition-all"
                    style={{
                      focusRingColor: colors.primary,
                      maxHeight: "120px",
                    }}
                    rows={1}
                    onInput={(e) => {
                      e.target.style.height = "auto";
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 120) + "px";
                    }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 rounded-full text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                  style={{
                    backgroundColor: newMessage.trim()
                      ? colors.primary
                      : "#ccc",
                    transform: newMessage.trim() ? "scale(1)" : "scale(0.95)",
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatModal;
