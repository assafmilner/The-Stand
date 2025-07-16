import React, { useEffect } from "react";
import { useUser, UserProvider } from "../../context/UserContext";
import Header from "./Header";
import RightSidebar from "./RightSidebar";
import NextFixtures from "../league/NextFixtures";
import MobileHamburgerMenu from "./MobileHamburgerMenu";
import teamColors from "../../utils/teamStyles";
import "../../styles/index.css";
import { useNavigate } from "react-router-dom";

const Layout = ({ children, onChatSelect }) => {
  const navigate = useNavigate();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return null; // או Loader אם תרצה
  }

  const colors = teamColors[user.favoriteTeam];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="home-container">
      <Header user={user} onChatSelect={onChatSelect} />
      <MobileHamburgerMenu colors={colors} onLogout={handleLogout} />

      <main className="home-main">
        <div className="dashboard-grid">
          <RightSidebar
            user={user}
            colors={colors}
            onChatSelect={onChatSelect}
          />
          <section className="centered-content pt-6">{children}</section>
          <aside>
            <NextFixtures />
          </aside>
        </div>
      </main>

      <footer className="home-footer">
        © 2025 אסף מילנר | כל הזכויות שמורות
      </footer>
    </div>
  );
};

export default Layout;
