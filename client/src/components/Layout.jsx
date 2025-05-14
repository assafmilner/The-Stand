import React, { useEffect } from "react";
import { useUser } from "../context/useUserContext";
import Header from "./layoutComponents/Header";
import RightSidebar from "./layoutComponents/RightSidebar";
import NextFixtures from "./league/NextFixtures";
import teamColors from "../utils/teamStyles";
import "../styles/index.css";
import { useNavigate } from "react-router-dom";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const colors = teamColors[user?.favoriteTeam] || {};

  useEffect(() => {
    if (colors.primary) {
      document.documentElement.style.setProperty("--color-primary", colors.primary);
      document.documentElement.style.setProperty("--color-secondary", colors.secondary);
    }
  }, [colors]);

  if (loading) {
    return <div className="text-center p-4">טוען...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <main className="flex flex-1">
        <RightSidebar />
        <div className="flex-1 p-4">{children}</div>
        <aside className="w-64 p-4">
          <NextFixtures />
        </aside>
      </main>
      <footer className="text-center py-4">© 2025 Matchday | כל הזכויות שמורות</footer>
    </div>
  );
};

export default Layout;