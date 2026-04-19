import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getDashboard } from "../../services/transportService";

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load dashboard data."));
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return <p>Loading...</p>;

  const { stats } = data;

  const statCards = [
    { label: "Total Students",        value: stats.total_students,            color: "#4a90d9", path: "/admin/students" },
    { label: "Active Buses",           value: stats.active_buses,              color: "#5cb85c", path: "/admin/buses" },
    { label: "Active Routes",          value: stats.active_routes,             color: "#5bc0de", path: "/admin/routes" },
    { label: "Route Assignments",      value: stats.active_route_assignments,  color: "#9b59b6", path: "/admin/assignments" },
    { label: "Pending Complaints",     value: stats.pending_complaints,        color: "#e67e22", path: "/admin/complaints" },
    { label: "Route Change Requests",  value: stats.open_route_change_requests, color: "#e74c3c", path: "/admin/routechangerequests" }, // ✅
    { label: "Unverified Fees",        value: stats.unverified_fees,           color: "#f0ad4e", path: "/admin/feeverifications" },
    { label: "Pending Maintenance",    value: stats.pending_maintenance,       color: "#c0392b", path: "/admin/maintenance" },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="staff" />
      <div style={{ flex: 1 }}>
        <Navbar title="Admin Dashboard" />
        <div style={{ padding: "24px" }}>
          <h1>Staff Dashboard</h1>
          <p style={{ color: "#666" }}>Overview of the transport system</p>
          <div style={gridStyle}>
            {statCards.map((card, i) => (
              <StatCard
                key={i}
                label={card.label}
                value={card.value}
                color={card.color}
                onClick={() => navigate(card.path)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, onClick }) {
  return (
    <div onClick={onClick} style={{ ...cardStyle, borderTop: `4px solid ${color}`, cursor: "pointer" }}>
      <div style={{ fontSize: "2.2rem", fontWeight: "bold", color }}>{value}</div>
      <div style={{ marginTop: "6px", color: "#555", fontSize: "0.95rem" }}>{label}</div>
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: "16px",
  marginTop: "24px",
};

const cardStyle = {
  background: "#fff",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  padding: "20px 16px",
  textAlign: "center",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

export default AdminDashboard;