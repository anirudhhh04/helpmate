import {useState} from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
function StartPage(){
    const [location, setLocation] = useState("");
    const [services, setServices] = useState([]);
    const n=useNavigate();
    const fetchServices = async () => {
        if (!location.trim()) {
          alert("Please enter a location!");
          return;             }

        try {
          const response = await axios.get(`http://localhost:5000/api/workers?location=${location}`);
          setServices(response.data);  } 
        catch (error) {
          alert("Error fetching services");
          setServices([]);
        }
        };
        const handle= () => {
            const isLoggedIn = localStorage.getItem("isLoggedIn");
            if (isLoggedIn) {
                n("/user/dashboard"); 
            } else {
                alert("Please log in to book the service.");
                n("/selectpage"); 
            }
        };
        const nalogin=()=>{
               n("/user/login");
        }
        const walogin=()=>{
          n("/worker/login");
   }
      return (
        <div>
    
          <h2>Helpmate</h2>
          <div >
            <input type="text"  placeholder="Enter Location"  value={location}  onChange={(e) => setLocation(e.target.value)}/>
            <button onClick={fetchServices}>🔍 Search</button>
          </div>
          <button onClick={()=>nalogin()}> User Login</button>
          <button onClick={()=>walogin()}> Worker Login</button>

          {services.length > 0 ? (
            services.map((worker) => (
              <div key={worker.wid} style={styles.workerCard}>
                <p><strong>{worker.service}</strong> - {worker.name}</p>
                <button onClick={handle} >Book Now</button>
              </div> )) ) : ( <p style={{ marginTop: "20px" }}>No services found.</p> )}
        </div>
      );
    
    


}
export default StartPage;