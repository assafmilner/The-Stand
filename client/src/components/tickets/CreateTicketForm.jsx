// client/src/components/tickets/CreateTicketForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Users, DollarSign } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useLeague, useFixtures } from "../../hooks/useLeague";
import api from "../../utils/api";
import teamNameMap from "../../utils/teams-hebrew";
import stadiums from "../../utils/stadiums";

const CreateTicketForm = ({ colors }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { league } = useLeague(user?.favoriteTeam);
  const { fixtures, loading: fixturesLoading } = useFixtures(league, user?.favoriteTeam);

  const [formData, setFormData] = useState({
    matchId: "",
    quantity: 1,
    price: "",
    notes: "",
  });

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [upcomingMatches, setUpcomingMatches] = useState([]);

  useEffect(() => {
    if (fixtures.length > 0 && user?.favoriteTeam) {
      // Get English team name for filtering
      const reverseTeamMap = Object.entries(teamNameMap).reduce(
        (acc, [eng, data]) => {
          acc[data.name] = eng;
          return acc;
        },
        {}
      );
      const favoriteTeamEnglish = reverseTeamMap[user.favoriteTeam];

      if (favoriteTeamEnglish) {
        // Filter matches for favorite team only (both home and away games)
        const teamMatches = fixtures.filter(match => 
          match.homeTeam === favoriteTeamEnglish || match.awayTeam === favoriteTeamEnglish
        ).slice(0, 30); // Show more matches for testing

        setUpcomingMatches(teamMatches);
      }
    }
  }, [fixtures, user?.favoriteTeam]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "matchId" && value) {
      const match = upcomingMatches.find(m => m.id === value);
      setSelectedMatch(match);
    }
  };

  const formatMatchOption = (match) => {
    const reverseTeamMap = Object.entries(teamNameMap).reduce(
      (acc, [eng, data]) => {
        acc[data.name] = eng;
        return acc;
      },
      {}
    );
    const favoriteTeamEnglish = reverseTeamMap[user?.favoriteTeam];
    
    const homeTeam = teamNameMap[match.homeTeam]?.name || match.homeTeam;
    const awayTeam = teamNameMap[match.awayTeam]?.name || match.awayTeam;
    const date = new Date(match.date).toLocaleDateString("he-IL", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const stadium = stadiums[match.venue] || match.venue;
    
    // Determine if it's home or away game for the user's favorite team
    const isHomeGame = match.homeTeam === favoriteTeamEnglish;
    const gameType = isHomeGame ? "(בית)" : "(חוץ)";
    
    return `${homeTeam} נגד ${awayTeam} ${gameType} - ${date} - ${stadium}`;
  };

  const validateForm = () => {
    if (!formData.matchId) {
      setError("יש לבחור משחק");
      return false;
    }
    
    if (!formData.quantity || formData.quantity < 1) {
      setError("כמות הכרטיסים חייבת להיות לפחות 1");
      return false;
    }
    
    if (!formData.price || formData.price < 0) {
      setError("מחיר הכרטיס לא יכול להיות שלילי");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const ticketData = {
        matchId: selectedMatch.id,
        homeTeam: selectedMatch.homeTeam,
        awayTeam: selectedMatch.awayTeam,
        date: selectedMatch.date,
        time: selectedMatch.time,
        stadium: selectedMatch.venue,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        notes: formData.notes.trim(),
      };

      await api.post("/api/tickets", ticketData);
      
      // Success - redirect to my tickets page
      navigate("/tickets", { 
        state: { message: "הכרטיס נוסף בהצלחה לשוק!" }
      });
      
    } catch (err) {
      console.error("Error creating ticket:", err);
      setError(err.response?.data?.message || "שגיאה ביצירת הכרטיס");
    } finally {
      setLoading(false);
    }
  };

  if (fixturesLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p>טוען משחקים קרובים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold" style={{ color: colors.primary }}>
          מכור כרטיס למשחק של {user?.favoriteTeam}
        </h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Match Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline mr-2" size={16} />
              בחר משחק של {user?.favoriteTeam} *
            </label>
            <select
              value={formData.matchId}
              onChange={(e) => handleInputChange("matchId", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">בחר משחק של {user?.favoriteTeam}...</option>
              {upcomingMatches.map(match => (
                <option key={match.id} value={match.id}>
                  {formatMatchOption(match)}
                </option>
              ))}
            </select>
            {upcomingMatches.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                אין משחקים זמינים עבור {user?.favoriteTeam} כרגע
              </p>
            )}
          </div>

          {/* Selected Match Preview */}
          {selectedMatch && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">פרטי המשחק הנבחר:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-blue-700">
                  <Calendar size={16} />
                  <span>
                    {new Date(selectedMatch.date).toLocaleDateString("he-IL", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-blue-700">
                  <span className="font-medium">שעה: {selectedMatch.time}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-700">
                  <MapPin size={16} />
                  <span>{stadiums[selectedMatch.venue] || selectedMatch.venue}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline mr-2" size={16} />
              כמות כרטיסים *
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.quantity}
              onChange={(e) => handleInputChange("quantity", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="כמה כרטיסים אתה מוכר?"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline mr-2" size={16} />
              מחיר לכרטיס (₪) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="כמה עולה כרטיס אחד?"
              required
            />
            {formData.price && formData.quantity && (
              <p className="text-sm text-gray-600 mt-1">
                סה"כ עבור {formData.quantity} כרטיסים: {" "}
                <span className="font-semibold text-green-600">
                  {(parseFloat(formData.price) * parseInt(formData.quantity)).toLocaleString("he-IL")} ₪
                </span>
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              הערות נוספות
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              maxLength="500"
              placeholder="מידע נוסף על הכרטיסים (מיקום במגרש, הגבלות וכו')"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.notes.length}/500 תווים
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300  rounded-lg font-medium  transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={loading || !selectedMatch}
              className="flex-1 px-6 py-3  rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: loading || !selectedMatch ? '#ccc' : colors.primary 
              }}
            >
              {loading ? "מפרסם..." : "פרסם כרטיס"}
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 טיפים למכירה מוצלחת:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• הגדר מחיר הוגן בהשוואה לשוק</li>
          <li>• ציין מידע חשוב על מיקום הכרטיסים</li>
          <li>• היה זמין לתקשורת עם קונים פוטנציאליים</li>
          <li>• עדכן אם הכרטיסים נמכרו</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateTicketForm;