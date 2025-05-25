import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Edit, Undo2, CheckCircle, Trash2 } from "lucide-react";
import TicketCard from "./TicketCard";
import { useUser } from "../../context/UserContext";
import api from "../../utils/api";
import teamColors from "../../utils/teamStyles";

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
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
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
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את הכרטיס?")) return;
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

  const renderActions = (ticket, sold) => (
    <div className="flex justify-center gap-2 mt-4">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleToggleSoldOut(ticket._id, ticket.isSoldOut);
        }}
        className={`text-white px-3 py-1 rounded-md text-sm hover:opacity-90 transition ${
          sold ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {sold ? <Undo2 size={14} /> : <CheckCircle size={14} />}
        {sold ? "סמן כזמין" : "סמן כנמכר"}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/tickets/${ticket._id}`);
        }}
        className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition"
      >
        <Edit size={14} />
        צפה בפרטים
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteTicket(ticket._id);
        }}
        className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition"
      >
        <Trash2 size={14} />
        מחק
      </button>
    </div>
  );

  const activeTickets = tickets.filter((ticket) => !ticket.isSoldOut);
  const soldTickets = tickets.filter((ticket) => ticket.isSoldOut);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold" style={{ color: colors.primary }}>
          הכרטיסים שלי
        </h1>
        <button
          onClick={() => navigate("/create-ticket")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colors.primary }}
        >
          <Plus size={18} />
          הוסף כרטיס
        </button>
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold" style={{ color: colors.primary }}>
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
      )}

      {!loading && !error && (
        <>
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

          {activeTickets.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                כרטיסים זמינים למכירה ({activeTickets.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTickets.map((ticket) => (
                  <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    showSellerInfo={false}
                    extraActions={renderActions(ticket, false)}
                  />
                ))}
              </div>
            </div>
          )}

          {soldTickets.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                כרטיסים שנמכרו ({soldTickets.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {soldTickets.map((ticket) => (
                  <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    showSellerInfo={false}
                    extraActions={renderActions(ticket, true)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyTickets;