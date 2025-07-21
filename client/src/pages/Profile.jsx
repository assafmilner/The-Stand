/**
 * Profile page – displays either the current user's or another user's profile.
 * Supports cover photo updates, friend system, chat modal, and dynamic content via tabs.
 */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Edit3, MessageCircle, Users, Calendar } from "lucide-react";
import api from "../utils/api";
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
import "../styles/index.css";

/**
 * Main Profile component logic.
 * Determines if it's the current user's profile or someone else's,
 * handles loading and rendering of profile data, friends list, and modals.
 */
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

  const isOwnProfile = !userId || userId === currentUser?._id;
  const displayUser = isOwnProfile ? currentUser : profileUser;
  const colors = teamColors[displayUser?.favoriteTeam || "הפועל תל אביב"];

  /**
   * Fetch another user's friends (when visiting a different profile).
   */
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

  /**
   * Fetch profile data when component mounts or userId changes.
   */
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId && !currentUser) return;

      try {
        setLoading(true);

        if (isOwnProfile) {
          getCurrentUserFriends();
        } else {
          const profileResponse = await api.get(`/api/users/profile/${userId}`);
          setProfileUser(profileResponse.data);
          await fetchUserFriends(userId);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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

  /**
   * Handle update of friendship status (after add/remove/accept).
   */
  const handleFriendStatusChange = (newStatus) => {
    if (isOwnProfile) {
      getCurrentUserFriends();
    } else {
      fetchUserFriends(userId);
    }
  };

  /**
   * Get the relevant friend list data based on current profile.
   */
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

  // Skeleton loader
  if (loading) {
    return (
      <ProfileLayout>
        <div className="profile-container bg-gray-50 " dir="rtl">
          <div className="relative h-64 md:h-80 bg-gray-200 animate-pulse rounded-b-4xl" />
          <div className="relative px-4 md:px-8 pb-6">
            <div className="flex flex-col lg:flex-row lg:items-end -mt-16 md:-mt-20 gap-6">
              <div className="flex items-end gap-4">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-300 animate-pulse rounded-full border-4 border-white" />
                <div className="pb-1">
                  <div className="h-8 bg-gray-300 animate-pulse rounded w-48 mb-2" />
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-32" />
                </div>
              </div>
            </div>
          </div>
          <div className="text-center py-8">
            <div className="loading-spinner mx-auto mb-4"></div>
            <span>טוען פרופיל...</span>
          </div>
        </div>
      </ProfileLayout>
    );
  }

  // Not found
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

  // Main profile UI
  return (
    <ProfileLayout>
      <div className="profile-container bg-gray-50" dir="rtl">
        <CoverImageUploader
          user={displayUser}
          isOwnProfile={isOwnProfile}
          colors={colors}
          onCoverUpdate={handleCoverUpdate}
        />

        {/* Profile Header */}
        <div className="relative px-4 md:px-8 pb-6">
          <div className="animate-fade-in-up">
            <div className="flex flex-col lg:flex-row lg:items-end -mt-16 md:-mt-20 gap-6">
              <div className="flex items-end gap-4">
                <div className="relative">
                  <img
                    src={
                      displayUser.profilePicture ||
                      " /assets/defaultProfilePic.png"
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
                      <FriendButton
                        targetUser={displayUser}
                        colors={colors}
                        onStatusChange={handleFriendStatusChange}
                      />
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

        {/* Main content: Info + Posts/Friends */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ProfileInfo
                user={displayUser}
                isOwnProfile={isOwnProfile}
                colors={colors}
                friendsCount={friendsCount}
                compact={true}
              />
            </div>

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
                      showRemove={isOwnProfile}
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
      {isChatOpen && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={handleCloseChatModal}
          otherUser={displayUser}
        />
      )}
    </ProfileLayout>
  );
};

export default Profile;
