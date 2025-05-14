// components/Header.jsx
import React from "react";
import { MessageCircle, Bell, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "styles/index.css";

const Header = ({ user }) => {
  const navigate = useNavigate();
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
          <button className="icon-button" aria-label="הודעות">
            <MessageCircle size={20} />
          </button>
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
