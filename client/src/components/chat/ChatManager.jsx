import React from "react";
import { useChat } from "../context/ChatContext";
import ChatWindow from "./ChatWindow";

const ChatManager = () => {
  const { openChats, closeChat, minimizeChat } = useChat();

  return (
    <div className="fixed bottom-0 right-0 z-40 pointer-events-none">
      {openChats.map((chat, index) => (
        <div
          key={chat.userId}
          className="pointer-events-auto absolute"
          style={{
            right: `${index * 320 + 16}px`,
            bottom: "80px",
          }}
        >
          <ChatWindow
            chat={chat}
            onClose={() => closeChat(chat.userId)}
            onMinimize={() => minimizeChat(chat.userId)}
          />
        </div>
      ))}
    </div>
  );
};

export default ChatManager;
