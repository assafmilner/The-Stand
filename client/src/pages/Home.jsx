// client/src/pages/Home.jsx (Updated with Tickets tab)
import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext";
import Layout from "../components/layout/Layout";
import Feed from "../components/homeComponents/Feed";
import SmartLeagueTable from "../components/league/SmartLeagueTable";
import Community from "../components/homeComponents/Community";
import TicketMarketplace from "../components/tickets/TicketMarketplace"; // ✨ New import

import teamColors from "../utils/teamStyles";

import "../styles/index.css";

const Home = () => {
  const { user, loading } = useUser();
  const [selectedTab, setSelectedTab] = useState("feed");
  const colors = teamColors[user?.favoriteTeam || "הפועל תל אביב"];

  // loading / not authed
  if (loading) {
    return (
      <Layout>
        <div className="text-center p-4">טוען...</div>
      </Layout>
    );
  }
  if (!user) return null;

  // Main render
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
          {[
            { key: "feed", label: "פיד" },
            { key: "groups", label: "קהילות" },
            { key: "tickets", label: "כרטיסים" }, // ✨ New tab
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

      {/* Tab content */}
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
        {selectedTab === "tickets" && ( // ✨ New tab content
          <div key="tickets" className="animate-fade-in">
            <TicketMarketplace colors={colors} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
