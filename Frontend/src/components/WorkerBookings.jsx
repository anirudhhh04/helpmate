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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WorkerBookings;
