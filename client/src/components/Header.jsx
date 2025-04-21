// components/Header.jsx
import React from "react";
import { User, MessageCircle, Bell, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../index.css";

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
        <div className="navbar-search">
          <input type="text" placeholder="חפש אוהדים, קבוצות או פוסטים..." />
        </div>

        {/* Logo + avatar */}
        <div className="navbar-logo">
          <span className="logo-text" onClick={() => navigate("/home")}>
            היציע
          </span>
          <button className="logo-circle" onClick={() => navigate("/profile")}>
            {user?.name?.charAt(0).toUpperCase() || "?"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
