// client/src/pages/Friends.jsx
import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";
import Layout from "../components/layout/Layout";
import { useUser } from "../context/UserContext";
import { useChat } from "../context/ChatContext";
import { useFriends } from "../hooks/useFriends";
import teamColors from "../utils/teamStyles";
import DeleteConfirmationModal from "../components/modal/DeleteConfirmationModal";
import {
  Users,
  UserPlus,
  Check,
  X,
  MessageCircle,
  UserMinus,
  Clock,
} from "lucide-react";

const ChatModal = lazy(() => import("../components/chat/ChatModal"));

const Friends = () => {
  const { user } = useUser();
  const { markAsRead } = useChat();
  const [activeTab, setActiveTab] = useState("friends");
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChatFriend, setSelectedChatFriend] = useState(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [friendToDelete, setFriendToDelete] = useState(null);

  const {
    friends,
    receivedRequests,
    sentRequests,
    loading,
    requestLoading,
    error,
    friendsCount,
    receivedRequestsCount,
    sentRequestsCount,
    getFriends,
    getReceivedRequests,
    getSentRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    clearError,
  } = useFriends();

  const colors = useMemo(
    () => teamColors[user?.favoriteTeam || "הפועל תל אביב"],
    [user?.favoriteTeam]
  );

  useEffect(() => {
    if (user) {
      getFriends();
      getReceivedRequests();
      getSentRequests();
    }
  }, [user, getFriends, getReceivedRequests, getSentRequests]);

  const handleAcceptRequest = async (requestId) => {
    const result = await acceptFriendRequest(requestId);
    if (result.success) {
      // Show success message or toast
      console.log(result.message);
    }
  };

  const handleRejectRequest = async (requestId) => {
    const result = await rejectFriendRequest(requestId);
    if (result.success) {
      console.log(result.message);
    }
  };

  // פתיחת מודאל המחיקה
  const handleRemoveFriend = (friend) => {
    setFriendToDelete(friend);
    setIsDeleteModalOpen(true);
  };

  // ביצוע המחיקה בפועל
  const confirmDeleteFriend = async () => {
    if (!friendToDelete) return;

    const result = await removeFriend(friendToDelete._id);
    if (result.success) {
      console.log(result.message);
      setSelectedFriend(null); // Clear selected friend if it was the deleted one
    } else {
      alert(result.error || "שגיאה במחיקת החבר");
    }

    // סגירת המודאל
    setIsDeleteModalOpen(false);
    setFriendToDelete(null);
  };

  // סגירת מודאל המחיקה
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setFriendToDelete(null);
  };

  // Chat functions
  const handleOpenChat = (friend) => {
    if (!friend || !friend._id) {
      alert("שגיאה: לא ניתן לפתוח צ'אט עם החבר");
      return;
    }

    // Prepare friend data for chat modal
    const friendData = {
      _id: friend._id,
      name: friend.name,
      profilePicture: friend.profilePicture,
    };

    setSelectedChatFriend(friendData);
    setIsChatOpen(true);
  };

  const handleCloseChatModal = () => {
    setIsChatOpen(false);
    setSelectedChatFriend(null);
  };

  const tabConfig = [
    {
      id: "friends",
      label: "חברים",
      icon: Users,
      count: friendsCount,
      data: friends,
    },
    {
      id: "received",
      label: "בקשות שהתקבלו",
      icon: UserPlus,
      count: receivedRequestsCount,
      data: receivedRequests,
    },
    {
      id: "sent",
      label: "בקשות שנשלחו",
      icon: Clock,
      count: sentRequestsCount,
      data: sentRequests,
    },
  ];

  const activeTabData = tabConfig.find((tab) => tab.id === activeTab);

  return (
    <Layout>
      <div className="flex h-[80vh] bg-white shadow-md rounded-xl overflow-hidden">
        {/* Right Sidebar - Tabs and Lists */}
        <div className="w-[360px] border-l bg-gray-50 flex flex-col">
          {/* Tab Headers */}
          <div className="border-b bg-white px-2 pt-2">
            <div className="flex gap-2">
              {tabConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg transition-all ${
                      isActive
                        ? "text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    style={{
                      backgroundColor: isActive
                        ? colors.primary
                        : colors.secondary,
                    }}
                  >
                    <Icon size={18} />
                    <span className="font-medium text-sm">{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          isActive ? "bg-white/20" : "bg-gray-200"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
                <button
                  onClick={clearError}
                  className="float-left ml-2 text-red-600 hover:text-red-800"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-2"></div>
                <p className="text-gray-500">טוען...</p>
              </div>
            ) : activeTabData.data.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <activeTabData.icon
                  size={48}
                  className="mx-auto mb-4 text-gray-300"
                />
                <p className="font-medium">
                  {activeTab === "friends" && "אין לך חברים עדיין"}
                  {activeTab === "received" && "אין בקשות חברות חדשות"}
                  {activeTab === "sent" && "לא שלחת בקשות חברות"}
                </p>
                <p className="text-sm mt-1">
                  {activeTab === "friends" && "התחל לחבר עם אוהדים אחרים"}
                  {activeTab === "received" && "בקשות חברות יופיעו כאן"}
                  {activeTab === "sent" && "בקשות ששלחת יופיעו כאן"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Friends List */}
                {activeTab === "friends" &&
                  friends.map((friend) => (
                    <div
                      key={friend._id}
                      onClick={() => setSelectedFriend(friend)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedFriend?._id === friend._id
                          ? "bg-blue-100 border border-blue-200"
                          : "hover:bg-gray-100 bg-white border border-gray-200"
                      }`}
                    >
                      <img
                        src={friend.profilePicture || "/defaultProfilePic.png"}
                        alt={friend.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{friend.name}</p>
                        <p className="text-sm text-gray-500 truncate">
                          אוהד {friend.favoriteTeam}
                        </p>
                        {friend.friendshipDate && (
                          <p className="text-xs text-gray-400">
                            חברים מאז{" "}
                            {new Date(friend.friendshipDate).toLocaleDateString(
                              "he-IL"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                {/* Received Requests */}
                {activeTab === "received" &&
                  receivedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={
                            request.sender.profilePicture ||
                            "/defaultProfilePic.png"
                          }
                          alt={request.sender.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{request.sender.name}</p>
                          <p className="text-sm text-gray-500">
                            אוהד {request.sender.favoriteTeam}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(request.createdAt).toLocaleDateString(
                              "he-IL"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={requestLoading}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <Check size={16} />
                          <span className="text-sm">אשר</span>
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={requestLoading}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          <X size={16} />
                          <span className="text-sm">דחה</span>
                        </button>
                      </div>
                    </div>
                  ))}

                {/* Sent Requests */}
                {activeTab === "sent" &&
                  sentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            request.receiver.profilePicture ||
                            "/defaultProfilePic.png"
                          }
                          alt={request.receiver.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{request.receiver.name}</p>
                          <p className="text-sm text-gray-500">
                            אוהד {request.receiver.favoriteTeam}
                          </p>
                          <p className="text-xs text-gray-400">
                            נשלח ב-
                            {new Date(request.createdAt).toLocaleDateString(
                              "he-IL"
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-orange-600">
                          <Clock size={16} />
                          <span className="text-sm">ממתין</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Left Content Area */}
        <div className="flex-1 flex flex-col border-r bg-white">
          {selectedFriend ? (
            <>
              {/* Friend Details Header */}
              <div className="flex items-center gap-4 p-6 border-b bg-white">
                <img
                  src={
                    selectedFriend.profilePicture || "/defaultProfilePic.png"
                  }
                  alt={selectedFriend.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold">{selectedFriend.name}</h2>
                  <p className="text-gray-600">
                    אוהד {selectedFriend.favoriteTeam}
                  </p>
                  {selectedFriend.location && (
                    <p className="text-sm text-gray-500">
                      {selectedFriend.location}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleOpenChat(selectedFriend)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MessageCircle size={18} />
                    <span>שלח הודעה</span>
                  </button>
                  <button
                    onClick={() => handleRemoveFriend(selectedFriend)}
                    disabled={requestLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <UserMinus size={18} />
                    <span>{requestLoading ? "מסיר..." : "הסר חבר"}</span>
                  </button>
                </div>
              </div>

              {/* Friend Details Content */}
              <div className="flex-1 p-6 bg-gray-50">
                <div className="bg-white rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">פרטי החבר</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">שם: </span>
                      <span>{selectedFriend.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        קבוצת הלב:{" "}
                      </span>
                      <span>{selectedFriend.favoriteTeam}</span>
                    </div>
                    {selectedFriend.location && (
                      <div>
                        <span className="font-medium text-gray-700">
                          מיקום:{" "}
                        </span>
                        <span>{selectedFriend.location}</span>
                      </div>
                    )}
                    {selectedFriend.friendshipDate && (
                      <div>
                        <span className="font-medium text-gray-700">
                          חברים מאז:{" "}
                        </span>
                        <span>
                          {new Date(
                            selectedFriend.friendshipDate
                          ).toLocaleDateString("he-IL")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[400px]">
              <div className="text-center">
                <Users size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">בחר חבר מהרשימה</p>
                <p className="text-sm">צפה בפרטי החבר ושלח הודעות</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteFriend}
        title="הסר חבר"
        message={
          friendToDelete
            ? `האם אתה בטוח שברצונך להסיר את ${friendToDelete.name} מרשימת החברים שלך?`
            : "האם אתה בטוח שברצונך להסיר את החבר הזה?"
        }
        confirmText="הסר חבר"
        cancelText="ביטול"
        type="danger"
      />

      {/* Chat Modal */}
      {isChatOpen && selectedChatFriend && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg">
                <p>טוען צ'אט...</p>
              </div>
            </div>
          }
        >
          <ChatModal
            isOpen={isChatOpen}
            onClose={handleCloseChatModal}
            otherUser={selectedChatFriend}
            onMarkAsRead={markAsRead}
          />
        </Suspense>
      )}
    </Layout>
  );
};

export default Friends;
