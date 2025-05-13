import {
  User,
  Calendar,
  Bell,
  Settings,
  LogOut,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const RightSidebar = ({ user, colors, onChatSelect }) => {
  const navigate = useNavigate();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // דמה של משתמשים מחוברים - זה יצריך להיות מחובר ל-socket בפועל
  useEffect(() => {
    setConnectedUsers([
      { name: "יוסי אוהד", favoriteTeam: "מכבי תל אביב", online: true },
      { name: "רחל ירוקה", favoriteTeam: "הפועל תל אביב", online: true },
      { name: "דוד כחול", favoriteTeam: 'בית"ר ירושלים', online: false },
      { name: "שרה לבנה", favoriteTeam: "מכבי חיפה", online: true },
    ]);
  }, []);

  return (
    <aside className="side-bar right-0">
      <nav
        className="dashboard-card"
        style={{
          marginBottom: "1.5rem",
          borderTop: `4px solid ${colors.primary}`,
        }}
      >
        <ul className="nav-list space-y-2">
          <li
            className="nav-item flex items-center gap-2"
            onClick={() => navigate("/home")}
          >
            <User size={18} /> דף הבית
          </li>
          <li
            className="nav-item flex items-center gap-2"
            onClick={() => navigate("/fixtures")}
          >
            <Calendar size={18} /> משחקים
          </li>
          <li className="nav-item flex items-center gap-2">
            <Bell size={18} /> התראות
          </li>
          <li className="nav-item flex items-center gap-2">
            <Settings size={18} /> פרופיל
          </li>
          <li
            className="nav-item flex items-center gap-2 text-red-600"
            onClick={handleLogout}
          >
            <LogOut size={18} /> התנתק
          </li>
        </ul>
      </nav>

      <section
        className="dashboard-card users-online"
        style={{
          marginBottom: "1.5rem",
          borderTop: `4px solid ${colors.primary}`,
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="card-title">
            משתמשים ({connectedUsers.filter((u) => u.online).length})
          </h3>
          <button onClick={() => setShowUsers(!showUsers)}>
            {showUsers ? "הסתר" : "הצג"}
          </button>
        </div>

        
      </section>
    </aside>
  );
};

export default RightSidebar;
