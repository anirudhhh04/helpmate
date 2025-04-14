import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwt_decode from 'jwt-decode';

function UserDashboard() {
  const [location, setLocation] = useState("");
  const [services, setServices] = useState([]);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null); // Reference for input field

  // Function to fetch suggestions
  const fetchSuggestions = async () => {
    
  
    try {
      const response = await axios.get(`http://localhost:4000/api/worker/locations?q=${location}`); // Ensure backend route is correct
      setSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  useEffect(() => {
    if (location.length < 2) {
      setSuggestions([]);
      return;
    }
    const delaySearch = setTimeout(fetchSuggestions, 300); // Debounce API call
    return () => clearTimeout(delaySearch);
  }, [location]);

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
      setServices(response.data.services);
    } catch (error) {
      alert("Error fetching services");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/user/login");
  };

  const handleQuickService = (serviceName) => {
    navigate(`/services/Thrissur/${serviceName}`);
  };

  return (
    <div className="dashboard-container">
      {/* Profile Circle Button */}
      <button className="profile-circle" onClick={() => setShowSidebar(!showSidebar)}>
        👤
      </button>

      {/* Sidebar */}
      <div className={`profile-sidebar ${showSidebar ? "show" : ""}`}>
        <button className="close-btn" onClick={() => setShowSidebar(false)}></button>
        {user ? (
          <>
            <p><strong>{user.username}</strong></p>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <h2 className="dashboard-title">Search For Services</h2>

      {/* Search Bar with Suggestions */}
      <div className="search-container" style={{ position: "relative" }}>
        <input
          type="text"
          placeholder="Enter Location / Thrissur"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="search-input"
          ref={inputRef}
          onBlur={() => setTimeout(() => setSuggestions([]), 300)} // Delay clearing to allow clicks
        />
        <button onClick={fetchServices} className="search-button">🔍 Search</button>

        {/* Display Suggestions */}
        {suggestions.length > 0 && (
          <ul className="suggestions-dropdown">
            {suggestions.map((loc, index) => (
              <li key={index} onClick={() => { setLocation(loc); setSuggestions([]); }}>
                {loc}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="quick-services">
        <button className="service-icon" onClick={() => handleQuickService("Plumber")}>🚰 Plumber</button>
        <button className="service-icon" onClick={() => handleQuickService("Electrician")}>💡 Electrician</button>
        <button className="service-icon" onClick={() => handleQuickService("Doctor")}>🩺 Doctor</button>
        <button className="service-icon" onClick={() => handleQuickService("Engineer")}>🏗️ Engineer</button>
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
    </div>
  );
}

export default UserDashboard;
