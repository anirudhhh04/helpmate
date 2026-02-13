const express = require("express");
const mongoose = require("mongoose");
const Worker = require("../models/Worker");
const Slot = require("../models/Slot");
const Convertslot = require("../controller/Convertslot");
const Booking = require("../models/Booking");
const User = require("../models/User");
// const { spawn } = require("child_process"); // ❌ AI Disabled
// const Tesseract = require("tesseract.js");  // ❌ AI Disabled
// const crypto = require("crypto");           // ❌ Not needed now
// const fs = require("fs");                   // ❌ Not needed now
// const path = require("path");               // ❌ Not needed now

const Rating = require("../models/Rating");
const upload = require("../middlewares/multerconfig");
const router = express.Router();

/* ============================
   WORKER REGISTER (AI REMOVED)
   ============================ */

router.post("/register", upload.any(), async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      location,
      phone,
      service,
      description,
    } = req.body;

    // 1️⃣ Check if email exists
    const existingWorker = await Worker.findOne({ email });

    if (existingWorker) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // 2️⃣ Store uploaded documents (no AI analysis)
    let uploadedDocs = [];

    if (req.files && req.files.length > 0) {
      uploadedDocs = req.files.map((f) => `uploads/${f.filename}`);
    }

    // 3️⃣ Create worker (AI removed, admin approval still required)
    const newWorker = await Worker.create({
      username,
      email,
      password, // hashed in schema
      location: location.toLowerCase(),
      contactNumber: phone,
      service,
      description,
      documents: uploadedDocs,

      // ✅ Keep admin approval system
      verificationStatus: "pending",

      // AI disabled but field exists
      aiApproved: true,
      aiVerdictReason: "AI verification disabled",
    });

    return res.status(201).json({
      success: true,
      message: "Worker registered. Awaiting admin approval.",
    });

  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* ============================
   WORKER LOGIN (UNCHANGED)
   ============================ */

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const worker = await Worker.findOne({ email });

    if (!worker) {
      return res.json({
        message: "Worker not registered",
        success: false,
      });
    }

    const token = await Worker.matchpassword(email, password);

    if (!token) {
      return res.json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // ✅ Keep admin approval check
    if (worker.verificationStatus !== "approved") {
      return res.json({
        success: false,
        message:
          "Your account is waiting for Admin Approval. Please check back later.",
      });
    }

    return res.status(200).json({
      message: "Worker logged in",
      token,
      success: true,
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
