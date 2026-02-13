import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // 'pending', 'approved', 'rejected', 'all'
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}
/api/admin/all-workers`,
      );
      setWorkers(response.data.workers || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching workers:", error);
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this worker?`))
      return;

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}
/api/admin/verify-worker/${id}`, {
        action,
      });
      // Optimistic UI update (update list without reloading)
      setWorkers(
        workers.map((w) =>
          w._id === id ? { ...w, verificationStatus: action } : w,
        ),
      );
    } catch (error) {
      console.error("Error updating worker:", error);
      alert("Failed to update status");
    }
  };

  // Filter Logic
  const filteredWorkers = workers.filter((worker) => {
    if (filter === "all") return true;
    return worker.verificationStatus === filter;
  });

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
          marginBottom: "30px",
        }}
      >
        <h1 style={{ margin: 0, color: "#343a40" }}>Admin Dashboard</h1>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* TABS FOR FILTERING */}
      <div style={{ marginBottom: "25px", display: "flex", gap: "10px" }}>
        {["pending", "approved", "rejected", "all"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: "10px 20px",
              borderRadius: "30px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              textTransform: "capitalize",
              backgroundColor: filter === status ? "#007bff" : "#e9ecef",
              color: filter === status ? "white" : "#495057",
              boxShadow:
                filter === status ? "0 4px 6px rgba(0,123,255,0.3)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            {status === "pending" ? "⚠️ Pending Reviews" : status}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#666" }}>Loading...</p>
      ) : filteredWorkers.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "50px", color: "#888" }}>
          <h3>No {filter} workers found.</h3>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "25px",
          }}
        >
          {filteredWorkers.map((worker) => (
            <div
              key={worker._id}
              style={{
                backgroundColor: "white",
                padding: "25px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                borderTop: `4px solid ${worker.aiApproved ? "#28a745" : "#ffc107"}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <h3 style={{ margin: 0, color: "#333" }}>{worker.username}</h3>
                <span
                  style={{
                    fontSize: "12px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor: "#eee",
                    height: "fit-content",
                  }}
                >
                  {worker.service}
                </span>
              </div>

              <p style={{ color: "#555", fontSize: "14px", margin: "5px 0" }}>
                📧 {worker.email}
              </p>
              <p
                style={{
                  color: "#555",
                  fontSize: "14px",
                  margin: "5px 0 15px",
                }}
              >
                📞 {worker.contactNumber}
              </p>

              {/* AI VERIFICATION BOX */}
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  border: "1px solid #e9ecef",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "5px",
                  }}
                >
                  <strong>AI Analysis:</strong>
                  {worker.aiApproved ? (
                    <span
                      style={{
                        color: "#28a745",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      ✅ Passed
                    </span>
                  ) : (
                    <span
                      style={{
                        color: "#dc3545",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      ❌ Flagged
                    </span>
                  )}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#666",
                    fontStyle: "italic",
                  }}
                >
                  "{worker.aiVerdictReason}"
                </p>
              </div>

              {/* DOCUMENTS CAROUSEL */}
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                Documents:
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  overflowX: "auto",
                  paddingBottom: "10px",
                }}
              >
                {worker.documents && worker.documents.length > 0 ? (
                  worker.documents.map((docPath, index) => (
                    <a
                      key={index}
                      href={`${import.meta.env.VITE_API_URL}
/${docPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {docPath.endsWith(".pdf") ? (
                        <div
                          style={{
                            width: "70px",
                            height: "70px",
                            background: "#ffebee",
                            color: "#d32f2f",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px",
                            fontSize: "10px",
                            fontWeight: "bold",
                            border: "1px solid #ffcdd2",
                          }}
                        >
                          PDF
                        </div>
                      ) : (
                        <img
                          src={`${import.meta.env.VITE_API_URL}
/${docPath}`}
                          alt="Doc"
                          style={{
                            width: "70px",
                            height: "70px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #dee2e6",
                          }}
                        />
                      )}
                    </a>
                  ))
                ) : (
                  <span style={{ fontSize: "12px", color: "#999" }}>
                    No docs
                  </span>
                )}
              </div>

              {/* ACTION BUTTONS (Only show for Pending) */}
              {worker.verificationStatus === "pending" && (
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "20px" }}
                >
                  <button
                    onClick={() => handleAction(worker._id, "approved")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleAction(worker._id, "rejected")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}

              {/* STATUS BADGE (For Approved/Rejected) */}
              {worker.verificationStatus !== "pending" && (
                <div
                  style={{
                    marginTop: "20px",
                    textAlign: "center",
                    padding: "8px",
                    borderRadius: "6px",
                    backgroundColor:
                      worker.verificationStatus === "approved"
                        ? "#d4edda"
                        : "#f8d7da",
                    color:
                      worker.verificationStatus === "approved"
                        ? "#155724"
                        : "#721c24",
                    fontWeight: "bold",
                    textTransform: "capitalize",
                  }}
                >
                  {worker.verificationStatus}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
