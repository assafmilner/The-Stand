import React, { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/api";

/**
 * VerifyEmail component handles email verification from a URL token.
 * It reads the token from the query string, sends a request to the server,
 * and displays appropriate status messages to the user.
 */
export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'
  const [error, setError] = useState("");
  const verificationAttempted = useRef(false);

  const token = useMemo(
    () => new URLSearchParams(location.search).get("token"),
    [location.search]
  );

  useEffect(() => {
    const verifyEmail = async () => {
      if (verificationAttempted.current) return;
      verificationAttempted.current = true;

      if (!token) {
        setStatus("error");
        setError("לא נמצא טוקן לאימות. נסה לחזור על הקישור במייל.");
        return;
      }

      try {
        await api.get(`/api/auth/verify-email/${encodeURIComponent(token)}`);
        setStatus("success");
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      } catch (err) {
        console.error("Verification error:", err);
        const resp = err.response;
        const msg = resp?.data?.message || resp?.data?.error;
        if (
          resp?.status === 400 &&
          (msg === "Token already used" || msg === "Email already verified")
        ) {
          setStatus("success");
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          setTimeout(() => navigate("/login", { replace: true }), 2000);
          return;
        }

        setStatus("error");
        if (resp) {
          if (resp.status === 400) {
            setError("הקישור שגוי. אנא בקש קישור אימות חדש.");
          } else if (resp.status === 401) {
            setError("פג תוקף הקישור. אנא בקש קישור אימות חדש.");
          } else {
            setError(msg || "אירעה שגיאה במהלך האימות.");
          }
        } else if (err.request) {
          setError("השרת אינו מגיב. אנא נסה שוב מאוחר יותר.");
        } else {
          setError("אירעה שגיאה לא צפויה. אנא נסה שוב מאוחר יותר.");
        }
      }
    };

    verifyEmail();
  }, [token, location.search, navigate]);

  if (status === "loading") {
    return <div className="text-center p-4">טוען אימות...</div>;
  }
  if (status === "success") {
    return (
      <div className="text-center p-4">
        <h2>אימייל אומת בהצלחה!</h2>
        <p>מעבירים אותך לעמוד ההתחברות…</p>
      </div>
    );
  }

  return (
    <div className="text-center p-4">
      <h2>אימות נכשל</h2>
      <p>{error}</p>
      <button
        type="button"
        onClick={() => navigate("/login", { replace: true })}
        className="mt-4 form-button"
      >
        חזור להתחברות
      </button>
    </div>
  );
}
