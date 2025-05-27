// fan-server/middlewares/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "") || 
                  req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: "Access denied. No token provided." 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Consistent user field naming
    req.user = {
      id: decoded.id,
      userId: decoded.id // For backward compatibility
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ 
      success: false, 
      error: "Invalid token." 
    });
  }
};

module.exports = auth;