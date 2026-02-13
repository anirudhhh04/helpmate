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
        `${import.meta.env.VITE_API_URL}
/api/worker/login`,
        { email, password },
      );

      if (response.data.success) {
        localStorage.setItem("workerToken", response.data.token);
        navigate("/worker/dashboard");
      } else {
        const message = response.data.message;

        // Specific check for "Worker not registered" to redirect
        // Note: Make sure backend sends exactly "Worker not registered"
        if (message && message.toLowerCase().includes("not registered")) {
          if (
            window.confirm("Account not found. Would you like to register?")
          ) {
            navigate("/worker/register");
          }
        }
        // For all other errors (Invalid pass, Pending Approval, Rejected),
        // just show the message the backend sent.
        else {
          alert(message);
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

        <button className="register-button" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}

export default WorkerLogin;
