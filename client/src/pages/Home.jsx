import { useUser } from "../components/context/UserContext";
import { useState } from "react";
import Layout from "../components/Layout"; // ✅ שימוש בלייאאוט
import Feed from "../components/homeComponents/Feed";
import SmartLeagueTable from "../components/homeComponents/SmartLeagueTable";
import Community from "../components/homeComponents/Community";
import teamColors from "../utils/teamStyles";
import "../index.css";

const Home = () => {
  const { user, loading } = useUser();
  const [selectedTab, setSelectedTab] = useState("feed"); // ✅ מצב טאב
  const colors = teamColors[user?.favoriteTeam || "הפועל תל אביב"];

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
    <Layout>
      {/* אזור מרכזי */}
      <div className="flex justify-center my-6">
        <div
          className="tab-wrapper"
          style={{
            width: "100%",
            backgroundColor: "var(--card-bg)",
            padding: "1rem",
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

      {/* תוכן הטאבים */}
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
        {selectedTab === "groups" && <Community colors={colors} />}

        {selectedTab === "tickets" && (
          <div
            key="tickets"
            className="animate-fade-in text-center text-gray-500"
          >
            כרטיסים - בקרוב
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
