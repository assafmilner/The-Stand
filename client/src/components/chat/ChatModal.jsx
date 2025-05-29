// client/src/components/chat/ChatModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import { X, Send, Minimize2, Maximize2 } from "lucide-react";
import { useUser } from "../../context/UserContext";
import teamColors from "../../utils/teamStyles";
import socketService from "../../services/socketService";
import { useSharedChatCache } from "../../hooks/useSharedChatCache";

const ChatModal = ({ isOpen, onClose, otherUser, onMarkAsRead }) => {
  const { user } = useUser();
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { loadChatHistory, addMessageToCache, invalidateRecentChats } =
    useSharedChatCache();

  const colors = useMemo(
    () => teamColors[user?.favoriteTeam || "הפועל תל אביב"],
    [user?.favoriteTeam]
  );

  // Load chat history when modal opens
  useEffect(() => {
    if (!isOpen || !otherUser?._id) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoading(true);
      try {
        // 🔥 כריח טעינה מהשרת (לא מקאש) כדי לקבל הודעות חדשות
        const result = await loadChatHistory(otherUser._id, true); // forceRefresh = true
        setMessages(result.data);

        onMarkAsRead?.(otherUser._id);
      } catch (err) {
        console.error("Failed to load chat:", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [isOpen, otherUser?._id, loadChatHistory, onMarkAsRead]);

  // Setup socket listeners
  useEffect(() => {
    if (!isOpen || !otherUser?._id) return;

    const token = localStorage.getItem("accessToken");
    if (token && !socketService.isSocketConnected()) {
      socketService.connect(token);
    }

    const handleReceiveMessage = (msg) => {
      if (msg.senderId._id === otherUser._id) {
        // Update cache and local state
        const updatedMessages = addMessageToCache(otherUser._id, msg);
        setMessages(updatedMessages);

        // Mark as read since chat is open
        onMarkAsRead?.(otherUser._id);

        // Invalidate recent chats to refresh the list
        invalidateRecentChats();

        // Auto scroll
        setTimeout(() => scrollToBottom(), 100);
      }
    };

    const handleMessageSent = (msg) => {
      if (msg.receiverId._id === otherUser._id) {
        console.log("Message sent confirmed:", msg.content);

        // החלף הודעה אופטימיסטית בהודעה אמיתית
        setMessages((prevMessages) => {
          // מצא את ההודעה האופטימיסטית
          const optimisticIndex = prevMessages.findIndex(
            (m) =>
              m.isOptimistic &&
              m.content === msg.content &&
              m.senderId._id === msg.senderId._id
          );

          if (optimisticIndex >= 0) {
            // החלף את האופטימיסטית באמיתית
            const newMessages = [...prevMessages];
            newMessages[optimisticIndex] = msg;
            return newMessages;
          } else {
            // fallback - השתמש ב-cache רגיל
            const updatedMessages = addMessageToCache(otherUser._id, msg);
            return updatedMessages;
          }
        });

        // Invalidate recent chats to refresh the list
        invalidateRecentChats();

        // Auto scroll
        setTimeout(() => scrollToBottom(), 100);
      }
    };

    const handleMessageError = (err) => {
      console.error("Message send error:", err);

      // הסר הודעות אופטימיסטיות שנכשלו
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => !msg.isOptimistic)
      );

      alert("שליחת ההודעה נכשלה - נסה שוב");
    };

    socketService.onReceiveMessage(handleReceiveMessage);
    socketService.onMessageSent(handleMessageSent);
    socketService.onMessageError(handleMessageError);

    return () => {
      socketService.removeAllListeners();
    };
  }, [
    isOpen,
    otherUser?._id,
    addMessageToCache,
    invalidateRecentChats,
    onMarkAsRead,
  ]);

  const sendMessage = () => {
    if (!newMessage.trim() || !otherUser?._id) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;

    // ✨ Optimistic Update - הוסף הודעה מיד
    const optimisticMessage = {
      _id: tempId,
      content: messageContent,
      senderId: { _id: user._id, name: user.name },
      receiverId: { _id: otherUser._id, name: otherUser.name },
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // הוסף מיד לצ'אט
    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);

    // נקה את השדה
    setNewMessage("");

    // שלח לשרת
    socketService.sendMessage(otherUser._id, messageContent);

    // Auto scroll
    setTimeout(() => scrollToBottom(), 100);

    // Timeout - הסר אחרי 10 שניות אם לא הגיע אישור
    setTimeout(() => {
      setMessages((prevMessages) => {
        const hasOptimistic = prevMessages.some(
          (msg) => msg._id === tempId && msg.isOptimistic
        );
        if (hasOptimistic) {
          console.log("Message timeout, removing optimistic message");
          return prevMessages.filter((msg) => msg._id !== tempId);
        }
        return prevMessages;
      });
    }, 10000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    const el = document.getElementById("chat-bottom-anchor");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Auto scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  if (!isOpen || !otherUser) return null;

  return (
    <div className="fixed inset-0 top-[72px] bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
          isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
        } flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center gap-3">
            <img
              src={otherUser.profilePicture || "/defaultProfilePic.png"}
              alt={otherUser.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
              {loading && (
                <span className="text-xs text-blue-600">טוען הודעות...</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {loading ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-2"></div>
                  <p>טוען הודעות...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Send size={32} className="mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">התחל שיחה!</p>
                  <p className="text-sm">שלח הודעה ראשונה ל{otherUser.name}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isOwn = message.senderId._id === user._id;
                    return (
                      <div
                        key={message._id || index}
                        className={`flex ${
                          isOwn ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm ${
                            isOwn
                              ? "text-white"
                              : "bg-white text-gray-800 border"
                          } ${message.isOptimistic ? "opacity-70" : ""}`}
                          style={{
                            backgroundColor: isOwn ? colors.primary : undefined,
                            borderRadius: isOwn
                              ? "20px 20px 6px 20px"
                              : "20px 20px 20px 6px",
                          }}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p
                              className={`text-xs ${
                                isOwn ? "text-white/70" : "text-gray-500"
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleTimeString(
                                "he-IL",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                            {/* אינדיקטור שליחה */}
                            {message.isOptimistic && (
                              <div className="flex items-center gap-1 mr-2">
                                <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
                                <span className="text-xs text-white/70">
                                  שולח...
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div id="chat-bottom-anchor" />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-3 items-end">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`שלח הודעה ל${otherUser.name}...`}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 resize-none"
                  style={{ focusRingColor: colors.primary }}
                  rows={1}
                  maxLength={500}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 rounded-full text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  style={{
                    backgroundColor: newMessage.trim()
                      ? colors.primary
                      : "#ccc",
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
