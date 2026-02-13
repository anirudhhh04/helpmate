import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  FaUser,
  FaTools,
  FaEnvelope,
  FaLock,
  FaMapMarkerAlt,
  FaPhone,
  FaFileAlt,
  FaCaretDown,
} from "react-icons/fa";

/* ---------- Service → Required Documents Mapping ---------- */
const serviceDocuments = {
  doctor: [
    { name: "license", label: "Medical License" },
    { name: "degree", label: "Medical Degree Certificate" },
  ],
  engineer: [
    { name: "degree", label: "Engineering Degree" },
    { name: "portfolio", label: "Work Portfolio / Proof" },
  ],
  plumber: [{ name: "tradeCert", label: "Trade Certificate" }],
  electrician: [{ name: "electricalLicense", label: "Electrical License" }],
};

const RegisterWorker = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    service: "",
    location: "",
    description: "",
    phone: "",
  });

  const [documents, setDocuments] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "service") setDocuments({});
  };

  const handleFileChange = (e) => {
    setDocuments({ ...documents, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation logic here (omitted for brevity, same as before)

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      (serviceDocuments[formData.service] || []).forEach((doc) => {
        if (documents[doc.name]) data.append(doc.name, documents[doc.name]);
      });

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}
/api/worker/register`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (response.data.success) {
        alert("Registration submitted. Await admin verification.");
        navigate("/worker/login");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Registration failed.");
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="p-s" style={styles.pageContainer}>
      <div style={styles.glassCard}>
        <h2 style={styles.title}>Worker Registration</h2>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* ROW 1: Username & Password */}
          <div style={styles.row}>
            <Input
              icon={<FaUser />}
              name="username"
              placeholder="Name (as per Certificate)"
              value={formData.username}
              onChange={handleChange}
            />
            <Input
              icon={<FaLock />}
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* ROW 2: Email & Phone */}
          <div style={styles.row}>
            <Input
              icon={<FaEnvelope />}
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              icon={<FaPhone />}
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* ROW 3: Service & Location */}
          <div style={styles.row}>
            {/* Service Dropdown */}
            <div style={{ ...styles.inputWrapper, flex: 1 }}>
              <span style={styles.iconWrapper}>
                <FaTools />
              </span>
              <select
                style={{ ...styles.inputField, ...styles.selectField }}
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Service
                </option>
                <option value="doctor">Doctor</option>
                <option value="engineer">Engineer</option>
                <option value="plumber">Plumber</option>
                <option value="electrician">Electrician</option>
              </select>
              <FaCaretDown style={styles.arrowIcon} />
            </div>

            <Input
              icon={<FaMapMarkerAlt />}
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          {/* ROW 4: Description (Full Width) */}
          <div style={styles.inputWrapper}>
            <span style={styles.iconWrapper}>
              <FaTools />
            </span>
            <input
              style={styles.inputField}
              name="description"
              placeholder="Description of your skills..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Dynamic Documents (Compact) */}
          {serviceDocuments[formData.service]?.map((doc) => (
            <div key={doc.name} style={{ marginBottom: "10px" }}>
              <label style={styles.fileLabel}>Upload {doc.label}</label>
              <div style={styles.inputWrapper}>
                <span style={styles.iconWrapper}>
                  <FaFileAlt />
                </span>
                <input
                  style={{ ...styles.inputField, paddingTop: "10px" }}
                  type="file"
                  name={doc.name}
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  required
                />
              </div>
            </div>
          ))}

          <button style={styles.submitBtn} className="submit-animated" type="submit">
            Register
          </button>
        </form>

        <p style={styles.footerText}>
          Already Registered?{" "}
          <Link
            to="/worker/login"
            style={{ color: "#fff", fontWeight: "bold" }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

/* ---------- Reusable Input Component ---------- */
const Input = ({ icon, ...props }) => (
  <div style={{ ...styles.inputWrapper, flex: 1 }}>
    <span style={styles.iconWrapper}>{icon}</span>
    <input style={styles.inputField} {...props} required />
  </div>
);

/* ---------- Styles ---------- */
const styles = {
  pageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100%",
    // Background handled by .p-s class in CSS
  },
  glassCard: {
    background: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: "16px",
    padding: "30px", // Reduced padding
    width: "100%",
    maxWidth: "500px", // Increased width slightly to fit 2 columns
    color: "#fff",
    boxSizing: "border-box",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px", // Reduced margin
    color: "#080707",
    fontSize: "24px",
    fontWeight: "bold",
    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },
  // New Row Style
  row: {
    display: "flex",
    gap: "15px",
    marginBottom: "0px", // Spacing handled by inputWrapper
  },
  inputWrapper: {
    position: "relative",
    marginBottom: "15px",
    width: "100%",
  },
  iconWrapper: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#555",
    zIndex: 1,
    pointerEvents: "none",
  },
  inputField: {
    width: "100%",
    padding: "10px 10px 10px 35px", // Compact padding
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    background: "rgba(255, 255, 255, 0.9)",
    color: "#333",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
  },
  selectField: {
    appearance: "none",
    cursor: "pointer",
  },
  arrowIcon: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#555",
    pointerEvents: "none",
  },
  fileLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#fff",
    marginBottom: "4px",
    display: "block",
    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
  },
  submitBtn: {
  width: "220px",
  height: "50px",
  alignSelf: "center",           // 🔥 centers inside flex container
  display: "block",
  margin: "20px auto 0 auto",    // 🔥 centers horizontally
  borderRadius: "40px",
  textTransform: "uppercase",
  letterSpacing: "2px",
  fontSize: "16px",
  fontWeight: "bold",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  background: "linear-gradient(90deg, #03a9f4, #d21872, #ffeb3b, #03a9f4)",
  backgroundSize: "400%",
  transition: "all 0.3s ease-in-out",
}
,
  footerText: {
    textAlign: "center",
    marginTop: "15px",
    fontSize: "14px",
    color: "#131212",
  },
};

export default RegisterWorker;
