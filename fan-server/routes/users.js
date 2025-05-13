const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const { getCurrentUser, changePassword, updateProfileInfo, uploadProfilePicture, uploadCoverImage, deleteAccount,  getPublicProfile, getAllusers  } = require("../controllers/userController");
const { storage } = require("../utils/cloudinary");
const multer = require("multer");
const upload = require("../middlewares/uploadProfile");

router.get("/me", authMiddleware, getCurrentUser);
router.put("/change-password", authMiddleware, changePassword);
router.put("/update-profile", authMiddleware, updateProfileInfo);
router.get("/all", authMiddleware, getAllusers);
router.post("/upload-profile", authMiddleware, upload.single("image"), uploadProfilePicture);
router.post("/upload-cover", authMiddleware, upload.single("coverImage"), uploadCoverImage);
router.get("/profile/:userId", authMiddleware, getPublicProfile);
router.delete("/delete", authMiddleware, deleteAccount);

module.exports = router;
