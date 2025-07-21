import React, { useState, useEffect, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  MessageCircle,
  Star,
  Shield,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useChat } from "../../context/ChatContext";
import Layout from "../layout/Layout";
import api from "../../utils/api";
import teamNameMap from "../../utils/teams-hebrew";
import stadiums from "../../utils/stadiums";

const ChatModal = lazy(() => import("../chat/ChatModal"));

/**
 * TicketDetails component
 *
 * Displays full information for a single ticket.
 * - Shows match data, pricing, seller details, notes, safety tips, etc.
 * - Allows user to contact the seller via chat modal
 * - Lazy-loads ChatModal for performance optimization
 *
 * Layout:
 * - Two-column grid: main content + sidebar
 * - Uses Tailwind utility classes for styling
 */

const TicketDetails = ({ colors }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { markAsRead } = useChat();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);

  /**
   * useEffect hook
   *
   * Triggers fetch for ticket details by ID.
   */

  useEffect(() => {
    /**
     * fetchTicketDetails
     *
     * Retrieves ticket information from the backend.
     * Handles loading and error states.
     */
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/api/tickets/${id}`);
      setTicket(response.data);
    } catch (err) {
      console.error("Error fetching ticket details:", err);
      setError("שגיאה בטעינת פרטי הכרטיס");
    } finally {
      setLoading(false);
    }
  };

  /**
   * formatDate
   *
   * Converts a date string to Hebrew-readable format.
   */

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("he-IL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  /**
   * formatPrice
   *
   * Formats a number into ILS currency string.
   */

  const formatPrice = (price) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
    }).format(price);
  };

  /**
   * getTeamName
   *
   * Maps an English team name to Hebrew.
   */

  const getTeamName = (englishName) => {
    return teamNameMap[englishName]?.name || englishName;
  };

  /**
   * getStadiumName
   *
   * Maps stadium ID to human-readable stadium name.
   */

  const getStadiumName = (venue) => {
    return stadiums[venue] || venue;
  };

  /**
   * handleContactSeller
   *
   * Prepares and opens the chat modal with the ticket's seller.
   */

  const handleContactSeller = () => {
    if (!ticket || !ticket.sellerId) {
      alert("שגיאה: לא ניתן לפתוח צ'אט עם המוכר");
      return;
    }

    // Prepare seller data for chat modal
    const sellerData = {
      _id: ticket.sellerId._id,
      name: ticket.sellerId.name,
      profilePicture: ticket.sellerId.profilePicture,
    };

    setSelectedSeller(sellerData);
    setIsChatOpen(true);
  };

  /**
   * handleCloseChatModal
   *
   * Closes the chat modal and resets the selected seller.
   */

  const handleCloseChatModal = () => {
    setIsChatOpen(false);
    setSelectedSeller(null);
  };

  const isOwnTicket = user && ticket && ticket.sellerId._id === user._id;

  /**
   * Conditional rendering for:
   * - Loading screen
   * - Error fallback
   * - Full ticket layout (main + sidebar)
   */

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p>טוען פרטי כרטיס...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            שגיאה בטעינת הכרטיס
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            חזור לעמוד הבית
          </button>
        </div>
      </div>
    );
  }
  
  /**
   * JSX Render:
   * - Header with back button and "sold" label
   * - Left: game, pricing, notes
   * - Right: seller info, safety tips, listing metadata
   * - Chat modal loaded via Suspense
   */

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold" style={{ color: colors.primary }}>
          פרטי כרטיס
        </h1>
        {ticket.isSoldOut && (
          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
            נמכר
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Match Info */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: colors.primary }}
            >
              פרטי המשחק
            </h2>

            <div className="space-y-4">
              {/* Teams */}
              <div className="text-center py-4">
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  {getTeamName(ticket.homeTeam)} נגד{" "}
                  {getTeamName(ticket.awayTeam)}
                </div>
                <div className="flex items-center justify-center gap-8 text-gray-600">
                  <div className="text-center">
                    <div className="text-sm">קבוצת בית</div>
                    <div className="font-semibold">
                      {getTeamName(ticket.homeTeam)}
                    </div>
                  </div>
                  <div
                    className="text-3xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    VS
                  </div>
                  <div className="text-center">
                    <div className="text-sm">קבוצת חוץ</div>
                    <div className="font-semibold">
                      {getTeamName(ticket.awayTeam)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">תאריך המשחק</div>
                    <div className="font-semibold">
                      {formatDate(ticket.date)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    ⏰
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">שעת התחלה</div>
                    <div className="font-semibold">{ticket.time}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-green-600" />
                  <div>
                    <div className="text-sm text-gray-600">אצטדיון</div>
                    <div className="font-semibold">
                      {getStadiumName(ticket.stadium)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users size={20} className="text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-600">כמות כרטיסים</div>
                    <div className="font-semibold">
                      {ticket.quantity} כרטיסים
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: colors.primary }}
            >
              מחירים
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">מחיר לכרטיס</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(ticket.price)}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 bg-green-50 rounded-lg px-4">
                <span className="font-semibold text-gray-800">
                  סה"כ עבור {ticket.quantity} כרטיסים
                </span>
                <span className="text-3xl font-bold text-green-600">
                  {formatPrice(ticket.price * ticket.quantity)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {ticket.notes && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: colors.primary }}
              >
                הערות המוכר
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {ticket.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Seller Info */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3
              className="text-lg font-bold mb-4"
              style={{ color: colors.primary }}
            >
              פרטי המוכר
            </h3>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={ticket.sellerId.profilePicture || "/defaultProfilePic.png"}
                alt={ticket.sellerId.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
              <div>
                <h4 className="font-semibold text-lg">
                  {ticket.sellerId.name}
                </h4>
                {ticket.sellerId.favoriteTeam && (
                  <p className="text-sm text-gray-600">
                    אוהד {ticket.sellerId.favoriteTeam}
                  </p>
                )}
                {ticket.sellerId.location && (
                  <p className="text-sm text-gray-500">
                    📍 {ticket.sellerId.location}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Button */}
            {!isOwnTicket && !ticket.isSoldOut && (
              <button
                onClick={handleContactSeller}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <MessageCircle size={20} />
                צור קשר עם המוכר
              </button>
            )}

            {isOwnTicket && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-700 text-center">
                  זה הכרטיס שלך
                </p>
              </div>
            )}

            {ticket.isSoldOut && !isOwnTicket && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700 text-center font-medium">
                  כרטיס זה נמכר
                </p>
              </div>
            )}
          </div>

          {/* Safety Tips */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3
              className="text-lg font-bold mb-4 flex items-center gap-2"
              style={{ color: colors.primary }}
            >
              <Shield size={20} />
              טיפים לרכישה בטוחה
            </h3>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>פגש את המוכר במקום ציבורי</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>בדוק את הכרטיסים לפני התשלום</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>שמור על תקשורת דרך הפלטפורמה</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>אל תעביר כסף מראש</span>
              </div>
            </div>
          </div>

          {/* Listing Details */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3
              className="text-lg font-bold mb-4"
              style={{ color: colors.primary }}
            >
              פרטי הרישום
            </h3>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>תאריך פרסום:</span>
                <span>
                  {new Date(ticket.createdAt).toLocaleDateString("he-IL")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>מספר צפיות:</span>
                <span>--</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {isChatOpen && selectedSeller && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg">
                <p>טוען צ'אט...</p>
              </div>
            </div>
          }
        >
          <ChatModal
            isOpen={isChatOpen}
            onClose={handleCloseChatModal}
            otherUser={selectedSeller}
            onMarkAsRead={markAsRead}
          />
        </Suspense>
      )}
    </Layout>
  );
};

export default TicketDetails;
