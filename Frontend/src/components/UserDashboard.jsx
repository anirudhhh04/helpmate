import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const [location, setLocation] = useState("");
  const [services, setServices] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
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
    <div className="dashboard-container">
      <button onClick={scrollToProfile} className="profile-button">👤 Profile</button>

      <h2 className="dashboard-title">User Dashboard</h2>

      <div className="search-container">
        <input 
          type="text" 
          placeholder="Enter Location" 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          className="search-input"
        />
        <button onClick={fetchServices} className="search-button">🔍 Search</button>
      </div>

      {services.length > 0 ? (
        <div className="services-container">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <p><strong>{service}</strong></p>
              <button onClick={() => navigate(`/services?location=${location}&service=${service}`)} className="view-workers-button">
                View Available Workers
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-services">No services found.</p>
      )}

      <div ref={profile} className="profile-container">
        <h3 className="profile-title">User Profile</h3>
        {user ? (<p className="profile-info"><strong>Name:</strong> {user.name}</p>) : (
          <p className="loading-text">Loading user details...</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
