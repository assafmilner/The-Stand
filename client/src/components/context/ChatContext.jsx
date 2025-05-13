import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";
import io from "socket.io-client";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useUser();
  const [socket, setSocket] = useState(null);
  const [openChats, setOpenChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [mainChatOpen, setMainChatOpen] = useState(true);

  useEffect(() => {
    if (!user) return;

    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.emit("join", {
      name: user.name,
      favoriteTeam: user.favoriteTeam,
      userId: user._id,
    });

    newSocket.on("connectedUsers", (users) => {
      setOnlineUsers(users.map((u) => u.userId || u._id));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const openChat = (userId, userData) => {
    if (!openChats.find((chat) => chat.userId === userId)) {
      setOpenChats((prev) => [
        ...prev,
        {
          userId,
          userData,
          isMinimized: false,
          messages: [],
        },
      ]);
    }
  };

  const closeChat = (userId) => {
    setOpenChats((prev) => prev.filter((chat) => chat.userId !== userId));
  };

  const minimizeChat = (userId) => {
    setOpenChats((prev) =>
      prev.map((chat) =>
        chat.userId === userId
          ? { ...chat, isMinimized: !chat.isMinimized }
          : chat
      )
    );
  };

  const toggleMainChat = () => {
    setMainChatOpen(!mainChatOpen);
  };

  const value = {
    socket,
    openChats,
    onlineUsers,
    mainChatOpen,
    openChat,
    closeChat,
    minimizeChat,
    toggleMainChat,
    setOpenChats,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
