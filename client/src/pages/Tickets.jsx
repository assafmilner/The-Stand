import React, { useState } from "react";
import Layout from "../components/layout/Layout";
import TicketMarketplace from "../components/tickets/TicketMarketplace";
import MyTickets from "../components/tickets/MyTickets";
import { useUser } from "../context/UserContext";
import teamColors from "../utils/teamStyles";

/**
 * Tickets Page
 *
 * This page displays two tabs:
 * - "Community Tickets": Marketplace with tickets for sale by users.
 * - "My Tickets": Tickets published by the logged-in user.
 *
 * Uses teamColors for dynamic styling based on user's favorite team.
 */

const TicketsPage = () => {
  const { user } = useUser();
  const colors = teamColors[user?.favoriteTeam || "הפועל תל אביב"];
  const [selectedTab, setSelectedTab] = useState("community");

  return (
    <Layout>
      {/* Selector Tab */}
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
            { key: "community", label: "כרטיסים מהקהילה" },
            { key: "mine", label: "הכרטיסים שלי" },
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

      {/* Content by tab */}
      {selectedTab === "community" && <TicketMarketplace colors={colors} />}
      {selectedTab === "mine" && <MyTickets />}
    </Layout>
  );
};

export default TicketsPage;
