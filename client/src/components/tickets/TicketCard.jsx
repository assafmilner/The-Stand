// client/src/components/tickets/TicketCard.jsx
import React from "react";
import { Calendar, MapPin, Users, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import teamNameMap from "../../utils/teams-hebrew";

const TicketCard = ({
  ticket,
  showSellerInfo = true,
  onEdit,
  onDelete,
  isOwner = false,
}) => {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("he-IL", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
    }).format(price);
  };

  const getTeamName = (englishName) => {
    return teamNameMap[englishName]?.name || englishName;
  };

  const handleCardClick = () => {
    if (!isOwner) {
      navigate(`/tickets/${ticket._id}`);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-4 transition-all hover:shadow-lg border border-gray-200 ${
        !isOwner ? "cursor-pointer" : ""
      }`}
      onClick={handleCardClick}
    >
      {/* Match Info Header */}
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

        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(ticket);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ערוך
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(ticket._id);
              }}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              מחק
            </button>
          </div>
        )}
      </div>

      {/* Match Details */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={16} />
          <span>{formatDate(ticket.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="font-medium">{ticket.time}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={16} />
          <span>{ticket.stadium}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Users size={16} />
          <span>{ticket.quantity} כרטיסים</span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-2xl font-bold text-green-600">
          {formatPrice(ticket.price)}
          <span className="text-sm text-gray-500 font-normal"> לכרטיס</span>
        </div>
        <div className="text-lg font-semibold text-gray-700">
          סה"כ: {formatPrice(ticket.price * ticket.quantity)}
        </div>
      </div>

      {/* Notes */}
      {ticket.notes && (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{ticket.notes}</p>
        </div>
      )}

      {/* Seller Info */}
      {showSellerInfo && ticket.sellerId && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
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

          {!isOwner && !ticket.isSoldOut && (
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
  );
};

export default TicketCard;
