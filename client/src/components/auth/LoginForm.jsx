import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/useUserContext";
import { useAuth } from "../../context/useAuthContext";
import AuthHeader from "./AuthHeader";
import ResendEmailButton from "./ResendEmailButton";
import api from "../../utils/api";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [error, setError] = useState("");

  const { setUser } = useUser();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setEmailVerificationRequired(false);

    try {
      const response = await api.post("/api/auth/login", { email, password });

      login(response.data.accessToken);
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

  return (
    <form onSubmit={handleLogin} className="auth-form">
      <AuthHeader
        title="ברוך הבא ליציע!"
        subtitle="התחבר כדי לצפות בקבוצות שלך, הפוסטים והחברים."
      />

      <input
        type="email"
        placeholder="אימייל"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="סיסמה"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p className="form-error">{error}</p>}

      {emailVerificationRequired && (
        <>
          <p>נדרש אימות מייל.</p>
          <ResendEmailButton email={email} />
        </>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "טוען..." : "התחברות"}
      </button>

      <p className="form-footer">
        אין לך חשבון?{" "}
        <button type="button" className="link-button" onClick={() => navigate("/register")}>
          הרשם
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
