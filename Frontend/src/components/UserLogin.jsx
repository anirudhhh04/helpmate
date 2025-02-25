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
      if(response.data.success){
        localStorage.setItem("userToken", response.data.token);
        navigate("/user/dashboard");
      }else{
        if(response.data.message=="user not registerd") navigate("/user/register");
        if(response.data.message=="invalid email or password") alert("invalid email or password");
      }
     
     
    } catch (err) {
      alert("Login failed!");
    }
  };

  return (
    <div>
      <h2>User Login</h2>
      <input type="text" placeholder="email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
     
    </div>
  );
}

export default UserLogin;
