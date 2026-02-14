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
  const [showAbout, setShowAbout] = useState(false); // NEW
  const navigate = useNavigate();
  const inputRef = useRef(null);
  
  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}
/api/worker/locations?q=${location}`);
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
    const delaySearch = setTimeout(fetchSuggestions, 300);
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
        const response = await axios.get(`${import.meta.env.VITE_API_URL}
/api/user/profile/${userId}`);
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL}
/api/worker/services/${location}`);
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

  const toggleAbout = () => {
    setShowAbout(prev => !prev);
  };

 return (
  <div className="dashboard-container">

    {/* ===== NAVBAR ===== */}
    <nav className="top-navbar">
      <div className="logo-section">
        <h1 className="main-logo">
          <span className="logo-blue">HELP</span>
          <span className="logo-yellow">MATE</span>
        </h1>
      </div>

      <div className="nav-right">
        <button className="nav-link" onClick={toggleAbout}>
          About
        </button>

        <button 
          className="profile-btn" 
          onClick={() => setShowSidebar(!showSidebar)}
        >
          👤
        </button>
      </div>
    </nav>


    {/* ===== SIDEBAR ===== */}
    <div className={`profile-sidebar ${showSidebar ? "show" : ""}`}>
      <button 
        className="close-btn" 
        onClick={() => setShowSidebar(false)}
      >
        ✖
      </button>

      {user ? (
        <>
          <h3>{user.username}</h3>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>


    {/* ===== PAGE CONTENT WRAPPER ===== */}
    <div className="dashboard-content">

      {showAbout && (
        <div className="about-box">
          Helpmate is a smart platform connecting users with trusted local professionals.
          Discover workers, check availability, and book services — all in one place.
        </div>
      )}

      <h2 className="dashboard-title">Search For Services</h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Enter Location / Thrissur"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="search-input"
          ref={inputRef}
          onBlur={() => setTimeout(() => setSuggestions([]), 300)}
        />
        <button onClick={fetchServices} className="search-button">
          🔍 Search
        </button>

        {suggestions.length > 0 && (
          <ul className="suggestions-dropdown">
            {suggestions.map((loc, index) => (
              <li
                key={index}
                onClick={() => {
                  setLocation(loc);
                  setSuggestions([]);
                }}
              >
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
              <button
                onClick={() => navigate(`/services/${location}/${service}`)}
                className="view-workers-button"
              >
                View Available Workers
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-services">No services found.</p>
      )}
    </div>


    {/* ===== FOOTER ===== */}
    <footer className="main-footer">
      <div className="footer-content">
        <div>
          <h3>Helpmate</h3>
          <p>Connecting local professionals with people who need them.</p>
        </div>

        <div className="footer-contact">
          <p><strong>Email:</strong> support@helpmate.com</p>
          <p><strong>Phone:</strong> +91 98765 43210</p>
          <p><strong>Location:</strong> Thrissur, Kerala</p>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Helpmate. All rights reserved.
      </div>
    </footer>

  </div>
);

}

export default UserDashboard;
