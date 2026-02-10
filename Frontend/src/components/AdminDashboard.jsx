import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/admin/all-workers"
      );
      setWorkers(response.data.workers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching workers:", error);
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await axios.put(
        `http://localhost:4000/api/admin/verify-worker/${id}`,
        { action }
      );

      fetchWorkers(); // Refresh list
    } catch (error) {
      console.error("Error updating worker:", error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f6f9",
        padding: "40px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>

        <button
          onClick={() => navigate("/")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#343a40",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <p style={{ textAlign: "center" }}>Loading workers...</p>
      ) : workers.length === 0 ? (
        /* No Workers Message */
        <div
          style={{
            textAlign: "center",
            marginTop: "120px",
            color: "#6c757d",
          }}
        >
          <h2 style={{ fontWeight: "500" }}>No Workers Registered</h2>
          <p style={{ marginTop: "10px" }}>
            Once workers register, they will appear here for verification.
          </p>
        </div>
      ) : (
        /* Worker Cards */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "25px",
          }}
        >
          {workers.map((worker) => (
            <div
              key={worker._id}
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                transition: "transform 0.2s ease",
              }}
            >
              {/* Worker Name */}
              <h3 style={{ marginBottom: "15px" }}>
                {worker.username}
              </h3>

              {/* AI Status */}
              <p style={{ marginBottom: "10px" }}>
                <strong>AI Verification:</strong>{" "}
                {worker.aiApproved ? (
                  <span style={{ color: "#28a745", fontWeight: "bold" }}>
                    ✔ Approved by AI
                  </span>
                ) : (
                  <span style={{ color: "#dc3545", fontWeight: "bold" }}>
                    ✖ Rejected by AI
                  </span>
                )}
              </p>

              {/* Certificate Image */}
              <div style={{ marginTop: "10px" }}>
                <img
                  src={`http://localhost:4000/${worker.certificate}`}
                  alt="Certificate"
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={() => handleAction(worker._id, "approved")}
                  style={{
                    flex: 1,
                    marginRight: "10px",
                    padding: "8px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Accept
                </button>

                <button
                  onClick={() => handleAction(worker._id, "rejected")}
                  style={{
                    flex: 1,
                    padding: "8px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
