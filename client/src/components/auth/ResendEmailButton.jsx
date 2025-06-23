// src/components/auth/ResendEmailButton.jsx
import React, { useState } from "react";
import api from "../../utils/api";

export default function ResendEmailButton({ email }) {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

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
