// ### Multer Upload Configuration for Profile Pictures
// This middleware handles user profile image uploads via Cloudinary.
// Images are uploaded to the `profile_pictures` folder with automatic transformations applied.

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// ### Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ### CloudinaryStorage: Profile Picture Logic
// - Only allows images (jpg, jpeg, png, webp)
// - Applies size/quality transformation on upload
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_pictures",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      {
        quality: "auto:eco",
        width: 720,
        height: 720,
        crop: "limit",
      },
    ],
  },
});

// ### Multer Middleware for Profile Uploads
const uploadProfile = multer({ storage: profileStorage });

module.exports = uploadProfile;
