import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaUser,
  FaTools,
  FaEnvelope,
  FaLock,
  FaMapMarkerAlt,
  FaPhone,
} from "react-icons/fa";

const WorkerRegister = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    service: "",
    location: "",
    description: "",
    phone: "",
    certificate: null, // ✅ NEW FIELD
  });

  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleChange = (e) => {
    if (e.target.name === "certificate") {
      setFormData({ ...formData, certificate: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.service ||
      !formData.location ||
      !formData.description ||
      !formData.phone ||
      !formData.certificate
    ) {
      alert("Please fill in all fields including certificate.");
      return;
    }

    try {
      const data = new FormData();

      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("service", formData.service);
      data.append("location", formData.location);
      data.append("description", formData.description);
      data.append("phone", formData.phone);
      data.append("certificate", formData.certificate); // ✅ Image appended

      const response = await axios.post(
        "http://localhost:4000/api/worker/register",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        alert("Registration submitted. Awaiting admin verification.");
        navigate("/worker/login");
      }
    } catch (error) {
      console.error("Error registering worker:", error);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div className="p-s">
      <div className="register-container">
        <h2 className="register-title">Worker Registration</h2>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="input-container">
            <FaUser className="input-icon" />
            <input
              className="register-input"
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-container">
            <FaEnvelope className="input-icon" />
            <input
              className="register-input"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
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
              onChange={handleChange}
              required
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
              onChange={handleChange}
              required
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
              onChange={handleChange}
              required
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
              onChange={handleChange}
              required
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
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-container">
            <FaTools className="input-icon" />
            <input
              className="register-input"
              type="file"
              name="certificate"
              accept="image/*"
              onChange={handleChange}
              required
            />
          </div>

          <button className="register-button" type="submit">
            Register
          </button>
        </form>

        <p className="register-text">
          Already Registered? <Link to="/worker/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default WorkerRegister;
