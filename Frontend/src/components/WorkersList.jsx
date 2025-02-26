import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function WorkersList() {
  const { location, service } = useParams();
  const [workers, setWorkers] = useState([]);
  const n = useNavigate();

  useEffect(() => {
        const fetchWorkers = async () => {
        try {
             const response = await axios.get(`http://localhost:4000/api/worker/${location}/${service}`);
             setWorkers(response.data);
            } catch (error) {
             alert("No workers found for this service!");
            }
        };
        if (location && service) {
            fetchWorkers();
        }
        }, [location, service]);
  return (
    <div>
      <h2>Workers Offering {service} in {location}</h2>
      {workers.map((worker,index) => (
        <div key={index}>
          <h3>{worker.username}</h3>
          <p>{worker.description}</p>
          <p>📞 Contact: {worker.contactNumber}</p>
          <button onClick={() => navigate(`/worker/${worker.wid}/slots`)}>View Available Slots</button>
        </div>
      ))}
    </div>
  );
}

export default WorkersList;
