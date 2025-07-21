/**
 * Login page – renders the login form component.
 * Styling is handled via a dedicated auth.css file.
 */
import React from "react";
import LoginForm from "../components/auth/LoginForm";
import "../styles/auth.css";

/**
 * Stateless component that delegates rendering to <LoginForm />.
 */
const Login = () => {
  return <LoginForm />;
};

export default Login;
