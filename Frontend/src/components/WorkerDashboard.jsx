import { useState, useEffect } from "react";
import jwt_decode from 'jwt-decode';
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
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const n = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('workerToken');
    if (token) {
      const decoded = jwt_decode(token);
      setWorkerId(decoded._id);
    }
  }, []); 
  
  useEffect(() => {
    if (!workerId) return;
    const fetchWorkerData = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/worker/get/${workerId}`);
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

  const handleAddSlot = () => {
    if (!startTime || !endTime) return alert("Please select both start and end time.");
    const newSlot = `${startTime} - ${endTime}`;
    setSlots((prev) => ({ ...prev, [newSlot]: false }));
    setStartTime("");
    setEndTime("");
  };

  const handleSubmit = async () => {
    try {
      const date = selectedDate.toLocaleDateString("en-CA");
      const response = await axios.post("http://localhost:4000/api/worker/slots", { workerId, date, slots });
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
      const response = await axios.post(`http://localhost:4000/upload/${workerId}`, f);
      setImageUrl(response.data.imageurl);
      alert("Profile photo updated!");
    } catch (error) {
      alert("Error uploading image");
    }
  };

  return (
    <div className="worker-dashboard" style={{ padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      {/* Logout Button */}
      <div style={{ textAlign: "right" }}>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>

      <h2>Worker Dashboard</h2>

      {/* Profile Section */}
      <div className="profile-container">
        <h3>Profile Photo</h3>
        <img src={imageUrl} alt="Worker Profile" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />
        <form className="upload-form" onSubmit={handleImageUpload}>
          <input type="file" name="image" onChange={(e) => setImage(e.target.files[0])} />
          <button type="submit">Upload</button>
        </form>
      </div>

      {/* Date Selection */}
      <div>
        <h3>Select a Date</h3>
        <DatePicker selected={selectedDate} onChange={handleDateChange} dateFormat="yyyy/MM/dd" />
      </div>

      {/* Start/End Time Picker */}
      <div style={{ marginTop: "20px" }}>
        <h3>Create Custom Slot</h3>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
          <label>Start Time:</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{ padding: "5px" }}
          />
          <label>End Time:</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={{ padding: "5px" }}
          />
          <button
            onClick={handleAddSlot}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Add Slot
          </button>
        </div>
      </div>

      {/* Slot Grid */}
      <div>
        <h3>Available Slots for {selectedDate.toLocaleDateString()}</h3>
        <div className="slot-grid" style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
          {Object.keys(slots).map((slot) => (
            <button
              key={slot}
              onClick={() => handleSlotToggle(slot)}
              className={`slot-button ${slots[slot] ? "active" : ""}`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={handleSubmit}>Save Slots</button>
        <button onClick={handleViewBookings}>View Bookings</button>
      </div>
    </div>
  );
}

export default WorkerDashboard;
