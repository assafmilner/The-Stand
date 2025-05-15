import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",
  withCredentials: true,
});

// ✅ הוספת Authorization header אוטומטית אם קיים טוקן
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ טיפול גלובלי בשגיאות
axios.interceptors.response.use(
  
    res => res,
    err => {
      const { config, response } = err;
  
      // אם זו קריאה ל־login או ל־verify-email או ל־resend-verification – תן ל־catch המקומי לטפל
      if (
        response?.status === 401 &&
        config.url !== "/api/auth/login" &&
        config.url !== "/api/auth/verify-email" &&
        config.url !== "/api/auth/resend-verification"
      ) {
        window.location = "/login";
      }
  
      return Promise.reject(err);
    }
  );

export default api;
