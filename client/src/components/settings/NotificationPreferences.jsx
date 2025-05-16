import React, { useState } from "react";
import { CheckCircle, AlertTriangle, Bell, Mail, MessageSquare } from "lucide-react";

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    messageNotifications: true,
    postLikes: true,
    postComments: true,
    newFollowers: false,
    teamUpdates: true,
    matchReminders: true,
  });
  
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePreferenceChange = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      // Here you would typically save to your API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSuccess("העדפות ההתראות עודכנו בהצלחה");
    } catch (err) {
      setError("שגיאה בעדכון העדפות ההתראות");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-right">
      {error && (
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Email Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Mail size={20} />
          התראות במייל
        </h3>
        
        <div className="space-y-3 mr-8">
          <label className="flex items-center justify-between">
            <span>קבלת התראות במייל</span>
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={() => handlePreferenceChange('emailNotifications')}
              className="toggle"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span>עדכונים על הקבוצה</span>
            <input
              type="checkbox"
              checked={preferences.teamUpdates}
              onChange={() => handlePreferenceChange('teamUpdates')}
              className="toggle"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span>תזכורות למשחקים</span>
            <input
              type="checkbox"
              checked={preferences.matchReminders}
              onChange={() => handlePreferenceChange('matchReminders')}
              className="toggle"
            />
          </label>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bell size={20} />
          התראות בדפדפן
        </h3>
        
        <div className="space-y-3 mr-8">
          <label className="flex items-center justify-between">
            <span>הפעלת התראות בדפדפן</span>
            <input
              type="checkbox"
              checked={preferences.pushNotifications}
              onChange={() => handlePreferenceChange('pushNotifications')}
              className="toggle"
            />
          </label>
        </div>
      </div>

      {/* Social Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare size={20} />
          התראות חברתיות
        </h3>
        
        <div className="space-y-3 mr-8">
          <label className="flex items-center justify-between">
            <span>הודעות חדשות</span>
            <input
              type="checkbox"
              checked={preferences.messageNotifications}
              onChange={() => handlePreferenceChange('messageNotifications')}
              className="toggle"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span>לייקים לפוסטים שלי</span>
            <input
              type="checkbox"
              checked={preferences.postLikes}
              onChange={() => handlePreferenceChange('postLikes')}
              className="toggle"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span>תגובות לפוסטים שלי</span>
            <input
              type="checkbox"
              checked={preferences.postComments}
              onChange={() => handlePreferenceChange('postComments')}
              className="toggle"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span>עוקבים חדשים</span>
            <input
              type="checkbox"
              checked={preferences.newFollowers}
              onChange={() => handlePreferenceChange('newFollowers')}
              className="toggle"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded hover:opacity-90 transition"
        >
          {loading ? "שומר..." : "שמור העדפות"}
        </button>
      </div>
    </div>
  );
};

export default NotificationPreferences;