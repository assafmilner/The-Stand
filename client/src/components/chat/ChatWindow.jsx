import React, { useState, useEffect, useRef } from "react";
import { X, Send, Minimize2 } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useChat } from "../context/ChatContext";
import { getContrastTextColor, getTeamColors } from "../../utils/colorUtils";
import teamColors from "../../utils/teamStyles";

function ChatWindow({ chat, onClose, onMinimize }) {
  const { user } = useUser();
  const { socket, setOpenChats } = useChat();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const userColors = getTeamColors(user?.favoriteTeam, teamColors);
  const { userData, isMinimized, messages = [] } = chat;

  useEffect(() => {
    if (!socket || !user) return;

    const handlePrivateMessage = ({
      from,
      message,
      to,
      timestamp,
      fromId,
      toId,
    }) => {
      if (
        (fromId === userData._id && toId === user._id) ||
        (fromId === user._id && toId === userData._id)
      ) {
        setOpenChats((prev) =>
          prev.map((c) =>
            c.userId === userData._id
              ? {
                  ...c,
                  messages: [
                    ...(c.messages || []),
                    {
                      from,
                      text: message,
                      timestamp: timestamp || new Date(),
                      isOwn: fromId === user._id,
                    },
                  ],
                }
              : c
          )
        );
      }
    };

    socket.on("privateMessage", handlePrivateMessage);

    return () => {
      socket.off("privateMessage", handlePrivateMessage);
    };
  }, [socket, userData._id, user._id, setOpenChats]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      const messageObj = {
        from: user.name,
        to: userData.name,
        message: newMessage,
        timestamp: new Date(),
        fromId: user._id,
        toId: userData._id,
      };

      socket.emit("sendPrivateMessage", messageObj);

      // הוספה לצ'אט המקומי מיד
      setOpenChats((prev) =>
        prev.map((c) =>
          c.userId === userData._id
            ? {
                ...c,
                messages: [
                  ...(c.messages || []),
                  {
                    from: user.name,
                    text: newMessage,
                    timestamp: new Date(),
                    isOwn: true,
                  },
                ],
              }
            : c
        )
      );

      setNewMessage("");
    }
  };

  return (
    <div
      className="chat-window"
      style={{
        background: `linear-gradient(135deg, ${userColors.primary}20, ${userColors.secondary}20)`,
        border: `1px solid ${userColors.primary}`,
        height: isMinimized ? "40px" : "350px",
        overflow: "hidden",
        transition: "height 0.3s ease",
      }}
    >
      <div
        className="chat-window-header"
        style={{
          backgroundColor: userColors.primary,
          color: getContrastTextColor(userColors.primary),
        }}
      >
        <h4>צ'אט עם {userData.name}</h4>
        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="p-1 hover:bg-white/10 rounded"
            style={{
              color: getContrastTextColor(userColors.primary),
            }}
          >
            <Minimize2 size={14} />
          </button>
          <button
            className="close-btn"
            onClick={onClose}
            style={{
              color: getContrastTextColor(userColors.primary),
              opacity: 0.7,
              transition: "opacity 0.2s",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = 1;
              e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = 0.7;
              e.target.style.backgroundColor = "transparent";
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="chat-window-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-message ${msg.isOwn ? "own" : "other"}`}
              >
                <div
                  className="message-bubble"
                  style={{
                    backgroundColor: msg.isOwn
                      ? userColors.primary
                      : userColors.secondary + "40",
                    color: msg.isOwn
                      ? getContrastTextColor(userColors.primary)
                      : userColors.primary,
                    border: msg.isOwn
                      ? "none"
                      : `1px solid ${userColors.primary}`,
                  }}
                >
                  <p>{msg.text}</p>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div
            className="chat-window-input"
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
              style={{
                borderColor: userColors.primary + "50",
                "&:focus": {
                  borderColor: userColors.primary,
                  boxShadow: `0 0 0 2px ${userColors.primary}20`,
                },
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                backgroundColor: userColors.primary,
                color: getContrastTextColor(userColors.primary),
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatWindow;
