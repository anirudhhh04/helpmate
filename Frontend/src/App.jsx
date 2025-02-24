import {  Route, Routes } from "react-router-dom";
import SelectingPage from "./components/SelectingPage.jsx";
import UserLogin from "./components/UserLogin.jsx";
import WorkerLogin from "./components/WorkerLogin.jsx";
import RegisterUser from "./components/RegisterUser.jsx";
import RegisterWorker from "./components/RegisterWorker.jsx";
import WorkerDashboard from "./components/WorkerDashboard.jsx";
import UserDashboard from "./components/UserDashboard.jsx";
import ServiceList from "./components/ServiceList.jsx";
import WorkerSlots from "./components/WorkerSlots.jsx";
import WorkerBookings from "./components/WorkerBookings.jsx";
import StartPage from "./components/StartPage.jsx";

function App() {
  return (
      <Routes>
        <Route path="/" element={<StartPage/>}/>
        <Route path="/selectpage" element={<SelectingPage />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/worker/login" element={<WorkerLogin />} />
        <Route path="/user/register" element={<RegisterUser />} />
        <Route path="/worker/register" element={<RegisterWorker />} />
        <Route path="/worker/dashboard" element={<WorkerDashboard />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/services/:location/:service" element={<ServiceList />} />
        <Route path="/worker/:workerId/slots" element={<WorkerSlots />} />
        <Route path="/worker/bookings" element={<WorkerBookings/>}/>
      </Routes>
 
  );
}

export default App;
