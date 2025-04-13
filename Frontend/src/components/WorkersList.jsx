import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function WorkersList() {
  const { location, service } = useParams();
  const [workers, setWorkers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/worker/${location}/${service}`
        );
        if (Array.isArray(response.data)) {
          setWorkers(response.data.filter(worker => worker)); 
        } else {
          setWorkers([]);
        }
      } catch (error) {
        alert("No workers found for this service!");
      }
    };

    if (location && service) {
      fetchWorkers();
    }
  }, [location, service]);

  return (
    <div className="container">
      <h2 className="title">
        Available {service}s in {location}
      </h2>

      {workers.length === 0 ? (
        <p className="no-workers">No workers found.</p>
      ) : (
        <div className="workers-grid">
          {workers.map((worker, index) => (
            <div
              key={index}
              className="worker-card"
              onClick={() => navigate(`/worker/slots/${worker._id.toString()}`)}
            >
              <div className="worker-info">
                <div className="worker-text">
                  <h3>{worker.username}</h3>
                  <p className="description">{worker.description}</p>
                  <p className="contact">📞 {worker.contactNumber}</p>
                </div>
                <div className="worker-photo">
                  <img src={worker.imageurl ? "http://localhost:4000/"+worker.imageurl:"http://localhost:4000/images/profilelogo.png"} alt={worker.username} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkersList;
