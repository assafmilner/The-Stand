

import { useNavigate } from "react-router-dom";
import { useUser } from "../components/context/UserContext";
import teamColors from "../utils/teamStyles";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import RightSidebar from "../components/RightSidebar";
import Feed from "../components/homeComponents/Feed";
import SmartLeagueTable from "../components/homeComponents/SmartLeagueTable"; // ✅ ייבוא הטבלה
import "../index.css";

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const [selectedTab, setSelectedTab] = useState("feed"); // ✅ מצב טאב
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
          {/* סרגל צד ימין */}
          <RightSidebar user={user} colors={colors} onLogout={handleLogout} />

          {/* אזור מרכזי */}
          <section>
            <div className="flex justify-center my-6">
              <div
                className="tab-wrapper"
                style={{
                  width: "100%",
                  backgroundColor: "var(--card-bg)",
                  padding: "0.5rem",
                  borderRadius: "1rem",
                  display: "flex",
                  alignItems: "center",
                  margin: "0 auto ",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                }}
              >
                {[
                  { key: "feed", label: "פיד" },
                  { key: "groups", label: "קבוצות" },
                  { key: "tickets", label: "כרטיסים" },
                  { key: "table", label: "טבלה" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedTab(tab.key)}
                    className={`custom-tab-button flex-1 ${
                      selectedTab !== tab.key ? "inactive" : ""
                    }`}
                    style={
                      selectedTab === tab.key
                        ? { backgroundColor: colors.primary }
                        : {}
                    }
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="transition-all duration-500 ease-in-out">
              {selectedTab === "feed" && (
                <div key="feed" className="animate-fade-in">
                  <Feed user={user} colors={colors} />
                </div>
              )}
              {selectedTab === "table" && (
                <div key="table" className="animate-fade-in">
                  <SmartLeagueTable />
                </div>
              )}
              {selectedTab === "groups" && (
                <div
                  key="groups"
                  className="animate-fade-in text-center text-gray-500"
                >
                  קבוצות - בקרוב
                </div>
              )}
              {selectedTab === "tickets" && (
                <div
                  key="tickets"
                  className="animate-fade-in text-center text-gray-500"
                >
                  כרטיסים - בקרוב
                </div>
              )}
            </div>
          </section>

          {/* אזור צד שמאל */}
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
