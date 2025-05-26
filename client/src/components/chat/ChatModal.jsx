// client/src/components/chat/ChatModal.js - OPTIMIZED VERSION
import React, { 
  useMemo, 
  useState, 
  useCallback, 
  useRef, 
  useEffect 
} from "react";
import { 
  X, 
  Send, 
  Minimize2, 
  Maximize2, 
  Phone, 
  Video,
  MoreVertical,
  Smile
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import teamColors from "../../utils/teamStyles";
import useChatLogic from "../../hooks/useChatLogic";

// Memoized message component to prevent unnecessary re-renders
const MessageItem = React.memo(({ 
  message, 
  isCurrentUser, 
  showAvatar, 
  colors,
  userInfo 
}) => (
  <div
    className={`flex items-end gap-2 mb-3 ${
      isCurrentUser ? "justify-end" : "justify-start"
    }`}
  >
    {!isCurrentUser && (
      <img
        src={message.senderId.profilePicture || "/defaultProfilePic.png"}
        alt={message.senderId.name}
        className={`w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm transition-opacity ${
          showAvatar ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
      />
    )}

    <div
      className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm transition-all duration-200 ${
        isCurrentUser
          ? "text-white"
          : "bg-white text-gray-800 border border-gray-100"
      } ${message.isOptimistic ? "opacity-70 transform scale-95" : ""}`}
      style={{
        backgroundColor: isCurrentUser ? colors.primary : undefined,
        borderRadius: isCurrentUser
          ? "20px 20px 6px 20px"
          : "20px 20px 20px 6px",
      }}
    >
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {message.content}
      </p>
      <div className="flex items-center justify-between mt-1">
        <p
          className={`text-xs ${
            isCurrentUser ? "text-white/70" : "text-gray-500"
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        {message.isOptimistic && (
          <span className="text-xs opacity-70 animate-pulse">שולח...</span>
        )}
      </div>
    </div>
  </div>
));

// Typing indicator component
const TypingIndicator = React.memo(({ colors }) => (
  <div className="flex items-center gap-2 mb-3 opacity-70">
    <div className="flex gap-1">
      <div 
        className="w-2 h-2 rounded-full animate-bounce"
        style={{ backgroundColor: colors.primary, animationDelay: '0ms' }}
      />
      <div 
        className="w-2 h-2 rounded-full animate-bounce"
        style={{ backgroundColor: colors.primary, animationDelay: '150ms' }}
      />
      <div 
        className="w-2 h-2 rounded-full animate-bounce"
        style={{ backgroundColor: colors.primary, animationDelay: '300ms' }}
      />
    </div>
    <span className="text-xs text-gray-500">כותב...</span>
  </div>
));

const ChatModal = ({ isOpen, onClose, otherUser, onMarkAsRead }) => {
  const { user } = useUser();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  // Refs for optimization
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const modalRef = useRef(null);

  const otherUserId = useMemo(() => otherUser?._id, [otherUser]);

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
    isOpen: isOpen && !isMinimized, 
    onMarkAsRead 
  });

  const colors = useMemo(
    () => teamColors[user?.favoriteTeam || "הפועל תל אביב"],
    [user?.favoriteTeam]
  );

  // Handle message sending with optimizations
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;
    
    // Clear typing indicator
    setIsTyping(false);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    
    await sendMessage();
    
    // Focus textarea after sending
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, [newMessage, sendMessage, typingTimeout]);

  // Handle input changes with typing indicator
  const handleInputChange = useCallback((e) => {
    setNewMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
    
    // Typing indicator logic
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      // Here you would emit typing_start to socket
    }
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing indicator
    if (e.target.value.trim()) {
      const timeout = setTimeout(() => {
        setIsTyping(false);
        // Here you would emit typing_stop to socket
      }, 2000);
      setTypingTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [isTyping, typingTimeout, setNewMessage]);

  // Handle key press for sending
  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Handle modal close with cleanup
  const handleClose = useCallback(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    setIsTyping(false);
    setShowEmojiPicker(false);
    onClose();
  }, [onClose, typingTimeout]);

  // Toggle minimize
  const toggleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev);
    if (isMinimized) {
      // Focus input when maximizing
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isMinimized]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!isMinimized) {
      scrollToBottom();
    }
  }, [messages, isMinimized, scrollToBottom]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 200);
    }
  }, [isOpen, isMinimized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  // Click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmojiPicker]);

  if (!isOpen || !otherUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
          isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
        } flex flex-col overflow-hidden`}
        style={{
          transform: isMinimized ? 'translateY(20px)' : 'translateY(0)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}15, ${colors.primary}05)`,
            borderColor: `${colors.primary}20`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={otherUser.profilePicture || "/defaultProfilePic.png"}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                loading="lazy"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
              {!isMinimized && isConnected && (
                <p className="text-xs text-gray-500">
                  {isTyping ? 'כותב...' : 'פעיל'}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!isMinimized && (
              <>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Phone size={16} />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Video size={16} />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <MoreVertical size={16} />
                </button>
              </>
            )}
            <button
              onClick={toggleMinimize}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Connection Status */}
            {!isConnected && (
              <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
                <p className="text-xs text-yellow-700">מנותק - מנסה להתחבר מחדש...</p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-b border-red-200 px-4 py-2">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            {/* Messages */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white"
            >
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
                  <p className="text-sm">שלח הודעה ראשונה ל{otherUser.name}</p>
                </div>
              ) : (
                <div>
                  {messages.map((message, index) => {
                    const isCurrentUser = message.senderId._id === user._id;
                    const showAvatar =
                      index === 0 ||
                      messages[index - 1].senderId._id !== message.senderId._id;

                    return (
                      <MessageItem
                        key={message._id || `msg-${index}`}
                        message={message}
                        isCurrentUser={isCurrentUser}
                        showAvatar={showAvatar}
                        colors={colors}
                        userInfo={user}
                      />
                    );
                  })}
                  
                  {isTyping && <TypingIndicator colors={colors} />}
                  
                  <div id="chat-bottom-anchor" />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white flex-shrink-0">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    placeholder={`שלח הודעה ל${otherUser.name}...`}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent resize-none transition-all"
                    style={{ 
                      focusRingColor: colors.primary,
                      minHeight: '52px',
                      maxHeight: '120px'
                    }}
                    rows={1}
                    disabled={!isConnected}
                  />
                  
                  {/* Emoji Button */}
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute left-3 bottom-3 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Smile size={18} className="text-gray-400" />
                  </button>
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

              {/* Simple Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-20 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                  <div className="grid grid-cols-6 gap-2">
                    {['😀', '😂', '😍', '🥰', '😘', '😊', '😉', '😎', '🤔', '👍', '👌', '❤️', '🔥', '💯', '🎉', '🙏'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setNewMessage(prev => prev + emoji);
                          setShowEmojiPicker(false);
                          textareaRef.current?.focus();
                        }}
                        className="p-2 hover:bg-gray-100 rounded text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(ChatModal);