import React from "react";

const AuthHeader = ({ title, subtitle }) => {
  return (
    <div className="form-header">
      <div className="logo-container">
        <img src="../..\logowebsite.JPG" alt="Logo" className="logo" />
      </div>
      <h1 className="form-title">{title}</h1>
      <p className="form-subtitle">{subtitle}</p>
    </div>
  );
};

export default AuthHeader;
