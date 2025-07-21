import React from "react";
import { useUser } from "../../context/UserContext";
import Header from "../layout/Header";
import "../../styles/index.css";

/**
 * ProfileLayout wraps the user profile pages in a consistent layout.
 * Includes:
 * - Header (with user context)
 * - Main content container with max width
 * - Footer (static)
 *
 * Usage: Used as a wrapper around profile-related routes.
 */
const ProfileLayout = ({ children }) => {
  const { user } = useUser();

  return (
    <div className="home-container">
      <Header user={user} />

      <main className="home-main">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <section className="w-full">{children}</section>
        </div>
      </main>

      <footer className="home-footer">
        © 2025 אסף מילנר | כל הזכויות שמורות
      </footer>
    </div>
  );
};

export default ProfileLayout;
