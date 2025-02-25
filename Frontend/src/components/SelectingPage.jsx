import { Link } from "react-router-dom";
//for selecting user or worker
function SelectingPage() {
  return (
    <div>
      <h2>Select User Type</h2>
      <Link to="/user/register"><button>USER</button></Link>
      <Link to="/worker/register"><button>WORKER</button></Link>
    </div>
  );
}

export default SelectingPage;
