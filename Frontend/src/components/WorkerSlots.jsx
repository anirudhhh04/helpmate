import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function WorkerSlots() {
  const { wid } = useParams(); // Fetch worker ID from URL
  const [slots, setSlots] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [description, setDescription] = useState("");
  const [worker, setWorker] = useState({});
  const [bookings, setBookings] = useState([]); // Store user's booked slots

  useEffect(() => {
    const fetchWorkerData = async () => {
      try {
        //fetch worker details
        const workerResponse = await axios.get(`http://localhost:5000/api/workers/${wid}`);
        setWorker(workerResponse.data);

        //fetch available slots
        const slotsResponse = await axios.get(`http://localhost:5000/api/workers/${wid}/slots`);
        setSlots(slotsResponse.data);

        //fetch user's bookings for this worker
        const userId = window.localStorage.getItem("userId");
        if (userId) {
          const bookingsResponse = await axios.get(`http://localhost:5000/api/users/${userId}/bookings`);
          setBookings(bookingsResponse.data);
        }
      } catch (error) {
        alert("Could not fetch worker data");
      }
    };
    fetchWorkerData();
  }, [wid]);

  const handleSubmit = async () => {
    try {
      const userId = window.localStorage.getItem("userId");
      if (!userId) {
        alert("Please log in to book a slot.");
        return;
      }

      await axios.post("http://localhost:5000/api/users/book", {
        wid,
        slot: selectedSlot,
        userId,
        description,
        status: false, //initially set status as false (Pending)
      });

      alert("Booking Confirmed!");
      const updatedBookings = await axios.get(`http://localhost:5000/api/users/${userId}/bookings`);
      setBookings(updatedBookings.data);
    } catch (error) {
      alert("Failed to book a slot.");
    }
  };

  return (
    <div>
      <h2>Worker Profile</h2>
      {worker.imageUrl && <img src={worker.imageUrl} alt="Worker" style={{ width: "150px", height: "150px" }} />}
      <h3>{worker.name} - {worker.service}</h3>
      <p>Location: {worker.location}</p>
      <p>Description : {worker.description} </p>

      <h2>Available Slots</h2>
      {Object.entries(slots).map(([time, available]) => {
        const con = bookings.find((b) => b.slot === time); // for checking confirmation
        return (
          <button 
            key={time} 
            onClick={() => setSelectedSlot(time)} 
            disabled={!available} 
            style={{ backgroundColor: selectedSlot === time ? "green" : "" }} >
            {time} {available ? "(Available)" : ""} {con && ` - ${con.status ? "Confirmed ✅" : "Pending ⏳"}`}
          </button>
        );
      })}

      <h3>Provide a Description</h3>
      <textarea 
        value={description} 
        onChange={(e) => setDescription(e.target.value)} 
        rows="4" 
        cols="50"
      />

      <button onClick={handleSubmit}>Confirm Booking</button>
    </div>
  );
}

export default WorkerSlots;
