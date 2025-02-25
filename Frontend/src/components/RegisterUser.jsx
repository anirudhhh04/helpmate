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
      const response=await axios.post("http://localhost:4000/api/user/register", { username,email, password });
     
      n("/user/login");
    } catch (err) {
      alert("Registration failed!");
    }
  };

  return (
    <div>
      <h2>Register as a User</h2>
      <input type="text" placeholder="username" onChange={(e) => setUsername(e.target.value)} />
      <input type="email" placeholder="email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
      <p> Already Registered? <Link style={{color:"blue"}} to="/user/login">Login</Link></p>
    </div>
  );
}

export default RegisterUser;
