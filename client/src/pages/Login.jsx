// src/pages/Login.jsx
import LoginForm from "../components/auth/LoginForm";

const Login = () => {
  return (
    <div className="auth-container">
      <div className="form-container">
        <div className="form-content">
          <div className="form-header">
            <h2 className="decorative-title">חזור לקהילת האוהדים!</h2>
            <p className="decorative-text">התחבר כדי לחזור לעולם של כדורגל.</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
