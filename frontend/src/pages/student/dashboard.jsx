import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getDashboard } from "../../services/transportService";

function StudentDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then((res) => {
        if (res.data.role === "staff") {
          navigate("/admin/dashboard", { replace: true });
          return;
        }
        setData(res.data);
      })
      .catch(() => setError("Failed to load dashboard data."));
  }, [navigate]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return <p>Loading...</p>;

  const { profile, recent_notifications } = data;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="student" />
      <div style={{ flex: 1 }}>
        <Navbar title="Student Dashboard" />
        <div style={{ padding: "24px", maxWidth: "800px" }}>
          <h1>Welcome, {profile.roll_number}</h1>

          <section style={cardStyle}>
            <h2>My Profile</h2>
            <p><strong>Roll No:</strong> {profile.roll_number}</p>
            <p><strong>Department:</strong> {profile.department}</p>
            <p><strong>Batch:</strong> {profile.batch}</p>
            <p><strong>Phone:</strong> {profile.phone}</p>
            <p><strong>Address:</strong> {profile.address}</p>
          </section>

          <section style={cardStyle}>
            <h2>Notifications</h2>
            {recent_notifications?.length > 0 ? (
              <ul style={{ paddingLeft: "1rem" }}>
                {recent_notifications.map((n, i) => (
                  <li key={i} style={{ marginBottom: "8px", opacity: n.is_read ? 0.6 : 1 }}>
                    <strong>{n.title}</strong>: {n.message}
                    {!n.is_read && <span style={{ color: "blue", marginLeft: "8px" }}>(New)</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No notifications.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "20px",
};

export default StudentDashboard;
