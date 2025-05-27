import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import Layout from "../components/layout/Layout";
import FriendsFeed from "../components/homeComponents/FriendsFeed";
import Community from "../components/homeComponents/Community";
import SmartLeagueTable from "../components/league/SmartLeagueTable";
import teamColors from "../utils/teamStyles";
import "../styles/index.css";

const Home = () => {
  const { user, loading } = useUser();
  const [selectedTab, setSelectedTab] = useState("feed");
  const colors = teamColors[user?.favoriteTeam || "הפועל תל אביב"];

  if (loading) {
    return (
      <Layout>
        <div className="text-center p-4">טוען...</div>
      </Layout>
    );
  }

  if (!user) return null;

  const tabItems = [
    { key: "feed", label: "פיד " },
    { key: "groups", label: `קהילת ${user.favoriteTeam || "הקבוצה שלי"}` },
    { key: "table", label: "טבלה" },
  ];

  return (
    <Layout>
      {/* Tab selector */}
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
            margin: "0 auto",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          {tabItems.map((tab) => (
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

      {/* Tab content */}
      <div className="transition-all duration-500 ease-in-out">
        {selectedTab === "feed" && (
          <div key="feed" className="animate-fade-in">
            <FriendsFeed user={user} colors={colors} />
          </div>
        )}

        {selectedTab === "groups" && (
          <div key="groups" className="animate-fade-in">
            <Community colors={colors} />
          </div>
        )}

        {selectedTab === "table" && (
          <div key="table" className="animate-fade-in">
            <SmartLeagueTable />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
