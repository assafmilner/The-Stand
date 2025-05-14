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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // לא מחובר → נעבור לעמוד login
      console.warn("Unauthorized – redirecting to /login");
      window.location.href = "/login";
    }

    if (status === 404) {
      // עמוד לא נמצא → נעבור לעמוד שגיאה
      console.warn("Resource not found – redirecting to /not-found");
      window.location.href = "/not-found";
    }

    return Promise.reject(error);
  }
);

export default api;
