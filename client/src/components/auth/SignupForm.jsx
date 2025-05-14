import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import AuthHeader from "./AuthHeader";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [favoriteTeam, setFavoriteTeam] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [bio, setBio] = useState("");
  const [joinDate] = useState(new Date().toISOString().split("T")[0]);

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות.");
      setIsLoading(false);
      return;
    }

    try {
      await api.post("/api/auth/register", {
        email,
        password,
        fullName,
        favoriteTeam,
        phone,
        gender,
        birthDate,
        bio,
        joinDate,
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
    <form onSubmit={handleSignup} className="auth-form">
      <AuthHeader
        title="הצטרף ליציע!"
        subtitle="הרשם כדי להתחיל לשתף, לאהוב ולהתחבר עם אוהדים כמוך."
      />

      <input
        type="text"
        placeholder="שם מלא"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
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
      <input
        type="password"
        placeholder="אימות סיסמה"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="קבוצה אהודה"
        value={favoriteTeam}
        onChange={(e) => setFavoriteTeam(e.target.value)}
        required
      />
      <input
        type="tel"
        placeholder="טלפון"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
      <select
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        required
      >
        <option value="">בחר מין</option>
        <option value="זכר">זכר</option>
        <option value="נקבה">נקבה</option>
        <option value="אחר">אחר</option>
      </select>
      <input
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        required
      />
      <textarea
        placeholder="ביוגרפיה קצרה"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={3}
      />

      {error && <p className="form-error">{error}</p>}

      {success ? (
        <div>
          <p>נרשמת בהצלחה! אימייל נשלח לאימות.</p>
          <button type="button" onClick={() => navigate("/login")}>
            מעבר להתחברות
          </button>
        </div>
      ) : (
        <button type="submit" disabled={isLoading}>
          {isLoading ? "טוען..." : "הרשמה"}
        </button>
      )}

      {!success && (
        <p className="form-footer">
          כבר יש לך חשבון?{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => navigate("/login")}
          >
            התחבר
          </button>
        </p>
      )}
    </form>
  );
};

export default SignupForm;
