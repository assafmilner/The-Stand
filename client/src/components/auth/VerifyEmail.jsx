import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./auth-styles.css";

const VerifyEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent multiple verification attempts for the same token
      if (verificationAttempted.current) {
        return;
      }

      verificationAttempted.current = true;

      const params = new URLSearchParams(location.search);
      const token = params.get("token");

      if (!token) {
        setVerificationStatus("invalid");
        setErrorMessage("לא נמצא טוקן לאימות. נסה לחזור על הקישור במייל.");
        return;
      }

      try {
        // Using encodeURIComponent to ensure token is properly formatted for URL
        const encodedToken = encodeURIComponent(token);
        await axios.get(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:3001"
          }/api/auth/verify-email/${encodedToken}`
        );
        setVerificationStatus("success");

        // Clear the token from URL to prevent accidental re-verification attempts
        // This replaces the current URL without token parameter
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (error) {
        console.error("Verification error:", error);

        // Special handling for already verified tokens
        if (
          error.response &&
          error.response.status === 400 &&
          error.response.data &&
          (error.response.data.message === "Token already used" ||
            error.response.data.message === "Email already verified")
        ) {
          // Email was already verified - this is actually a success case
          setVerificationStatus("success");
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          return;
        }

        setVerificationStatus("error");

        // More specific error handling
        if (error.response) {
          if (error.response.status === 400) {
            setErrorMessage("הקישור שגוי. אנא בקש קישור אימות חדש.");
          } else if (error.response.status === 401) {
            setErrorMessage("פג תוקף הקישור. אנא בקש קישור אימות חדש.");
          } else {
            setErrorMessage(
              error.response.data?.message || "אירעה שגיאה במהלך האימות."
            );
          }
        } else if (error.request) {
          setErrorMessage("השרת אינו מגיב. אנא נסה שוב מאוחר יותר.");
        } else {
          setErrorMessage("אירעה שגיאה לא צפויה. אנא נסה שוב מאוחר יותר.");
        }
      }
    };

    verifyEmail();
  }, [location]);

  return (
    <div className="auth-container">
      <div className="form-container">
        <div className="form-content">
          <div className="form-header">
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
            <h1 className="form-title">אימות אימייל</h1>

            {verificationStatus === "verifying" && (
              <p className="form-subtitle">מאמת את כתובת האימייל שלך...</p>
            )}

            {verificationStatus === "success" && (
              <>
                <p className="form-subtitle">האימייל אומת בהצלחה!</p>
                <button
                  onClick={() => navigate("/login")}
                  className="form-button"
                  style={{ marginTop: "20px" }}
                >
                  המשך להתחברות
                </button>
              </>
            )}

            {verificationStatus === "error" && (
              <>
                <p className="form-subtitle">
                  {errorMessage || "הקישור שגוי או שפג תוקפו."}
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="form-button"
                  style={{ marginTop: "20px" }}
                >
                  חזור לדף התחברות
                </button>
              </>
            )}

            {verificationStatus === "invalid" && (
              <>
                <p className="form-subtitle">
                  {errorMessage ||
                    "לא נמצא טוקן לאימות. נסה לחזור על הקישור במייל."}
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="form-button"
                  style={{ marginTop: "20px" }}
                >
                  חזור לדף התחברות
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Decorative side */}
      <div className="decorative-container">
        <div className="field-pattern"></div>
        <div className="field-elements">
          <div className="center-circle"></div>
          <div className="center-dot"></div>
          <div className="halfway-line"></div>
          <div className="penalty-area-top"></div>
          <div className="penalty-area-bottom"></div>
          <div className="goal-top"></div>
          <div className="goal-bottom"></div>
        </div>
        <div className="decorative-content">
          <div className="decorative-card">
            <svg
              className="decorative-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 12h-4l-3 9L9 3l-3 9H2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="decorative-title">אימות אימייל</h2>
            <p className="decorative-text">
              תודה שאימתת את כתובת האימייל שלך. כעת תוכל להתחבר ולהשתמש בכל
              התכונות של היציע.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
