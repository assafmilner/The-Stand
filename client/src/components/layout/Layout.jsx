import React, { useEffect } from "react";
import { useUser, UserProvider } from "../../context/UserContext";
import Header from "./Header";
import RightSidebar from "./RightSidebar";
import NextFixtures from "../league/NextFixtures";
import MobileHamburgerMenu from "./MobileHamburgerMenu";
import teamColors from "../../utils/teamStyles";
import "../../styles/index.css";
import { useNavigate } from "react-router-dom";

/**
 * Layout component defines the main page structure for authenticated users.
 * Includes a top header, sidebars, central content area, and a mobile menu.
 * Redirects to login if user is not authenticated.
 *
 * Props:
 * - children: content to be rendered in the center of the layout
 * - onChatSelect: callback function for opening chats (used in header/sidebar)
 */

const Layout = ({ children, onChatSelect }) => {
  const navigate = useNavigate();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const isReady = !loading && user;
  const colors = teamColors[user?.favoriteTeam] || teamColors["הפועל תל אביב"];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="home-container">
      {isReady ? (
        <>
          <Header user={user} onChatSelect={onChatSelect} />

          {/* Main grid layout with sidebars and central content */}
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

          {/* Mobile hamburger navigation menu */}
          <MobileHamburgerMenu colors={colors} onLogout={handleLogout} />
          {/* Application footer */}
          <footer className="home-footer">
            © 2025 אסף מילנר | כל הזכויות שמורות
          </footer>
        </>
      ) : (
        <div className="flex justify-center items-center h-screen text-lg font-bold text-gray-500">
          טוען את היציע...
        </div>
      )}
    </div>
  );
};

export default Layout;
