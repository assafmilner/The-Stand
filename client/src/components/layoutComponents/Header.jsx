// components/Header.jsx
import React, { useState } from "react";
import { MessageCircle, Bell, Settings, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../index.css";

const Header = ({ user, onChatSelect }) => {
  const navigate = useNavigate();
  const [showChatDropdown, setShowChatDropdown] = useState(false);

  // דמה של שיחות קיימות - זה יצריך להיות מחובר למסד הנתונים בפועל
  const [existingChats, setExistingChats] = useState([
    { id: 1, name: "יוסי אוהד", lastMessage: "איך המשחק הלך?", time: "10:30" },
    { id: 2, name: "רחל ירוקה", lastMessage: "בואו נפגש במשחק", time: "09:15" },
    {
      id: 3,
      name: "דוד כחול",
      lastMessage: "מה השעה של המשחק?",
      time: "08:45",
    },
  ]);

  return (
    <header className="top-navbar">
      <div className="navbar-content">
        {/* Left icons */}
        <div className="navbar-icons">
          <button
            className="icon-button"
            aria-label="הגדרות"
            onClick={() => navigate("/settings")}
          >
            <Settings size={20} />
          </button>

          {/* Chat dropdown button */}
          <div className="chat-dropdown-container">
            <button
              className="icon-button"
              aria-label="הודעות"
              onClick={() => setShowChatDropdown(!showChatDropdown)}
            >
              <MessageCircle size={20} />
              <ChevronDown size={12} />
            </button>

            {showChatDropdown && (
              <div className="chat-dropdown">
                <h4>שיחות</h4>
                <div className="chat-list">
                  {existingChats.map((chat) => (
                    <div
                      key={chat.id}
                      className="chat-item"
                      onClick={() => {
                        onChatSelect({ name: chat.name, id: chat.id });
                        setShowChatDropdown(false);
                      }}
                    >
                      <div className="chat-item-header">
                        <span className="chat-name">{chat.name}</span>
                        <span className="chat-time">{chat.time}</span>
                      </div>
                      <div className="chat-last-message">
                        {chat.lastMessage}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="new-chat-btn"
                  onClick={() => {
                    // כאן ניתן להוסיף פונקציה לפתיחת חלון בחירת משתמש
                    setShowChatDropdown(false);
                  }}
                >
                  שיחה חדשה
                </button>
              </div>
            )}
          </div>

          <button className="icon-button" aria-label="התראות">
            <Bell size={20} />
          </button>
        </div>

        {/* Search bar */}
        <div
          className="navbar-search"
          style={{ flex: 1, display: "flex", justifyContent: "center" }}
        >
          <input type="text" placeholder="חפש אוהדים, קבוצות או פוסטים..." />
        </div>

        {/* Logo + avatar */}
        <div className="navbar-logo">
          <span
            className="logo-text tracking-wide "
            onClick={() => navigate("/home")}
          >
            היציע
          </span>
          <button className="logo-circle" onClick={() => navigate("/profile")}>
            <img
              src={
                user?.profilePicture ||
                "http://localhost:3001/assets/defaultProfilePic.png"
              }
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
