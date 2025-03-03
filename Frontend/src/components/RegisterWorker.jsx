import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaUser,FaTools, FaEnvelope, FaLock, FaWrench, FaMapMarkerAlt, FaPhone } from "react-icons/fa"; 

const WorkerRegister = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    service: "",
    location: "",
    description: "",
    phone: "",
  });

  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.service || !formData.location || !formData.description || !formData.phone) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await axios.post("http://localhost:4000/api/worker/register", formData);
      if (response.data.success) {
        navigate("/worker/login");
      }
    } catch (error) {
      console.error("Error registering worker:", error);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Worker Registration</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <FaUser className="input-icon" />
          <input className="register-input"  type="text" name="username" placeholder="Username"  value={formData.username} required onChange={handleChange}/>
        </div>
        <div className="input-container">
          <FaEnvelope className="input-icon" />
          <input
            className="register-input"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            required
            onChange={handleChange}
          />
        </div>
        <div className="input-container">
          <FaLock className="input-icon" />
          <input
            className="register-input"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            required
            onChange={handleChange}
          />
        </div>
        <div className="input-container">
          <FaTools className="input-icon" />
          <input
            className="register-input"
            type="text"
            name="service"
            placeholder="Service"
            value={formData.service}
            required
            onChange={handleChange}
          />
        </div>
        <div className="input-container">
          <FaMapMarkerAlt className="input-icon" />
          <input
            className="register-input"
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            required
            onChange={handleChange}
          />
        </div>
        <div className="input-container">
          <FaTools className="input-icon" />
          <input
            className="register-input"
            type="text"
            name="description"
            placeholder="Service Description"
            value={formData.description}
            required
            onChange={handleChange}
          />
        </div>
        <div className="input-container">
          <FaPhone className="input-icon" />
          <input
            className="register-input"
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            required
            onChange={handleChange}
          />
        </div>

        <button className="register-button" type="submit">Register</button>
      </form>
      <p className="register-text">
        Already Registered? <Link to="/worker/login">Login</Link>
      </p>
    </div>
  );
};

export default WorkerRegister;
