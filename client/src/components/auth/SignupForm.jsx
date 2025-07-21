import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import teamColors from "../../utils/teamStyles";
import AuthHeader from "./AuthHeader";
import "../../styles/auth.css";

/**
 * SignupForm handles the user registration process.
 * It collects user details, validates input, and submits to the server.
 * After successful registration, the user is prompted to verify their email.
 */
const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [favoriteTeam, setFavoriteTeam] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const locations = ["צפון", "מרכז", "דרום", "ירושלים", "אחר"];

  const navigate = useNavigate();

  /**
   * Handles the signup form submission.
   * Validates passwords and sends registration data to the API.
   */
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות.");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/api/auth/register", {
        email,
        name,
        location,
        phone,
        gender,
        birthDate,
        favoriteTeam,
        bio,
        password,
      });
      setSuccess(true);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.error || "ההרשמה נכשלה.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {success ? (
        <div className="form-container">
          <div className="form-content">
            <div className="form-header">
              <h2 className="decorative-title">נרשמת בהצלחה!</h2>
              <p className="decorative-text">
                שלחנו אליך מייל לאימות. לאחריו תוכל להתחבר.
              </p>
            </div>
            <button className="form-button" onClick={() => navigate("/login")}>
              התחבר
            </button>
          </div>
        </div>
      ) : (
        <div className="form-container">
          <div className="form-content">
            <AuthHeader
              title="הצטרף ליציע!"
              subtitle="הרשם כדי להתחיל לשתף, לאהוב ולהתחבר עם אוהדים כמוך."
            />

            {error && <p className="form-error">{error}</p>}

            <form onSubmit={handleSignup} className="form">
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  שם מלא
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="form-input"
                  placeholder="השם המלא שלך"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  אימייל
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  סיסמה
                </label>
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

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  אימות סיסמה
                </label>
                <input
                  type="password"
                  placeholder="הסיסמה שלך בשנית"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <label htmlFor="location" className="form-label">
                מיקום בישראל
              </label>
              <select
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="form-select"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  טלפון
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="form-input"
                  placeholder="050-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender" className="form-label">
                  מין
                </label>
                <select
                  id="gender"
                  className="form-select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="">בחר מין</option>
                  <option value="זכר">זכר</option>
                  <option value="נקבה">נקבה</option>
                  <option value="אחר">אחר</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="birthDate" className="form-label">
                  תאריך לידה
                </label>
                <input
                  id="birthDate"
                  type="date"
                  className="form-input"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="favoriteTeam" className="form-label">
                  קבוצה אהודה
                </label>
                <select
                  id="favoriteTeam"
                  className="form-select"
                  value={favoriteTeam}
                  onChange={(e) => setFavoriteTeam(e.target.value)}
                  required
                >
                  <option value="">בחר קבוצה</option>
                  {Object.keys(teamColors).map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="bio" className="form-label">
                  ביוגרפיה קצרה
                </label>
                <textarea
                  id="bio"
                  className="form-input"
                  rows={3}
                  placeholder="ספר לנו קצת על עצמך"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="form-button"
                disabled={isLoading}
              >
                {isLoading ? "טוען..." : "הרשמה"}
              </button>
            </form>

            <div className="form-footer">
              <p>
                כבר יש לך חשבון?{" "}
                <Link to="/login" className="form-link">
                  התחבר כאן
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="decorative-container">
        <div className="field-pattern"></div>
        <div className="field-elements">
          <div className="center-circle"></div>
          <div className="center-dot"></div>
          <div className="halfway-line"></div>
          <div className="decorative-column">
            <div className="decorative-card">
              <h2 className="decorative-title">הצטרף לקהילת האוהדים!</h2>
              <p className="decorative-text">
                התחבר עם אוהדים אחרים, שתף את התשוקה שלך לכדורגל, והרגש בבית עם
                תומכים שחולקים את האהבה שלך למשחק.
              </p>
            </div>
            <div className="field-pattern"></div>
          </div>
          <div className="penalty-area-top"></div>
          <div className="penalty-area-bottom"></div>
          <div className="goal-top"></div>
          <div className="goal-bottom"></div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
