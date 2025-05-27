// client/src/App.js (Updated with Messages route)
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmailPage from "./pages/VerifyEmail";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Fixtures from "./pages/Fixtures";
import Tickets from "./pages/Tickets";
import Messages from "./pages/Messages"; 
import Friends from "pages/Friends";

// Ticket Components
import CreateTicketForm from "./components/tickets/CreateTicketForm";
import TicketDetails from "./components/tickets/TicketDetails";

// Context
import { useUser } from "./context/UserContext";

// Utils
import teamColors from "./utils/teamStyles";

function ColorManager() {
  const { user } = useUser();

  useEffect(() => {
    const colors = teamColors[user?.favoriteTeam];
    if (colors) {
      document.documentElement.style.setProperty("--color-primary", colors.primary);
      document.documentElement.style.setProperty("--color-secondary", colors.secondary);
    }
  }, [user?.favoriteTeam]);

  return null;
}

function App() {
  const { user } = useUser();
  const colors = teamColors[user?.favoriteTeam || "הפועל תל אביב"];

  return (
    <BrowserRouter>
      <ColorManager />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/fixtures" element={<Fixtures />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/messages" element={<Messages />} /> 
        <Route path="/friends" element={<Friends />} />

        <Route path="/create-ticket" element={<CreateTicketForm colors={colors} />} />
        <Route path="/tickets/:id" element={<TicketDetails colors={colors} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;