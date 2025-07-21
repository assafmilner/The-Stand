import React, { createContext, useState, useEffect, useContext } from "react";

/**
 * AuthContext
 *
 * Provides authentication state and methods across the app.
 * - Stores and retrieves the access token from localStorage
 * - Exposes login/logout functions
 * - Tracks authentication status with `isAuthenticated`
 */

export const AuthContext = createContext();

/**
 * AuthProvider
 *
 * Wraps the app and makes auth context available to all children.
 * - Automatically initializes state from localStorage
 * - Updates `isAuthenticated` when token changes
 */

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  );
  const [isAuthenticated, setIsAuthenticated] = useState(!!accessToken);

  /**
   * login
   *
   * Saves token to localStorage and updates context state.
   */

  const login = (token) => {
    localStorage.setItem("accessToken", token);
    setAccessToken(token);
    setIsAuthenticated(true);
  };

  /**
   * logout
   *
   * Clears token from localStorage and resets context state.
   */

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken(null);
    setIsAuthenticated(false);
  };

  /**
   * Sync isAuthenticated whenever token changes.
   */

  useEffect(() => {
    setIsAuthenticated(!!accessToken);
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{ accessToken, login, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth
 *
 * Custom hook to access the auth context.
 * Throws error if used outside of AuthProvider.
 */

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
