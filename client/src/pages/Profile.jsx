import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Edit3, MessageCircle, Users, Calendar } from "lucide-react";
import api from "utils/api";
import ProfileLayout from "../components/profile/ProfileLayout";
import { useUser } from "../context/UserContext";
import CoverImageUploader from "../components/profile/CoverImageUploader";
import ProfileTabs from "../components/profile/ProfileTabs";
import ProfilePosts from "../components/profile/ProfilePosts";
import ProfileInfo from "../components/profile/ProfileInfo";
import ChatModal from "../components/chat/ChatModal";
import FriendButton from "../components/friends/FriendButton";
import FriendsList from "../components/friends/FriendsList";
import { useFriends } from "../hooks/useFriends";
import teamColors from "../utils/teamStyles";
import "styles/index.css";

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, setUser } = useUser();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [isChatOpen, setIsChatOpen] = useState(false);

  // State for handling friends data
  const [profileFriends, setProfileFriends] = useState([]);
  const [profileFriendsCount, setProfileFriendsCount] = useState(0);
  const [profileFriendsLoading, setProfileFriendsLoading] = useState(false);

  // Current user's friends (only used for own profile)
  const {
    friends: currentUserFriends,
    friendsCount: currentUserFriendsCount,
    loading: currentUserFriendsLoading,
    getFriends: getCurrentUserFriends,
  } = useFriends();

  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !userId || userId === currentUser?._id;
  const displayUser = isOwnProfile ? currentUser : profileUser;
  const colors = teamColors[displayUser?.favoriteTeam || "הפועל תל אביב"];

  // Function to fetch another user's friends
  const fetchUserFriends = async (targetUserId) => {
    setProfileFriendsLoading(true);
    try {
      const response = await api.get(`/api/friends/user/${targetUserId}`);
      if (response.data.success) {
        setProfileFriends(response.data.friends);
        setProfileFriendsCount(response.data.pagination.totalFriends);
      }
    } catch (error) {
      console.error("Error fetching user friends:", error);
      setProfileFriends([]);
      setProfileFriendsCount(0);
    } finally {
      setProfileFriendsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch profile user data if viewing another user's profile
        if (!isOwnProfile) {
          const profileResponse = await api.get(`/api/users/profile/${userId}`);
          setProfileUser(profileResponse.data);

          // Fetch that user's friends
          await fetchUserFriends(userId);
        } else {
          // For own profile, get current user's friends
          getCurrentUserFriends();
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if ((isOwnProfile && currentUser) || (!isOwnProfile && userId)) {
      fetchUserData();
    }
  }, [currentUser, userId, isOwnProfile, getCurrentUserFriends]);

  const handleCoverUpdate = (newCoverImage) => {
    if (isOwnProfile) {
      setUser((prev) => ({ ...prev, coverImage: newCoverImage }));
    }
  };

  const handleSendMessage = () => {
    setIsChatOpen(true);
  };

  const handleCloseChatModal = () => {
    setIsChatOpen(false);
  };

  const formatJoinDate = (date) => {
    return new Date(date).toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
    });
  };

  // Handle friend status changes
  const handleFriendStatusChange = (newStatus) => {
    if (isOwnProfile) {
      // Refresh current user's friends
      getCurrentUserFriends();
    } else {
      // Refresh the profile user's friends
      fetchUserFriends(userId);
    }
  };

  // Get the appropriate friends data based on profile type
  const getFriendsData = () => {
    if (isOwnProfile) {
      return {
        friends: currentUserFriends,
        friendsCount: currentUserFriendsCount,
        friendsLoading: currentUserFriendsLoading,
      };
    } else {
      return {
        friends: profileFriends,
        friendsCount: profileFriendsCount,
        friendsLoading: profileFriendsLoading,
      };
    }
  };

  const { friends, friendsCount, friendsLoading } = getFriendsData();

  if (loading) {
    return (
      <ProfileLayout>
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <span>טוען פרופיל...</span>
        </div>
      </ProfileLayout>
    );
  }

  if (!displayUser) {
    return (
      <ProfileLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-red-600 mb-4">שגיאה</h2>
          <p className="text-gray-600">הפרופיל לא נמצא</p>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="profile-container bg-gray-50" dir="rtl">
        <CoverImageUploader
          user={displayUser}
          isOwnProfile={isOwnProfile}
          colors={colors}
          onCoverUpdate={handleCoverUpdate}
        />

        {/* Header section with avatar and basic info */}
        <div className="relative px-4 md:px-8 pb-6">
          <div className="animate-fade-in-up">
            <div className="flex flex-col lg:flex-row lg:items-end -mt-16 md:-mt-20 gap-6">
              {/* Avatar and Name */}
              <div className="flex items-end gap-4">
                <div className="relative">
                  <img
                    src={
                      displayUser.profilePicture ||
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

                <div className="pb-1">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    {displayUser.name}
                  </h1>
                  <p className="text-gray-500 text-lg">
                    אוהד{" "}
                    <span style={{ color: colors.primary, fontWeight: "bold" }}>
                      {displayUser.favoriteTeam}
                    </span>
                  </p>
                </div>
              </div>

              {/* Stats and Actions */}
              <div className="flex-1">
                <div className="profile-stats text-sm mb-4">
                  <div className="profile-stat">
                    <div className="flex items-center gap-2">
                      <Users size={20} />
                      <span className="font-bold">{friendsCount}</span>
                      <span className="font-bold">חברים</span>
                    </div>
                  </div>

                  <div className="profile-stat">
                    <div className="flex items-center gap-2">
                      <Calendar size={20} />
                      <span className="font-bold">
                        הצטרף ב{formatJoinDate(displayUser.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="profile-actions">
                  {isOwnProfile ? (
                    <button
                      className="profile-btn secondary"
                      onClick={() => (window.location.href = "/settings")}
                    >
                      <Edit3 size={18} />
                      ערוך פרופיל
                    </button>
                  ) : (
                    <div className="flex flex-row gap-3">
                      {/* Friend Button */}
                      <FriendButton
                        targetUser={displayUser}
                        colors={colors}
                        onStatusChange={handleFriendStatusChange}
                      />

                      {/* Message Button */}
                      <button
                        className="profile-btn secondary"
                        onClick={handleSendMessage}
                      >
                        <MessageCircle size={18} />
                        שלח הודעה
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Wider container for side-by-side layout */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Profile Info */}
            <div className="lg:col-span-1">
              <ProfileInfo
                user={displayUser}
                isOwnProfile={isOwnProfile}
                colors={colors}
                friendsCount={friendsCount}
                compact={true}
              />
            </div>

            {/* Right Side - Tabs and Content */}
            <div className="lg:col-span-2">
              <ProfileTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                colors={colors}
              />

              <div className="mt-6">
                {activeTab === "posts" && (
                  <ProfilePosts
                    user={displayUser}
                    isOwnProfile={isOwnProfile}
                    colors={colors}
                  />
                )}

                {activeTab === "friends" && (
                  <div>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Users size={24} />
                      {isOwnProfile
                        ? `החברים שלי (${friendsCount})`
                        : `חברים של ${displayUser.name} (${friendsCount})`}
                    </h2>

                    <FriendsList
                      friends={friends}
                      loading={friendsLoading}
                      colors={colors}
                      showActions={true}
                      showRemove={isOwnProfile} // Only show remove if viewing own profile
                      showMessage={true}
                      onFriendRemoved={handleFriendStatusChange}
                      emptyMessage={
                        isOwnProfile
                          ? "אין לך חברים עדיין"
                          : `אין חברים ל${displayUser.name}`
                      }
                      emptySubMessage={
                        isOwnProfile
                          ? "התחל לחבר עם אוהדים אחרים של הקבוצה"
                          : "המשתמש עדיין לא הוסיף חברים"
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={handleCloseChatModal}
        otherUser={displayUser}
      />
    </ProfileLayout>
  );
};

export default Profile;
