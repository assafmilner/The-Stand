import React from "react";
import { Calendar, MapPin, Users, ShoppingCart, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import teamNameMap from "../../utils/teams-hebrew";
import stadiums from "../../utils/stadiums";

/**
 * TicketCard component
 *
 * Displays a summary card for a single ticket listing.
 * - Shows match details (teams, date, time, stadium)
 * - Shows quantity, price per ticket, and total price
 * - Optional notes and seller information
 * - Clickable to navigate to ticket detail page
 * - Supports additional actions (edit/delete/toggle sold)
 *
 * Design:
 * - Responsive, hoverable card layout
 * - Uses Lucide icons for better UX
 * - Tailwind-based styling
 */
const TicketCard = ({ ticket, showSellerInfo = true, extraActions }) => {
  const navigate = useNavigate();

  /**
   * Formats a date string into a Hebrew-readable format.
   */
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("he-IL", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  /**
   * Formats number into ILS currency string.
   */
  const formatPrice = (price) =>
    new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
    }).format(price);

  /**
   * Translates English team name to Hebrew if available.
   */
  const getTeamName = (englishName) =>
    teamNameMap[englishName]?.name || englishName;

  /**
   * Navigates to ticket details page on card click.
   */
  const handleCardClick = () => {
    navigate(`/tickets/${ticket._id}`);
  };

  /**
   * Renders the ticket summary card layout.
   * - Top section: teams and sold-out badge
   * - Middle: details grid (date, time, stadium, quantity)
   * - Bottom: price breakdown and optional notes
   * - Footer: actions and seller info
   */
  return (
    <div
      className="bg-white rounded-xl shadow-md p-4 transition-all hover:shadow-lg border border-gray-200 cursor-pointer h-full flex flex-col justify-between"
      onClick={handleCardClick}
      style={{ minHeight: "250px" }}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold text-gray-800">
              {getTeamName(ticket.homeTeam)} נגד {getTeamName(ticket.awayTeam)}
            </div>
            {ticket.isSoldOut && (
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                נמכר
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={16} />
            <span>{formatDate(ticket.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} />
            <span className="font-medium">{ticket.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={16} />
            <span>{stadiums[ticket.stadium] || ticket.stadium}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={16} />
            <span>{ticket.quantity} כרטיסים</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl font-bold text-green-600">
            {formatPrice(ticket.price)}
            <span className="text-sm text-gray-500 font-normal"> לכרטיס</span>
          </div>
          <div className="text-lg font-semibold text-gray-700">
            סה"כ: {formatPrice(ticket.price * ticket.quantity)}
          </div>
        </div>

        {ticket.notes && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{ticket.notes}</p>
          </div>
        )}
      </div>

      <div>
        {extraActions && <div className="mt-4">{extraActions}</div>}

        {showSellerInfo && ticket.sellerId && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-4">
            <div className="flex items-center gap-2">
              <img
                src={ticket.sellerId.profilePicture || "/defaultProfilePic.png"}
                alt={ticket.sellerId.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {ticket.sellerId.name}
                </p>
                {ticket.sellerId.favoriteTeam && (
                  <p className="text-xs text-gray-500">
                    אוהד {ticket.sellerId.favoriteTeam}
                  </p>
                )}
              </div>
            </div>

            {!ticket.isSoldOut && (
              <button
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/tickets/${ticket._id}`);
                }}
              >
                <ShoppingCart size={14} />
                צור קשר
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
