import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

function StudentChallanPage() {
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const res = await api.get("/api/transport-registrations/");
        const data = res.data;
        if (Array.isArray(data)) {
        // plain list: []
        setRegistration(data.length > 0 ? data[0] : null);
        } else if (data?.results) {
        // paginated: { count, results: [] }
        setRegistration(data.results.length > 0 ? data.results[0] : null);
        } else if (data?.id) {
        // single object
        setRegistration(data);
        } else {
        setRegistration(null);
        }
      } catch (err) {
        console.error(err);
        setRegistration(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistration();
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="student" />
      <div style={{ flex: 1 }}>
        <Navbar title="Student — My Challan" />
        <div style={{ padding: "24px", maxWidth: "900px" }}>
          <h2>My Transport Details</h2>

          {loading && <p style={{ color: "#6b7280", fontSize: "14px" }}>Loading...</p>}

          {!loading && !registration && (
            <p style={{ color: "#6b7280", fontSize: "14px" }}>
              No transport registration found.
            </p>
          )}

          {!loading && registration && (
            <>
                <div style={detailsStyle}>
                <DetailRow label="Route"     value={registration.route_name} />
                <DetailRow label="Stop"      value={registration.stop_name} />
                <DetailRow label="Semester"  value={registration.semester_name} />
                <DetailRow label="Status"    value={registration.status} />
                </div>
                <button
                style={btnStyle}
                onClick={() => navigate(`/student/challan/${registration.id}`)}
                >
                View Challan
                </button>
            </>
            )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={rowStyle}>
      <span style={{ color: "#6b7280", fontSize: "14px" }}>{label}</span>
      <span style={{ fontSize: "14px", fontWeight: "500" }}>{value || "—"}</span>
    </div>
  );
}

const detailsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  marginBottom: "20px",
};

const rowStyle = {
  display: "flex",
  gap: "12px",
  padding: "8px 0",
  borderBottom: "1px solid #f0f0f0",
};

const btnStyle = { padding: "8px 16px" };

export default StudentChallanPage;