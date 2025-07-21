// ### Middleware: auth
// Protects routes by validating the JWT token from the Authorization header or cookies.
// Attaches the decoded user ID to `req.user`.
//
// Usage: Apply to any route that requires authentication.
//
// On Success: `req.user = { id, userId }`
// On Failure: Returns 401 Unauthorized

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      userId: decoded.id,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      error: "Invalid token.",
    });
  }
};

module.exports = auth;
