import React, { useState, useEffect } from "react";
import RightSidebar from "./RightSidebar";
import "../../styles/index.css";

/**
 * MobileHamburgerMenu displays a hamburger icon that toggles a mobile sidebar.
 * When opened, the sidebar renders the RightSidebar component.
 *
 * Props:
 * - colors: team color styles used inside RightSidebar
 * - onLogout: function triggered when user logs out from sidebar
 */

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
      {/* Hamburger button visible on mobile */}
      <button className="hamburger-menu" onClick={() => setIsOpen(true)}>
        ☰
      </button>
      {/* Fullscreen backdrop with slide-out sidebar */}
      {isOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setIsOpen(false)}
        >
          <div className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            <RightSidebar colors={colors} onLogout={onLogout} />
          </div>
        </div>
      )}
    </>
  );
};

export default MobileHamburgerMenu;
