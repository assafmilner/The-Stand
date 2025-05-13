import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext";
import { useChat } from "../context/ChatContext";
import { getContrastTextColor, getTeamColors } from "../../utils/colorUtils";
import teamColors from "../../utils/teamStyles";
import { Minimize2, Maximize2, X, Users } from "lucide-react";
import "./Chat.css";

function Chat() {
  const { user } = useUser();
  const { socket, mainChatOpen, toggleMainChat, openChat, onlineUsers } =
    useChat();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showUsers, setShowUsers] = useState(true);
  const messagesEndRef = useRef(null);

  const userColors = getTeamColors(user?.favoriteTeam, teamColors);

  useEffect(() => {
    if (!socket) return;

    socket.on("userJoined", ({ name, favoriteTeam }) => {
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          text: `${name} (${favoriteTeam}) הצטרף לצ'אט`,
          timestamp: new Date(),
        },
      ]);
    });

    socket.on("userLeft", ({ name }) => {
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          text: `${name} עזב את הצ'אט`,
          timestamp: new Date(),
        },
      ]);
    });

    socket.on("connectedUsers", (users) => {
      setConnectedUsers(users);
    });

    socket.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("connectedUsers");
      socket.off("message");
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      socket.emit("sendMessage", {
        text: newMessage,
        name: user.name,
        favoriteTeam: user.favoriteTeam,
      });
      setNewMessage("");
    }
  };

  const startPrivateChat = (targetUser) => {
    openChat(targetUser._id || targetUser.userId, targetUser);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const toggleUsers = () => {
    setShowUsers(!showUsers);
  };

  if (!mainChatOpen) {
    return (
      <button
        onClick={toggleMainChat}
        className="fixed bottom-5 right-5 w-16 h-16 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition-shadow z-50"
        style={{
          backgroundColor: userColors.primary,
          color: getContrastTextColor(userColors.primary),
        }}
      >
        💬
      </button>
    );
  }

  return (
    <div
      className={`chat-container ${isMinimized ? "minimized" : ""} ${
        isMaximized ? "maximized" : ""
      }`}
      style={{
        background: `linear-gradient(135deg, ${userColors.primary}, ${userColors.secondary})`,
      }}
    >
      <div
        className="chat-header"
        style={{
          backgroundColor: userColors.primary,
          color: getContrastTextColor(userColors.primary),
        }}
      >
        <h3>צ'אט קהילתי - {user?.favoriteTeam || "כל האוהדים"}</h3>
        <div className="chat-controls">
          <button
            onClick={toggleUsers}
            title={showUsers ? "הסתר משתמשים" : "הצג משתמשים"}
          >
            <Users size={16} />
          </button>
          <button
            onClick={toggleMinimize}
            title={isMinimized ? "הגדל" : "מזער"}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={toggleMaximize}
            title={isMaximized ? "קטן" : "גדל"}
            disabled={isMinimized}
          >
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button onClick={toggleMainChat} title="סגור צ'אט">
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && showUsers && (
        <div
          className="connected-users"
          style={{
            borderBottomColor: userColors.primary,
          }}
        >
          <h4 style={{ color: userColors.primary }}>
            משתמשים מחוברים ({connectedUsers.length})
          </h4>
          <div className="users-list">
            {connectedUsers.map((u, i) => (
              <span
                key={i}
                className="user-item"
                style={{
                  backgroundColor: userColors.secondary,
                  color: getContrastTextColor(userColors.secondary),
                  border: `1px solid ${userColors.primary}`,
                }}
                onClick={() => startPrivateChat(u)}
              >
                {u.name} ({u.favoriteTeam})
              </span>
            ))}
          </div>
        </div>
      )}

      {!isMinimized && (
        <>
          <div className="messages-container">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.type}`}>
                {msg.type === "system" ? (
                  <span
                    className="system-message"
                    style={{ color: userColors.primary }}
                  >
                    {msg.text}
                  </span>
                ) : (
                  <div className="message-content">
                    <span
                      className="message-author"
                      style={{ color: userColors.primary }}
                    >
                      {msg.name}
                    </span>
                    <span className="message-text">{msg.text}</span>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div
            className="message-input-container"
            style={{
              borderTopColor: userColors.primary,
            }}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="הקלד הודעה..."
              className="message-input"
              style={{
                borderColor: userColors.primary,
                "&:focus": {
                  borderColor: userColors.primary,
                  boxShadow: `0 0 0 2px ${userColors.primary}20`,
                },
              }}
            />
            <button
              onClick={sendMessage}
              className="send-button"
              style={{
                backgroundColor: userColors.primary,
                color: getContrastTextColor(userColors.primary),
              }}
            >
              שלח
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Chat;
