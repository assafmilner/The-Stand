// ### Module: API Client
// Axios instance configured with:
// - baseURL from environment
// - credentials included for cross-origin requests
// - request interceptor for automatic auth header
// - response interceptor for global error handling

import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || " ",
  withCredentials: true,
});

// ### Interceptor: Request
// Adds Authorization header with Bearer token if token exists in localStorage
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

// ### Interceptor: Response
// Handles 401 errors globally by redirecting to /login page,
// unless the request is to login or email verification routes
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const { config, response } = err;

    const isAuthRoute =
      config.url !== "/api/auth/login" &&
      config.url !== "/api/auth/verify-email" &&
      config.url !== "/api/auth/resend-verification";

    const alreadyOnLoginPage = window.location.pathname === "/login";

    if (response?.status === 401 && !isAuthRoute && !alreadyOnLoginPage) {
      window.location = "/login";
    }

    return Promise.reject(err);
  }
);

export default api;
