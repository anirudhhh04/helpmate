import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {GoDotFill as G } from "react-icons/go";
import { FaTools, FaMapMarkerAlt } from "react-icons/fa";

function WorkerSlots() {
  const { wid } = useParams(); // Fetch worker ID from URL
  const [slots, setSlots] = useState([]);
  const [startHour, setStarthour] = useState(null);
  const [endHour, setEndhour] = useState(null);
  const [description, setDescription] = useState("");
  const [worker, setWorker] = useState({});
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); 

  useEffect(() => {
    const fetchWorkerData = async () => {
      try {
        // Fetch worker details
        const workerResponse = await axios.get(`http://localhost:4000/api/worker/get/${wid}`);
        if (workerResponse.data.success){
         setWorker(workerResponse.data.worker);
         console.log("Fetched worker data:", workerResponse.data);
        }
  
        const slotsResponse = await axios.get(`http://localhost:4000/api/worker/slots/${wid}/${selectedDate.toLocaleDateString("en-CA")}`);

        if (slotsResponse.data.success) {
          setSlots(slotsResponse.data.slots);
        }
  
        // Fetch user's bookings for this worker
        const token = window.localStorage.getItem("userToken");
        if (token) {
          const decoded = jwt_decode(token);
          const bookingsResponse = await axios.get(`http://localhost:4000/api/user/bookings/${decoded._id}/${selectedDate.toLocaleDateString("en-CA")}`);
          if (bookingsResponse.data.success) {
            setBookings(bookingsResponse.data.bookings);
          }else{
            setBookings([]);
          }
        }
      } catch (err) {
        console.log(err.message);
        setSlots([]); 
        // alert("Could not fetch worker data");
      }
    };
  
    fetchWorkerData(); // Initial fetch
  
    // Set interval to refresh data every 5 seconds
    const interval = setInterval(() => {
      fetchWorkerData();
    }, 5000);
  
    return () => clearInterval(interval); // Cleanup function to prevent memory leaks
  }, [wid, selectedDate]); 

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
        status: false,
        date:selectedDate.toLocaleDateString("en-CA"), //initially set status as false (Pending)
      });
      if(response.data.success){
      alert("Booking Confirmed!");}else{
        alert("booking failed");
      }
     
    } catch (error) {
      console.log(error.message)
      console.log(selectedDate)
      alert("Failed to book a slot in server");
    }
  };
return (
  <div className="worker-slots-container">
    <div className="worker-profile">
      <img
        src={`http://localhost:4000/${worker.imageurl}`}
        alt="Worker"
        className="worker-avatar"
      />
      <div className="worker-details">
      <h2 className="worker-name">
       
        {worker.username}
      </h2>
      <p className="worker-service">
         <FaTools size={15} style={{ marginRight: "8px" }} />
         {worker.service}
      </p>
      <p className="worker-location">
        <FaMapMarkerAlt style={{ marginRight: "8px" }} />
        {worker.location}
      </p>
      <p className="worker-description">{worker.description}</p>
      </div>
    </div>

    <div className="date-picker-section">
      <h3>Select Date</h3>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="yyyy/MM/dd"
        className="date-picker-input"
      />
    </div>

    <div className="slots-section">
      <h3>
        Available Slots for{" "}
        {selectedDate ? selectedDate.toLocaleDateString() : "Select a date"}
      </h3>
      <div className="slots-grid">
        {Array.isArray(slots) && slots.length === 0 && (
          <p>No slots available for this day.</p>
        )}
        {slots.map((slot, index) => {
          const time = `${slot.startHour} - ${slot.endHour}`;
          const available = slot.available;
          const con = bookings.find(
            (b) =>
              b.startHour === slot.startHour && b.endHour === slot.endHour
          );
          return (
            <button
              key={index}
              onClick={() => {
                setStarthour(slot.startHour);
                setEndhour(slot.endHour);}}
              disabled={!available}
              className={`slots-button ${
                startHour === slot.startHour && endHour === slot.endHour ? "selected-slot": ""
              } ${!available ? "disabled-slot" : ""}`} >
              {time}{" "}
              {available ? <G color=" #16d71f" size={16}/> : "" }
              {con && `  ${con.status ? "✅" : "⏳"}`}
            </button>
          );
        })}
      </div>
    </div>

    <div className="description-section">
      <h3>Booking Description</h3>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe your need..."
        className="description-input"
        rows="4"
      />
    </div>

    <div className="actions-buttons">
      <button onClick={handleSubmit} className="confirm-booking-button">
        Confirm Booking
      </button>
      {worker.contactNumber && (
        <a href={`tel:${worker.contactNumber}`} className="call-now-button">
          Call Now
        </a>
      )}
    </div>
  </div>
);
}

export default WorkerSlots;