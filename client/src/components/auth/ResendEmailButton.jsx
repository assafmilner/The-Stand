import { useState } from "react";
import api from "../../utils/api";


const ResendEmailButton = ({ email }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await api.post("/api/auth/resend-verification", { email });
      setSuccess(true);
    } catch (err) {
      console.error("Resend error:", err);
      setError("שליחת מייל נכשלה.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="resend-container">
      <button onClick={handleResend} disabled={isLoading}>
        {isLoading ? "שולח..." : "שלח שוב מייל אימות"}
      </button>
      {success && <p className="success-message">המייל נשלח בהצלחה!</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default ResendEmailButton;
