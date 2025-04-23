import React, { useEffect } from "react";
import Header from "../components/Header";
import { useUser } from "../components/context/UserContext";
import PersonalInfoTab from "../pages/settingsComponents/PersonalInfo";
import ChangePasswordTab from "../pages/settingsComponents/ChangePassword";
import ProfilePictureTab from "../pages/settingsComponents/ProfilePicture";
import DeleteAccountTab from "../pages/settingsComponents/DeleteAccount";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    // Enable smooth scrolling on mount
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      // Reset scroll behavior on unmount
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

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
      <Header user={user} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-4xl font-bold mb-6 text-right">הגדרות</h2>
          <ProfilePictureTab user={user} />

          <div className="flex justify-center gap-6 my-8 border-b pb-3 flex-wrap text-right ">
            <a href="#personal" className="secondary-bg-primary-text">
              פרטים אישיים
            </a>
            <a href="#password" className="secondary-bg-primary-text">
              שינוי סיסמה
            </a>
            <a href="#delete" className="secondary-bg-primary-text">
              מחיקת חשבון
            </a>
          </div>

          <div id="personal" className="mb-10 scroll-mt-28">
            <PersonalInfoTab user={user} />
          </div>

          <div id="password" className="mb-10 scroll-mt-28">
            <ChangePasswordTab />
          </div>

          <div id="delete" className="scroll-mt-28">
            <DeleteAccountTab />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
