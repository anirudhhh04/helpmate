import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function StartPage() {
  const [location, setLocation] = useState("");
  const [services, setServices] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showAbout, setShowAbout] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const skipSuggestionFetch = useRef(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/worker/locations?q=${location}`,
      );
      setSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  useEffect(() => {
    if (skipSuggestionFetch.current) {
      skipSuggestionFetch.current = false;
      return;
    }
    if (location.length < 2) {
      setSuggestions([]);
      return;
    }
    const delaySearch = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delaySearch);
  }, [location]);

  const fetchServices = async () => {
    if (!location.trim()) {
      alert("Please enter a location!");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:4000/api/worker/services/${location}`,
      );
      setServices(response.data.services);
    } catch (error) {
      alert("Error fetching services");
    }
  };

  const handleQuickService = (serviceName) => {
    navigate("/selecting");
  };

  const handleViewWorkers = (service) => {
    navigate("/selecting");
  };

  const handleLogin = () => {
    navigate("/selecting");
  };

  const toggleAbout = () => {
    setShowAbout((prev) => !prev);
  };

  return (
    <div className="dashboard-container">
      {/* ========== Header ========== */}
      <header
        style={{
          position: "relative",
          textAlign: "center",
          marginTop: "20px",
          marginBottom: "30px",
        }}
      >
        <h1
          className="main-title"
          style={{ fontSize: "2.5rem", color: "#333", margin: 0 }}
        >
          <span style={{ color: "#007bff" }}>HELP</span>
          <span style={{ color: "#ffc107" }}>MATE</span>
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#777",
            marginTop: "0.3rem",
            fontStyle: "italic",
          }}
        >
          A Customer-Worker Interaction System
        </p>

        {/* Login and About Buttons */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            onClick={() => setShowAdminLogin((prev) => !prev)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#212529",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Admin
          </button>
          <button
            onClick={toggleAbout}
            onMouseEnter={() => setHoveredButton("about")}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              padding: "8px 16px",
              backgroundColor:
                hoveredButton === "about" ? "#5c636a" : "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem",
              transition: "background-color 0.3s",
            }}
          >
            About
          </button>
          <button
            onClick={handleLogin}
            onMouseEnter={() => setHoveredButton("login")}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              padding: "8px 16px",
              backgroundColor:
                hoveredButton === "login" ? "#0056b3" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Login
          </button>
        </div>
      </header>
      {showAdminLogin && (
        <div
          style={{
            position: "absolute",
            top: "80px",
            right: "20px",
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
          }}
        >
          <input
            type="password"
            placeholder="Enter Admin Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            style={{
              padding: "8px",
              width: "200px",
              marginBottom: "8px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
          <br />
          <button
            onClick={() => {
              if (adminPassword === "12345") {
                navigate("/admin-dashboard");
              } else {
                alert("Incorrect Password");
              }
            }}
            style={{
              padding: "6px 15px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Enter
          </button>
        </div>
      )}

      {/* About Section */}
      {showAbout && (
        <div
          style={{
            maxWidth: "750px",
            margin: "0 auto 30px",
            backgroundColor: "#f9f9f9",
            padding: "15px 20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            fontSize: "1rem",
            color: "#444",
            textAlign: "center",
          }}
        >
          Helpmate is a simple and smart platform designed to bridge the gap
          between users and local professionals. Whether it's for essential
          daily services or scheduled assistance, Helpmate lets you discover
          nearby workers, check their availability in real time, and book
          appointments with ease — all in one place.
        </div>
      )}

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
          <button onClick={fetchServices} className="search-button">
            🔍 Search
          </button>

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map((loc, index) => (
                <li
                  key={index}
                  onClick={() => {
                    skipSuggestionFetch.current = true;
                    setSuggestions([]);
                    setLocation(loc);
                    inputRef.current.blur();
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
          <button
            className="service-icon"
            onClick={() => handleQuickService("Plumber")}
          >
            🚰 Plumber
          </button>
          <button
            className="service-icon"
            onClick={() => handleQuickService("Electrician")}
          >
            💡 Electrician
          </button>
          <button
            className="service-icon"
            onClick={() => handleQuickService("Doctor")}
          >
            🩺 Doctor
          </button>
          <button
            className="service-icon"
            onClick={() => handleQuickService("Engineer")}
          >
            🏗️ Engineer
          </button>
        </div>
      </section>

      {/* ========== Service Results Section ========== */}
      <section style={{ marginTop: "40px" }}>
        {services.length > 0 ? (
          <div className="services-container">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <p>
                  <strong>{service}</strong>
                </p>
                <button
                  onClick={() => handleViewWorkers(service)}
                  className="view-workers-button"
                >
                  View Available Workers
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p
            className="no-services"
            style={{ marginTop: "20px", fontSize: "1rem", color: "#888" }}
          >
            No services found.
          </p>
        )}
      </section>
    </div>
  );
}

export default StartPage;
