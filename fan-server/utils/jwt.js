const jwt = require("jsonwebtoken");

function generateAccessToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
    );
  }

  function generateRefreshToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
    );
  }

  function verifyToken(token) {
    try {
      console.log("✅ SECRET:", process.env.JWT_SECRET);
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("❌ JWT verification error:", err.message);
      return null;
    }
  }
  
  

  module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
  };
  