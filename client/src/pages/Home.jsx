import { useNavigate } from "react-router-dom";
import { useUser } from "../components/context/UserContext";
import teamColors from "../utils/teamStyles";
import { useEffect } from "react";
import Header from "../components/Header";
import RightSidebar from "../components/RightSidebar";
import Feed from "../components/Feed";
import "../index.css";

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const colors = teamColors[user?.favoriteTeam || "הפועל תל אביב"];

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
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

  if (!user) return null;

  return (
    <div className="home-container">
      <Header user={user} />

      <main className="home-main">
        <div className="dashboard-grid">
          {}
          <RightSidebar user={user} colors={colors} onLogout={handleLogout} />

          {}
          <section>
            <div
              className="tab-buttons"
              style={{
                marginBottom: "1.5rem",
                display: "flex",
                justifyContent: "center",
                borderTop: `4px solid ${colors.primary}`,
                padding: "1rem",
                borderRadius: "0.75rem",
                backgroundColor: "var(--card-bg)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div className="tab-buttons-inner">
                <button className="join-group-button">פיד</button>
                <button className="join-group-button">פעילות</button>
                <button className="join-group-button">קבוצות</button>
              </div>
            </div>
            <Feed user={user} colors={colors} />
          </section>

          {}
          <aside>
            <section
              className="dashboard-card upcoming-matches"
              style={{
                marginBottom: "1.5rem",
                borderTop: `4px solid ${colors.primary}`,
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
                borderTop: `4px solid ${colors.primary}`,
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
        © 2025 אסף מילנר וליאת מרלי | כל הזכויות שמורות
      </footer>
    </div>
  );
};

export default Home;
