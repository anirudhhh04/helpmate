import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa"; // Import icons

function RegisterUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const n = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}
/api/user/register`, { username, email, password });
      n("/user/login");
    } catch (err) {
      alert("Registration failed!");
    }
  };

  return (
  <div className="p-s">
    <div className="register-container">
      <h2 className="register-title">Register as a User</h2>
      <div className="input-container">
        <FaUser className="input-icon" />
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          className="register-input"
        />
      </div>
      <div className="input-container">
        <FaEnvelope className="input-icon" />
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="register-input"
        />
      </div>
      <div className="input-container">
        <FaLock className="input-icon" />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="register-input"
        />
      </div>

      <button onClick={handleRegister} className="register-button">
        Register
      </button>

      <p className="register-text">
        Already Registered?{" "}
        <Link className="register-link" to="/user/login">
          Login
        </Link>
      </p>
    </div>
  </div>
  );
}

export default RegisterUser;
