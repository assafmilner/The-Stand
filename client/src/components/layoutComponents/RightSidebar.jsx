import { User, Calendar, Bell, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RightSidebar = ({ user, colors, onLogout }) => {
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
        className="dashboard-card group-info"
        style={{
          marginBottom: "1.5rem",
          borderTop: `4px solid ${colors.primary}`,
        }}
      >
        <h3 className="card-title">הקבוצה שלך: {user?.favoriteTeam}</h3>
        <p className="group-desc">זו הקבוצה שאתה עוקב אחריה בברירת מחדל.</p>
        <button
          className="join-group-button"
          onClick={() => alert("בעתיד: דיאלוג בחירת קבוצה")}
        >
          שנה קבוצה
        </button>
      </section>
    </aside>
  );
};

export default RightSidebar;
