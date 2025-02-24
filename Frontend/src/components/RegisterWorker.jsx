import { useState } from "react";
import { useNavigate } from "react-router-dom";

const WorkerRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
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
      const response = await fetch("http://localhost:5000/api/auth/register-worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Worker registered successfully!");
        navigate("/worker-login");
      } else {
        alert(data.message || "Registration failed");
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
        <input type="text" name="name" placeholder="Name" value={formData.name} required onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" value={formData.password} required onChange={handleChange} />
        <input type="text" name="service" placeholder="Service (e.g., Plumber, Electrician)" value={formData.service} required onChange={handleChange} />
        <input type="text" name="location" placeholder="Location"  value={formData.location} required onChange={handleChange} />
        <input type="text" name="description" placeholder="Service Description" value={formData.description} required onChange={handleChange} />
        <input type="text" name="phone" placeholder="Phone Number"  value={formData.phone} required onChange={handleChange} />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default WorkerRegister;
