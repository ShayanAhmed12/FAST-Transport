import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import {
  getStops,
  getSemesters,
  createRegistration,
} from "../../services/transportService";

function TransportRegistration() {
  const [semesters, setSemesters] = useState([]);
  const [stops, setStops] = useState([]);

  const [selectedStop, setSelectedStop] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const semestersRes = await getSemesters();
        const stopsRes = await getStops();

        setStops(stopsRes.data);
        setSemesters(semestersRes.data);
      } catch (err) {
        alert("Failed to load data");
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStop || !selectedSemester) {
      setMessage("Please select both semester and stop");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await createRegistration({
      stop_id: selectedStop,
      semester_id: selectedSemester,
    });

      setMessage("Registration submitted successfully!");
    } catch (err) {
      console.error(err);
      console.error("FULL ERROR:", err.response?.data);
      setMessage("Failed to submit registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="student" />

      <div style={{ flex: 1 }}>
        <Navbar title="Student — Transport Registration" />

        <div style={{ padding: "24px" }}>
          
          {/* ── Top Bar ── */}
          <div style={topBarStyle}>
            <h2 style={{ margin: 0 }}>Register for Transport</h2>
          </div>

          {/* ── Form Card ── */}
          <div style={cardStyle}>
            <form onSubmit={handleSubmit}>
              
              {/* Semester Selection */}
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Select Semester</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Choose a semester</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stop Selection */}
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Select Stop</label>
                <select
                  value={selectedStop}
                  onChange={(e) => setSelectedStop(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Choose a stop</option>
                  {stops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                style={buttonStyle}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Registration"}
              </button>
            </form>

            {/* Message */}
            {message && (
              <p style={{ marginTop: "12px", fontSize: "14px" }}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransportRegistration;

//
// ───────────── STYLES (match your app) ─────────────
//

const topBarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "16px",
};

const cardStyle = {
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  background: "#fff",
  maxWidth: "500px",
};

const fieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  marginBottom: "16px",
};

const labelStyle = {
  fontSize: "14px",
  marginBottom: "6px",
  color: "#555",
};

const inputStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px",
};

const buttonStyle = {
  marginTop: "10px",
  padding: "10px 16px",
  background: "#4f46e5",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
};