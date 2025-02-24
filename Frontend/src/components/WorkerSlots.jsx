import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function WorkerSlots() {
  const { wid } = useParams(); // Fetch worker ID from URL
  const [slots, setSlots] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [description, setDescription] = useState("");
  const [worker, setWorker] = useState({});
  const n = useNavigate();

  useEffect(() => {
    const fetchWorkerData = async () => {
      try {
        const workerResponse = await axios.get(`http://localhost:5000/api/workers/${wid}`);
        setWorker(workerResponse.data);
        
        const slotsResponse = await axios.get(`http://localhost:5000/api/workers/${wid}/slots`);
        setSlots(slotsResponse.data);
      } catch (error) {
        alert("Could not fetch worker data!");
      }
    };
    fetchWorkerData();
  }, [wid]);

  return (
    <div>
      <h2>Worker Profile</h2>
      {worker.imageUrl && <img src={worker.imageUrl} alt="Worker" style={{ width: "150px", height: "150px" }} />}
      <h3>{worker.name} - {worker.service}</h3>
      <p>Location: {worker.location}</p>

      <h2>Available Slots</h2>
      {Object.entries(slots).map(([time, available]) => (
        <button key={time} onClick={() => setSelectedSlot(time)} disabled={!available} style={{ backgroundColor: selectedSlot === time ? "green" : "" }}>
          {time} {available ? "(Available)" : "(Booked)"}
        </button>
      ))}

      <h3>Provide a Description</h3>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" cols="50" />

      <button onClick={() => alert("Booking confirmed!")}>Confirm Booking</button>
    </div>
  );
}

export default WorkerSlots;
