const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshToken
} = require("../controllers/authController");

// register
router.post("/register", register);

// login
router.post("/login", login);

// token refresh
router.post("/refresh", refreshToken);

module.exports = router;
