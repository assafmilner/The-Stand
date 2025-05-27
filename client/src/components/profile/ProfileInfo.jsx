import React from "react";
import { MapPin, Calendar, Users, Phone, Heart, Mail } from "lucide-react";
import teamNameMap from "../../utils/teams-hebrew";

const ProfileInfo = ({
  user,
  isOwnProfile,
  colors,
  friendsCount = 0, // Now we trust the prop from Profile component
  compact = false,
  showAsAbout = false,
}) => {
  // Use the friends count passed as prop
  const displayFriendsCount = friendsCount;

  const getTeamData = () => {
    const teamEnglishName = Object.keys(teamNameMap).find(
      (key) => teamNameMap[key].name === user?.favoriteTeam
    );
    return teamNameMap[teamEnglishName] || {};
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

  // About tab version - full width detailed view
  if (showAsAbout) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info Card */}
          <div className="profile-info-card">
            <h2 className="flex items-center gap-2">
              <Users size={20} />
              פרטים אישיים
            </h2>

            {user.bio && (
              <div className="mb-4">
                <div className="profile-bio">{user.bio}</div>
              </div>
            )}

            <div className="space-y-3">
              {user.location && (
                <div className="profile-info-item">
                  <MapPin size={18} className="profile-info-icon" />
                  <span>מתגורר ב{user.location}</span>
                </div>
              )}

              {/* Show email only for own profile */}
              {isOwnProfile && user.email && (
                <div className="profile-info-item">
                  <Mail size={18} className="profile-info-icon" />
                  <span>{user.email}</span>
                </div>
              )}

              {/* Show phone only for own profile */}
              {isOwnProfile && user.phone && (
                <div className="profile-info-item">
                  <Phone size={18} className="profile-info-icon" />
                  <span>{formatPhoneNumber(user.phone)}</span>
                </div>
              )}

              {/* Join date - visible to everyone */}
              <div className="profile-info-item">
                <Calendar size={18} className="profile-info-icon" />
                <span>
                  הצטרף בתאריך{" "}
                  {new Date(user.createdAt).toLocaleDateString("he-IL")}
                </span>
              </div>
            </div>
          </div>

          {/* Team and Additional Info */}
          <div className="space-y-6">
            {/* Team Card - visible to everyone */}
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

            {/* Additional Info Card - visible to everyone */}
            <div className="profile-info-card">
              <h2>פרטים נוספים</h2>

              <div className="space-y-3">
                {/* Friends count - visible to everyone - NOW USING REAL COUNT */}
                <div className="profile-info-item">
                  <Users size={18} className="profile-info-icon" />
                  <span>
                    {displayFriendsCount > 0
                      ? `${displayFriendsCount} חברים`
                      : "אין חברים עדיין"}
                  </span>
                </div>

                {/* Gender - visible to everyone if provided */}
                {user.gender && (
                  <div className="profile-info-item">
                    <span className="w-5 h-5 flex-shrink-0 text-gray-500">
                      👤
                    </span>
                    <span>{user.gender}</span>
                  </div>
                )}

                {/* Birth date - you can make this visible to everyone if you want */}
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
        </div>
      </div>
    );
  }

  // Compact sidebar version
  if (compact) {
    return (
      <div className="space-y-6">
        {/* Basic Stats Card */}
        <div className="profile-info-card">
          <h2 className="flex items-center gap-2">
            <Users size={20} />
            מידע כללי
          </h2>
          <div className="space-y-3">
            {/* Friends count - NOW USING REAL COUNT */}
            <div className="profile-info-item">
              <Users size={18} className="profile-info-icon" />
              <span>
                {displayFriendsCount > 0
                  ? `${displayFriendsCount} חברים`
                  : "אין חברים עדיין"}
              </span>
            </div>
            <div className="profile-info-item">
              <Calendar size={18} className="profile-info-icon" />
              <span>
                הצטרף{" "}
                {new Date(user.createdAt).toLocaleDateString("he-IL", {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            </div>
            {user.location && (
              <div className="profile-info-item">
                <MapPin size={18} className="profile-info-icon" />
                <span>{user.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Team Card */}
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

        {/* Bio Card */}
        {user.bio && (
          <div className="profile-info-card">
            <h2>אודות</h2>
            <div className="profile-bio">{user.bio}</div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ProfileInfo;
