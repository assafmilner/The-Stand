import SignupForm from "../components/auth/SignupForm";

const Signup = () => {
  return (
    <div className="auth-container">
      <div className="form-container">
        <div className="form-content">
          <div className="form-header">
            <h2 className="decorative-title">הצטרף ליציע!</h2>
            <p className="decorative-text">הרשם כדי להתחבר לעולם הכדורגל.</p>
          </div>

          <SignupForm />
        </div>
      </div>
    </div>
  );
};

export default Signup;
