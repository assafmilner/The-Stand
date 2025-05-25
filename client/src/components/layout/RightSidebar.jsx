import {
  User,
  Calendar,
  Bell,
  Home,
  LogOut,
  Ticket,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const RightSidebar = ({ colors, onLogout }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

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
            <Home size={18} /> דף הבית
          </li>
          <li
            className="nav-item flex items-center gap-2"
            onClick={() => navigate("/fixtures")}
          >
            <Calendar size={18} /> משחקים
          </li>
          <li
            className="nav-item flex items-center gap-2"
            onClick={() => navigate("/messages")}
          >
            <MessageCircle size={18} /> הודעות
          </li>
          <li className="nav-item flex items-center gap-2">
            <Bell size={18} /> התראות
          </li>
          <li
            className="nav-item flex items-center gap-2"
            onClick={() => navigate("/tickets")}
          >
            <Ticket size={18} /> כרטיסים
          </li>
          <li
            className="nav-item flex items-center gap-2"
            onClick={() => navigate("/profile")}
          >
            <User size={18} /> פרופיל
          </li>
          <li
            className="nav-item flex items-center gap-2 text-red-600"
            onClick={handleLogout}
          >
            <LogOut size={18} /> התנתק
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default RightSidebar;
