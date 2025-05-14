import { createContext, useState, useEffect } from "react";
import api from "../utils/api"; // ודא שיש קובץ כזה, או תשתמש ב־axios רגיל

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);

        const response = await api.get("/api/users/me"); // שנה ל־endpoint שלך בפועל
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
