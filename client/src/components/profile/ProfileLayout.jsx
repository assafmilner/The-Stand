import React from "react";
import { useUser } from "../context/UserContext";
import Header from "../layoutComponents/Header";
import "../../index.css";

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
        © 2025 אסף מילנר וליאת מרלי | כל הזכויות שמורות
      </footer>
    </div>
  );
};

export default ProfileLayout;
