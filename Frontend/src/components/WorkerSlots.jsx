import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { GoDotFill as G } from "react-icons/go";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaStar } from "react-icons/fa6"; // ⭐ Star icon

function WorkerSlots() {
  const { wid } = useParams();
  const [slots, setSlots] = useState([]);
  const [startHour, setStarthour] = useState(null);
  const [endHour, setEndhour] = useState(null);
  const [description, setDescription] = useState("");
  const [worker, setWorker] = useState({});
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [allRatings, setAllRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const slotsRef = useRef(null);
  const confirmBookingButtonRef = useRef(null);
  const ctref = useRef(null);

   useEffect(() =>{
    const fetchcomments=async ()=>{
    const ratingsRes = await axios.get(`http://localhost:4000/api/rating/worker/${wid}`);
        if (ratingsRes.data.success) {
          setAllRatings(ratingsRes.data.ratings);
          const ratingsOnly = ratingsRes.data.ratings.map((r) => r.rating);
          const avg = ratingsOnly.length ? ratingsOnly.reduce((a, b) => a + b, 0) / ratingsOnly.length : 0;
          setAvgRating(avg.toFixed(1));
        }

      }
      fetchcomments();  
   });
  useEffect(() => {
    const fetchWorkerData = async () => {
      try {
        const workerResponse = await axios.get(`http://localhost:4000/api/worker/get/${wid}`);
        if (workerResponse.data.success) {
          setWorker(workerResponse.data.worker);
        }

        const slotsResponse = await axios.get(
          `http://localhost:4000/api/worker/slots/${wid}/${selectedDate.toLocaleDateString("en-CA")}`
        );
        if (slotsResponse.data.success) setSlots(slotsResponse.data.slots);

        const token = window.localStorage.getItem("userToken");
        if (token) {
          const decoded = jwt_decode(token);
          const bookingsResponse = await axios.get(
            `http://localhost:4000/api/user/bookings/${decoded._id}/${selectedDate.toLocaleDateString("en-CA")}`
          );
          if (bookingsResponse.data.success) setBookings(bookingsResponse.data.bookings);
          else setBookings([]);
        }

     
      
      } catch (err) {
        console.log(err.message);
        setSlots([]);
      }
    };

    fetchWorkerData();

    const interval = setInterval(() => {
      fetchWorkerData();
    }, 5000);

    return () => clearInterval(interval);
  }, [wid, selectedDate]);

  const handleSubmit = async () => {
    try {
      const token = window.localStorage.getItem("userToken");
      const decoded = jwt_decode(token);

      const response = await axios.post("http://localhost:4000/api/user/book", {
        wid,
        startHour,
        endHour,
        userId: decoded._id,
        description,
        status: 0,
        date: selectedDate.toLocaleDateString("en-CA"),
      });

      if (response.data.success) alert("Booking Confirmed!");
      else alert("Booking failed");
    } catch (error) {
      alert("Failed to book a slot in server");
    }
  };

  const handleCancelBooking = async (userId, date, startHour) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/user/bookings/cancel/${userId}/${date}/${startHour}`
      );
      if (response.data.success) {
        alert("Booking Canceled");
        setBookings((prev) =>
          prev.filter((b) => !(b.startHour === startHour && b.date === date))
        );
      }
    } catch (error) {
      console.error(error);
      alert("Error canceling booking");
    }
  };

  const submitRating = async () => {
    try {
      const token = window.localStorage.getItem("userToken");
      const decoded = jwt_decode(token);

      const res = await axios.post("http://localhost:4000/api/rating/add", {
        userId: decoded._id,
        workerId: wid,
        rating,
        comment,
      });

      if (res.data.success) {
        alert("Rating submitted!");
        setRating(0);
        setComment("");
      } 
    } catch (err) {
      alert("Server error submitting rating");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        slotsRef.current &&
        !slotsRef.current.contains(event.target) &&
        confirmBookingButtonRef.current &&
        !confirmBookingButtonRef.current.contains(event.target) &&
        ctref.current &&
        !ctref.current.contains(event.target)
      ) {
        setStarthour(null);
        setEndhour(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="worker-slots-container">
      <div className="worker-profile">
        <img
          src={
            worker.imageurl
              ? "http://localhost:4000/" + worker.imageurl
              : "http://localhost:4000/images/profilelogo.png"
          }
          alt="Worker"
          className="worker-avatar"
        />
        <div className="worker-details">
          <h2 className="worker-name">{worker.username}</h2>
          <p className="worker-service">{worker.service}</p>
          <p className="worker-location">
            <FaMapMarkerAlt style={{ marginRight: "8px" }} />
            {worker.location}
          </p>
          <p className="worker-description">{worker.description}</p>
          <p className="worker-rating">⭐ Average Rating: {avgRating}/5</p>
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
          {selectedDate
            ? selectedDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "Select a date"}
        </h3>
        <div className="slots-grid" ref={slotsRef}>
          {Array.isArray(slots) && slots.length === 0 && <p>No slots available.</p>}
          {slots.map((slot, index) => {
            const time = `${slot.startHour} - ${slot.endHour}`;
            const available = slot.available;
            const con = bookings.find(
              (b) => b.startHour === slot.startHour && b.endHour === slot.endHour
            );
            return (
              <button
                key={index}
                onClick={() => {
                  setStarthour(slot.startHour);
                  setEndhour(slot.endHour);
                }}
                onDoubleClick={() => {
                  if (con && (con.status === 1 || con.status === 0)) {
                    if (window.confirm("Do you want to cancel this booking?")) {
                      handleCancelBooking(con.uid, con.date, con.startHour);
                    }
                  }
                }}
                disabled={!available && (!con || con.status !== 1)}
                className={`slots-button ${
                  startHour === slot.startHour && endHour === slot.endHour
                    ? "selected-slot"
                    : ""
                } ${!available ? "disabled-slot" : ""}`}
              >
                {time} {available ? <G color="green" size={16} /> : ""}
                {con && (con.status === 1 ? "✅" : con.status === 0 ? "⏳" : "")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="description-section">
        <h3>Booking Description</h3>
        <textarea
          ref={ctref}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your need..."
          className="description-input"
          rows="4"
        />
      </div>

      <div className="actions-buttons">
        <button
          ref={confirmBookingButtonRef}
          onClick={handleSubmit}
          className="confirm-booking-button"
        >
          Confirm Booking
        </button>
        {worker.contactNumber && (
          <a href={`tel:${worker.contactNumber}`} className="call-now-button">
            Call Now
          </a>
        )}
      </div>

      <div className="rating-section">
        <h3>Rate This Worker</h3>
        <div className="stars-container">
        {[...Array(5)].map((_, index) => {
           const currentRating = index + 1;
           return(
            <FaStar
               key={currentRating}
               onClick={() => setRating(currentRating)}
               color={currentRating <= rating ? "gold" : "lightgray"}
               size={24}
               style={{ cursor: "pointer", marginRight: 5 }}/>);
         })}
        </div>
        <textarea
          className="comment-input"
          placeholder="Write your comment..."
          rows="3"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button className="submit-rating-button" onClick={submitRating}>
          Submit Rating
        </button>
      </div>
      <div className="ratings-display-section">
        <h3>What others say</h3>
        {allRatings.length === 0 && <p>No ratings yet for this worker.</p>}
        {allRatings.map((r, i) => (
          <div key={i} className="single-rating">
            <h4>{r.uid.username}</h4>
            <div className="rating-stars">
              
              {[...Array(r.rating)].map((_, i) => (
                <FaStar key={i} color="gold" size={16} />
              ))}
              {[...Array(5 - r.rating)].map((_, i) => (
                <FaStar key={i + r.rating} color="lightgray" size={16} />
              ))}
            </div>
            <p>{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkerSlots;
