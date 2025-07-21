import React, { useState } from "react";
import api from "../../utils/api";

/**
 * ResendEmailButton handles the logic for resending the email verification link.
 *
 * Props:
 * - email: string - the email address to which the verification will be resent
 *
 * States:
 * - status: "idle" | "sending" | "sent" | "error"
 */
export default function ResendEmailButton({ email }) {
  const [status, setStatus] = useState("idle");

  /**
   * Sends a request to resend the verification email.
   * Updates status accordingly to reflect the process.
   */
  const handleResend = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await api.post("/api/auth/resend-verification", { email });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <button
      type="button"
      onClick={handleResend}
      className="form-button mt-2"
      disabled={status === "sending" || status === "sent"}
    >
      {status === "sending" && "שולח..."}
      {status === "sent" && "נשלח בהצלחה!"}
      {status === "idle" && "שלח אימות מחדש"}
      {status === "error" && "שגיאה—נסה שוב"}
    </button>
  );
}
