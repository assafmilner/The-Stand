"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "./context/UserContext";
import { User, MessageCircle, Bell } from "lucide-react";
import "./home-styles.css";

const Home = () => {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [teamTheme, setTeamTheme] = useState({
    primary: "#FF0000",
    secondary: "#FFFFFF",
    name: "הפועל תל אביב",
  });
  const navigate = useNavigate();

  // Team color configurations
  const teamColors = {
    "הפועל תל אביב": { primary: "#FF0000", secondary: "#FFFFFF" },
    "מכבי תל אביב": { primary: "#FFFF00", secondary: "#0000FF" },
    "הפועל באר שבע": { primary: "#FF0000", secondary: "#FFFFFF" },
    "מכבי חיפה": { primary: "#00FF00", secondary: "#FFFFFF" },
    'בית"ר ירושלים': { primary: "#FFFF00", secondary: "#000000" },
    "בני יהודה": { primary: "#FFA500", secondary: "#000000" },
    "מכבי נתניה": { primary: "#FFFF00", secondary: "#000000" },
    "הפועל חיפה": { primary: "#FF0000", secondary: "#000000" },
    "הפועל ירושלים": { primary: "#FF0000", secondary: "#000000" },
    "עירוני קרית שמונה": { primary: "#0000FF", secondary: "#FFFFFF" },
    "מ.ס. אשדוד": { primary: "#FFFF00", secondary: "#FF0000" },
    "בני סכנין": { primary: "#FF0000", secondary: "#FFFFFF" },
    "הפועל פתח תקווה": { primary: "#0000FF", secondary: "#FFFFFF" },
    "מכבי פתח תקווה": { primary: "#0000FF", secondary: "#FFFFFF" },
    "הפועל רמת גן": { primary: "#FF0000", secondary: "#000000" },
    "הפועל כפר שלם": { primary: "#FFA500", secondary: "#FFFFFF" },
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = response.data;
        setUser(response.data);
        setLoading(false);
        setCheckedAuth(true);

        if (userData.favoriteTeam && teamColors[userData.favoriteTeam]) {
          setTeamTheme({
            ...teamColors[userData.favoriteTeam],
            name: userData.favoriteTeam,
          });

          document.documentElement.style.setProperty(
            "--primary-color",
            teamColors[userData.favoriteTeam].primary
          );
          document.documentElement.style.setProperty(
            "--secondary-color",
            teamColors[userData.favoriteTeam].secondary
          );
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    // In a real app, implement logout functionality
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>טוען...</p>
      </div>
    );
  }
  if (!checkedAuth) return null;

  return (
    <div className="home-container">
      <header className="top-navbar">
        <div className="navbar-content">
          {/* Left icons */}
          <div className="navbar-icons">
            <button className="icon-button" aria-label="פרופיל">
              <User size={20} />
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
            <input type="text" placeholder="...חפש אוהדים, קבוצות או פוסטים" />
          </div>

          {/* Logo + avatar */}
          <div className="navbar-logo">
            <span className="logo-text">היציע</span>
            <div className="logo-circle">
              {user?.name?.charAt(0).toUpperCase() || "?"}
            </div>
          </div>
        </div>
      </header>

      <main className="home-main">
        <div className="dashboard-grid">
          {/* Sidebar Left */}
          <aside>
            <nav
              className="dashboard-card"
              style={{
                marginBottom: "1.5rem",
                borderTop: `4px solid ${teamTheme.primary}`,
              }}
            >
              <ul className="nav-list">
                <li className="nav-item">🏠 דף הבית</li>
                <li className="nav-item">📅 משחקים</li>
                <li className="nav-item">🔔 התראות</li>
                <li className="nav-item">⚙️ פרופיל</li>
                <li className="nav-item">🚪 התנתק</li>
              </ul>
            </nav>

            <section
              className="dashboard-card group-info"
              style={{
                marginBottom: "1.5rem",
                borderTop: `4px solid ${teamTheme.primary}`,
              }}
            >
              <h3 className="card-title">הקבוצה שלך: {teamTheme.name}</h3>
              <p className="group-desc">
                זו הקבוצה שאתה עוקב אחריה בברירת מחדל.
              </p>
              <button
                className="join-group-button"
                onClick={() => alert("בעתיד: דיאלוג בחירת קבוצה")}
              >
                שנה קבוצה
              </button>
            </section>
          </aside>

          {/* Center Content */}
          <section>
            <div
              className="tab-buttons"
              style={{
                marginBottom: "1.5rem",
                display: "flex",
                justifyContent: "center",
                borderTop: `4px solid ${teamTheme.primary}`,
                padding: "1rem",
                borderRadius: "0.75rem",
                backgroundColor: "var(--card-bg)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div className="tab-buttons-inner">
                <button
                  className="join-group-button"
                  style={{ backgroundColor: teamTheme.primary, color: "#fff" }}
                >
                  פיד
                </button>
                <button
                  className="join-group-button"
                  style={{ backgroundColor: teamTheme.primary, color: "#fff" }}
                >
                  פעילות
                </button>
                <button
                  className="join-group-button"
                  style={{ backgroundColor: teamTheme.primary, color: "#fff" }}
                >
                  קבוצות
                </button>
              </div>
            </div>

            <div
              className="dashboard-card"
              style={{
                marginBottom: "1.5rem",
                borderTop: `4px solid ${teamTheme.primary}`,
              }}
            >
              <textarea
                className="post-input"
                placeholder="מה קורה בקבוצת האוהדים שלך?"
              />
            </div>

            <div
              className="post-card"
              style={{
                marginBottom: "1.5rem",
                borderTop: `4px solid ${teamTheme.primary}`,
              }}
            >
              <div className="post-header">איתי כהן</div>
              <p>
                איזה שחקן סתיו טוריאלללללל הקבוצה הזאת בדם!! תראו את הנתונים של
                המשחק האחרון שלו 👇
              </p>
              <div className="post-footer">
                <span>124 לייקים</span>
                <span>32 תגובות</span>
              </div>
            </div>
          </section>

          {/* Sidebar Right */}
          <aside>
            <section
              className="dashboard-card upcoming-matches"
              style={{
                marginBottom: "1.5rem",
                borderTop: `4px solid ${teamTheme.primary}`,
              }}
            >
              <h3 className="card-title">משחקים קרובים</h3>
              <div className="matches-list">
                <div className="match-item">
                  <div className="match-date">שבת, 15:30</div>
                  <div className="match-teams">
                    <span className="home-team">הפועל ת"א</span>
                    <span className="match-versus">VS</span>
                    <span className="away-team">מכבי חיפה</span>
                  </div>
                  <div className="match-details">
                    <span>בלומפילד</span>
                    <span>ליגת העל</span>
                  </div>
                </div>
                <div className="match-item">
                  <div className="match-date">ראשון, 20:00</div>
                  <div className="match-teams">
                    <span className="home-team">ב"ש</span>
                    <span className="match-versus">VS</span>
                    <span className="away-team">הפועל י-ם</span>
                  </div>
                  <div className="match-details">
                    <span>טרנר</span>
                    <span>ליגת העל</span>
                  </div>
                </div>
              </div>
            </section>

            <section
              className="dashboard-card fan-groups"
              style={{
                marginBottom: "1.5rem",
                borderTop: `4px solid ${teamTheme.primary}`,
              }}
            >
              <h3 className="card-title">אוהדים לעקוב</h3>
              <div className="groups-list">
                <div className="group-item">
                  <div className="group-name">רועי לוי</div>
                  <div className="group-members">הפועל ת"א</div>
                  <button className="join-group-button">עקוב</button>
                </div>
                <div className="group-item">
                  <div className="group-name">שירה כהן</div>
                  <div className="group-members">בית"ר ירושלים</div>
                  <button className="join-group-button">עקוב</button>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>

      <footer className="home-footer">
        © 2025 אסף מילנר | כל הזכויות שמורות
      </footer>
    </div>
  );
};

export default Home;
