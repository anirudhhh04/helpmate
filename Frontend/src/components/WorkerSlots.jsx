import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast, { Toaster } from "react-hot-toast";
import { GoCheckCircle, GoClock } from "react-icons/go";
import { FaMapMarkerAlt, FaStar, FaPhoneAlt } from "react-icons/fa";
import { IoArrowBack, IoRefresh } from "react-icons/io5";

function WorkerSlots() {
  const { wid } = useParams();
  const navigate = useNavigate();

  // --- Data States ---
  const [worker, setWorker] = useState(null);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [allRatings, setAllRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  // --- UI States ---
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // --- Selection States ---
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [description, setDescription] = useState("");

  // --- Rating States ---
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");

  const userId = useRef(null);

  // --- Helper: Get Safe YYYY-MM-DD Date String ---
  // Fixes timezone issues where date might shift by one day
  const getFormattedDate = (date) => {
    const offset = date.getTimezoneOffset();
    const dateLocal = new Date(date.getTime() - offset * 60 * 1000);
    return dateLocal.toISOString().split("T")[0];
  };

  // --- Sync selected slot booking after refresh ---
  useEffect(() => {
    if (!selectedSlot) return;

    const updatedBooking = bookings.find(
      (b) =>
        b.startHour == selectedSlot.startHour &&
        b.endHour == selectedSlot.endHour,
    );

    if (updatedBooking) {
      setSelectedSlot((prev) => ({
        ...prev,
        myBooking: updatedBooking,
        isMine: true,
      }));
    }
  }, [bookings]);

  // --- Initial Setup ---
  useEffect(() => {
    const token = window.localStorage.getItem("userToken");
    if (token) {
      const decoded = jwt_decode(token);
      userId.current = decoded._id;
    }
    fetchRatings();
    // eslint-disable-next-line
  }, [wid]);

  // --- Poll Data every 10 seconds ---
  useEffect(() => {
    fetchWorkerAndSlots();
    const interval = setInterval(fetchWorkerAndSlots, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [wid, selectedDate]);

  const fetchRatings = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}
/api/rating/worker/${wid}`,
      );
      if (res.data.success) {
        setAllRatings(res.data.ratings);
        const ratingsOnly = res.data.ratings.map((r) => r.rating);
        const avg = ratingsOnly.length
          ? ratingsOnly.reduce((a, b) => a + b, 0) / ratingsOnly.length
          : 0;
        setAvgRating(avg.toFixed(1));
      }
    } catch (err) {
      console.error("Error fetching ratings");
    }
  };

  // --- Main Data Fetcher ---
  const fetchWorkerAndSlots = async () => {
    try {
      // 1. Get Token & User ID immediately (Avoids race condition)
      const token = window.localStorage.getItem("userToken");
      let currentUserId = null;
      if (token) {
        const decoded = jwt_decode(token);
        currentUserId = decoded._id;
        userId.current = decoded._id;
      }

      // 2. Fetch Worker Profile (if not already loaded)
      if (!worker) {
        const wRes = await axios.get(
          `${import.meta.env.VITE_API_URL}
/api/worker/get/${wid}`,
        );
        if (wRes.data.success) setWorker(wRes.data.worker);
      }

      const dateStr = getFormattedDate(selectedDate);

      // 3. Fetch Slots for Date
      const sRes = await axios.get(
        `${import.meta.env.VITE_API_URL}
/api/worker/slots/${wid}/${dateStr}`,
      );

      // Handle Success or Empty slots
      if (sRes.data.success) {
        setSlots(sRes.data.slots || []);
      }

      // 4. Fetch User Bookings (ONLY if logged in)
      if (currentUserId) {
        const bRes = await axios.get(
          `${import.meta.env.VITE_API_URL}
/api/user/bookings/${currentUserId}/${dateStr}`,
        );

        if (bRes.data.success) {
          // Filter to ensure strictly matching date and active bookings
          const activeBookings = bRes.data.bookings.filter(
            (b) => b.date === dateStr && !b.deleted,
          );
          setBookings(activeBookings);
        } else {
          setBookings([]);
        }
      }
    } catch (err) {
      // If 404, it just means no slots created for this day yet
      if (err.response && err.response.status === 404) {
        setSlots([]);
      } else {
        console.error("Fetch Error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Event Handlers ---

  const handleSlotClick = (slot) => {
    // Find my booking for this slot (use loose equality == for numbers/strings)
    const myBooking = bookings.find(
      (b) => b.startHour == slot.startHour && b.endHour == slot.endHour,
    );

    setSelectedSlot({
      ...slot,
      myBooking: myBooking || null,
      isMine: !!myBooking,
    });
    setDescription("");
  };

  const handleBook = async () => {
    if (!selectedSlot || !userId.current)
      return toast.error("Please login to book.");
    if (!description.trim())
      return toast.error("Please add a brief description.");

    setProcessing(true);
    try {
      const dateStr = getFormattedDate(selectedDate);

      const response = await axios.post(`${import.meta.env.VITE_API_URL}
/api/user/book`, {
        wid,
        startHour: selectedSlot.startHour,
        endHour: selectedSlot.endHour,
        userId: userId.current,
        description,
        status: 0,
        date: dateStr,
      });

      if (response.data.success) {
        toast.success("Booking Request Sent!");

        // Optimistic Update: Add to local bookings immediately
        const newBooking = {
          startHour: selectedSlot.startHour,
          endHour: selectedSlot.endHour,
          status: 0,
          description,
          date: dateStr,
          _id: "temp-" + Date.now(),
        };
        setBookings((prev) => [...prev, newBooking]);

        // Update selection to show "Manage Booking" view
        setSelectedSlot((prev) => ({
          ...prev,
          isMine: true,
          myBooking: newBooking,
        }));

        // Force server sync
        setTimeout(fetchWorkerAndSlots, 500);
      } else {
        toast.error("Booking failed.");
      }
    } catch (error) {
      toast.error("Server error. Please try again later.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    setProcessing(true);
    const { startHour } = selectedSlot;
    const dateStr = getFormattedDate(selectedDate);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}
/api/user/bookings/cancel/${userId.current}/${dateStr}/${startHour}`,
      );

      if (response.data.success) {
        toast.success("Booking Cancelled");
        // Remove from local state
        setBookings((prev) => prev.filter((b) => b.startHour != startHour));
        setSelectedSlot(null);
        setTimeout(fetchWorkerAndSlots, 500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setProcessing(false);
    }
  };

  const submitRating = async () => {
    if (userRating === 0) return toast.error("Please select a star rating.");
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}
/api/rating/add`, {
        userId: userId.current,
        workerId: wid,
        rating: userRating,
        comment,
      });

      if (res.data.success) {
        toast.success("Rating submitted!");
        setUserRating(0);
        setComment("");
        fetchRatings();
      }
    } catch (err) {
      toast.error("Error submitting rating.");
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchWorkerAndSlots().then(() => {
      toast.success("Status updated!");
      setLoading(false);
    });
  };

  if (loading && !worker)
    return <div style={styles.loadingContainer}>Loading Worker Profile...</div>;
  if (!worker)
    return <div style={styles.loadingContainer}>Worker not found.</div>;

  return (
    <div style={styles.container}>
      <Toaster position="top-center" reverseOrder={false} />

      <div style={styles.header}>
        <button
          onClick={() => navigate("/user/dashboard")}
          style={styles.backButton}
        >
          <IoArrowBack size={20} /> Back
        </button>
        <h2 style={{ margin: 0 }}>Book a Service</h2>
      </div>

      <div style={styles.contentGrid}>
        {/* --- Left Column: Profile --- */}
        <div style={styles.leftColumn}>
          <div style={styles.card}>
            <div style={styles.profileHeader}>
              <img
                src={
                  worker.imageurl
                    ? `${import.meta.env.VITE_API_URL}
/${worker.imageurl}`
                    : `${import.meta.env.VITE_API_URL}
/images/profilelogo.png`
                }
                alt="Profile"
                style={styles.avatar}
              />
              <div>
                <h2 style={styles.workerName}>{worker.username}</h2>
                <p style={styles.serviceTag}>{worker.service}</p>
                <div style={styles.metaRow}>
                  <FaMapMarkerAlt color="#666" /> <span>{worker.location}</span>
                </div>
                <div style={styles.metaRow}>
                  <FaStar color="gold" />{" "}
                  <span>
                    {avgRating} ({allRatings.length} reviews)
                  </span>
                </div>
              </div>
            </div>
            <p style={styles.description}>{worker.description}</p>
            {worker.contactNumber && (
              <a href={`tel:${worker.contactNumber}`} style={styles.callButton}>
                <FaPhoneAlt style={{ marginRight: 8 }} /> Call Now
              </a>
            )}
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Select Date</h3>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }}
              dateFormat="MMMM d, yyyy"
              minDate={new Date()}
              inline
            />
          </div>
        </div>

        {/* --- Right Column: Slots --- */}
        <div style={styles.rightColumn}>
          {/* Legend */}
          <div style={styles.legend}>
            <span style={styles.legendItem}>
              <span
                style={{
                  ...styles.dot,
                  border: "1px solid #ccc",
                  background: "#fff",
                }}
              ></span>{" "}
              Available
            </span>
            <span style={styles.legendItem}>
              <span style={{ ...styles.dot, background: "#ff9800" }}></span>{" "}
              Pending
            </span>
            <span style={styles.legendItem}>
              <span style={{ ...styles.dot, background: "#28a745" }}></span>{" "}
              Confirmed
            </span>
            <span style={styles.legendItem}>
              <span style={{ ...styles.dot, background: "#6c757d" }}></span>{" "}
              Unavailable
            </span>
          </div>

          {/* Slots Grid */}
          <div style={styles.card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
                Slots for{" "}
                {selectedDate.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                })}
              </h3>
              <button onClick={handleRefresh} style={styles.refreshBtn}>
                <IoRefresh size={18} /> Refresh
              </button>
            </div>

            {slots.length === 0 ? (
              <p style={{ color: "#666", fontStyle: "italic" }}>
                No slots available for this date.
              </p>
            ) : (
              <div style={styles.slotGrid}>
                {slots.map((slot, index) => {
                  // --- CRITICAL LOGIC FIX ---
                  // 1. Find if I have a booking (Use loose equality '==' to match "10" and 10)
                  const myBooking = bookings.find(
                    (b) =>
                      b.startHour == slot.startHour &&
                      b.endHour == slot.endHour,
                  );
                  const isMine = !!myBooking;

                  // 2. Is Selected? (Loose equality here too)
                  const isSelected = selectedSlot?.startHour == slot.startHour;

                  // 3. Define "Taken by Others"
                  // It is unavailable ONLY if the slot says unavailable AND it is NOT mine.
                  // If it IS mine, we ignore slot.available because I own it.
                  const isTakenByOthers = !slot.available && !isMine;

                  // 4. Determine Styles based on priority
                  let btnStyle = { ...styles.slotBtn };

                  if (isMine) {
                    // Priority 1: It is MY booking
                    if (myBooking.status == 1) {
                      btnStyle = { ...btnStyle, ...styles.slotConfirmed }; // Green
                    } else {
                      btnStyle = { ...btnStyle, ...styles.slotPending }; // Orange
                    }
                  } else if (isTakenByOthers) {
                    // Priority 2: Taken by someone else
                    btnStyle = { ...btnStyle, ...styles.slotDisabled }; // Gray
                  } else if (isSelected) {
                    // Priority 3: Currently Selected
                    btnStyle = { ...btnStyle, ...styles.slotSelected }; // Blue
                  }

                  return (
                    <button
                      key={index}
                      // Disable click only if taken by others
                      onClick={() => !isTakenByOthers && handleSlotClick(slot)}
                      disabled={isTakenByOthers}
                      style={btnStyle}
                    >
                      {/* --- CONTENT RENDER --- */}

                      {isMine && myBooking.status == 1 && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px",
                          }}
                        >
                          <span>{slot.startHour}</span>
                          <GoCheckCircle size={16} color="white" />
                        </div>
                      )}

                      {isMine && myBooking.status == 0 && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px",
                          }}
                        >
                          <span>{slot.startHour}</span>
                          <GoClock size={16} color="white" />
                        </div>
                      )}

                      {!isMine && <span>{slot.startHour}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Panel */}
          <div style={styles.actionPanel}>
            {!selectedSlot ? (
              <p style={{ color: "#666", textAlign: "center" }}>
                👈 Select a slot above to proceed
              </p>
            ) : selectedSlot.isMine ? (
              <div style={{ textAlign: "center" }}>
                <h4 style={{ margin: "0 0 10px" }}>
                  Manage Booking ({selectedSlot.startHour} -{" "}
                  {selectedSlot.endHour})
                </h4>
                <div style={{ marginBottom: 15 }}>
                  Status:{" "}
                  <span
                    style={
                      selectedSlot.myBooking.status == 1
                        ? styles.badgeSuccess
                        : styles.badgeWarning
                    }
                  >
                    {selectedSlot.myBooking.status == 1
                      ? " Confirmed"
                      : " Pending Approval"}
                  </span>
                </div>
                <button
                  onClick={handleCancel}
                  disabled={processing}
                  style={styles.cancelBtn}
                >
                  {processing ? "Cancelling..." : "Cancel Booking"}
                </button>
              </div>
            ) : (
              <div>
                <h4 style={{ margin: "0 0 10px" }}>
                  Book Slot ({selectedSlot.startHour} - {selectedSlot.endHour})
                </h4>
                <textarea
                  style={styles.textArea}
                  placeholder="Describe your issue or requirement..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <button
                  onClick={handleBook}
                  disabled={processing}
                  style={styles.bookBtn}
                >
                  {processing ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Rate & Review</h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  size={24}
                  color={star <= userRating ? "gold" : "#ddd"}
                  onClick={() => setUserRating(star)}
                  style={{ cursor: "pointer", marginRight: 5 }}
                />
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              style={styles.textArea}
            />
            <button onClick={submitRating} style={styles.submitRatingBtn}>
              Post Review
            </button>

            <div style={{ marginTop: 20 }}>
              {allRatings.map((r, i) => (
                <div key={i} style={styles.reviewItem}>
                  <div style={{ fontWeight: "bold" }}>
                    {r.uid?.username || "Anonymous"}
                  </div>
                  <div style={{ color: "gold", fontSize: 12 }}>
                    {[...Array(r.rating)].map((_, j) => (
                      <FaStar key={j} />
                    ))}
                  </div>
                  <div style={{ color: "#555", fontSize: 14 }}>{r.comment}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Segoe UI, sans-serif",
    background: "#f8f9fa",
    minHeight: "100vh",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "1.2rem",
    color: "#666",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "20px",
    background: "#fff",
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "transparent",
    border: "none",
    color: "#007bff",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: 600,
  },
  contentGrid: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" },
  leftColumn: { display: "flex", flexDirection: "column", gap: "20px" },
  rightColumn: { display: "flex", flexDirection: "column", gap: "20px" },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: "15px",
    color: "#333",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "15px",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #eee",
  },
  workerName: { margin: "0 0 5px 0", fontSize: "1.2rem" },
  serviceTag: {
    background: "#e3f2fd",
    color: "#1976d2",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.85rem",
    display: "inline-block",
    marginBottom: "5px",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.9rem",
    color: "#666",
    marginTop: "5px",
  },
  description: {
    fontSize: "0.9rem",
    color: "#555",
    lineHeight: "1.5",
    marginBottom: "15px",
  },
  callButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "10px",
    background: "#28a745",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: "bold",
  },
  legend: {
    display: "flex",
    gap: "15px",
    fontSize: "0.85rem",
    color: "#666",
    justifyContent: "center",
    marginBottom: "15px",
  },
  legendItem: { display: "flex", alignItems: "center", gap: "5px" },
  dot: { width: "12px", height: "12px", borderRadius: "50%" },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "#f0f0f0",
    border: "1px solid #ccc",
    padding: "4px 8px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "0.8rem",
    color: "#333",
  },
  slotGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
    gap: "10px",
  },
  slotBtn: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    fontSize: "0.95rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 500,
  },
  slotDisabled: {
    background: "#6c757d",
    color: "#fff",
    cursor: "not-allowed",
    borderColor: "#545b62",
    opacity: 0.6,
  },
  slotSelected: {
    background: "#007bff",
    color: "#fff",
    borderColor: "#0056b3",
    boxShadow: "0 0 0 3px rgba(0,123,255,0.25)",
  },
  slotPending: {
    background: "#ff9800",
    color: "#fff",
    borderColor: "#f57c00",
    fontWeight: "bold",
  },
  slotConfirmed: {
    background: "#28a745",
    color: "#fff",
    borderColor: "#1e7e34",
    fontWeight: "bold",
    boxShadow: "0 2px 5px rgba(40, 167, 69, 0.4)",
  },
  actionPanel: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    border: "1px solid #e0e0e0",
  },
  textArea: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "10px",
    fontFamily: "inherit",
  },
  bookBtn: {
    width: "100%",
    padding: "12px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "8px 16px",
    background: "#fff",
    color: "#d32f2f",
    border: "1px solid #d32f2f",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  badgeSuccess: {
    background: "#c8e6c9",
    color: "#1b5e20",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.85rem",
  },
  badgeWarning: {
    background: "#fff3e0",
    color: "#e65100",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.85rem",
  },
  submitRatingBtn: {
    padding: "8px 16px",
    background: "#333",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  reviewItem: {
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
    marginBottom: "10px",
  },
};

const mobileStyles = `
@media (max-width: 768px) {
  .contentGrid { grid-template-columns: 1fr !important; }
}
`;

export default WorkerSlots;
