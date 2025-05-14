import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!accessToken);

  // התחברות – מקבל טוקן, שומר אותו
  const login = (token) => {
    localStorage.setItem("accessToken", token);
    setAccessToken(token);
    setIsAuthenticated(true);
  };

  // התנתקות
  const logout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken(null);
    setIsAuthenticated(false);
  };

  // עוזר אם הטוקן משתנה מחוץ ל־login/logout
  useEffect(() => {
    setIsAuthenticated(!!accessToken);
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ accessToken, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
