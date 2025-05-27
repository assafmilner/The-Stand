// client/src/components/friends/FriendButton.jsx
import React, { useState, useEffect } from "react";
import { UserPlus, Users, Clock, Check, X } from "lucide-react";
import { useFriends } from "../../hooks/useFriends";
import { useUser } from "../../context/UserContext";

const FriendButton = ({ targetUser, colors, onStatusChange }) => {
  const { user: currentUser } = useUser();
  const [buttonState, setButtonState] = useState("loading");

  const {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    getFriendshipStatus,
    getFriendRequestId,
    requestLoading,
    getFriends,
    getReceivedRequests,
    getSentRequests,
  } = useFriends();

  

  // Check if same team (required for friend requests)
  const sameTeam = currentUser.favoriteTeam === targetUser.favoriteTeam;

  useEffect(() => {
    const loadFriendshipData = async () => {
      if (!targetUser._id) return;

      // Load all friendship data
      await Promise.all([
        getFriends(),
        getReceivedRequests(),
        getSentRequests(),
      ]);
    };

    loadFriendshipData();
  }, [targetUser._id, getFriends, getReceivedRequests, getSentRequests]);

  useEffect(() => {
    if (targetUser._id) {
      const status = getFriendshipStatus(targetUser._id);
      setButtonState(status);
    }
  }, [targetUser._id, getFriendshipStatus]);

  const handleSendRequest = async () => {
    const result = await sendFriendRequest(targetUser._id);
    if (result.success) {
      setButtonState("sent");
      onStatusChange?.("sent");
    } else {
      alert(result.error);
    }
  };

  const handleAcceptRequest = async () => {
    const requestId = getFriendRequestId(targetUser._id);
    if (requestId) {
      const result = await acceptFriendRequest(requestId);
      if (result.success) {
        setButtonState("friends");
        onStatusChange?.("friends");
      } else {
        alert(result.error);
      }
    }
  };

  const handleRejectRequest = async () => {
    const requestId = getFriendRequestId(targetUser._id);
    if (requestId) {
      const result = await rejectFriendRequest(requestId);
      if (result.success) {
        setButtonState("none");
        onStatusChange?.("rejected");
      }
    }
  };

  const handleRemoveFriend = async () => {
    if (window.confirm("האם אתה בטוח שברצונך להסיר את החבר?")) {
      const result = await removeFriend(targetUser._id);
      if (result.success) {
        setButtonState("none");
        onStatusChange?.("removed");
      } else {
        alert(result.error);
      }
    }
  };

  // Don't show button if not same team
  if (!sameTeam) {
    return (
      <div className="text-center p-3 bg-gray-100 rounded-lg text-gray-600 text-sm">
        ניתן לשלוח בקשות חברות רק לאוהדים של {currentUser.favoriteTeam}
      </div>
    );
  }

  // Loading state
  if (buttonState === "loading") {
    return (
      <button className="profile-btn secondary w-full" disabled>
        <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
        טוען...
      </button>
    );
  }

  // Friends state
  if (buttonState === "friends") {
    return (
      <div className="space-y-2">
        <button
          className="profile-btn primary w-full"
          style={{ backgroundColor: colors.primary }}
        >
          <Users size={18} />
          חברים
        </button>
        <button
          onClick={handleRemoveFriend}
          disabled={requestLoading}
          className="profile-btn secondary w-full text-red-600 hover:bg-red-50 border-red-200"
        >
          {requestLoading ? (
            <div className="animate-spin w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full"></div>
          ) : (
            <>
              <X size={18} />
              הסר חבר
            </>
          )}
        </button>
      </div>
    );
  }

  // Sent request state
  if (buttonState === "sent") {
    return (
      <button className="profile-btn secondary w-full" disabled>
        <Clock size={18} />
        בקשה נשלחה
      </button>
    );
  }

  // Received request state
  if (buttonState === "received") {
    return (
      <div className="space-y-2">
        <button
          onClick={handleAcceptRequest}
          disabled={requestLoading}
          className="profile-btn primary w-full"
          style={{ backgroundColor: colors.primary }}
        >
          {requestLoading ? (
            <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
          ) : (
            <>
              <Check size={18} />
              אשר בקשת חברות
            </>
          )}
        </button>
        <button
          onClick={handleRejectRequest}
          disabled={requestLoading}
          className="profile-btn secondary w-full text-gray-600 hover:bg-gray-100"
        >
          {requestLoading ? (
            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
          ) : (
            <>
              <X size={18} />
              דחה
            </>
          )}
        </button>
      </div>
    );
  }

  // No relationship - can send request
  return (
    <button
      onClick={handleSendRequest}
      disabled={requestLoading}
      className="profile-btn primary w-full"
      style={{ backgroundColor: colors.primary }}
    >
      {requestLoading ? (
        <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
      ) : (
        <>
          <UserPlus size={18} />
          הוסף לחברים
        </>
      )}
    </button>
  );
};

export default FriendButton;
