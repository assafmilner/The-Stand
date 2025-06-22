// middlewares/uploadProfile.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_pictures", // ✅ שמירה נכונה לתיקייה שונה
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ quality: "auto:eco", width: 720, height: 720, crop: "limit" }],
  },
});

const uploadProfile = multer({ storage: profileStorage });

module.exports = uploadProfile;
