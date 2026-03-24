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
        const d = res.data;

        console.log("DASHBOARD DATA:", d);

        if (d.role === "staff") {
          navigate("/admin/dashboard", { replace: true });
          return;
        }

        setData(d);
      })
      .catch(() => setError("Failed to load dashboard data."));
  }, [navigate]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return <p>Loading...</p>;

  const {
    profile,
    recent_notifications,
    active_registration,
    seat,
    waitlist_position,
  } = data;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="student" />

      <div style={{ flex: 1 }}>
        <Navbar title="Student Dashboard" />

        <div style={{ padding: "24px", maxWidth: "800px" }}>
          <h1>Welcome, {profile.roll_number}</h1>

          {/* PROFILE */}
          <section style={cardStyle}>
            <h2>My Profile</h2>
            <p><strong>Roll No:</strong> {profile.roll_number}</p>
            <p><strong>Department:</strong> {profile.department}</p>
            <p><strong>Batch:</strong> {profile.batch}</p>
            <p><strong>Phone:</strong> {profile.phone}</p>
            <p><strong>Address:</strong> {profile.address}</p>
          </section>

          {/* NOTIFICATIONS */}
          <section style={cardStyle}>
            <h2>Notifications</h2>

            {recent_notifications?.length > 0 ? (
              <ul style={{ paddingLeft: "1rem" }}>
                {recent_notifications.map((n, i) => (
                  <li
                    key={i}
                    style={{
                      marginBottom: "8px",
                      opacity: n.is_read ? 0.6 : 1,
                    }}
                  >
                    <strong>{n.title}</strong>: {n.message}
                    {!n.is_read && (
                      <span style={{ color: "blue", marginLeft: "8px" }}>
                        (New)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No notifications.</p>
            )}
          </section>

          {/* TRANSPORT STATUS */}
          <section style={cardStyle}>
            <h2>Transport Status</h2>

            {active_registration ? (
              <>
                <p>
                  <strong>Route:</strong>{" "}
                  {active_registration.route}
                </p>
                <p>
                  <strong>Stop:</strong>{" "}
                  {active_registration.stop}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {active_registration.status}
                </p>

                <hr style={{ margin: "12px 0" }} />

                {seat ? (
                  <div style={{ color: "green", fontWeight: "bold" }}>
                    Seat Allocated: #{seat.seat_number}
                  </div>
                ) : waitlist_position ? (
                  <div style={{ color: "orange", fontWeight: "bold" }}>
                    Waitlist Position: {waitlist_position}
                  </div>
                ) : (
                  <div style={{ color: "gray" }}>
                    Pending allocation...
                  </div>
                )}
              </>
            ) : (
              <p>No active transport registration.</p>
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