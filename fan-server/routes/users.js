const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const { getCurrentUser, changePassword, updateLocation } = require("../controllers/userController");

router.get("/me", authMiddleware, getCurrentUser);
router.put("/change-password", authMiddleware, changePassword);
router.put("/update-location", authMiddleware, updateLocation);

module.exports = router;
