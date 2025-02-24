import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function WorkerBookings() {
  const { workerId } = useParams();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/workers/${workerId}/bookings`);
        setBookings(response.data);
      }catch (error) {
        alert("Error fetching bookings");
      }
    };
    fetchBookings();
  }, [workerId]);
  const handleSave = async (bookingId, slot) => {
    try {
      //confirm the Booking (Set status = true)
      await axios.put(`http://localhost:5000/api/workers/bookings/${bookingId}/confirm`, { status: true });
  
      // update the worker's slots (Set slot availability to false)
      await axios.put(`http://localhost:5000/api/workers/${workerId}/slots/update`, { slot, available: false });
  
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
          {bookings.map((booking) => (
            <li key={booking.bid}>
              <h3>{booking.userId.name}</h3>
              <p><strong>Description:</strong> {booking.description}</p>
              <p><strong>Slot:</strong> {booking.slot}</p>
              <button onClick={() => handleSave(booking.bid,booking.slot)}>{booking.status ? "Confirmed" : "Confirm"} </button>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WorkerBookings;
