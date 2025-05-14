// src/components/auth/LoginForm.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "context/UserContext";
import { useAuth } from "../../context/AuthContext";
import AuthHeader from "./AuthHeader";
import ResendEmailButton from "./ResendEmailButton";
import api from "../../utils/api";
import "../../styles/auth.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerificationRequired, setEmailVerificationRequired] =
    useState(false);
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
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.data?.emailVerificationRequired) {
        setEmailVerificationRequired(true);
      } else {
        setError(err.response?.data?.error || "ההתחברות נכשלה!");
      }
    } finally {
      setIsLoading(false);
    }
  };
  // מצב של אימות מייל נדרש — לא מציגים כלל את הטופס
  if (emailVerificationRequired) {
    return (
      <div className="auth-container">
        <div className="form-container">
          <div className="form-content">
            <AuthHeader
              title="נערך אימות המייל"
              subtitle='נא לאמת את כתובת הדוא"ל שלך לפני ההתחברות.'
            />
            <ResendEmailButton email={email} />
            <div className="form-footer">
              <button
                type="button"
                className="form-link "
                onClick={() => setEmailVerificationRequired(false)}
              >
                חזור לטופס התחברות
              </button>
            </div>
          </div>
        </div>

        {/* decorative side */}
        <div className="decorative-container">
          {/* ...ה־decorative שלך בדיוק כמו בקוד הקודם */}
        </div>
      </div>
    );
  }
  return (
    <div className="auth-container">
      <div className="form-container">
        <div className="form-content">
          <AuthHeader
            title="ברוך הבא ליציע!"
            subtitle="התחבר כדי לצפות בקבוצות שלך, הפוסטים והחברים."
          />
          {error && <p className="form-error">{error}</p>}
          <form onSubmit={handleLogin} className="form">
            {" "}
            {/* :contentReference[oaicite:12]{index=12}:contentReference[oaicite:13]{index=13} */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                אימייל
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <div className="form-label-group">
                <label htmlFor="password" className="form-label">
                  סיסמה
                </label>
                <Link to="#" className="form-link">
                  שכחת סיסמה?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="הסיסמה שלך"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="form-button" disabled={isLoading}>
              {isLoading ? (
                <svg
                  className="form-button-icon animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  {/* spinner paths */}
                </svg>
              ) : (
                <>
                  <svg
                    className="form-button-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    {/* login icon */}
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
                הרשם כאן
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* ——— צד שמאל ——— */}
      <div className="decorative-container">
        <div className="field-pattern"></div>
        <div className="field-elements">
          <div className="center-circle"></div>
          <div className="center-dot"></div>
          <div className="halfway-line"></div>
          <div className="decorative-column">
            <div className="decorative-card">
              <h2 className="decorative-title">חזור לקהילת האוהדים!</h2>
              <p className="decorative-text">
                התחבר כדי לחזור לקהילת האוהדים שלך, לעקוב אחרי המשחקים ולהתחבר
                עם אוהדים אחרים שחולקים את התשוקה שלך לכדורגל.
              </p>
            </div>
            <div className="field-pattern"></div>
          </div>

          <div className="penalty-area-top"></div>
          <div className="penalty-area-bottom"></div>
          <div className="goal-top"></div>
          <div className="goal-bottom"></div>
        </div>
        {/* …modern-football SVG elements… */}
      </div>
    </div>
  );
};

export default LoginForm;
