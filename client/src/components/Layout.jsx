import React from "react";
import { useUser } from "./context/UserContext";
import Header from "./Header";
import RightSidebar from "./RightSidebar";
import teamColors from "../utils/teamStyles";
import "../index.css";
import NextFixtures from "./homeComponents/NextFixtures";

const Layout = ({ children }) => {
  const { user } = useUser();
  const colors = teamColors[user?.favoriteTeam || "הפועל תל אביב"];

  return (
    <div className="home-container">
      <Header user={user} />

      <main className="home-main">
        <div className="dashboard-grid">
          {/* סרגל צד ימין */}
          <RightSidebar user={user} colors={colors} />

          {/* אזור תוכן מרכזי */}
          <section>{children}</section>

          {/* אזור צד שמאל - ריק */}
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
