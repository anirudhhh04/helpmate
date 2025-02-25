import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
const WorkerRegister = () => {
  const [formData, setFormData] = useState({
    username: "",
    email:"",
    password: "",
    service: "",
    location: "",
    description: "",
    phone: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if(formData.username &&  formData.email && formData.password && formData.service && formData.location && formData.description && formData.phone){
        const response = await axios.post("http://localhost:4000/api/worker/register", formData);
  
        console.log(response);
        if (response.data.success) {
        
          navigate("/worker/login");}
            
        
      }else{
        alert("please enter all fields");
      }
     
      
    } catch (error) {
      console.error("Error registering worker:", error);
      alert("Something went wrong. Try again");
    }
  };

  return (
    <div>
      <h2>Worker Registration</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="username" value={formData.username} required onChange={handleChange} />
        <input type="email" name="email" placeholder="email" value={formData.email} required onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" value={formData.password} required onChange={handleChange} />
        <input type="text" name="service" placeholder="Service (e.g., Plumber, Electrician)" value={formData.service} required onChange={handleChange} />
        <input type="text" name="location" placeholder="Location"  value={formData.location} required onChange={handleChange} />
        <input type="text" name="description" placeholder="Service Description" value={formData.description} required onChange={handleChange} />
        <input type="text" name="phone" placeholder="Phone Number"  value={formData.phone} required onChange={handleChange} />
        <button type="submit">Register</button>
      </form>
      <p> Already Registered? <Link style={{color:"blue"}} to="worker/login">Login</Link></p>
    </div>
  );
};

export default WorkerRegister;
