// src/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the upload directory exists to prevent errors
const uploadDir = path.resolve(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Centralized folder
  },
  filename: (req, file, cb) => {
    // Sanitize filename to remove spaces
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
