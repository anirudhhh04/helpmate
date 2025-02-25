import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function RegisterUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const n = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:4000/api/user/register", { username, email, password });
      n("/user/login");
    } catch (err) {
      alert("Registration failed!");
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Register as a User</h2>
      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
        className="register-input"
      />
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        className="register-input"
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        className="register-input"
      />
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
  );
}

export default RegisterUser;
