// ### Express Router: Auth Routes
// Defines authentication-related API endpoints for user registration, login,
// logout, token refresh, and email verification flows.

const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerificationEmail,
} = require("../controllers/authController");

// register
router.post("/register", register);

// login
router.post("/login", login);

// token refresh
router.post("/refresh", refreshToken);

router.post("/logout", logout);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

module.exports = router;
