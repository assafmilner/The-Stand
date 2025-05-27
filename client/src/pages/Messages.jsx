// client/src/pages/Messages.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import Layout from "../components/layout/Layout";
import { useUser } from "../context/UserContext";
import teamColors from "../utils/teamStyles";
import { Send } from "lucide-react";
import api from "../utils/api";
import socketService from "../services/socketService";

const Messages = () => {
  const { user } = useUser();
  const [selectedUser, setSelectedUser] = useState(null);
  const [recentChats, setRecentChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  const chatCacheRef = useRef(new Map());
  const lastLoadedUserRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  const colors = useMemo(
    () => teamColors[user?.favoriteTeam || "הפועל תל אביב"],
    [user?.favoriteTeam]
  );

  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await api.get("/api/messages/recent");
        if (res.data.success) {
          setRecentChats(res.data.recentChats || []);
        }
      } catch (err) {
        console.error("Failed to load chats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      const userId = selectedUser._id;
      const cachedMessages = chatCacheRef.current.get(userId);
      if (cachedMessages) {
        setMessages(cachedMessages);
        lastLoadedUserRef.current = userId;
        scrollToBottom(false);
        return;
      }

      setChatLoading(true);
      try {
        const res = await api.get(`/api/messages/history/${userId}`);
        if (res.data.success) {
          const fetchedMessages = res.data.messages || [];
          chatCacheRef.current.set(userId, fetchedMessages);
          setMessages(fetchedMessages);
          lastLoadedUserRef.current = userId;
          scrollToBottom(false);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setChatLoading(false);
      }
    };

    loadMessages();
  }, [selectedUser?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const setupSocket = async () => {
      try {
        if (!socketService.isSocketConnected()) {
          await socketService.connect(token);
        }

        socketService.onReceiveMessage((msg) => {
          const senderId = msg.senderId._id;
          const cachedMessages = chatCacheRef.current.get(senderId) || [];
          chatCacheRef.current.set(senderId, [...cachedMessages, msg]);
          if (selectedUser && senderId === selectedUser._id) {
            setMessages((prev) => [...prev, msg]);
          }
        });

        socketService.onMessageSent((msg) => {
          const receiverId = msg.receiverId._id;
          const cachedMessages = chatCacheRef.current.get(receiverId) || [];
          chatCacheRef.current.set(receiverId, [...cachedMessages, msg]);
          if (selectedUser && receiverId === selectedUser._id) {
            setMessages((prev) => [...prev, msg]);
          }
        });
      } catch (err) {
        console.error("Socket setup failed:", err);
      }
    };

    setupSocket();

    return () => {
      socketService.removeAllListeners();
    };
  }, [selectedUser?._id]);

  const handleSelectUser = (chatUser) => {
    setSelectedUser(chatUser);
    setNewMessage("");
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;
    socketService.sendMessage(selectedUser._id, newMessage.trim());
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Layout>
      <div className="flex border rounded-xl overflow-hidden h-[80vh] bg-white shadow-md">
        <div className="w-1/3 p-4 border-l overflow-y-auto bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">שיחות</h2>

          {loading ? (
            <p className="text-gray-500">טוען שיחות...</p>
          ) : recentChats.length === 0 ? (
            <p className="text-gray-500">אין שיחות פעילות</p>
          ) : (
            recentChats.map((chat) => {
              const isSelected = selectedUser?._id === chat.user._id;
              return (
                <div
                  key={chat.user._id}
                  onClick={() => handleSelectUser(chat.user)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                    isSelected
                      ? "bg-blue-100 border border-blue-200"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <img
                    src={chat.user.profilePicture || "/defaultProfilePic.png"}
                    alt={chat.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block truncate">
                      {chat.user.name}
                    </span>
                    {chat.lastMessage && (
                      <span className="text-sm text-gray-500 block truncate">
                        {chat.lastMessage.slice(0, 40)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              <div className="flex items-center gap-3 p-4 border-b bg-white">
                <img
                  src={selectedUser.profilePicture || "/defaultProfilePic.png"}
                  alt={selectedUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {chatLoading ? (
                  <p className="text-center text-gray-400">טוען הודעות...</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-gray-400">
                    התחל שיחה עם {selectedUser.name}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, idx) => {
                      const isOwn = msg.senderId._id === user._id;
                      return (
                        <div
                          key={msg._id || idx}
                          className={`flex ${
                            isOwn ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] px-4 py-2 rounded-xl ${
                              isOwn
                                ? "text-white"
                                : "bg-white text-gray-900 border"
                            }`}
                            style={{
                              backgroundColor: isOwn
                                ? colors.primary
                                : undefined,
                            }}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs mt-1 text-right opacity-70">
                              {new Date(msg.createdAt).toLocaleTimeString(
                                "he-IL",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="כתוב הודעה..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2"
                    rows={1}
                    maxLength={500}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-3 rounded-xl text-white shadow-md transition-colors"
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
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Send size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">בחר שיחה מהרשימה</p>
                <p className="text-sm">התחל לשוחח עם אוהדים אחרים</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
