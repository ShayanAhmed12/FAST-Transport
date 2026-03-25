import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import {
  getStops,
  getSemesters,
  createRegistration,
  getRegistration,
} from "../../services/transportService";

function TransportRegistration() {
  const [registration, setRegistration] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [semestersRes, stopsRes, regRes] = await Promise.all([
          getSemesters(),
          getStops(),
          getRegistration(),
        ]);
        setSemesters(semestersRes.data);
        setStops(stopsRes.data);
        setRegistration(regRes.data?.length > 0 ? regRes.data[0] : null);
      } catch {
        alert("Failed to load data");
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStop || !selectedSemester) {
      setMessage("Please select both semester and stop.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await createRegistration({ stop_id: selectedStop, semester_id: selectedSemester });
      const regRes = await getRegistration();
      setRegistration(regRes.data[0]);
      setMessage("Registration submitted successfully!");
    } catch (err) {
      console.error("FULL ERROR:", err.response?.data);
      setMessage("Failed to submit registration.");
    } finally {
      setLoading(false);
    }
  };

  const status = registration?.status?.toLowerCase();

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="student" />
      <div style={{ flex: 1 }}>
        <Navbar title="Student — Transport Registration" />
        <div style={{ padding: "24px", maxWidth: "900px" }}>
          <h2>Transport Registration</h2>

          {/* ── Status banners ── */}
          {status === "pending" && (
            <div style={bannerStyle("#fff3cd", "#ffeeba")}>
              <strong>Registration Pending</strong> — Please pay the transport fee and wait for
              admin verification.
              <br />
              <span style={{ fontSize: "13px", color: "#856404" }}>
                Pay via bank transfer using your challan number. Your seat will be confirmed after
                admin review.
              </span>
              <div>
                <button
                  style={{ ...btnStyle, marginTop: "10px" }}
                  onClick={() => navigate(`/student/challan/${registration.id}`)}
                >
                  Pay Fee (View Challan)
                </button>
              </div>
            </div>
          )}

          {status === "approved" && (
            <div style={bannerStyle("#d4edda", "#c3e6cb")}>
              <strong>Approved</strong> — Your transport registration has been confirmed.
            </div>
          )}

          {/* ── Registration form ── */}
          {!registration && (
            <>
              <form onSubmit={handleSubmit} style={formStyle}>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select Semester</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStop}
                  onChange={(e) => setSelectedStop(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select Stop</option>
                  {stops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...btnStyle, alignSelf: "flex-start" }}
                >
                  {loading ? "Submitting..." : "Submit Registration"}
                </button>
              </form>

              {message && <p style={{ fontSize: "14px", color: "#555" }}>{message}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Styles ──
const formStyle = {
  marginBottom: "20px",
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  alignItems: "flex-start",
};

const inputStyle = { flex: "1 1 180px", padding: "8px" };

const btnStyle = { padding: "8px 16px" };

const bannerStyle = (bg, border) => ({
  background: bg,
  border: `1px solid ${border}`,
  borderRadius: "6px",
  padding: "12px 16px",
  marginBottom: "20px",
  lineHeight: "1.6",
});

export default TransportRegistration;