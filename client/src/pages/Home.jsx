import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../components/context/UserContext";
import teamColors from "../utils/teamStyles";
import Header from "../components/Header";
import RightSidebar from "../components/RightSidebar";
import "../index.css";

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const colors = teamColors[user?.favoriteTeam || "הפועל תל אביב"];
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = useCallback(() => {
    if (!user?.communityId) return;
    axios
      .get(`http://localhost:3001/posts?communityId=${user.communityId}`)
      .then((res) => setPosts(res.data))
      .catch((err) => console.error("שגיאה בטעינת פוסטים", err));
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const handlePostSubmit = async () => {
    if (!newPostContent.trim()) return;
    setIsSubmitting(true);
    try {
      await axios.post("http://localhost:3001/posts", {
        authorId: user._id,
        communityId: user.communityId,
        content: newPostContent,
        media: [],
      });
      setNewPostContent("");
      fetchPosts();
    } catch (error) {
      console.error("שגיאה ביצירת פוסט", error);
    } finally {
      setIsSubmitting(false);
    }
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
          <RightSidebar user={user} colors={colors} onLogout={handleLogout} />

          <section>
            <div
              className="dashboard-card post-box"
              style={{
                marginBottom: "1.5rem",
                borderTop: `4px solid ${colors.primary}`,
              }}
            >
              <textarea
                className="post-input"
                placeholder="מה קורה בקבוצת האוהדים שלך?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              <button
                className="join-group-button"
                style={{ marginTop: "0.75rem" }}
                onClick={handlePostSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "מעלה..." : "העל/י פוסט"}
              </button>
            </div>

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

            {posts.map((post) => (
              <div
                key={post._id}
                className="post-card"
                style={{
                  marginBottom: "1.5rem",
                  borderTop: `4px solid ${colors.primary}`,
                }}
              >
                <div className="post-header">
                  {post.authorId?.username || "משתמש אנונימי"}
                </div>
                <p>{post.content}</p>
                <div className="post-footer">
                  <span>{post.likes?.length || 0} לייקים</span>
                  <button className="join-group-button">הגב/י לפוסט</button>
                  <button className="join-group-button">רא/י תגובות</button>
                </div>
              </div>
            ))}
          </section>

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


/*
import { useNavigate } from "react-router-dom";
import { useUser } from "../components/context/UserContext";
import teamColors from "../utils/teamStyles";
import { useEffect } from "react";
import Header from "../components/Header";
import RightSidebar from "../components/RightSidebar";
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

            <div
              className="dashboard-card post-box"
              style={{
                marginBottom: "1.5rem",
                borderTop: `4px solid ${colors.primary}`,
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
                borderTop: `4px solid ${colors.primary}`,
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
*/