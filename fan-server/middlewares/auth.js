const { verifyToken } = require("../utils/jwt");

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
        return res.status(401).json({ error: "Invalid token" });
    }

    req.user = payload;

    next();

}

module.exports = authMiddleware;