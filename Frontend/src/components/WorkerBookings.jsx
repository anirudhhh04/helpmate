import { useState, useEffect } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";

function WorkerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- Fetch Bookings ---
  const fetchBookings = async () => {
    try {
      const token = window.localStorage.getItem("workerToken");
      if (!token) return;
      const decoded = jwt_decode(token);
      console.log("🚀 Frontend Requesting Bookings for ID:", decoded._id);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}
/api/worker/bookings/${decoded._id}`,
      );

      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // --- CONFIRM BOOKING ---
  const handleSave = async (bookingId, startHour, endHour, date) => {
    try {
      // 1. Single API call handles BOTH Booking Status & Slot Availability
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}
/api/worker/bookings/confirm/${bookingId}`,
        { status: 1, date },
      );

      if (response.data.success) {
        // 2. Update UI locally
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: 1 } : b)),
        );
        alert("Booking Confirmed!"); // Optional: Success message
      }
    } catch (error) {
      console.error(error);
      alert("Error confirming booking.");
    }
  };

  // --- REJECT BOOKING ---
  const handleReject = async (bookingId) => {
    if (!window.confirm("Reject this booking?")) return;
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}
/api/worker/bookings/reject/${bookingId}`,
        { deleted: true },
      );
      if (response.data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, deleted: true } : b)),
        );
      }
    } catch (error) {
      alert("Error rejecting booking");
    }
  };

  // --- RATE USER (The New Logic) ---
  const handleRateUser = async (bookingId, userId, ratingValue) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}
/api/worker/rate-user`,
        {
          bookingId,
          userId,
          ratingValue, // 1 or -1
        },
      );

      if (response.data.success) {
        // Update local state so the buttons disappear immediately
        setBookings((prev) =>
          prev.map((b) => {
            if (b._id === bookingId) {
              // Update the score locally for instant feedback
              const currentScore = b.uid.score || 0;
              return {
                ...b,
                workerRatedUser: true,
                uid: { ...b.uid, score: currentScore + ratingValue },
              };
            }
            return b;
          }),
        );
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error rating user");
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerBar}>
        <button
          onClick={() => navigate("/worker/dashboard")}
          style={styles.backButton}
        >
          ← Dashboard
        </button>
        <h2 style={{ margin: 0, fontSize: "20px" }}>Requests</h2>
      </div>

      <div style={styles.grid}>
        {bookings.map((booking) => {
          const isConfirmed = booking.status == 1;
          const isDeleted = booking.deleted === true;
          const isPending = !isDeleted && !isConfirmed;

          return (
            <div key={booking._id} style={styles.card(isDeleted)}>
              {/* Status Badge */}
              <div style={styles.statusBadge(booking.status, isDeleted)}>
                {isDeleted ? "Rejected" : isConfirmed ? "Confirmed" : "New"}
              </div>

              {/* User Details */}
              <h3 style={{ margin: "15px 0 5px" }}>
                👤 {booking.uid?.username || "Unknown User"}
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
                Reputation Score:{" "}
                <strong
                  style={{
                    color: (booking.uid?.score || 0) < 0 ? "red" : "green",
                  }}
                >
                  {booking.uid?.score || 0}
                </strong>
              </p>

              <hr style={{ borderTop: "1px solid #eee", margin: "10px 0" }} />

              <div style={styles.details}>
                <p>
                  📅 {formatDate(booking.date)} | ⏰ {booking.startHour}-
                  {booking.endHour}
                </p>
                <p>📝 {booking.description || "No notes"}</p>
              </div>

              {/* ACTION AREA */}
              <div style={{ marginTop: "15px" }}>
                {/* 1. Pending Actions */}
                {isPending && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() =>
                        handleSave(
                          booking._id,
                          booking.startHour,
                          booking.endHour,
                          booking.date,
                        )
                      }
                      style={styles.confirmBtn}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleReject(booking._id)}
                      style={styles.rejectBtn}
                    >
                      Reject
                    </button>
                  </div>
                )}

                {/* 2. Rating Area (Only if Confirmed & Not Deleted) */}
                {isConfirmed && !isDeleted && (
                  <div style={styles.ratingBox}>
                    {booking.workerRatedUser ? (
                      <div style={styles.ratedText}>✓ Feedback Sent</div>
                    ) : (
                      <>
                        <p style={{ margin: "0 0 8px", fontSize: "13px" }}>
                          Rate Customer:
                        </p>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={() =>
                              handleRateUser(booking._id, booking.uid._id, 1)
                            }
                            style={styles.thumbsUp}
                          >
                            👍 Good (+1)
                          </button>
                          <button
                            onClick={() =>
                              handleRateUser(booking._id, booking.uid._id, -1)
                            }
                            style={styles.thumbsDown}
                          >
                            👎 Bad (-1)
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {isDeleted && (
                  <div
                    style={{
                      color: "#999",
                      textAlign: "center",
                      marginTop: "10px",
                    }}
                  >
                    Booking Cancelled
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "80px auto 0",
    fontFamily: "Segoe UI, sans-serif",
    background: "#f4f6f8",
    minHeight: "100vh",
  },
  headerBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    background: "#fff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
  backButton: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  card: (isDeleted) => ({
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    borderTop: isDeleted ? "4px solid #ccc" : "4px solid #007bff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    opacity: isDeleted ? 0.6 : 1,
  }),
  statusBadge: (status, deleted) => ({
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "bold",
    background: deleted ? "#ffebee" : status == 1 ? "#e8f5e9" : "#fff3e0",
    color: deleted ? "#c62828" : status == 1 ? "#2e7d32" : "#ef6c00",
  }),
  details: { fontSize: "14px", color: "#444", lineHeight: "1.6" },
  confirmBtn: {
    flex: 1,
    padding: "10px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  rejectBtn: {
    flex: 1,
    padding: "10px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  ratingBox: {
    background: "#f8f9fa",
    padding: "10px",
    borderRadius: "8px",
    marginTop: "15px",
    textAlign: "center",
    border: "1px solid #e9ecef",
  },
  thumbsUp: {
    flex: 1,
    padding: "8px",
    background: "#e8f5e9",
    color: "#2e7d32",
    border: "1px solid #c8e6c9",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  thumbsDown: {
    flex: 1,
    padding: "8px",
    background: "#ffebee",
    color: "#c62828",
    border: "1px solid #ffcdd2",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  ratedText: { color: "#28a745", fontWeight: "bold", fontSize: "14px" },
};

export default WorkerBookings;
