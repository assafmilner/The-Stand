// client/src/pages/Messages.js - OPTIMIZED VERSION
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Layout from "../components/layout/Layout";
import { useUser } from "../context/UserContext";
import { useChat } from "../context/ChatContext";
import useChatLogic from "../hooks/useChatLogic";
import teamColors from "../utils/teamStyles";
import { Send, Search, MoreVertical, Phone, Video } from "lucide-react";

// Memoized chat list item to prevent unnecessary re-renders
const ChatListItem = React.memo(({ 
  chat, 
  isSelected, 
  isUnread, 
  onClick 
}) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 
      ${isSelected ? "bg-blue-50 border-l-4 border-blue-500" : isUnread ? "bg-yellow-50" : ""} 
      hover:bg-gray-100 hover:shadow-sm`}
  >
    <div className="relative">
      <img
        src={chat.user.profilePicture || "/defaultProfilePic.png"}
        alt={chat.user.name}
        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
        loading="lazy"
      />
      {isUnread && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white animate-pulse" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-gray-900 truncate">{chat.user.name}</span>
        {chat.lastMessageTime && (
          <span className="text-xs text-gray-500 flex-shrink-0">
            {formatMessageTime(chat.lastMessageTime)}
          </span>
        )}
      </div>
      {chat.lastMessage && (
        <p className="text-sm text-gray-600 truncate">
          {chat.lastMessage.length > 40 ? chat.lastMessage.slice(0, 40) + "..." : chat.lastMessage}
        </p>
      )}
    </div>
  </div>
));

// Memoized message bubble to prevent unnecessary re-renders
const MessageBubble = React.memo(({ 
  message, 
  isOwn, 
  showAvatar, 
  colors 
}) => (
  <div
    className={`flex items-end gap-2 mb-4 ${
      isOwn ? "justify-end" : "justify-start"
    }`}
  >
    {!isOwn && (
      <img
        src={message.senderId.profilePicture || "/defaultProfilePic.png"}
        alt={message.senderId.name}
        className={`w-8 h-8 rounded-full object-cover transition-opacity ${
          showAvatar ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
      />
    )}
    
    <div
      className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
        isOwn
          ? "text-white"
          : "bg-white text-gray-900 border border-gray-200"
      } ${message.isOptimistic ? "opacity-70" : ""}`}
      style={{
        backgroundColor: isOwn ? colors.primary : undefined,
        borderRadius: isOwn ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
      }}
    >
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {message.content}
      </p>
      <div className="flex items-center justify-between mt-2">
        <p className={`text-xs ${isOwn ? "text-white/70" : "text-gray-500"}`}>
          {formatMessageTime(message.createdAt)}
        </p>
        {message.isOptimistic && (
          <span className="text-xs opacity-70">שולח...</span>
        )}
      </div>
    </div>
  </div>
));

// Utility function to format message time
const formatMessageTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffInHours < 48) {
    return "אתמול";
  } else {
    return date.toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
    });
  }
};

const Messages = () => {
  const { user } = useUser();
  const {
    recentChats,
    loadRecentChats,
    markAsRead,
    notifications,
    recentChatsLoading,
    isSocketConnected,
  } = useChat();

  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  // Refs for optimization
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const searchInputRef = useRef(null);

  const otherUserId = selectedUser?._id;

  const {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    loading,
    error,
    isConnected,
    scrollToBottom,
  } = useChatLogic({
    user,
    otherUserId,
    isOpen: !!selectedUser,
    onMarkAsRead: markAsRead,
  });

  // Load recent chats on mount
  useEffect(() => {
    loadRecentChats();
  }, [loadRecentChats]);

  // Memoized team colors
  const colors = useMemo(
    () => teamColors[user?.favoriteTeam || "הפועל תל אביב"],
    [user?.favoriteTeam]
  );

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return recentChats;
    
    return recentChats.filter(chat =>
      chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recentChats, searchQuery]);

  // Handle chat selection
  const handleChatSelect = useCallback((chatUser) => {
    setSelectedUser(chatUser);
    markAsRead(chatUser._id);
    setNewMessage("");
    
    // Focus message input after a short delay
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  }, [markAsRead, setNewMessage]);

  // Handle message sending with typing indicator
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;
    
    // Clear typing indicator
    setIsTyping(false);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    
    await sendMessage();
    
    // Focus input after sending
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  }, [newMessage, sendMessage, typingTimeout]);

  // Handle input changes with typing indicator
  const handleInputChange = useCallback((e) => {
    setNewMessage(e.target.value);
    
    // Typing indicator logic
    if (!isTyping) {
      setIsTyping(true);
      // Here you would emit typing_start to socket
    }
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      setIsTyping(false);
      // Here you would emit typing_stop to socket
    }, 2000);
    
    setTypingTimeout(timeout);
  }, [isTyping, typingTimeout, setNewMessage]);

  // Handle key press for sending messages
  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return (
    <Layout>
      <div className="flex border rounded-xl overflow-hidden h-[85vh] bg-white shadow-lg">
        {/* Chat List Sidebar */}
        <div className="w-1/3 flex flex-col border-l bg-gray-50">
          {/* Search Header */}
          <div className="p-4 border-b bg-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-900">שיחות</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-gray-500">
                  {isSocketConnected ? 'מחובר' : 'מנותק'}
                </span>
              </div>
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="חפש שיחות..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {recentChatsLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                <p className="text-gray-500">טוען שיחות...</p>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {searchQuery ? "לא נמצאו שיחות" : "אין שיחות פעילות"}
              </div>
            ) : (
              <div className="p-2">
                {filteredChats.map((chat) => {
                  const isUnread = notifications.some(
                    (n) => n.senderId === chat.user._id
                  );
                  const isSelected = selectedUser?._id === chat.user._id;

                  return (
                    <ChatListItem
                      key={chat.user._id}
                      chat={chat}
                      isSelected={isSelected}
                      isUnread={isUnread}
                      onClick={() => handleChatSelect(chat.user)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b bg-white">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedUser.profilePicture || "/defaultProfilePic.png"}
                    alt={selectedUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedUser.name}
                    </h3>
                    {isTyping && (
                      <p className="text-sm text-gray-500">כותב...</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Phone size={18} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Video size={18} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                    <p className="text-gray-500">טוען הודעות...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: `${colors.primary}20` }}
                    >
                      <Send size={24} style={{ color: colors.primary }} />
                    </div>
                    <p className="font-medium text-gray-700">התחל שיחה!</p>
                    <p className="text-sm text-gray-500">
                      שלח הודעה ראשונה ל{selectedUser.name}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map((message, index) => {
                      const isOwn = message.senderId._id === user._id;
                      const showAvatar =
                        index === 0 ||
                        messages[index - 1].senderId._id !== message.senderId._id;

                      return (
                        <MessageBubble
                          key={message._id || `msg-${index}`}
                          message={message}
                          isOwn={isOwn}
                          showAvatar={showAvatar}
                          colors={colors}
                        />
                      );
                    })}
                    <div ref={messagesEndRef} id="chat-bottom-anchor" />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <textarea
                      ref={messageInputRef}
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyPress}
                      placeholder={`שלח הודעה ל${selectedUser.name}...`}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                      rows={1}
                      style={{ minHeight: '52px', maxHeight: '120px' }}
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                      }}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !isConnected}
                    className="p-3 rounded-full transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{
                      backgroundColor: newMessage.trim() && isConnected
                        ? colors.primary
                        : "#ccc",
                      transform: newMessage.trim() && isConnected ? "scale(1)" : "scale(0.95)",
                    }}
                  >
                    <Send size={18} className="text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${colors.primary}20` }}
                >
                  <Send size={32} style={{ color: colors.primary }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  בחר שיחה מהרשימה
                </h3>
                <p className="text-gray-500">התחל להתכתב עם אוהדים אחרים</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;