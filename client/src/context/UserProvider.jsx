import { createContext, useState, useEffect } from "react";
import api from "../utils/api";

/**
 * UserContext
 *
 * Global context for storing the currently authenticated user's data.
 * Includes error state and loading indicator.
 */
export const UserContext = createContext();

/**
 * UserProvider
 *
 * Fetches user data on mount using the /api/users/me endpoint.
 * Provides: `user`, `setUser`, `loading`, and `error` to consumers.
 */
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * useEffect: On mount
   *
   * Attempts to fetch the authenticated user.
   * On failure: sets user to null and stores error.
   */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);

        const response = await api.get("/api/users/me");
        setUser(response.data);
      } catch (err) {
        setUser(null);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};
