import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/dashboard/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.clear();
          navigate("/login");
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setData(json);
      })
      .catch(() => setError("Failed to load dashboard data."));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return <p>Loading...</p>;
  if (data.role === "staff") {
    navigate("/staff-dashboard", { replace: true });
    return null;
  }

  const { profile, active_registration, seat, waitlist_position, fee_summary, recent_complaints, recent_notifications } = data;

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Student Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Profile */}
      <section style={cardStyle}>
        <h2>My Profile</h2>
        <p><strong>Roll No:</strong> {profile.roll_number}</p>
        <p><strong>Department:</strong> {profile.department}</p>
        <p><strong>Batch:</strong> {profile.batch}</p>
        <p><strong>Phone:</strong> {profile.phone}</p>
        <p><strong>Address:</strong> {profile.address}</p>
      </section>

      {/* Active Registration */}
      <section style={cardStyle}>
        <h2>Current Semester Registration</h2>
        {active_registration ? (
          <>
            <p><strong>Semester:</strong> {active_registration.semester}</p>
            <p><strong>Route:</strong> {active_registration.route}</p>
            <p><strong>Stop:</strong> {active_registration.stop}</p>
            <p><strong>Status:</strong> <StatusBadge status={active_registration.status} /></p>
            {seat && (
              <p><strong>Seat Number:</strong> {seat.seat_number}</p>
            )}
            {waitlist_position && (
              <p><strong>Waitlist Position:</strong> #{waitlist_position}</p>
            )}
          </>
        ) : (
          <p>No active registration found.</p>
        )}
      </section>

      {/* Fee Summary */}
      <section style={cardStyle}>
        <h2>Fee Summary</h2>
        {fee_summary.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={thStyle}>
                <th>Semester</th>
                <th>Amount</th>
                <th>Challan #</th>
                <th>Verified</th>
              </tr>
            </thead>
            <tbody>
              {fee_summary.map((f, i) => (
                <tr key={i} style={trStyle(i)}>
                  <td>{f.semester}</td>
                  <td>Rs. {f.amount}</td>
                  <td>{f.challan_number}</td>
                  <td>{f.is_verified ? " Yes" : " No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No fee records found.</p>
        )}
      </section>

      {/* Recent Complaints */}
      <section style={cardStyle}>
        <h2>Recent Complaints</h2>
        {recent_complaints.length > 0 ? (
          <ul style={{ paddingLeft: "1rem" }}>
            {recent_complaints.map((c, i) => (
              <li key={i} style={{ marginBottom: "8px" }}>
                <strong>{c.subject}</strong> — <StatusBadge status={c.status} /> | Priority: {c.priority}
              </li>
            ))}
          </ul>
        ) : (
          <p>No complaints submitted.</p>
        )}
      </section>

      {/* Notifications */}
      <section style={cardStyle}>
        <h2>Notifications</h2>
        {recent_notifications.length > 0 ? (
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
  );
}

function StatusBadge({ status }) {
  const colors = {
    Pending: "#f0ad4e",
    Approved: "#5cb85c",
    Rejected: "#d9534f",
    Active: "#5cb85c",
  };
  return (
    <span style={{
      background: colors[status] || "#aaa",
      color: "#fff",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "0.85em",
    }}>
      {status}
    </span>
  );
}

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "20px",
};

const thStyle = {
  background: "#f5f5f5",
  textAlign: "left",
  padding: "8px",
};

const trStyle = (i) => ({
  background: i % 2 === 0 ? "#fff" : "#fafafa",
  padding: "6px",
});

export default StudentDashboard;
