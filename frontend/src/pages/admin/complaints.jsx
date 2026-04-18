import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import { getComplaints, resolveComplaint } from "../../services/transportService";

function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [responses, setResponses] = useState({});
  const [resolvingId, setResolvingId] = useState(null);

  const fetchComplaints = () =>
    getComplaints()
      .then((res) => setComplaints(res.data))
      .catch(() => alert("Failed to fetch complaints."));

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResponseChange = (id, value) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  const handleResolve = async (id) => {
    const adminResponse = (responses[id] || "").trim();

    if (!adminResponse) {
      alert("Please add an admin response before resolving.");
      return;
    }

    setResolvingId(id);
    try {
      await resolveComplaint(id, { admin_response: adminResponse });
      setResponses((prev) => ({ ...prev, [id]: "" }));
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to resolve complaint.");
    } finally {
      setResolvingId(null);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return date.toLocaleString();
  };

  const isResolved = (status) => (status || "").toLowerCase() === "resolved";

  const columns = [
    { key: "student", label: "Student" },
    { key: "subject", label: "Subject" },
    { key: "description", label: "Description" },
    { key: "priority", label: "Priority" },
    { key: "status", label: "Status" },
    { key: "submitted_at", label: "Submitted At" },
    { key: "resolved_by", label: "Resolved By" },
    { key: "resolved_at", label: "Resolved At" },
    { key: "admin_response", label: "Admin Response" },
    { key: "action", label: "Action" },
  ];

  const rows = complaints
    .slice()
    .sort((a, b) => {
      const aResolved = isResolved(a.status) ? 1 : 0;
      const bResolved = isResolved(b.status) ? 1 : 0;
      if (aResolved !== bResolved) return aResolved - bResolved;
      return new Date(b.created_at) - new Date(a.created_at);
    })
    .map((complaint) => {
      const resolved = isResolved(complaint.status);

      return {
        ...complaint,
        student: complaint.submitted_by?.username || "N/A",
        status: resolved ? <span style={resolvedBadge}>Resolved</span> : <span style={pendingBadge}>Pending</span>,
        submitted_at: formatDateTime(complaint.created_at),
        resolved_by: complaint.resolved_by?.username || "-",
        resolved_at: formatDateTime(complaint.resolved_at),
        admin_response:
          complaint.admin_response && complaint.admin_response !== "N/A"
            ? complaint.admin_response
            : "-",
        action: resolved ? (
          <span style={{ color: "#6b7280", fontSize: "13px" }}>Completed</span>
        ) : (
          <div style={{ display: "grid", gap: "6px", minWidth: "220px" }}>
            <textarea
              rows={2}
              placeholder="Write response..."
              value={responses[complaint.id] || ""}
              onChange={(e) => handleResponseChange(complaint.id, e.target.value)}
              style={{ resize: "vertical", padding: "6px 8px" }}
            />
            <button
              onClick={() => handleResolve(complaint.id)}
              disabled={resolvingId === complaint.id}
              style={resolveBtnStyle}
            >
              {resolvingId === complaint.id ? "Resolving..." : "Resolve"}
            </button>
          </div>
        ),
      };
    });

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="staff" />
      <div style={{ flex: 1 }}>
        <Navbar title="Admin - Complaints" />
        <div style={{ padding: "24px" }}>
          <h2>Complaint Resolution</h2>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "18px" }}>
            Review student complaints and resolve them with an admin response.
          </p>
          <Table columns={columns} rows={rows} />
        </div>
      </div>
    </div>
  );
}

const pendingBadge = {
  fontSize: "12px",
  fontWeight: "500",
  background: "#fff3cd",
  color: "#856404",
  padding: "2px 10px",
  borderRadius: "20px",
};

const resolvedBadge = {
  fontSize: "12px",
  fontWeight: "500",
  background: "#EAF3DE",
  color: "#3B6D11",
  padding: "2px 10px",
  borderRadius: "20px",
};

const resolveBtnStyle = {
  padding: "6px 12px",
  fontSize: "13px",
  background: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default AdminComplaintsPage;
