import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useUser } from "./UserContext";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      // יצירת חיבור Socket
      const newSocket = io("http://localhost:3001", {
        transports: ["websocket"],
      });

      newSocket.on("connect", () => {
        console.log("התחברת לשרת Socket.io");
        // הודעה לשרת על זהות המשתמש
        newSocket.emit("join-chat", user._id);
      });

      newSocket.on("disconnect", () => {
        console.log("התנתקת מהשרת");
      });

      setSocket(newSocket);

      // ניקוי החיבור כשהקומפוננטה מתנקה
      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const value = {
    socket,
    onlineUsers,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
