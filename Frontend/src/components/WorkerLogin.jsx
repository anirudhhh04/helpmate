import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function WorkerLogin() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/workers/login", { name, password });
      localStorage.setItem("workerToken", response.data.token);
      navigate("/worker/dashboard");
    }catch (err) {
      alert("Login failed!");
    }
  };

  return (
    <div>
      <h2>Worker Login</h2>
      <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <button onClick={() => navigate("/worker/register")}>Register</button>
    </div>
  );
}

export default WorkerLogin;
