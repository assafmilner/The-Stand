import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useChat } from "../context/ChatContext";
import axios from "axios";

const OnlineUsers = () => {
  const { user } = useUser();
  const { onlineUsers, openChat } = useChat();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          "http://localhost:3001/api/users/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // סינון המשתמש הנוכחי מהרשימה
        setAllUsers(response.data.filter((u) => u._id !== user._id));
      } catch (error) {
        console.error("Error fetching users:", error);
        // אם אין API, נשתמש בדמה
        setAllUsers([
          {
            _id: "1",
            name: "יוסי אוהד",
            favoriteTeam: "מכבי תל אביב",
            profilePicture: null,
          },
          {
            _id: "2",
            name: "רחל ירוקה",
            favoriteTeam: "הפועל תל אביב",
            profilePicture: null,
          },
          {
            _id: "3",
            name: "דוד כחול",
            favoriteTeam: 'בית"ר ירושלים',
            profilePicture: null,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  const handleStartChat = (otherUser) => {
    openChat(otherUser._id, otherUser);
  };

  if (loading) {
    return (
      <div className="dashboard-card">
        <h3 className="card-title">טוען משתמשים...</h3>
      </div>
    );
  }

  // הצגת משתמשים - מקסימום 10
  const usersToShow = allUsers.slice(0, 10);

  return (
    <div className="dashboard-card">
      <h3 className="card-title">משתמשים ברשת</h3>

      <div className="space-y-3 overflow-y-auto max-h-96">
        {usersToShow.map((userItem) => {
          const isOnline = onlineUsers.includes(userItem._id);
          return (
            <div
              key={userItem._id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleStartChat(userItem)}
            >
              <div className="relative">
                <img
                  src={userItem.profilePicture || "/defaultProfilePic.png"}
                  alt={userItem.name}
                  className="w-10 h-10 rounded-full"
                />
                {isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-right">
                  {userItem.name}
                </p>
                <p className="text-xs text-gray-500 text-right">
                  {userItem.favoriteTeam}
                </p>
              </div>
              <button
                className="p-2 hover:bg-gray-100 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartChat(userItem);
                }}
              >
                <MessageCircle size={16} className="text-gray-600" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnlineUsers;
