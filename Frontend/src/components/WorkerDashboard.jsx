import { useState, useEffect } from "react";
import jwt_decode from 'jwt-decode';

import axios from "axios";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function WorkerDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState({ "9-10": false, "10-11": false, "11-12": false,  "12-1": false,  "1-2": false, "2-3": false,"3-4": false ,"4-5": false});
  const [workerId, setWorkerId] = useState(" "); 
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const n = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('workerToken');
    if (token) {
      const decoded = jwt_decode(token);
      setWorkerId(decoded._id);
    }
  }, []); 
  
  useEffect(() => {
    const fetchWorkerData = async () => {
      try {
        if (workerId) { // ✅ Only fetch if workerId is set
          const response = await axios.get(`http://localhost:4000/api/worker/${workerId}`);
          const workerData = response.data;
          if (workerData.imageurl) {
            setImageUrl(workerData.imageurl);
          } else {
            setImageUrl("http://localhost:4000/images/profilelogo.png");
          }
        }
      } catch (error) {
        console.error("Error fetching worker data");
      }
    };
    fetchWorkerData();
  }, [workerId]);
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  const handleSlotToggle = (slot) => {
    setSlots((prevSlots) => ({
      ...prevSlots,
      [slot]: !prevSlots[slot],
    }));
  };
  const handleSubmit = async () => {
    try {
      const date = selectedDate.toISOString().split("T")[0];

      const response=await axios.post("http://localhost:4000/api/worker/slots", { workerId, date, slots });
      alert(response.data.message);
    } catch (err) {
      alert("Error updating slots");
    }
  };

  const handleViewBookings = () => {
    n("/worker/bookings");
  };

  // Upload worker profile photo
  const handleImageUpload = async (e) => {
    e.preventDefault();
    const f = new FormData();
    f.append("image", image);

    try {
      const response = await axios.post('http://localhost:4000/upload', f);
      
      setImageUrl(response.data.imageurl);
      alert("Profile photo updated!");
    } catch (error) {
      alert("Error uploading image");
    }
  };

  return (
    <div className="worker-dashboard">
      <h2>Worker Dashboard</h2>

      <div className="profile-container">
        <h3>Profile Photo</h3>
         <img src={imageUrl} alt="Worker Profile" style={{ width: "100px", height: "100px" }} />
        <form className="upload-form" onSubmit={handleImageUpload} >
          <input type="file" name="image" onChange={(e) => setImage(e.target.files[0])} />
          <button type="submit">Upload</button>
        </form>
      </div>

      <div>
        <h3>Select a Date</h3>
        <DatePicker selected={selectedDate} onChange={handleDateChange} dateFormat="yyyy/MM/dd" />
      </div>

      <div>
        <h3>Available Slots for {selectedDate.toLocaleDateString()}</h3>
        <div className="slot-grid">
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
      <div className="action-buttons">
        <button onClick={handleSubmit}>Save Slots</button>
        <button onClick={handleViewBookings}>View Bookings</button>
      </div>
    </div>
  );
}

export default WorkerDashboard;
