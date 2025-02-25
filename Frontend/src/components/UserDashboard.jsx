import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const [location, setLocation] = useState("");
  const [services, setServices] = useState([]);
  const [user, setUser] = useState(null);
  const n = useNavigate();
  const profile = useRef(null);

  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await axios.get("http://localhost:4000/api/user/profile", {
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
      // Fetch unique services available in that location
      const response = await axios.get(`http://localhost:4000/api/services?location=${location}`);
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
        <input  type="text"  placeholder="Enter Location"  value={location}  onChange={(e) => setLocation(e.target.value)}
          style={styles.searchBar}
        />
        <button onClick={fetchServices} style={styles.searchButton}>🔍 Search</button>
      </div>

      {services.length > 0 ? (
        services.map((service, index) => (
          <div key={index} style={styles.serviceCard}>
            <p><strong>{service}</strong></p>
            <button onClick={() => n(`/services?location=${location}&service=${service}`)} style={styles.bookButton}>
              View Available Workers
            </button>
          </div>
        ))
      ) : (
        <p style={{ marginTop: "20px" }}>No services found.</p>
      )}

      <div ref={profile} style={styles.profileSection}>
        <h3>User Profile</h3>
        {user ? (<p><strong>Name:</strong> {user.name}</p>) : (<p>Loading user details...</p>)}
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
  serviceCard: {
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
