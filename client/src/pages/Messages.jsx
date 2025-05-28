// client/src/pages/Messages.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import Layout from "../components/layout/Layout";
import { useUser } from "../context/UserContext";
import teamColors from "../utils/teamStyles";
import { Send, Users, MessageCircle } from "lucide-react";
import api from "../utils/api";
import socketService from "../services/socketService";

const Messages = () => {
  const { user } = useUser();
  const [selectedUser, setSelectedUser] = useState(null);
  const [recentChats, setRecentChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  const chatCacheRef = useRef(new Map());
  const lastLoadedUserRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
        inline: "nearest",
      });
    }
  };

  const colors = useMemo(
    () => teamColors[user?.favoriteTeam || "הפועל תל אביב"],
    [user?.favoriteTeam]
  );

  // טעינת שיחות קיימות
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

  // טעינת רשימת חברים
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const res = await api.get("/api/friends");
        if (res.data.success) {
          setFriends(res.data.friends || []);
        }
      } catch (err) {
        console.error("Failed to load friends:", err);
      } finally {
        setFriendsLoading(false);
      }
    };

    loadFriends();
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

  // פונקציה לפתיחת שיחה עם חבר
  const handleSelectFriend = (friend) => {
    // החבר כבר במבנה הנכון: friend._id, friend.name, friend.profilePicture
    setSelectedUser(friend);
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

  // פילטר חברים שאינם כבר בשיחות קיימות
  const availableFriends = friends.filter(
    (friend) => !recentChats.some((chat) => chat.user._id === friend._id)
  );

  return (
    <Layout>
      <div className="flex border rounded-xl overflow-hidden h-[80vh] bg-white shadow-md">
        <div className="w-1/3 p-4 border-l overflow-y-auto bg-gray-50">
          {/* שיחות קיימות */}
          <h2 className="text-xl font-semibold mb-4">שיחות</h2>

          {loading ? (
            <p className="text-gray-500">טוען שיחות...</p>
          ) : recentChats.length === 0 ? (
            <p className="text-gray-500 mb-6">אין שיחות פעילות</p>
          ) : (
            <div className="mb-6">
              {recentChats.map((chat) => {
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
              })}
            </div>
          )}

          {/* רשימת חברים */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-700">
                החברים שלי
              </h3>
            </div>

            {friendsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center gap-3 p-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : availableFriends.length === 0 ? (
              <div className="text-center py-4">
                <MessageCircle
                  size={32}
                  className="mx-auto mb-2 text-gray-300"
                />
                <p className="text-gray-500 text-sm">
                  {friends.length === 0
                    ? "אין לך חברים עדיין"
                    : "כל החברים כבר בשיחות פעילות"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableFriends.map((friend) => {
                  const isSelected = selectedUser?._id === friend._id;
                  return (
                    <div
                      key={friend._id}
                      onClick={() => handleSelectFriend(friend)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors group ${
                        isSelected
                          ? "bg-blue-100 border border-blue-200"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={
                            friend.profilePicture || "/defaultProfilePic.png"
                          }
                          alt={friend.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-gray-300 transition-colors"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block truncate text-sm text-gray-900">
                          {friend.name}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span className="truncate">
                            {friend.favoriteTeam}
                          </span>
                          {friend.location && (
                            <>
                              <span>•</span>
                              <span>{friend.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  {selectedUser.favoriteTeam && (
                    <p className="text-sm text-gray-500">
                      אוהד {selectedUser.favoriteTeam}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {chatLoading ? (
                  <p className="text-center text-gray-400">טוען הודעות...</p>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <MessageCircle
                      size={48}
                      className="mx-auto mb-4 text-gray-300"
                    />
                    <p className="text-lg">התחל שיחה עם {selectedUser.name}</p>
                    <p className="text-sm">שלח הודעה ראשונה כדי להתחיל לשוחח</p>
                  </div>
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
                    placeholder={`כתוב הודעה ל${selectedUser.name}...`}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={1}
                    maxLength={500}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-3 rounded-xl text-white shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <p className="text-lg font-medium">בחר שיחה או חבר מהרשימה</p>
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
