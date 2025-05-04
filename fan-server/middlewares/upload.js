const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();

// הגדרות Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// הגדרת אחסון ל־Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "posts", // אפשר לשנות שם תיקייה
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

const upload = multer({ storage });

module.exports = upload;
