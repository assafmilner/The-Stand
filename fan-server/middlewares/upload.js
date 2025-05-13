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

// הגדרת אחסון ל־Multer - תמיכה בתמונות וסרטונים
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "posts", // אפשר לשנות שם תיקייה
    allowed_formats: [
      // פורמטי תמונות
      "jpg", "jpeg", "png", "gif", "webp", "avif", "svg", "bmp",
      // פורמטי סרטונים
      "mp4", "mov", "avi", "mkv", "flv", "wmv", "webm", "3gp", "m4v"
    ],
    // הגדרות ספציפיות לפי סוג הקובץ
     // הגדרות ספציפיות לפי סוג הקובץ
     transformation: async (req, file) => {
      // בדיקה אם זה סרטון או תמונה
      const videoFormats = ["mp4", "mov", "avi", "mkv", "flv", "wmv", "webm", "3gp", "m4v"];
      const fileExtension = file.originalname.split('.').pop().toLowerCase();
      
      if (videoFormats.includes(fileExtension)) {
        // הגדרות לסרטונים - כיווץ משמעותי
        return [
          { 
            // איכות וקובץ
            quality: "auto:eco", // איכות מופחתת לחיסכון בנפח
            fetch_format: "mp4", // המרה ל-mp4 שהוא יעיל יותר
            
            // רזולוציה
            width: 720, // רוחב מפחת ל-720p במקום 1080p
            height: 720, // גובה מקסימלי
            crop: "limit", // שמירה על יחס תמונה
            
            // הגדרות דחיסה
            video_codec: "h264", // קודק יעיל
            bit_rate: "1500k", // 1.5 Mbps - קצב סיביות נמוך יותר
            fps: 30, // 30 FPS במקום 60
            
            // אופציות נוספות
            flags: [
              "force_strip", // הסרת metadata
              "lossy", // דחיסה חזקה יותר
              "keep_iptc" // שמירה על מידע בסיסי
            ],
            
            // הגדרות שמע
            audio_codec: "aac",
            audio_frequency: 44100,
            audio_bitrate: "128k", // 128 kbps שמע
            
            // הגדרות תצוגה מקדימה
            start_offset: "auto", // יצירת thumbnail אוטומטי
          }
        ];
      } else {
        // הגדרות לתמונות
        return [
          { 

            quality: "100",
            fetch_format: "auto"
          }
        ];
      }
    },
    // הגדרת סוג המשאב (image/video) אוטומטית
    resource_type: async (req, file) => {
      const videoFormats = ["mp4", "mov", "avi", "mkv", "flv", "wmv", "webm", "3gp", "m4v"];
      const fileExtension = file.originalname.split('.').pop().toLowerCase();
      
      return videoFormats.includes(fileExtension) ? "video" : "image";
    }
  },
});

// הוספת בדיקת גודל קובץ
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv|flv|wmv|webm|3gp|m4v/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("שגיאה: רק קבצי תמונה וסרטון מותרים!"));
  }
};

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB - מתאים לסרטונים
  },
  fileFilter
});

module.exports = upload;