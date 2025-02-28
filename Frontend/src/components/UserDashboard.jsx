import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwt_decode from 'jwt-decode';

function UserDashboard() {
  const [location, setLocation] = useState("");
  const [services, setServices] = useState([]);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();
  const profile = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) return;
    const decoded = jwt_decode(token);
    setUserId(decoded._id);
  }, []);
  
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(`http://localhost:4000/api/user/profile/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
  
    fetchUser();
  }, [userId]);
  

  const fetchServices = async () => {
    if (!location.trim()) {
      alert("Please enter a location!");
      return;
    }
    try {
      const response = await axios.get(`http://localhost:4000/api/worker/services/${location}`);
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              fetchServices(); 
            }
          }}
          className="search-input"
        />
        <button onClick={fetchServices} className="search-button">🔍 Search</button>
      </div>

      {services.length > 0 ? (
        <div className="services-container">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <p><strong>{service}</strong></p>
              <button onClick={() => navigate(`/services/${location}/${service}`)} className="view-workers-button">
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
        {user ? (<p className="profile-info"><strong>Name:</strong> {user.username}</p>) : (
          <p className="loading-text">Loading user details...</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
