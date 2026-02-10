import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";

function WorkerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/worker/login",
        { email, password }
      );

      if (response.data.success) {
        localStorage.setItem("workerToken", response.data.token);
        navigate("/worker/dashboard");
      } else {
        const message = response.data.message;

        if (message === "worker not registered") {
          navigate("/worker/register");
        } 
        else if (message === "invalid email or password") {
          alert("Invalid email or password");
        } 
        else if (message === "verification pending") {
          alert("Your account is under verification. Please wait for admin approval.");
        } 
        else if (message === "verification rejected") {
          alert("Your registration was rejected by admin.");
        } 
        else {
          alert("Login failed.");
        }
      }
    } catch (err) {
      alert("Login failed!");
    }
  };

  return (
    <div className="p-s">
      <div className="register-container">
        <h2 className="register-title">Worker Login</h2>

        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input
            className="register-input"
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            className="register-input"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="register-button"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default WorkerLogin;
