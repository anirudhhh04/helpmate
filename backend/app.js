require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");

const userroute = require("./src/routes/User");
const workerroute = require("./src/routes/Worker");
const ratingroute = require("./src/routes/Rating");
const adminroute = require("./src/routes/admin");
const Worker = require("./src/models/Worker");
const upload = require("./src/middlewares/multerconfig");

const port = process.env.PORT || 4000;

// ✅ MongoDB Atlas Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// ✅ CORS (for frontend)
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    "http://localhost:5173",       // Vite default
    "http://localhost:5174",       // If port auto-changes
    credentials: true,
  })
);


// ✅ Static folders
app.use(express.static(path.resolve("./public")));

app.use(
  "/images",
  express.static(path.resolve(__dirname, "src/public/images"))
);

app.use(
  "/uploads",
  express.static(path.resolve(__dirname, "src/public/uploads"))
);

// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use("/api/user", userroute);
app.use("/api/worker", workerroute);
app.use("/api/rating", ratingroute);
app.use("/api/admin", adminroute);

// ✅ Image Upload Route
app.post("/upload/:id", upload.single("image"), async (req, res) => {
  try {
    const id = req.params.id;

    const updatedDoc = await Worker.findOneAndUpdate(
      { _id: id },
      { $set: { imageurl: `uploads/${req.file.filename}` } },
      { new: true }
    );

    return res.json({
      success: 1,
      imageurl: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: 0, message: "Upload failed" });
  }
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
