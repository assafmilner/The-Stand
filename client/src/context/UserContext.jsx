import { createContext, useContext, useState, useEffect } from "react";
import api from "utils/api";

/**
 * UserContext
 *
 * Provides the authenticated user's data throughout the app.
 */
export const UserContext = createContext();

/**
 * UserProvider
 *
 * Fetches the current user on mount (if accessToken exists),
 * and exposes `user`, `setUser`, and `loading` to consumers.
 */
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * useEffect: On mount
   *
   * - Attempts to fetch user data from the backend
   * - Uses Bearer token from localStorage
   */
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * useUser
 *
 * Custom hook to consume the user context.
 */
export const useUser = () => useContext(UserContext);