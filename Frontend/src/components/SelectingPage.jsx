import { Link } from "react-router-dom";
function SelectingPage() {
  return (
  <div className="p-s">
    <div className="select-container">
      <h2 className="select-title">Select User Type</h2>
      <div className="select-buttons">
        <Link to="/user/register">
          <button className="select-button user-button">USER</button>
        </Link>
        <Link to="/worker/register">
          <button className="select-button worker-button">WORKER</button>
        </Link>
      </div>
    </div>
</div>

  );
}

export default SelectingPage;
