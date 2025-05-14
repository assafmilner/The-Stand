import { useNavigate } from "react-router-dom";


const VerifyEmailMessage = ({ status, message }) => {
  const navigate = useNavigate();

  if (status === "verifying") {
    return <p className="form-subtitle">מאמת את כתובת האימייל שלך...</p>;
  }

  if (status === "success") {
    return (
      <>
        <p className="form-subtitle">האימייל אומת בהצלחה!</p>
        <button onClick={() => navigate("/login")} className="form-button">
          המשך להתחברות
        </button>
      </>
    );
  }

  if (status === "error" || status === "invalid") {
    return (
      <>
        <p className="form-subtitle">{message}</p>
        <button onClick={() => navigate("/register")} className="form-button">
          חזור להרשמה
        </button>
      </>
    );
  }

  return null;
};

export default VerifyEmailMessage;
