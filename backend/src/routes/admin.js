const express = require("express");
const router = express.Router();
const Worker = require("../models/Worker");

router.get("/all-workers", async (req, res) => {
  try {
    const workers = await Worker.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      workers: workers,
    });
  } catch (error) {
    console.error("Error fetching workers:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// 2. VERIFY WORKER (Approve/Reject)
// Endpoint: ${import.meta.env.VITE_API_URL}
///api/admin/verify-worker/:id
router.put("/verify-worker/:id", async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'approved' or 'rejected' from frontend

  // Simple validation
  if (!["approved", "rejected"].includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Invalid action. Must be 'approved' or 'rejected'.",
    });
  }

  try {
    const updatedWorker = await Worker.findByIdAndUpdate(
      id,
      { verificationStatus: action },
      { new: true }, // Return the updated document
    );

    if (!updatedWorker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Worker has been ${action}`,
      worker: updatedWorker,
    });
  } catch (error) {
    console.error("Error updating worker:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

module.exports = router;
