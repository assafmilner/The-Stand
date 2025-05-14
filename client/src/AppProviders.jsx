import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { PostViewerProvider } from './context/PostViewerContext';

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <UserProvider>
        <PostViewerProvider>
          {children}
        </PostViewerProvider>
      </UserProvider>
    </AuthProvider>
  );
}
