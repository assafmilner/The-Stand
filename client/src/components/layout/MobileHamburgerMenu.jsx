
// client/src/components/layout/MobileHamburgerMenu.jsx
import React, { useState, useEffect } from "react";
import RightSidebar from "./RightSidebar";
import "../../styles/index.css";

const MobileHamburgerMenu = ({ colors, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on window resize (if user rotates device or resizes window)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <button
        className="hamburger-menu"
        onClick={() => setIsOpen(true)}
      >
        ☰
      </button>

      {isOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="mobile-sidebar"
            onClick={(e) => e.stopPropagation()}
          >
            <RightSidebar colors={colors} onLogout={onLogout} />
          </div>
        </div>
      )}
    </>
  );
};

export default MobileHamburgerMenu;
