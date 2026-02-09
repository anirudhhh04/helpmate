const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // Link to the User (Customer)
    uid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    wid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },

    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    status: {
      type: Number, // 0 = Pending, 1 = Confirmed
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    startHour: String,
    endHour: String,

    // --- RATING SYSTEM ---

    // 1. Did the User rate the Worker?
    rated: {
      type: Boolean,
      default: false,
    },

    // 2. Did the Worker rate the User? (NEW FIELD)
    workerRatedUser: {
      type: Boolean,
      default: false,
    },

    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
