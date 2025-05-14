// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  );
  const [isAuthenticated, setIsAuthenticated] = useState(!!accessToken);

  const login = token => {
    localStorage.setItem("accessToken", token);
    setAccessToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken(null);
    setIsAuthenticated(false);
  };

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

// ← add this hook right here:
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
