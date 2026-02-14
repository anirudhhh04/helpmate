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
  style={{
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none",
  }}
  onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
  onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
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
    minHeight: "100vh",
    width: "100%",
    padding: "40px 20px",
    background: "#f3f4f6",
  },

  glassCard: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "35px",
    width: "100%",
    maxWidth: "720px",   // Wider for 2 columns
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    boxSizing: "border-box",
    overflow:"hidden",
  },

  title: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#111827",
    fontSize: "24px",
    fontWeight: "600",
  },

  row: {
    display: "flex",
    gap: "18px",
    marginBottom: "5px",
    flexWrap: "wrap", // 🔥 allows mobile stacking
    width:"100%",
  },

  inputWrapper: {
    position: "relative",
    marginBottom: "18px",
    flex: "1 1 300px",
    minWidth: "0", // 🔥 ensures clean wrapping on smaller screens
  },

  iconWrapper: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#6b7280",
    fontSize: "16px",
    pointerEvents: "none",
  },

  inputField: {
    width: "100%",
    padding: "12px 14px 12px 42px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    background: "#fff",
    transition: "border 0.2s ease",
  },

  selectField: {
    appearance: "none",
    cursor: "pointer",
  },

  arrowIcon: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#6b7280",
    pointerEvents: "none",
  },

  fileLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px",
    display: "block",
  },

  submitBtn: {
    width: "220px",
    height: "50px",
    display: "block",
    margin: "25px auto 0 auto",
    borderRadius: "40px",
    textTransform: "uppercase",
    letterSpacing: "2px",
    fontSize: "15px",
    fontWeight: "bold",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(90deg, #03a9f4, #d21872, #ffeb3b, #03a9f4)",
    backgroundSize: "400%",
    transition: "all 0.3s ease-in-out",
  },

  footerText: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "14px",
    color: "#374151",
  },
};


export default RegisterWorker;
