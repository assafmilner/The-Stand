import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AuthHeader from "./AuthHeader";
import VerifyEmailMessage from "./VerifyEmailMessage";
import api from "../../utils/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("verifying"); // verifying | success | error | invalid
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("invalid");
      setMessage("לא נמצא טוקן לאימות. נסה לחזור על הקישור במייל.");
      return;
    }

    const verifyEmail = async () => {
      try {
        await api.post("/api/auth/verify-email", { token });
        setStatus("success");
      } catch (error) {
        console.error("Email verification failed:", error);
        setStatus("error");
        setMessage("האימות נכשל או שפג תוקף הקישור.");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="auth-container">
      <div className="form-container">
        <div className="form-content">
          <AuthHeader
            title="אימות אימייל"
            subtitle={
              status === "success"
                ? "האימייל אומת בהצלחה!"
                : status === "error"
                ? "האימות נכשל או שפג תוקף הקישור."
                : "מאמת את כתובת הדוא״ל שלך..."
            }
          />
          <VerifyEmailMessage status={status} message={message} />
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
