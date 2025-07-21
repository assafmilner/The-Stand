import {
  User,
  Calendar,
  Home,
  LogOut,
  Ticket,
  MessageCircle,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * RightSidebar renders the main vertical navigation menu used in desktop and mobile.
 * Provides quick access to home, fixtures, messages, friends, tickets, profile, and logout.
 *
 * Props:
 * - colors: team-specific color styles (used for border-top highlight)
 * - onLogout: optional logout callback (if not provided, defaults to localStorage clear + redirect)
 *
 * 📐 UI Notes:
 * - This component is styled as a fixed sidebar (right-aligned on large screens)
 * - Each menu item uses a consistent icon + label pattern with spacing
 * - Active highlight color is controlled by `colors.primary` passed from context
 */

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
          <li
            className="nav-item flex items-center gap-2"
            onClick={() => navigate("/friends")}
          >
            <Users size={18} /> חברים
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
