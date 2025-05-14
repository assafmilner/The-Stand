import React, { useState } from "react";
import { useUser } from "../context/useUserContext";
import Feed from "../components/homeComponents/Feed";
import SmartLeagueTable from "../components/league/SmartLeagueTable";
import Community from "../components/homeComponents/Community";
import Layout from "../components/Layout";
import teamColors from "../utils/teamStyles";
import "../styles/index.css";

const Home = () => {
  const { user, loading } = useUser();
  const [selectedTab, setSelectedTab] = useState("feed");
  const colors = teamColors[user?.favoriteTeam];

  if (loading) {
    return (
      <Layout>
        <div className="text-center p-4">טוען...</div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex gap-2 mb-4">
          {[
            { key: "feed", label: "פיד" },
            { key: "groups", label: "קהילות" },
            { key: "tickets", label: "כרטיסים" },
            { key: "table", label: "טבלה" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`flex-1 py-2 rounded ${selectedTab === tab.key ? "font-bold" : ""}`}
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

        <div>
          {selectedTab === "feed" && <Feed colors={colors} />}
          {selectedTab === "groups" && <Community colors={colors} />}
          {selectedTab === "table" && <SmartLeagueTable />}
          {selectedTab === "tickets" && (
            <div className="text-center text-gray-500">כרטיסים - בקרוב</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
