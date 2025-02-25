import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:4000/api/user/login", { email, password });
      if (response.data.success) {
        localStorage.setItem("userToken", response.data.token);
        navigate("/user/dashboard");
      } else {
        if (response.data.message === "user not registerd") navigate("/user/register");
        if (response.data.message === "invalid email or password") alert("Invalid email or password");
      }
    } catch (err) {
      alert("Login failed!");
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">User Login</h2>
      <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="register-input" />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="register-input" />
      <button onClick={handleLogin} className="register-button">Login</button>
    </div>
  );
}

export default UserLogin;
