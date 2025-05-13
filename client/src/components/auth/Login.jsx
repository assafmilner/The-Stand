import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "./auth-styles.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerificationRequired, setEmailVerificationRequired] =
    useState(false);
  const [error, setError] = useState("");
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setEmailVerificationRequired(false);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/auth/login",
        { email, password }
      );
      localStorage.setItem("accessToken", response.data.accessToken);
      setUser(response.data.user);
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.data?.emailVerificationRequired) {
        setEmailVerificationRequired(true);
      } else {
        setError(error.response?.data?.error || "ההתחברות נכשלה!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResendingEmail(true);
    setResendSuccess(false);

    try {
      await axios.post("http://localhost:3001/api/auth/resend-verification", {
        email,
      });
      setResendSuccess(true);
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      setError("Failed to resend verification email. Please try again.");
    } finally {
      setIsResendingEmail(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Form side */}
      <div className="form-container">
        <div className="form-content">
          <div className="form-header">
            {/* Modern Football Logo */}
            <div className="logo-container">
              <svg
                className="logo"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="32"
                  cy="32"
                  r="30"
                  fill="white"
                  stroke="#15803d"
                  strokeWidth="2"
                />
                <path
                  d="M32 8C18.745 8 8 18.745 8 32C8 45.255 18.745 56 32 56C45.255 56 56 45.255 56 32C56 18.745 45.255 8 32 8Z"
                  fill="white"
                />
                <path
                  d="M32 8C18.745 8 8 18.745 8 32C8 45.255 18.745 56 32 56C45.255 56 56 45.255 56 32C56 18.745 45.255 8 32 8ZM32 12C35.73 12 39.21 13.033 42.167 14.833L38.833 19.5L32.833 19.833L26.5 15.167V12.333C28.245 12.117 30.1 12 32 12ZM16.833 24.5L22.5 20.167L28.833 24.833L29.167 32.833L24.5 38.5L15.5 37.167C14.35 35.583 13.517 33.833 13.167 32C13.167 32.833 13.283 33.667 13.5 34.5H16.833V24.5ZM24.167 51.833C18.745 50.883 14.117 47.45 11.5 42.833L19.167 44.167L24.5 40.833L32.167 44.5V51.833H24.167ZM40.167 51.833V47.167L43.833 42.5L52.167 44.167C48.883 48.4 44.833 51.167 40.167 51.833ZM53.167 32.833L46.5 32.5L44.167 27.167L49.5 22.5C52.167 28.5 52.833 33.667 53.167 32.833Z"
                  fill="#15803d"
                />
              </svg>
            </div>
            <h1 className="form-title">ברוכים השבים!</h1>
            <p className="form-subtitle">התחבר כדי להמשיך ל-היציע</p>
          </div>

          {error && (
            <div className="bg-red-100 p-4 rounded text-center mt-2 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {emailVerificationRequired && (
            <div className="bg-yellow-100 p-4 rounded text-center mt-2 mb-4">
              <p className="text-yellow-800">
                נא לאמת את כתובת הדוא"ל שלך לפני ההתחברות. בדוק את תיבת הדואר
                שלך.
              </p>
              {resendSuccess ? (
                <p className="text-green-600 mt-2">מייל אימות נשלח בהצלחה!</p>
              ) : (
                <button
                  onClick={handleResendVerification}
                  disabled={isResendingEmail}
                  className="text-yellow-800 font-medium hover:underline mt-2"
                >
                  {isResendingEmail ? "שולח..." : "שלח שוב מייל אימות"}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                אימייל
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <div className="form-label-group">
                <label htmlFor="password" className="form-label">
                  סיסמה
                </label>
                <a href="#" className="form-link">
                  שכחת סיסמה?
                </a>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                placeholder="הסיסמה שלך"
              />
            </div>

            <button type="submit" disabled={isLoading} className="form-button">
              {isLoading ? (
                <>
                  <svg
                    className="form-button-icon animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  מתחבר...
                </>
              ) : (
                <>
                  <svg
                    className="form-button-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 15L12 3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 11L12 15L8 11"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  התחברות
                </>
              )}
            </button>
          </form>

          <div className="form-footer">
            <p>
              אין לך חשבון?{" "}
              <Link to="/register" className="form-link">
                הירשם כאן
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative side */}
      <div className="decorative-container">
        <div className="field-pattern"></div>

        {/* Field elements */}
        <div className="field-elements">
          <div className="center-circle"></div>
          <div className="center-dot"></div>
          <div className="halfway-line"></div>
          <div className="penalty-area-top"></div>
          <div className="penalty-area-bottom"></div>
          <div className="goal-top"></div>
          <div className="goal-bottom"></div>
        </div>

        {/* Modern football elements */}
        <div className="football-element football-element-1">
          <div className="modern-football">
            <svg
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="32"
                cy="32"
                r="30"
                fill="white"
                stroke="#15803d"
                strokeWidth="2"
              />
              <path
                d="M32 8C18.745 8 8 18.745 8 32C8 45.255 18.745 56 32 56C45.255 56 56 45.255 56 32C56 18.745 45.255 8 32 8Z"
                fill="white"
              />
              <path
                d="M32 8C18.745 8 8 18.745 8 32C8 45.255 18.745 56 32 56C45.255 56 56 45.255 56 32C56 18.745 45.255 8 32 8ZM32 12C35.73 12 39.21 13.033 42.167 14.833L38.833 19.5L32.833 19.833L26.5 15.167V12.333C28.245 12.117 30.1 12 32 12ZM16.833 24.5L22.5 20.167L28.833 24.833L29.167 32.833L24.5 38.5L15.5 37.167C14.35 35.583 13.517 33.833 13.167 32C13.167 32.833 13.283 33.667 13.5 34.5H16.833V24.5ZM24.167 51.833C18.745 50.883 14.117 47.45 11.5 42.833L19.167 44.167L24.5 40.833L32.167 44.5V51.833H24.167ZM40.167 51.833V47.167L43.833 42.5L52.167 44.167C48.883 48.4 44.833 51.167 40.167 51.833ZM53.167 32.833L46.5 32.5L44.167 27.167L49.5 22.5C52.167 28.5 52.833 33.667 53.167 32.833Z"
                fill="#15803d"
              />
            </svg>
            <div className="ball-shadow"></div>
          </div>
        </div>

        <div className="football-element football-element-2">
          <div className="modern-football">
            <svg
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="32"
                cy="32"
                r="30"
                fill="white"
                stroke="#15803d"
                strokeWidth="2"
              />
              <path
                d="M32 8C18.745 8 8 18.745 8 32C8 45.255 18.745 56 32 56C45.255 56 56 45.255 56 32C56 18.745 45.255 8 32 8Z"
                fill="white"
              />
              <path
                d="M32 8C18.745 8 8 18.745 8 32C8 45.255 18.745 56 32 56C45.255 56 56 45.255 56 32C56 18.745 45.255 8 32 8ZM32 12C35.73 12 39.21 13.033 42.167 14.833L38.833 19.5L32.833 19.833L26.5 15.167V12.333C28.245 12.117 30.1 12 32 12ZM16.833 24.5L22.5 20.167L28.833 24.833L29.167 32.833L24.5 38.5L15.5 37.167C14.35 35.583 13.517 33.833 13.167 32C13.167 32.833 13.283 33.667 13.5 34.5H16.833V24.5ZM24.167 51.833C18.745 50.883 14.117 47.45 11.5 42.833L19.167 44.167L24.5 40.833L32.167 44.5V51.833H24.167ZM40.167 51.833V47.167L43.833 42.5L52.167 44.167C48.883 48.4 44.833 51.167 40.167 51.833ZM53.167 32.833L46.5 32.5L44.167 27.167L49.5 22.5C52.167 28.5 52.833 33.667 53.167 32.833Z"
                fill="#15803d"
              />
            </svg>
            <div className="ball-shadow"></div>
          </div>
        </div>

        {/* Content card */}
        <div className="decorative-content">
          <div className="decorative-card">
            <svg
              className="decorative-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="decorative-title">חזור לקהילת האוהדים!</h2>
            <p className="decorative-text">
              התחבר כדי לחזור לקהילת האוהדים שלך, לעקוב אחרי המשחקים ולהתחבר עם
              אוהדים אחרים שחולקים את התשוקה שלך לכדורגל.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
