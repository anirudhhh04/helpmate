import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";

function WorkerSlots() {
  const { wid } = useParams(); // Fetch worker ID from URL
  const [slots, setSlots] = useState([]);
  const [startHour, setStarthour] = useState(null);
  const [endHour, setEndhour] = useState(null);
  const [description, setDescription] = useState("");
  const [worker, setWorker] = useState({});
  const [bookings, setBookings] = useState([]); // Store user's booked slots

  useEffect(() => {
    const fetchWorkerData = async () => {
      try {
        //fetch worker details
        const workerResponse = await axios.get(`http://localhost:4000/api/worker/get/${wid}`);
       
        setWorker(workerResponse.data);
        console.log(worker)
        //fetch available slots
        const slotsResponse = await axios.get(`http://localhost:4000/api/worker/slots/${wid}`);
        setSlots(slotsResponse.data.slots);
        console.log(slots)

        //fetch user's bookings for this worker
        const token= window.localStorage.getItem("userToken");
        const decoded = jwt_decode(token);
        if (token) {
          const bookingsResponse = await axios.get(`http://localhost:4000/api/user/bookings/${decoded._id}`);
          if(bookingsResponse.data.success){
          setBookings(bookingsResponse.data.bookings);}
        }

        
      } catch (error) {
        alert("Could not fetch worker data");
      }
    };
    fetchWorkerData();
    const interval = setInterval(() => {
      fetchWorkerData(); // Fetch data every 5 seconds
    }, 5000);
  
    return () => clearInterval(interval);
  }, [wid]);

  const handleSubmit = async () => {
    try {
      const  token= window.localStorage.getItem("userToken");
      const decoded = jwt_decode(token);
      

      const response=await axios.post("http://localhost:4000/api/user/book", {
        wid,
        startHour,
        endHour,
        userId:decoded._id,
        description,
        status: false, //initially set status as false (Pending)
      });
      if(response.data.success){
      alert("Booking Confirmed!");}else{
        alert("booking failed");
      }
     
    } catch (error) {
      console.log(error.message)
      alert("Failed to book a slot in server");
    }
  };

  return (
    <div>
      <h2>Worker Profile</h2>
      <img src={"http://localhost:4000/"+worker.imageurl} alt="Worker" style={{ width: "150px", height: "150px" }} />
      <h3>{worker.username} - {worker.service}</h3>
      <p>Location: {worker.location}</p>
      <p>Description : {worker.description} </p>

      <h2>Available Slots</h2>
      {Array.isArray(slots) && slots.length === 0 && <p>No slots available for today.</p>}
      {Array.isArray(slots) && slots.length > 0 && slots.map((slot, index) => {
      const time = `${slot.startHour}-${slot.endHour}`;
      const available = slot.available;
      const con = bookings.find((b) => b.startHour === slot.startHour && b.endHour === slot.endHour); // for checking confirmation
  return (
    <button 
      key={index} 
      onClick={() => {
        setStarthour(slot.startHour);
        setEndhour(slot.endHour);}
      } 
      disabled={!available} 
      style={{ backgroundColor: startHour === slot.startHour && endHour===slot.endHour? "green" : "" }}
    >
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
