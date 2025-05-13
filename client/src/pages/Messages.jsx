import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import axios from "axios";
import { MessageCircle, Clock } from "lucide-react";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          "http://localhost:3001/api/messages/conversations",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setConversations(response.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMs = now - messageDate;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return messageDate.toLocaleDateString("he-IL");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">טוען שיחות...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-right">שיחות</h1>

        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              אין עדיין שיחות
            </h2>
            <p className="text-gray-500">התחל לשוחח עם אוהדים אחרים!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() =>
                  navigate(`/chat/${conversation.participant._id}`)
                }
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 border"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      conversation.participant.profilePicture ||
                      "/defaultProfilePic.png"
                    }
                    alt={conversation.participant.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-right">
                        {conversation.participant.name}
                      </h3>
                      {conversation.lastMessage && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock size={14} />
                          <span>
                            {formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        </div>
                      )}
                    </div>

                    {conversation.lastMessage && (
                      <p className="text-gray-600 truncate mt-1 text-right">
                        {conversation.lastMessage.content}
                      </p>
                    )}

                    <p className="text-sm text-gray-500 mt-1 text-right">
                      {conversation.participant.favoriteTeam
                        ? `אוהד ${conversation.participant.favoriteTeam}`
                        : "אוהד כדורגל"}
                    </p>
                  </div>

                  {conversation.unreadCount > 0 && (
                    <div className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Messages;
