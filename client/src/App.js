// client/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProviders } from "./AppProviders";
import LoginForm from "./pages/LoginForm";
import Signup from "./pages/Signup";
import VerifyEmailPage from "./pages/VerifyEmail";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Fixtures from "./pages/Fixtures";
import { useUser } from "./context/useUserContext";
import teamColors from "./utils/teamStyles";

function ColorManager() {
  const { user } = useUser();
  const colors = teamColors[user?.favoriteTeam] || {};

  React.useEffect(() => {
    if (colors.primary) {
      document.documentElement.style.setProperty("--color-primary", colors.primary);
      document.documentElement.style.setProperty("--color-secondary", colors.secondary);
    }
  }, [colors]);

  return null;
}

function PublicRoute({ children }) {
  const { user, loading } = useUser();
  if (loading) return <div className="text-center p-4">טוען...</div>;
  return !user ? children : <Navigate to="/home" replace />;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useUser();
  if (loading) return <div className="text-center p-4">טוען...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useUser();

  return (
    <AppProviders>
      <Router>
        <ColorManager />
        <Routes>
          <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />

          <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/verify-email" element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />

          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/fixtures" element={<ProtectedRoute><Fixtures /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to={user ? "/home" : "/login"} replace />} />
        </Routes>
      </Router>
    </AppProviders>
  );
}

