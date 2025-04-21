import React from "react";
import { useNavigate } from "react-router-dom";

const ProfileButton = ({ name }) => {
  const navigate = useNavigate();
  const firstLetter = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <button
      onClick={() => navigate("/settings")}
      className="w-10 h-10 rounded-full bg-green-600 text-white font-bold flex items-center justify-center hover:bg-green-700 transition"
    >
      {firstLetter}
    </button>
  );
};

export default ProfileButton;
