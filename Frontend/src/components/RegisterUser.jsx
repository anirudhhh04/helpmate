import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RegisterUser() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const n = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:5000/api/users/register", { name, password });
      alert("Registration successful!, Please log in.");
      n("/user/login");
    } catch (err) {
      alert("Registration failed!");
    }
  };

  return (
    <div>
      <h2>Register as a User</h2>
      <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default RegisterUser;
