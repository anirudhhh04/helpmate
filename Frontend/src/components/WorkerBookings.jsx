import { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from "jwt-decode";

function WorkerBookings() {
 
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
     
      try {
        const  token= window.localStorage.getItem("workerToken");
        const decoded = jwt_decode(token);
        const response = await axios.get(`http://localhost:4000/api/worker/bookings/${decoded._id}`);
        if(response.data.success){
        setBookings(response.data.bookings);}else{
          alert(response.data.message);
        }
      }catch (error) {
        alert("Error fetching bookings");
      }
    
    };
    fetchBookings();
    const interval = setInterval(() => {
      fetchBookings();
    }, 5000);
  
    return () => clearInterval(interval);
  }, []);
  const handleSave = async (bookingId, starthour,endhour,date) => {
    try {
      //confirm the Booking (Set status = true)
     const response= await axios.put(`http://localhost:4000/api/worker/bookings/confirm/${bookingId}`, { status: true ,date});
        if(response.data.success){
          alert("booking updated");
        }else{
          alert("failed");
        }
        const  token= window.localStorage.getItem("workerToken");
        const decoded = jwt_decode(token);
      // update the worker's slots (Set slot availability to false)
     const putresponse=await axios.put(`http://localhost:4000/api/worker/slots/update/${decoded._id}`, { starthour,endhour, available: false,date });
      console.log(putresponse.data.success);
      alert("Booking Confirmed!");
  
      //update the state to reflect changes immediately
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.bid === bookingId ? { ...booking, status: true } : booking
        )
      );
  
    } catch (error) {
      alert("Failed to confirm booking");
    }
  };
  
  
  return (
    <div>
      <h2>Bookings for You</h2>
      {bookings.length === 0 ? ( <p>No bookings yet</p>) : (
        <ul>
          {bookings.map((booking,index) => (
            <li key={index}>
              <h3>{booking.uid.username}</h3>
              <p><strong>Description:</strong> {booking.description}</p>
              <p><strong>Slot:</strong> {booking.startHour}-{booking.endHour}</p>
              <p><strong>Date:</strong> {booking.date}</p>
              <button onClick={() => handleSave(booking._id,booking.startHour,booking.endHour,booking.date)}>{booking.status ? "Confirmed" : "Confirm"} </button>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WorkerBookings;
