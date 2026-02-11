const express = require("express");
const mongoose = require("mongoose");
const Worker = require("../models/Worker");
const Slot = require("../models/Slot");
const Convertslot = require("../controller/Convertslot");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { spawn } = require("child_process");
const crypto = require("crypto"); // Built-in Node module for Hashing
const fs = require("fs");
const Rating = require("../models/Rating");
const path = require("path");
const Tesseract = require("tesseract.js");
const upload = require("../middlewares/multerconfig");
const router = express.Router();

router.get("/locations", async (req, res) => {
  try {
    const query = req.query.q || "";
    const locations = await Worker.find({
      location: { $regex: query, $options: "i" },
    }).distinct("location"); // Get unique locations

    res.status(200).json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/rate/:bookingId", async (req, res) => {
  const bookid = req.params.bookingId;
  const value = req.body.ratingValue;
  try {
    const booking = await Booking.findByIdAndUpdate(
      bookid,
      { $set: { rated: true } },
      { new: true },
    );
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const user = await User.findByIdAndUpdate(
      booking.uid,
      { $inc: { score: value } },
      { new: true },
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    return res.status(200).json({ message: "Rating submitted", success: true });
  } catch (err) {
    return res.status(500).json({ message: err.message, success: false });
  }
});

router.put("/slots/update/:wid", async (req, res) => {
  const wid = req.params.wid;
  const starthour = req.body.starthour;
  const endhour = req.body.endhour;

  try {
    const slot = await Slot.findOneAndUpdate(
      {
        wid,
        date: req.body.date,
        "slots.startHour": starthour,
        "slots.endHour": endhour,
      },
      {
        $set: { "slots.$.available": false }, // ✅ Correct - Updates only the matched slot
      },
      { new: true },
    );
    if (slot) return res.status(200).json({ success: true });
    return res.status(500).json({ success: false });
  } catch (err) {
    return res.status(500).json({ message: err.message, success: false });
  }
});

router.put("/bookings/confirm/:id", async (req, res) => {
  const bookingId = req.params.id;
  const { status, date } = req.body;

  try {
    // 1. Update the Booking Status
    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId },
      { status: status },
      { new: true },
    );

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found", success: false });
    }

    // 2. IF Confirmed (1), update the SLOT collection (not Worker)
    if (status === 1) {
      // We look for the Slot document belonging to this worker & date
      // Then we find the specific hour inside the 'slots' array
      await Slot.updateOne(
        {
          wid: booking.wid,
          date: date,
          "slots.startHour": booking.startHour,
        },
        {
          $set: { "slots.$.available": false },
        },
      );
    }

    return res.status(200).json({
      message: "Booking confirmed and slot updated",
      success: true,
      booking,
    });
  } catch (err) {
    console.error("Confirm Error:", err);
    return res.status(500).json({ message: err.message, success: false });
  }
});
router.get("/bookings/:id", async (req, res) => {
  try {
    const wid = req.params.id;

    const bookings = await Booking.find({
      wid: new mongoose.Types.ObjectId(wid),
    })
      .populate("uid", "username score")
      .sort({ createdAt: -1 });

    return res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

router.get("/slots/:id/:date", async (req, res) => {
  const id = req.params.id;
  const date = req.params.date;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Worker ID" });
    }

    // Find slot by id and select only the 'slots' field
    const slot = await Slot.findOne({ wid: id, date }).select("slots");

    // ✅ FIX: If no slot found, return empty array [] with 200 OK
    // Do NOT return 404 here.
    if (!slot) {
      return res.status(200).json({ slots: [], success: true });
    }

    // If slot found, return the slots
    return res.status(200).json({ slots: slot.slots, success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

const runPythonAnalysis = (filePath) => {
  return new Promise((resolve, reject) => {
    // Point to the script we created in Step 3
    const scriptPath = path.join(__dirname, "../scripts/ai_verification.py");

    // Spawn the python process
    const pythonProcess = spawn("python", [scriptPath, filePath]);

    let dataString = "";

    // Collect data printed by Python
    pythonProcess.stdout.on("data", (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python Error: ${data}`);
    });

    // When Python finishes
    pythonProcess.on("close", (code) => {
      try {
        const result = JSON.parse(dataString);
        resolve(result);
      } catch (e) {
        console.error("Failed to parse Python response", e);
        // Fallback if python fails
        resolve({ is_tampered: false, verdict: "System Error" });
      }
    });
  });
};

// ---------------------------------------------------------
// COMBINED AI CHECK (Python + Tesseract)
// ---------------------------------------------------------
// ---------------------------------------------------------
// DOMAIN KNOWLEDGE BASE
// ---------------------------------------------------------
const SERVICE_KEYWORDS = {
  doctor: [
    "medical",
    "medicine",
    "surgery",
    "mbbs",
    "health",
    "hospital",
    "doctor",
    "clinic",
    "practitioner",
  ],
  engineer: [
    "engineering",
    "technology",
    "b.tech",
    "science",
    "technical",
    "computer",
    "civil",
    "mechanical",
  ],
  plumber: [
    "plumbing",
    "trade",
    "vocational",
    "technician",
    "pipe",
    "water",
    "maintenance",
    "apprentice",
  ],
  electrician: [
    "electrical",
    "electric",
    "wiring",
    "voltage",
    "technician",
    "power",
    "grid",
    "circuit",
  ],
};

// ---------------------------------------------------------
// COMBINED AI CHECK (Python + Tesseract + Context)
// ---------------------------------------------------------
const analyzeDocument = async (filePath, username, service) => {
  try {
    console.log(`Analyzing: ${filePath} for service: ${service}`);

    // 1. Run Python Forensics (Check for Photoshop)
    const forensics = await runPythonAnalysis(filePath);
    if (forensics.is_tampered) {
      return {
        approved: false,
        reason: `Forgery Detected (Tamper Score: ${forensics.tamper_score})`,
      };
    }

    // 2. Run Tesseract (Extract Text)
    const {
      data: { text },
    } = await Tesseract.recognize(filePath, "eng");
    const cleanText = text.toLowerCase();

    // ---------------------------------------------------------
    // 3. CHECK 1: NAME VERIFICATION (Identity)
    // ---------------------------------------------------------
    const cleanName = username.toLowerCase().trim();
    const nameParts = cleanName.split(" ");
    let nameMatch = false;

    // We check if at least one significant part of the name exists
    for (let part of nameParts) {
      if (part.length > 3 && cleanText.includes(part)) {
        nameMatch = true;
        break;
      }
    }

    if (!nameMatch) {
      return {
        approved: false,
        reason: "Name mismatch (Possible Impersonation)",
      };
    }

    // ---------------------------------------------------------
    // 4. CHECK 2: SERVICE RELEVANCE (Context)
    // ---------------------------------------------------------
    // If the service is not in our list, we skip this check (or fail it, your choice)
    const expectedKeywords = SERVICE_KEYWORDS[service.toLowerCase()] || [];

    // If we have keywords for this service, check them
    if (expectedKeywords.length > 0) {
      let keywordFound = false;
      let foundWords = [];

      for (const word of expectedKeywords) {
        if (cleanText.includes(word)) {
          keywordFound = true;
          foundWords.push(word);
        }
      }

      // If NO keywords matched, the document is likely irrelevant
      if (!keywordFound) {
        return {
          approved: false,
          reason: `Document irrelevant. User applied for '${service}' but document lacks related keywords.`,
        };
      }
      console.log(
        `✅ Context Match: Found keywords [${foundWords.join(", ")}]`,
      );
    }

    // If we passed all checks
    return { approved: true, reason: "Verified Authentic & Relevant" };
  } catch (error) {
    console.error("Analysis Error:", error);
    return { approved: false, reason: "Processing Error" };
  }
};

router.post("/register", upload.any(), async (req, res) => {
  try {
    const { username, email, password, location, phone, service, description } =
      req.body;

    // 1. Check if Email Exists
    const existingWorker = await Worker.findOne({ email });
    if (existingWorker) {
      // Cleanup: Delete uploaded files so they don't clutter the server
      if (req.files) req.files.forEach((f) => fs.unlinkSync(f.path));
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    let uploadedDocs = [];
    let fileHashes = [];
    let aiVerdict = false;
    let aiReason = "No documents uploaded";

    // 2. Process Files (Security & AI)
    if (req.files && req.files.length > 0) {
      uploadedDocs = req.files.map((f) => `uploads/${f.filename}`);

      // --- STEP A: GENERATE HASHES & CHECK DUPLICATES ---
      for (const file of req.files) {
        const fileBuffer = fs.readFileSync(file.path);
        const hashSum = crypto.createHash("sha256");
        hashSum.update(fileBuffer);
        const hex = hashSum.digest("hex");
        fileHashes.push(hex);
      }

      // Check DB: Does ANY of these hashes exist in any other worker's record?
      const duplicateDoc = await Worker.findOne({
        documentHashes: { $in: fileHashes },
      });

      if (duplicateDoc) {
        console.log(
          `🚨 Security Alert: Duplicate document detected! (Used by ${duplicateDoc.email})`,
        );

        // Immediate Cleanup: Delete the fraudulent files
        req.files.forEach((f) => fs.unlinkSync(f.path));

        return res.json({
          success: false,
          message:
            "Security Alert: One or more documents are already in use by another registered worker.",
        });
      }

      // --- STEP B: RUN AI ANALYSIS LOOP ---
      let allPassed = true;
      let reasons = [];

      for (const file of req.files) {
        const docPath = file.path;

        console.log(`🤖 Analyzing: ${file.originalname}`);
        const result = await analyzeDocument(docPath, username, service);

        if (!result.approved) {
          allPassed = false;
          reasons.push(`${file.originalname}: ${result.reason}`);
        } else {
          reasons.push(`${file.originalname}: Verified`);
        }
      }

      // Final Verdict Logic
      aiVerdict = allPassed;
      aiReason = reasons.join(" | ");
    }

    // 3. Create Worker
    const newWorker = await Worker.create({
      username,
      email,
      password, // Hashed by Schema pre-save hook
      location: location.toLowerCase(),
      contactNumber: phone,
      service,
      description,

      documents: uploadedDocs, // Array of file paths
      documentHashes: fileHashes, // Array of SHA-256 hashes

      aiApproved: aiVerdict,
      aiVerdictReason: aiReason,
      verificationStatus: "pending", // Always pending Admin approval
    });

    return res
      .status(201)
      .json({ success: true, message: "Registered", aiStatus: aiReason });
  } catch (err) {
    console.error("Register Error:", err);

    // Cleanup files on server error
    if (req.files) {
      req.files.forEach((f) => {
        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      });
    }

    return res.status(500).json({ success: false, message: err.message });
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const worker = await Worker.findOne({ email: req.body.email });

    if (worker == null) {
      return res.json({ message: "worker not registered", success: false });
    }
    const token = await Worker.matchpassword(email, password);
    if (!token)
      return res.json({ message: "invalid email or password", success: false });

    if (worker.verificationStatus !== "approved") {
      return res.json({
        success: false,
        message:
          "Your account is waiting for Admin Approval. Please check back later.",
      });
    }
    return res
      .status(200)
      .json({ message: "User logged in", token, success: true });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/get/:id", async (req, res) => {
  try {
    console.log(req.params.id);

    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res
        .status(404)
        .json({ message: "Worker not found", success: false });
    }

    return res.status(200).json({ worker, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});
router.get("/services/:location", async (req, res) => {
  try {
    const location = req.params.location.toLowerCase();
    const services = await Worker.find({ location: location }).distinct(
      "service",
    );

    if (services.length === 0) {
      return res
        .status(404)
        .json({ message: "No services found in this location", services });
    }

    return res.status(200).json({ services });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});
router.get("/:location/:service", async (req, res) => {
  try {
    const location = req.params.location.toLowerCase();
    const service = req.params.service.toLowerCase();
    const workers = await Worker.find({ location: location, service: service });
    if (workers.length === 0) {
      return res
        .status(404)
        .json({ message: "No workers found for this service." });
    }

    // ✅ Fetch worker ratings & calculate average
    const workersWithRatings = await Promise.all(
      workers.map(async (worker) => {
        const ratings = await Rating.find({ wid: worker._id });

        // ✅ Calculate average rating
        const averageRating =
          ratings.length > 0
            ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
            : 0;

        return { ...worker.toObject(), averageRating }; // ✅ You forgot to return this
      }),
    );

    // ✅ Sort workers by rating (highest first)
    workersWithRatings.sort((a, b) => b.averageRating - a.averageRating);

    res.status(200).json(workersWithRatings);
  } catch (err) {
    return res.json({ message: err.message });
  }
});

router.post("/slots", async (req, res) => {
  try {
    const { workerId, date, slots } = req.body;

    // Validate workerId
    if (!mongoose.Types.ObjectId.isValid(workerId)) {
      return res.status(400).json({ message: "Invalid Worker ID" });
    }

    const formattedslot = Convertslot(slots);

    // Find the slot document
    let slotDocument = await Slot.findOne({ wid: workerId, date });

    if (slotDocument) {
      // Update existing slot document
      slotDocument.slots = formattedslot;
      await slotDocument.save();
      return res
        .status(200)
        .json({ message: "Slots updated successfully!", slotDocument });
    } else {
      // Create new slot document
      const newSlot = await Slot.create({
        wid: workerId,
        date,
        slots: formattedslot,
      });
      return res
        .status(201)
        .json({ message: "Slots created successfully!", newSlot });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
