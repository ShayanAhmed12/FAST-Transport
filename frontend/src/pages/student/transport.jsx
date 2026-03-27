import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getDashboard } from "../../services/transportService";

function StatusBadge({ status }) {
  const colors = {
    Pending: "#f0ad4e",
    Approved: "#5cb85c",
    Rejected: "#d9534f",
    Active: "#5cb85c",
  };
  return (
    <span
      style={{
        background: colors[status] || "#aaa",
        color: "#fff",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "0.85em",
      }}
    >
      {status}
    </span>
  );
}

function StudentTransport() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const pendingAssignmentMessage = "Fees paid; Admin will assign seats shortly.";
  const unpaidRegistrationMessage = "Registration submitted. Please pay transport fee to proceed.";

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load transport data."));
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return <p>Loading...</p>;

  const { profile, active_registration, seat, waitlist_position, fee_summary } = data;
  const normalizedStatus = (active_registration?.status || "").toLowerCase();
  const hasSubmittedFee = Boolean(active_registration?.fee_submitted);
  const shouldShowPendingAssignmentStatus =
    !seat && hasSubmittedFee && ["pending", "approved", "payment_submitted"].includes(normalizedStatus);
  const displayStatus = shouldShowPendingAssignmentStatus
    ? pendingAssignmentMessage
    : active_registration?.status;
  const hasFullAssignment = Boolean(
    profile && seat && active_registration?.route && active_registration?.bus
  );

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="student" />
      <div style={{ flex: 1 }}>
        <Navbar title="My Transport" />
        <div style={{ padding: "24px", maxWidth: "800px" }}>
          <h1>My Transport</h1>

          <section style={cardStyle}>
            <h2>Current Semester Registration</h2>
            {active_registration ? (
              <>
                <p><strong>Semester:</strong> {active_registration.semester}</p>
                <p><strong>Bus:</strong> {active_registration.bus || "Pending assignment"}</p>
                <p><strong>Route:</strong> {active_registration.route}</p>
                <p><strong>Stop:</strong> {active_registration.stop}</p>
                <p><strong>Status:</strong> <StatusBadge status={displayStatus} /></p>
                {!seat && !waitlist_position && !hasSubmittedFee && (
                  <p style={{ color: "#856404" }}>{unpaidRegistrationMessage}</p>
                )}
                {seat && <p><strong>Seat Number:</strong> {seat.seat_number}</p>}
                {waitlist_position && <p><strong>Waitlist Position:</strong> #{waitlist_position}</p>}
                {hasFullAssignment && (
                  <>
                    <hr style={{ margin: "12px 0" }} />
                    <h3 style={{ marginBottom: "8px" }}>Student Details</h3>
                    <p><strong>Roll No:</strong> {profile.roll_number}</p>
                    <p><strong>Department:</strong> {profile.department}</p>
                    <p><strong>Batch:</strong> {profile.batch}</p>
                  </>
                )}
              </>
            ) : (
              <p>{unpaidRegistrationMessage}</p>
            )}
          </section>

          <section style={cardStyle}>
            <h2>Fee Summary</h2>
            {fee_summary?.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Semester</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Challan #</th>
                    <th style={thStyle}>Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {fee_summary.map((f, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{f.semester}</td>
                      <td style={tdStyle}>Rs. {f.amount}</td>
                      <td style={tdStyle}>{f.challan_number}</td>
                      <td style={tdStyle}>{f.is_verified ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No fee records found.</p>
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

const thStyle = { background: "#f5f5f5", textAlign: "left", padding: "8px", border: "1px solid #ddd" };
const tdStyle = { padding: "8px", border: "1px solid #ddd" };

export default StudentTransport;
