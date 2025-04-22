const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const { getCurrentUser, changePassword, updateLocation, uploadProfilePicture } = require("../controllers/userController");
const multer = require("multer");
const { storage } = require("../utils/cloudinary");
const upload = require("../middlewares/upload");

router.get("/me", authMiddleware, getCurrentUser);
router.put("/change-password", authMiddleware, changePassword);
router.put("/update-location", authMiddleware, updateLocation);
router.post("/upload-profile", authMiddleware, upload.single("image"), uploadProfilePicture);

module.exports = router;
