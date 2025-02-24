import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const [location, setLocation] = useState("");
  const [services, setServices] = useState([]);
  const [user, setUser] = useState(null); 
  const n= useNavigate();
  const profile = useRef(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token"); 
        if (!token) return;
        const response = await axios.get("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const fetchServices = async () => {
    if (!location.trim()) {
      alert("Please enter a location!");
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5000/api/workers?location=${location}`);
      setServices(response.data);
    } catch (error) {
      alert("Error fetching services");
      
    }
  };
  const scrollToProfile = () => {
    profile.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={styles.container}>
      <button onClick={scrollToProfile} style={styles.profileButton}>👤 Profile</button>

      <h2>User Dashboard</h2>
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Enter Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={styles.searchBar}
        />
        <button onClick={fetchServices} style={styles.searchButton}>🔍 Search</button>
      </div>
      {services.length > 0 ? (
        services.map((worker) => (
          <div key={worker.wid} style={styles.workerCard}>
            <p><strong>{worker.service}</strong> - {worker.name}</p>
            <button onClick={() => n(`/user/book/${worker.wid}`)} style={styles.bookButton}>Book Now</button>
          </div>
        ))
      ) : (
        <p style={{ marginTop: "20px" }}>No services found.</p>
      )}

      <div ref={profile} style={styles.profileSection}>
        <h3>User Profile</h3>
        {user ? ( <p><strong>Name:</strong> {user.name}</p>) : (<p>Loading user details...</p> )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    position: "relative",
  },
  profileButton: {
    position: "absolute",
    top: "10px",
    left: "10px",
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  searchContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "15px",
  },
  searchBar: {
    width: "60%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  searchButton: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },
  workerCard: {
    border: "1px solid #ccc",
    borderRadius: "10px",
    padding: "15px",
    margin: "10px auto",
    width: "80%",
    textAlign: "left",
    backgroundColor: "#f9f9f9",
  },
  bookButton: {
    padding: "8px 12px",
    fontSize: "14px",
    cursor: "pointer",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },
  profileSection: {
    marginTop: "50px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "#e3f2fd",
  },
};

export default UserDashboard;
