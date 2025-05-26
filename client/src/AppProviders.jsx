import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { PostViewerProvider } from "./context/PostViewerContext";
import { ChatProvider } from "./context/ChatContext";

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <UserProvider>
        <ChatProvider>
          <PostViewerProvider>{children}</PostViewerProvider>
        </ChatProvider>
      </UserProvider>
    </AuthProvider>
  );
}
