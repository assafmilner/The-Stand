import React from "react";

const AuthHeader = ({ title, subtitle }) => {
  return (
    <div className="form-header">
      <div className="logo-container">
        <svg className="logo" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="white" stroke="#15803d" strokeWidth="2" />
          <path d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8Z" fill="white" />
          <path d="M32 12c3.7 0 7.2 1 10.2 2.8L39 20l-6.2.3L26.5 15v-2.7C28.2 12.1 30.1 12 32 12ZM24.2 51.8c-5.4-.9-10-4.3-12.7-8.9l7.7 1.3 5.3-3.3 7.7 3.7v7.2h-8z" fill="#15803d" />
        </svg>
      </div>
      <h1 className="form-title">{title}</h1>
      <p className="form-subtitle">{subtitle}</p>
    </div>
  );
};

export default AuthHeader;
