import { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function WorkerDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState({});
  const [workerId, setWorkerId] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  // Manual Slot State
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Bulk Generation State
  const [shiftStart, setShiftStart] = useState("09:00");
  const [shiftEnd, setShiftEnd] = useState("17:00");
  const [duration, setDuration] = useState(60);

  const n = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("workerToken");
    if (token) {
      const decoded = jwt_decode(token);
      setWorkerId(decoded._id);
    }
  }, []);

  useEffect(() => {
    if (!workerId) return;
    const fetchWorkerData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/worker/get/${workerId}`,
        );
        const workerData = response.data.worker;
        if (workerData.imageurl) {
          setImageUrl("http://localhost:4000/" + workerData.imageurl);
        } else {
          setImageUrl("http://localhost:4000/images/profilelogo.png");
        }
      } catch (error) {
        console.error("Error fetching worker data");
      }
    };
    fetchWorkerData();
  }, [workerId, selectedDate]);

  const handleDateChange = (date) => setSelectedDate(date);

  const handleSlotToggle = (slot) => {
    setSlots((prev) => ({ ...prev, [slot]: !prev[slot] }));
  };

  // --- Bulk Generator Function ---
  const generateBulkSlots = () => {
    if (!shiftStart || !shiftEnd)
      return alert("Please select start and end shift times");

    let start = new Date(`2000-01-01T${shiftStart}`);
    let end = new Date(`2000-01-01T${shiftEnd}`);

    if (start >= end) return alert("Shift end time must be after start time.");

    let newSlots = { ...slots };

    while (start < end) {
      let startTimeStr = start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      start.setMinutes(start.getMinutes() + parseInt(duration));

      if (start > end) break;

      let endTimeStr = start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      let slotString = `${startTimeStr} - ${endTimeStr}`;
      newSlots[slotString] = true;
    }
    setSlots(newSlots);
  };
  // ------------------------------

  const handleAddSlot = () => {
    if (!startTime || !endTime)
      return alert("Please select both start and end time.");
    const newSlot = `${startTime} - ${endTime}`;
    setSlots((prev) => ({ ...prev, [newSlot]: true }));
    setStartTime("");
    setEndTime("");
  };

  const handleSubmit = async () => {
    try {
      const date = selectedDate.toLocaleDateString("en-CA");
      const response = await axios.post(
        "http://localhost:4000/api/worker/slots",
        { workerId, date, slots },
      );
      alert(response.data.message);
      const resetSlots = {};
      Object.keys(slots).forEach((slot) => (resetSlots[slot] = false));
      setSlots(resetSlots);
    } catch (err) {
      alert("Error updating slots");
    }
  };

  const handleViewBookings = () => n("/worker/bookings");

  const handleLogout = () => {
    localStorage.removeItem("workerToken");
    n("/worker/login");
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    const f = new FormData();
    f.append("image", image);
    try {
      const response = await axios.post(
        `http://localhost:4000/upload/${workerId}`,
        f,
      );
      setImageUrl(response.data.imageurl);
      alert("Profile photo updated!");
    } catch (error) {
      alert("Error uploading image");
    }
  };

  return (
    <div
      className="worker-dashboard"
      style={{
        padding: "20px",
        fontFamily: "Segoe UI, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        boxSizing: "border-box",
        backgroundColor: "#f9f9f9",
        border: "1px solid #ccc",
        borderRadius: "8px",
        minHeight: "100vh",
      }}
    >
      {/* --- Header Bar (Home & Logout) --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          borderBottom: "1px solid #ddd",
          paddingBottom: "10px",
        }}
      >
        {/* Home Icon Button */}
        <div
          onClick={() => n("/")}
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            color: "#007bff",
            fontWeight: "bold",
          }}
          title="Go to Home"
        >
          {/* SVG Home Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ marginRight: "5px" }}
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          Home
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <h2>Worker Dashboard</h2>

      {/* Profile Section */}
      <div className="profile-container">
        <h3>Profile Photo</h3>
        <img
          src={imageUrl}
          alt="Worker Profile"
          style={{ width: "100px", height: "100px", borderRadius: "50%" }}
        />
        <form className="upload-form" onSubmit={handleImageUpload}>
          <input
            type="file"
            name="image"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <button type="submit">Upload</button>
        </form>
      </div>

      {/* Date Selection */}
      <div style={{ margin: "20px 0" }}>
        <h3>Select a Date</h3>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy/MM/dd"
        />
      </div>

      {/* --- Bulk Slot Generator --- */}
      <div
        style={{
          backgroundColor: "#e3f2fd",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid #90caf9",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ marginTop: 0, color: "#0d47a1" }}>
          ⚡ Quick Shift Generator
        </h3>
        <p style={{ fontSize: "14px", color: "#555" }}>
          Automatically create hourly slots for your entire shift.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            alignItems: "flex-end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                marginBottom: "5px",
              }}
            >
              Start Time
            </label>
            <input
              type="time"
              value={shiftStart}
              onChange={(e) => setShiftStart(e.target.value)}
              style={{
                padding: "5px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                marginBottom: "5px",
              }}
            >
              End Time
            </label>
            <input
              type="time"
              value={shiftEnd}
              onChange={(e) => setShiftEnd(e.target.value)}
              style={{
                padding: "5px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                marginBottom: "5px",
              }}
            >
              Slot Duration (Min)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={{
                padding: "5px",
                width: "60px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <button
            onClick={generateBulkSlots}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "8px 15px",
              borderRadius: "6px",
              cursor: "pointer",
              height: "35px",
            }}
          >
            Auto-Fill Slots
          </button>
        </div>
      </div>

      {/* Manual Custom Slot */}
      <div
        style={{
          marginBottom: "20px",
          borderTop: "1px solid #eee",
          paddingTop: "10px",
        }}
      >
        <h4>Or Add Custom Slot Manually</h4>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="ex: 10:30 AM"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{ padding: "5px" }}
          />
          <span>-</span>
          <input
            type="text"
            placeholder="ex: 11:30 AM"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={{ padding: "5px" }}
          />
          <button
            onClick={handleAddSlot}
            style={{
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Slot Display Grid */}
      <div>
        <h3>Available Slots for {selectedDate.toLocaleDateString("en-GB")}</h3>
        <div
          className="slot-grid"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "20px",
            justifyContent: "flex-start",
          }}
        >
          {Object.keys(slots).length === 0 && (
            <p style={{ color: "#888" }}>No slots added yet.</p>
          )}

          {Object.keys(slots).map((slot) => (
            <button
              key={slot}
              onClick={() => handleSlotToggle(slot)}
              className={`slot-button ${slots[slot] ? "active" : ""}`}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: slots[slot] ? "#28a745" : "#e9ecef",
                color: slots[slot] ? "white" : "black",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.2s",
              }}
            >
              {slot} {slots[slot] ? "✓" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="action-buttons"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <button
          onClick={handleSubmit}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Save Slots
        </button>
        <button
          onClick={handleViewBookings}
          style={{
            padding: "10px 20px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          View Bookings
        </button>
      </div>
    </div>
  );
}

export default WorkerDashboard;
