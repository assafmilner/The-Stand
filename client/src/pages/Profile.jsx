import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Edit3,
  MapPin,
  Calendar,
  Users,
  Award,
  MessageCircle,
  UserPlus,
  Phone,
  Heart,
  Mail,
} from "lucide-react";
import axios from "axios";
import ProfileLayout from "../components/ProfileLayout";
import { useUser } from "../components/context/UserContext";
import PostList from "../components/post/PostList";
import teamColors from "../utils/teamStyles";
import teamNameMap from "../utils/teams-hebrew";
import "../index.css";

const Profile = () => {
  const { user, setUser } = useUser();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coverImage, setCoverImage] = useState(user?.coverImage || null);
  const [uploading, setUploading] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [friendsCount, setFriendsCount] = useState(0);
  const coverInputRef = useRef(null);
  const colors = teamColors[user?.favoriteTeam || "הפועל תל אביב"];

  // Helper function to get team data
  const getTeamData = () => {
    const teamEnglishName = Object.keys(teamNameMap).find(
      (key) => teamNameMap[key].name === user?.favoriteTeam
    );
    return teamNameMap[teamEnglishName] || {};
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        // שליפת פוסטים של המשתמש
        const postsResponse = await axios.get(
          `http://localhost:3001/api/posts?authorId=${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserPosts(postsResponse.data);

        // סימולציה של מספר חברים (אפשר להחליף בקריאת API אמיתית)
        setFriendsCount(Math.floor(Math.random() * 500) + 50);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleCoverUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // בדיקת גודל קובץ (מקסימום 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("הקובץ גדול מדי. גודל מקסימלי: 5MB");
      return;
    }

    // בדיקת סוג קובץ
    if (!file.type.startsWith("image/")) {
      alert("אנא בחר קובץ תמונה בלבד");
      return;
    }

    const formData = new FormData();
    formData.append("coverImage", file);

    setUploading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        "http://localhost:3001/api/users/upload-cover",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setCoverImage(response.data.coverImage);
      setUser((prev) => ({ ...prev, coverImage: response.data.coverImage }));
    } catch (error) {
      console.error("Error uploading cover image:", error);
      alert("שגיאה בהעלאת תמונת קאבר");
    } finally {
      setUploading(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }
    return phone;
  };

  const formatJoinDate = (date) => {
    return new Date(date).toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
    });
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <span>טוען פרופיל...</span>
      </div>
    );
  }

  return (
    <ProfileLayout>
      <div className="profile-container bg-gray-50" dir="rtl">
        {/* תמונת קאבר */}
        <div className="relative profile-cover h-64 md:h-80 rounded-b-2xl overflow-hidden">
          {coverImage ? (
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              }}
            />
          )}

          <div className="cover-overlay" />

          <button
            onClick={() => coverInputRef.current?.click()}
            className="upload-cover-btn"
            disabled={uploading}
            title="שנה תמונת קאבר"
          >
            {uploading ? (
              <div className="animate-spin text-2xl">⏳</div>
            ) : (
              <Camera size={20} className="text-gray-700" />
            )}
          </button>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />
        </div>

        {/* מידע פרופיל */}
        <div className="relative px-4 md:px-8 pb-6">
          <div className="animate-fade-in-up">
            <div className="flex flex-col lg:flex-row lg:items-end -mt-16 md:-mt-20 gap-6">
              {/* תמונת פרופיל ושם - מתחת לקאבר */}
              <div className="flex items-end gap-4">
                <div className="relative">
                  <img
                    src={
                      user.profilePicture ||
                      "http://localhost:3001/assets/defaultProfilePic.png"
                    }
                    alt="Profile"
                    className="profile-avatar w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                  <div
                    className="profile-team-badge"
                    style={{ backgroundColor: colors.primary }}
                  />
                </div>

                {/* שם המשתמש */}
                <div className="pb-1">
                  <h1 className="text-2xl md:text-3xl font-bold  mb-2">
                    {user.name}
                  </h1>
                  <p className="text-gray-500 text-lg">
                    אוהד{" "}
                    <span style={{ color: colors.primary, fontWeight: "bold" }}>
                      {user.favoriteTeam}
                    </span>
                  </p>
                </div>
              </div>

              {/* סטטיסטיקות ופעולות */}
              <div className="flex-1">
                <div className="profile-stats text-sm mb-4">
                  <div className="profile-stat">
                    <div className="flex items-center gap-2">
                      <Users size={20} />
                      <span className="font-bold ">{friendsCount}</span>
                      <span className="font-bold ">חברים</span>
                    </div>
                  </div>

                  <div className="profile-stat">
                    <div className="flex items-center gap-2">
                      <Award size={20} />
                      <span className="font-bold ">{userPosts.length}</span>
                      <span className="font-bold ">פוסטים</span>
                    </div>
                  </div>

                  <div className="profile-stat">
                    <div className="flex items-center gap-2">
                      <Calendar size={20} />
                      <span className="font-bold ">
                        הצטרף ב{formatJoinDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* כפתורי פעולה */}
                <div className="profile-actions">
                  <button className="profile-btn primary">
                    <UserPlus size={18} />
                    הוסף לחברים
                  </button>
                  <button className="profile-btn secondary">
                    <MessageCircle size={18} />
                    שלח הודעה
                  </button>
                  <button
                    className="profile-btn secondary"
                    onClick={() => (window.location.href = "/settings")}
                  >
                    <Edit3 size={18} />
                    ערוך פרופיל
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* רשת תוכן */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 profile-grid">
            {/* עמודה שמאל - מידע */}
            <div className="lg:col-span-1 space-y-6">
              {/* כרטיס מידע אישי */}
              <div className="profile-info-card">
                <h2 className="flex items-center gap-2">
                  <Users size={20} />
                  פרטים אישיים
                </h2>

                {user.bio && (
                  <div className="mb-4">
                    <p className="profile-bio">
                      {showFullBio || user.bio.length <= 100
                        ? user.bio
                        : `${user.bio.substring(0, 100)}...`}
                      {user.bio.length > 100 && (
                        <button
                          onClick={() => setShowFullBio(!showFullBio)}
                          className="bio-toggle-btn"
                        >
                          {showFullBio ? "הצג פחות" : "הצג עוד"}
                        </button>
                      )}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {user.location && (
                    <div className="profile-info-item">
                      <MapPin size={18} className="profile-info-icon" />
                      <span>מתגורר ב{user.location}</span>
                    </div>
                  )}

                  {user.email && (
                    <div className="profile-info-item">
                      <Mail size={18} className="profile-info-icon" />
                      <span>{user.email}</span>
                    </div>
                  )}

                  {user.phone && (
                    <div className="profile-info-item">
                      <Phone size={18} className="profile-info-icon" />
                      <span>{formatPhoneNumber(user.phone)}</span>
                    </div>
                  )}

                  <div className="profile-info-item">
                    <Calendar size={18} className="profile-info-icon" />
                    <span>
                      הצטרף בתאריך{" "}
                      {new Date(user.createdAt).toLocaleDateString("he-IL")}
                    </span>
                  </div>
                </div>
              </div>

              {/* כרטיס קבוצת הלב */}
              <div
                className="profile-team-card"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="profile-team-icon">
                    <Heart size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">קבוצת הלב</h3>
                    <p className="opacity-90 text-sm">{user.favoriteTeam}</p>
                    {getTeamData().badge && (
                      <img
                        src={getTeamData().badge}
                        alt={user.favoriteTeam}
                        className="w-8 h-8 mt-2 rounded object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* כרטיס מידע נוסף */}
              <div className="profile-info-card">
                <h2>פרטים נוספים</h2>

                <div className="space-y-3">
                  {user.gender && (
                    <div className="profile-info-item">
                      <span className="w-5 h-5 flex-shrink-0 text-gray-500">
                        👤
                      </span>
                      <span>{user.gender}</span>
                    </div>
                  )}

                  {user.birthDate && (
                    <div className="profile-info-item">
                      <span className="w-5 h-5 flex-shrink-0 text-gray-500">
                        🎂
                      </span>
                      <span>
                        נולד ב-
                        {new Date(user.birthDate).toLocaleDateString("he-IL")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* עמודה ימין - פוסטים */}
            <div className="lg:col-span-2">
              <div className="profile-posts">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Award size={24} />
                  הפוסטים שלי ({userPosts.length})
                </h2>

                {userPosts.length === 0 ? (
                  <div className="profile-empty-posts">
                    <div className="profile-empty-icon">📝</div>
                    <h3 className="text-lg font-semibold mb-2">
                      עדיין לא פרסמת פוסטים
                    </h3>
                    <p className="text-gray-500 mb-4">
                      החל לשתף את המחשבות שלך על הכדורגל!
                    </p>
                    <button
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: colors.primary }}
                      onClick={() => (window.location.href = "/home")}
                    >
                      צור פוסט ראשון
                    </button>
                  </div>
                ) : (
                  <PostList
                    initialPosts={userPosts}
                    colors={colors}
                    showCreateButton={false}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default Profile;
