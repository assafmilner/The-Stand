import React, { useEffect } from "react";
import { useUser } from "./context/UserContext";
import Header from "./layoutComponents/Header";
import RightSidebar from "./layoutComponents/RightSidebar";
import teamColors from "../utils/teamStyles";
import NextFixtures from "./layoutComponents/NextFixtures";
import { useNavigate } from "react-router-dom";
import "../index.css";

const Layout = ({ children, onChatSelect }) => {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const colors = teamColors[user?.favoriteTeam || "הפועל תל אביב"];

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  return (
    <div className="home-container">
      <Header user={user} onChatSelect={onChatSelect} />

      <main className="home-main">
        <div className="dashboard-grid">
          {/* סרגל צד ימין */}
          <RightSidebar user={user} colors={colors} onChatSelect={onChatSelect} />

          {/* אזור תוכן מרכזי */}
          <section className="centered-content pt-6">{children}</section>

          {/* אזור צד שמאל */}
          <aside>
            <NextFixtures />
          </aside>
        </div>
      </main>

      <footer className="home-footer">
        © 2025 אסף מילנר וליאת מרלי | כל הזכויות שמורות
      </footer>
    </div>
  );
};

export default Layout;