// client/src/pages/MyTickets.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Edit, Trash2, CheckCircle } from "lucide-react";
import Layout from "../components/layout/Layout";
import TicketCard from "../components/tickets/TicketCard";
import { useUser } from "../context/UserContext";
import api from "../utils/api";
import teamColors from "../utils/teamStyles";

const MyTickets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const colors = teamColors[user?.favoriteTeam || "הפועל תל אביב"];

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchMyTickets();

    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchMyTickets = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/tickets/mine");
      setTickets(response.data.tickets || []);
    } catch (err) {
      console.error("Error fetching my tickets:", err);
      setError("שגיאה בטעינת הכרטיסים שלך");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את הכרטיס?")) {
      return;
    }

    try {
      await api.delete(`/api/tickets/${ticketId}`);
      setTickets((prev) => prev.filter((ticket) => ticket._id !== ticketId));
      setSuccessMessage("הכרטיס נמחק בהצלחה");
    } catch (err) {
      console.error("Error deleting ticket:", err);
      alert("שגיאה במחיקת הכרטיס");
    }
  };

  const handleToggleSoldOut = async (ticketId, currentStatus) => {
    try {
      const response = await api.put(`/api/tickets/${ticketId}`, {
        isSoldOut: !currentStatus,
      });

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === ticketId
            ? { ...ticket, isSoldOut: response.data.isSoldOut }
            : ticket
        )
      );

      setSuccessMessage(
        !currentStatus ? "הכרטיס סומן כנמכר" : "הכרטיס חזר להיות זמין למכירה"
      );
    } catch (err) {
      console.error("Error updating ticket status:", err);
      alert("שגיאה בעדכון סטטוס הכרטיס");
    }
  };

  // Separate tickets by status
  const activeTickets = tickets.filter((ticket) => !ticket.isSoldOut);
  const soldTickets = tickets.filter((ticket) => ticket.isSoldOut);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold" style={{ color: colors.primary }}>
            הכרטיסים שלי
          </h1>
          <button
            onClick={() => navigate("/create-ticket")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.primary }}
          >
            <Plus size={18} />
            הוסף כרטיס
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <span className="text-green-700">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage("")}
              className="mr-auto text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p>טוען את הכרטיסים שלך...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">שגיאה</h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchMyTickets}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              נסה שוב
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div
                  className="text-2xl font-bold"
                  style={{ color: colors.primary }}
                >
                  {tickets.length}
                </div>
                <div className="text-sm text-gray-600">סה"כ כרטיסים</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-green-600">
                  {activeTickets.length}
                </div>
                <div className="text-sm text-gray-600">זמינים למכירה</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-gray-500">
                  {soldTickets.length}
                </div>
                <div className="text-sm text-gray-600">נמכרו</div>
              </div>
            </div>

            {/* Empty State */}
            {tickets.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎫</div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  עדיין לא פרסמת כרטיסים
                </h2>
                <p className="text-gray-500 mb-6">
                  התחל למכור כרטיסים למשחקים ותרוויח כסף!
                </p>
                <button
                  onClick={() => navigate("/create-ticket")}
                  className="px-6 py-3 rounded-lg text-white font-medium"
                  style={{ backgroundColor: colors.primary }}
                >
                  פרסם כרטיס ראשון
                </button>
              </div>
            )}

            {/* Active Tickets */}
            {activeTickets.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  כרטיסים זמינים למכירה ({activeTickets.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeTickets.map((ticket) => (
                    <div key={ticket._id} className="relative">
                      <TicketCard
                        ticket={ticket}
                        showSellerInfo={false}
                        isOwner={true}
                        onDelete={handleDeleteTicket}
                      />

                      {/* Action Buttons Overlay */}
                      <div className="absolute top-2 left-2 flex gap-2">
                        <button
                          onClick={() =>
                            handleToggleSoldOut(ticket._id, ticket.isSoldOut)
                          }
                          className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors text-xs"
                          title="סמן כנמכר"
                        >
                          <CheckCircle size={14} />
                        </button>

                        <button
                          onClick={() => navigate(`/tickets/${ticket._id}`)}
                          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors text-xs"
                          title="צפה בפרטים"
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sold Tickets */}
            {soldTickets.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  כרטיסים שנמכרו ({soldTickets.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {soldTickets.map((ticket) => (
                    <div key={ticket._id} className="relative opacity-75">
                      <TicketCard
                        ticket={ticket}
                        showSellerInfo={false}
                        isOwner={true}
                        onDelete={handleDeleteTicket}
                      />

                      {/* Action Buttons Overlay */}
                      <div className="absolute top-2 left-2 flex gap-2">
                        <button
                          onClick={() =>
                            handleToggleSoldOut(ticket._id, ticket.isSoldOut)
                          }
                          className="bg-yellow-600 text-white p-2 rounded-lg hover:bg-yellow-700 transition-colors text-xs"
                          title="סמן כזמין למכירה"
                        >
                          ↩️
                        </button>

                        <button
                          onClick={() => navigate(`/tickets/${ticket._id}`)}
                          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors text-xs"
                          title="צפה בפרטים"
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default MyTickets;
