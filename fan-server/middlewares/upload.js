// ### Multer Upload Configuration (with Cloudinary)
// This setup handles file uploads (images/videos) to Cloudinary,
// including custom transformations for videos and dynamic resource type resolution.

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const videoFormats = [
  "mp4",
  "mov",
  "avi",
  "mkv",
  "flv",
  "wmv",
  "webm",
  "3gp",
  "m4v",
];

// ### CloudinaryStorage: dynamic resource handling
// - Stores under "posts" folder
// - Applies different transformations based on file extension
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "posts",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "avif",
      "svg",
      "bmp",
      ...videoFormats,
    ],
    transformation: async (req, file) => {
      const ext = file.originalname.split(".").pop().toLowerCase();
      if (videoFormats.includes(ext)) {
        return [
          {
            quality: "auto:eco",
            fetch_format: "mp4",
            width: 720,
            height: 720,
            crop: "limit",
            video_codec: "h264",
            bit_rate: "1500k",
            fps: 30,
            flags: ["force_strip", "lossy", "keep_iptc"],
            audio_codec: "aac",
            audio_frequency: 44100,
            audio_bitrate: "128k",
            start_offset: "auto",
          },
        ];
      } else {
        return [{ quality: "100", fetch_format: "auto" }];
      }
    },
    resource_type: async (req, file) => {
      const ext = file.originalname.split(".").pop().toLowerCase();
      return videoFormats.includes(ext) ? "video" : "image";
    },
  },
});

// ### File Filter
// Validates extension and MIME type before accepting the file.
const fileFilter = (req, file, cb) => {
  const allowedTypes =
    /jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv|flv|wmv|webm|3gp|m4v/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("שגיאה: רק קבצי תמונה או וידאו מותרים!"));
  }
};

// ### Multer Upload Middleware
// Limits file size to 50MB, handles both image and video uploads.
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter,
});

module.exports = upload;
