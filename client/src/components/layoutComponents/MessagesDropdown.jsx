import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../context/ChatContext";
import axios from "axios";

const MessagesDropdown = ({ isOpen, onToggle, onClose }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { openChat } = useChat();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      fetchConversations();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
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

  const handleConversationClick = (conversation) => {
    // פתיחת הצ'אט בתחתית המסך
    openChat(conversation.participant._id, conversation.participant);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50"
      ref={dropdownRef}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">הודעות</h3>
          <button onClick={onClose}>
            <X size={20} className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="loading-spinner"></div>
            <p className="text-gray-500 mt-2">טוען שיחות...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">אין עדיין שיחות</div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation._id}
              onClick={() => handleConversationClick(conversation)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 flex items-center gap-3"
            >
              <img
                src={
                  conversation.participant.profilePicture ||
                  "/defaultProfilePic.png"
                }
                alt={conversation.participant.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <h4 className="font-medium text-right">
                  {conversation.participant.name}
                </h4>
                {conversation.lastMessage && (
                  <p className="text-sm text-gray-500 truncate text-right">
                    {conversation.lastMessage.content}
                  </p>
                )}
              </div>
              {conversation.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {conversations.length > 0 && (
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => {
              navigate("/messages");
              onClose();
            }}
            className="w-full text-center text-primary font-medium hover:underline"
          >
            הצג את כל השיחות
          </button>
        </div>
      )}
    </div>
  );
};

export default MessagesDropdown;
