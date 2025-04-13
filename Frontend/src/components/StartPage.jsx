import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function StartPage() {
  const [location, setLocation] = useState("");
  const [services, setServices] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Fetch location suggestions
  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/worker/locations?q=${location}`);
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

  // Fetch services based on location
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

  const handleQuickService = (serviceName) => {
    navigate('/selecting');
  };

  const handleViewWorkers = (service) => {
    navigate('/selecting');
  };

  const handleLogin = () => {
    navigate('/selecting');
  };

  return (
    <div className="dashboard-container">
      {/* ========== Header ========== */}
      <header style={{ position: "relative", textAlign: "center", marginTop: "20px", marginBottom: "30px" }}>
        <h1 className="main-title" style={{ fontSize: "2.5rem", color: "#333", margin: 0 }}>
          <span style={{ color: "#007bff" }}>HELP</span>
          <span style={{ color: "#ffc107" }}>MATE</span>
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#777", marginTop: "0.3rem", fontStyle: "italic" }}>
          A Customer-Worker Interaction System
        </p>

        {/* Login Button Top-Right */}
        <button
          onClick={handleLogin}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.9rem"
          }}
        >
          Login
        </button>
      </header>

      {/* ========== Search Section ========== */}
      <section>
        <h2 className="dashboard-title">Search For Services</h2>
        <div className="search-container" style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Enter Location / Thrissur"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="search-input"
            ref={inputRef}
            onBlur={() => setTimeout(() => setSuggestions([]), 300)}
          />
          <button onClick={fetchServices} className="search-button">🔍 Search</button>

          {/* Suggestions dropdown */}
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
      </section>

      {/* ========== Quick Services Section ========== */}
      <section style={{ marginTop: "40px" }}>
        <div className="quick-services">
          <button className="service-icon" onClick={() => handleQuickService("Plumber")}>🚰 Plumber</button>
          <button className="service-icon" onClick={() => handleQuickService("Electrician")}>💡 Electrician</button>
          <button className="service-icon" onClick={() => handleQuickService("Doctor")}>🩺 Doctor</button>
          <button className="service-icon" onClick={() => handleQuickService("Engineer")}>🏗️ Engineer</button>
        </div>
      </section>

      {/* ========== Service Results Section ========== */}
      <section style={{ marginTop: "40px" }}>
        {services.length > 0 ? (
          <div className="services-container">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <p><strong>{service}</strong></p>
                <button onClick={() => handleViewWorkers(service)} className="view-workers-button">
                  View Available Workers
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-services" style={{ marginTop: "20px", fontSize: "1rem", color: "#888" }}>
            No services found.
          </p>
        )}
      </section>
    </div>
  );
}

export default StartPage;
