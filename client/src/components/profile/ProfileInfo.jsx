import React from "react";
import { MapPin, Calendar, Users, Phone, Heart, Mail } from "lucide-react";
import teamNameMap from "../../utils/teams-hebrew";

/**
 * ProfileInfo renders a user's profile information in one of two layouts:
 *  - "About" tab: full-width detailed view with multiple cards
 *  - "Compact": sidebar-friendly layout with reduced information
 *
 * Props:
 * - user: the profile owner
 * - isOwnProfile: whether the viewer is the user themself
 * - colors: primary/secondary team colors for themed background
 * - friendsCount: number of confirmed friends (fallbacks to 0)
 * - compact: if true, renders compact version
 * - showAsAbout: if true, renders detailed version
 */
const ProfileInfo = ({
  user,
  isOwnProfile,
  colors,
  friendsCount = 0,
  compact = false,
  showAsAbout = false,
}) => {
  const displayFriendsCount = friendsCount;

  /**
   * Looks up team metadata (e.g. badge) from Hebrew-English map
   */
  const getTeamData = () => {
    const teamEnglishName = Object.keys(teamNameMap).find(
      (key) => teamNameMap[key].name === user?.favoriteTeam
    );
    return teamNameMap[teamEnglishName] || {};
  };

  /**
   * Formats phone numbers (assumes Israeli format)
   */
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

  // ----------------------------
  // Full "About" layout version
  // ----------------------------
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

              {isOwnProfile && user.email && (
                <div className="profile-info-item">
                  <Mail size={18} className="profile-info-icon" />
                  <span>{user.email}</span>
                </div>
              )}

              {isOwnProfile && user.phone && (
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

          {/* Team and Additional Info */}
          <div className="space-y-6">
            {/* Favorite Team Card */}
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

            {/* Additional Info Card */}
            <div className="profile-info-card">
              <h2>פרטים נוספים</h2>

              <div className="space-y-3">
                <div className="profile-info-item">
                  <Users size={18} className="profile-info-icon" />
                  <span>
                    {displayFriendsCount > 0
                      ? `${displayFriendsCount} חברים`
                      : "אין חברים עדיין"}
                  </span>
                </div>

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
        </div>
      </div>
    );
  }

  // ----------------------------
  // Compact sidebar version
  // ----------------------------
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

        {/* Favorite Team Card */}
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

        {/* Optional bio if exists */}
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
