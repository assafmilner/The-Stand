import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

// Import the form components
import ProfilePictureForm from "./ProfilePictureForm";
import PersonalInfoForm from "./PersonalInfoForm";
import ChangePasswordForm from "./ChangePasswordForm";
import DeleteAccountForm from "./DeleteAccountForm";

// Tab configuration
const TABS = [
  { id: "personal", label: "פרטים אישיים", component: PersonalInfoForm },
  { id: "password", label: "שינוי סיסמה", component: ChangePasswordForm },
  { id: "delete", label: "מחיקת חשבון", component: DeleteAccountForm },
];

/**
 * SettingsForm renders the user settings page.
 *
 * Features:
 * - Profile picture uploader
 * - Tab-based navigation for:
 *    - Personal Info
 *    - Password change
 *    - Account deletion
 * - User must be authenticated to access
 */
const SettingsForm = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  // Enable smooth scroll behavior while mounted
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  /**
   * Returns the component corresponding to the active tab.
   */
  const renderActiveComponent = () => {
    const activeTabConfig = TABS.find((tab) => tab.id === activeTab);
    if (!activeTabConfig) return null;

    const Component = activeTabConfig.component;
    return <Component user={user} />;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>טוען...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 py-10">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-4xl font-bold mb-6 text-right">הגדרות</h2>

          {/* Profile Picture Section */}
          <div className="mb-8">
            <ProfilePictureForm user={user} />
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center gap-6 my-8 border-b pb-3 flex-wrap text-right">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`secondary-bg-primary-text ${
                  activeTab === tab.id ? "bg-primary text-secondary" : ""
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tab Content */}
          <div className="scroll-mt-28">{renderActiveComponent()}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsForm;
