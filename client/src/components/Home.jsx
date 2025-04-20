"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useUser } from "./context/UserContext"
import "./home-styles.css"

const Home = () => {
    
  const [user, setUser] = useState()
  const [loading, setLoading] = useState(true)
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [teamTheme, setTeamTheme] = useState({
    primary: "#FF0000",
    secondary: "#FFFFFF",
    name: "הפועל תל אביב"
  })
  const navigate = useNavigate()
  
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
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
    navigate("/login");
    return;
    }
    
    const fetchUser = async() => {
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
                    name: userData.favoriteTeam
                });

                document.documentElement.style.setProperty('--primary-color', teamColors[userData.favoriteTeam].primary)
                document.documentElement.style.setProperty('--primary-color', teamColors[userData.favoriteTeam].secondary)
            }
        } catch (err) {
            console.error("Failed to fetch user:", err);
            navigate("/login");
        }
    };
    
    fetchUser();
},[]);
   
  
  const handleLogout = () => {
    // In a real app, implement logout functionality
    navigate("/login")
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>טוען...</p>
      </div>
    )
  }
  if (!checkedAuth) return null;


  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={handleLogout} className="logout-button">
              <svg className="logout-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M16 17L21 12L16 7" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M21 12H9" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              התנתק
            </button>
          </div>
          <div className="header-center">
            <div className="logo-container">
              <svg className="logo" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="30" fill="white" stroke="var(--primary-color)" strokeWidth="2" />
                <path
                  d="M32 8C18.745 8 8 18.745 8 32C8 45.255 18.745 56 32 56C45.255 56 56 45.255 56 32C56 18.745 45.255 8 32 8Z"
                  fill="white"
                />
                <path
                  d="M32 8C18.745 8 8 18.745 8 32C8 45.255 18.745 56 32 56C45.255 56 56 45.255 56 32C56 18.745 45.255 8 32 8ZM32 12C35.73 12 39.21 13.033 42.167 14.833L38.833 19.5L32.833 19.833L26.5 15.167V12.333C28.245 12.117 30.1 12 32 12ZM16.833 24.5L22.5 20.167L28.833 24.833L29.167 32.833L24.5 38.5L15.5 37.167C14.35 35.583 13.517 33.833 13.167 32C13.167 32.833 13.283 33.667 13.5 34.5H16.833V24.5ZM24.167 51.833C18.745 50.883 14.117 47.45 11.5 42.833L19.167 44.167L24.5 40.833L32.167 44.5V51.833H24.167ZM40.167 51.833V47.167L43.833 42.5L52.167 44.167C48.883 48.4 44.833 51.167 40.167 51.833ZM53.167 32.833L46.5 32.5L44.167 27.167L49.5 22.5C52.167 28.5 52.833 33.667 53.167 32.833Z"
                  fill="var(--primary-color)"
                />
              </svg>
            </div>
            <h1 className="app-title">HaYatzia</h1>
          </div>
          <div className="header-right">
            <div className="user-profile">
              <div className="user-avatar">{user.name[0]}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">ברוך הבא, {user.name}!</h1>
          <p className="hero-subtitle">מה חדש באתר HaYatzia היום?</p>
          
          <div className="team-badge">
            <div className="team-colors">
              <div className="team-color primary" style={{ backgroundColor: teamTheme.primary }}></div>
              <div className="team-color secondary" style={{ backgroundColor: teamTheme.secondary }}></div>
            </div>
            <span className="team-name">{teamTheme.name}</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="home-main">
        <div className="dashboard-grid">
          {/* Upcoming Matches */}
          <section className="dashboard-card upcoming-matches">
            <h2 className="card-title">המשחקים הקרובים</h2>
            <div className="matches-list">
              <div className="match-item">
                <div className="match-date">יום שבת, 26 אפריל</div>
                <div className="match-teams">
                  <span className="team home-team">{teamTheme.name}</span>
                  <span className="match-versus">נגד</span>
                  <span className="team away-team">מכבי נתניה</span>
                </div>
                <div className="match-details">
                  <span className="match-time">20:30</span>
                  <span className="match-stadium">אצטדיון סמי עופר</span>
                </div>
              </div>
              
              <div className="match-item">
                <div className="match-date">יום שלישי, 29 אפריל</div>
                <div className="match-teams">
                  <span className="team home-team">הפועל באר שבע</span>
                  <span className="match-versus">נגד</span>
                  <span className="team away-team">{teamTheme.name}</span>
                </div>
                <div className="match-details">
                  <span className="match-time">19:00</span>
                  <span className="match-stadium">אצטדיון טרנר</span>
                </div>
              </div>
            </div>
          </section>

          {/* Local Fan Groups */}
          <section className="dashboard-card fan-groups">
            <h2 className="card-title">קבוצות אוהדים ב{user.location}</h2>
            <div className="groups-list">
              <div className="group-item">
                <div className="group-name">האריות של {teamTheme.name}</div>
                <div className="group-members">43 חברים</div>
                <button className="join-group-button">הצטרף</button>
              </div>
              
              <div className="group-item">
                <div className="group-name">האולטראס {teamTheme.name}</div>
                <div className="group-members">126 חברים</div>
                <button className="join-group-button">הצטרף</button>
              </div>
              
              <div className="group-item">
                <div className="group-name">אוהדי {teamTheme.name} ב{user.location}</div>
                <div className="group-members">58 חברים</div>
                <button className="join-group-button">הצטרף</button>
              </div>
            </div>
          </section>

          {/* Match Viewing Events */}
          <section className="dashboard-card viewing-events">
            <h2 className="card-title">אירועי צפייה משותפת</h2>
            <div className="events-list">
              <div className="event-item">
                <div className="event-title">צפייה משותפת במשחק {teamTheme.name} נגד מכבי נתניה</div>
                <div className="event-location">בר הספורט, {user.location}</div>
                <div className="event-date">שבת, 26 אפריל | 20:00</div>
                <div className="event-attendees">23 אוהדים נרשמו</div>
                <button className="register-button">הירשם לאירוע</button>
              </div>
            </div>
          </section>

          {/* News Feed */}
          <section className="dashboard-card news-feed">
            <h2 className="card-title">חדשות מהקבוצה</h2>
            <div className="news-list">
              <div className="news-item">
                <h3 className="news-title">עדכונים מאימון הקבוצה להיום</h3>
                <p className="news-excerpt">
                  הנבחרת התאמנה היום באינטנסיביות לקראת המשחק הקרוב. שני שחקנים חזרו מפציעה והצטרפו לאימון מלא.
                </p>
                <div className="news-meta">
                  <span className="news-time">לפני 3 שעות</span>
                </div>
              </div>
              
              <div className="news-item">
                <h3 className="news-title">כרטיסים למשחק מול מכבי נתניה</h3>
                <p className="news-excerpt">
                  הכרטיסים למשחק השבת נמכרים בקצב מהיר. מומלץ לרכוש בהקדם כדי להבטיח מקומות.
                </p>
                <div className="news-meta">
                  <span className="news-time">לפני 5 שעות</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2025 HaYatzia - Fan? Feel at Home. כל הזכויות שמורות.</p>
      </footer>
    </div>
  )
}

export default Home