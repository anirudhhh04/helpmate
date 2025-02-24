import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UserLogin() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/users/login", { name, password });
      localStorage.setItem("userToken", response.data.token);
      navigate("/user/dashboard");
    } catch (err) {
      alert("Login failed!");
    }
  };

  return (
    <div>
      <h2>User Login</h2>
      <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <button onClick={() => navigate("/user/register")}>Register</button>
    </div>
  );
}

export default UserLogin;
