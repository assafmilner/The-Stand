"use client";

import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./auth-styles.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [favoriteTeam, setFavoriteTeam] = useState("הפועל תל אביב");
  const [location, setLocation] = useState("אחר");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [bio, setBio] = useState("");
  // Add this state
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const teams = [
    "הפועל תל אביב",
    "מכבי תל אביב",
    "הפועל באר שבע",
    "מכבי חיפה",
    'בית"ר ירושלים',
    "בני יהודה",
    "מכבי נתניה",
    "הפועל חיפה",
    "הפועל ירושלים",
    "עירוני קרית שמונה",
    "מ.ס. אשדוד",
    "בני סכנין",
    "הפועל פתח תקווה",
    "מכבי פתח תקווה",
    "הפועל רמת גן",
    "הפועל כפר שלם",
  ];

  const locations = ["צפון", "מרכז", "דרום", "ירושלים", "אחר"];

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/api/auth/register",
        {
          name,
          email,
          password,
          favoriteTeam,
          location,
          phone,
          gender,
          birthDate,
          bio,
        }
      );

      // Show success message instead of navigating
      setRegistrationSuccess(true);

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFavoriteTeam("הפועל תל אביב");
      setLocation("אחר");
      setPhone("");
      setGender("");
      setBirthDate("");
      setBio("");
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.response?.data?.error || "שגיאה ברישום. נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  // If registration was successful, show a success message
  if (registrationSuccess) {
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
              <h1 className="form-title">הרשמה הושלמה!</h1>
              <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-center text-gray-700 mb-4">
                  תודה שנרשמת ליציע! שלחנו מייל אימות לכתובת:
                </p>
                <p className="text-center font-bold text-gray-900 mb-4">
                  {email}
                </p>
                <p className="text-center text-gray-700">
                  אנא בדוק את תיבת הדואר הנכנס שלך (וגם את תיקיית הספאם) ולחץ על
                  הקישור לאימות החשבון שלך.
                </p>
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => navigate("/login")}
                  className="form-button"
                >
                  המשך להתחברות
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative side - keep as is */}
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
              <h2 className="decorative-title">כמעט שם!</h2>
              <p className="decorative-text">
                אנא אמת את כתובת המייל שלך כדי להמשיך. אימות המייל עוזר לנו
                לשמור על קהילה בטוחה ואיכותית של אוהדי כדורגל.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      {/* Form side */}
      <div className="form-container">
        <div className="form-content">
          <div className="form-header">
            {/* Modern Football Logo */}
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
            <h1 className="form-title">הצטרף לקהילה!</h1>
            <p className="form-subtitle">צור את החשבון שלך ב-היציע</p>
          </div>

          {error && (
            <div className="bg-red-100 p-4 rounded text-center mt-2 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                שם מלא
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input"
                placeholder="השם המלא שלך"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                אימייל
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="your@email.com"
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

            <div className="form-group">
              <label htmlFor="favoriteTeam" className="form-label">
                קבוצת הכדורגל האהובה עליך
              </label>
              <select
                id="favoriteTeam"
                value={favoriteTeam}
                onChange={(e) => setFavoriteTeam(e.target.value)}
                required
                className="form-select"
              >
                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
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
            </div>
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                טלפון
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
                placeholder="050-0000000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender" className="form-label">
                מין
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="form-select"
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
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio" className="form-label">
                ביוגרפיה קצרה
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="form-input"
                placeholder="כמה מילים על עצמך..."
                rows={3}
              />
            </div>

            <button type="submit" disabled={isLoading} className="form-button">
              {isLoading ? (
                <>
                  <svg
                    className="form-button-icon animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  יוצר חשבון...
                </>
              ) : (
                <>
                  <svg
                    className="form-button-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 4V20M20 12H4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  הצטרף עכשיו
                </>
              )}
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

      {/* Decorative side */}
      <div className="decorative-container">
        <div className="field-pattern"></div>

        {/* Field elements */}
        <div className="field-elements">
          <div className="center-circle"></div>
          <div className="center-dot"></div>
          <div className="halfway-line"></div>
          <div className="penalty-area-top"></div>
          <div className="penalty-area-bottom"></div>
          <div className="goal-top"></div>
          <div className="goal-bottom"></div>
        </div>

        {/* Modern football elements */}
        <div className="football-element football-element-1">
          <div className="modern-football">
            <svg
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
            <div className="ball-shadow"></div>
          </div>
        </div>

        <div className="football-element football-element-2">
          <div className="modern-football">
            <svg
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
            <div className="ball-shadow"></div>
          </div>
        </div>

        {/* Content card */}
        <div className="decorative-content">
          <div className="decorative-card">
            <svg
              className="decorative-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="decorative-title">הצטרף לקהילת האוהדים!</h2>
            <p className="decorative-text">
              התחבר עם אוהדים אחרים, שתף את התשוקה שלך לכדורגל, והרגש בבית עם
              תומכים שחולקים את האהבה שלך למשחק.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
