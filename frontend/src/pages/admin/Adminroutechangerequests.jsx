import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import {
  listAllRouteChangeRequests,
  approveRouteChangeRequest,
  denyRouteChangeRequest,
} from "../../services/transportService";

const STATUS_STYLE = {
  Pending:   { background: "#fff3cd", color: "#856404" },
  Approved:  { background: "#EAF3DE", color: "#3B6D11" },
  Rejected:  { background: "#fde8e8", color: "#9b1c1c" },
  Cancelled: { background: "#f3f4f6", color: "#6b7280" },
};

export default function AdminRouteChangeRequests() {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [actionId, setActionId]   = useState(null);
  const [remarks, setRemarks]     = useState({});   // { [id]: string }
  const [filter, setFilter]       = useState("Pending");

  const fetchRequests = () =>
    listAllRouteChangeRequests()
      .then((r) => { setRequests(r.data); setLoading(false); })
      .catch(() => setLoading(false));

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await approveRouteChangeRequest(id, remarks[id] || "");
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.detail || "Approval failed.");
    } finally {
      setActionId(null);
    }
  };

  const handleDeny = async (id) => {
    if (!remarks[id]?.trim()) {
      alert("Please enter a reason before denying.");
      return;
    }
    setActionId(id);
    try {
      await denyRouteChangeRequest(id, remarks[id]);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.detail || "Denial failed.");
    } finally {
      setActionId(null);
    }
  };

  const filtered = requests.filter((r) => filter === "All" || r.status === filter);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="staff" />
      <div style={{ flex: 1 }}>
        <Navbar title="Admin — Route Change Requests" />
        <div style={{ padding: "24px", maxWidth: "960px" }}>
          <h2 style={{ marginBottom: "4px" }}>Route Change Requests</h2>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}>
            Review student requests to change their transport route. Approving will automatically
            free the old seat and allocate a new one if available.
          </p>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            {["Pending", "Approved", "Rejected", "Cancelled", "All"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  border: "1px solid #e5e7eb",
                  background: filter === s ? "#4f46e5" : "#fff",
                  color: filter === s ? "#fff" : "#374151",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {loading ? (
            <p style={{ color: "#9ca3af" }}>Loading…</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: "#9ca3af", fontSize: "14px" }}>No {filter.toLowerCase()} requests.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {filtered.map((req) => (
                <div key={req.id} style={cardStyle}>
                  {/* Header row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <p style={{ margin: "0 0 4px", fontWeight: "600", fontSize: "15px" }}>
                        {req.registration?.student?.user?.username}
                        <span style={{ fontWeight: "400", color: "#6b7280", fontSize: "13px" }}>
                          {" "}· {req.registration?.student?.roll_number}
                        </span>
                      </p>
                      <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                        Semester: {req.registration?.semester?.name}
                      </p>
                    </div>
                    <span style={{ ...badgeStyle, ...STATUS_STYLE[req.status] }}>{req.status}</span>
                  </div>

                  {/* Route change detail */}
                  <div style={routeRowStyle}>
                    <div style={routeBoxStyle}>
                      <span style={routeLabelStyle}>Current Route</span>
                      <span style={routeValueStyle}>{req.current_route?.name}</span>
                    </div>
                    <span style={{ fontSize: "20px", color: "#9ca3af" }}>→</span>
                    <div style={routeBoxStyle}>
                      <span style={routeLabelStyle}>Requested Route</span>
                      <span style={routeValueStyle}>{req.requested_route?.name}</span>
                    </div>
                    <div style={routeBoxStyle}>
                      <span style={routeLabelStyle}>Requested Stop</span>
                      <span style={routeValueStyle}>{req.requested_stop?.name}</span>
                    </div>
                    {/* Seat availability badge */}
                    <div style={routeBoxStyle}>
                      <span style={routeLabelStyle}>Seats Available</span>
                      <span style={{
                        fontWeight: "600",
                        fontSize: "15px",
                        color: req.available_seats > 0 ? "#16a34a" : "#dc2626",
                      }}>
                        {req.available_seats ?? "—"}
                      </span>
                    </div>
                  </div>

                  {/* Existing admin remarks (resolved) */}
                  {req.admin_remarks && req.admin_remarks !== "N/A" && req.status !== "Pending" && (
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: "10px 0 0" }}>
                      Admin note: {req.admin_remarks}
                    </p>
                  )}

                  {/* Action row (only for pending) */}
                  {req.status === "Pending" && (
                    <div style={{ marginTop: "14px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                      <input
                        type="text"
                        placeholder="Remarks (required for denial)"
                        value={remarks[req.id] || ""}
                        onChange={(e) => setRemarks({ ...remarks, [req.id]: e.target.value })}
                        style={remarksInputStyle}
                      />
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={actionId === req.id || req.available_seats === 0}
                        style={{
                          ...approveBtnStyle,
                          opacity: req.available_seats === 0 ? 0.4 : 1,
                          cursor: req.available_seats === 0 ? "not-allowed" : "pointer",
                        }}
                        title={req.available_seats === 0 ? "No seats available on this route" : ""}
                      >
                        {actionId === req.id ? "Processing…" : "✓ Approve"}
                      </button>
                      <button
                        onClick={() => handleDeny(req.id)}
                        disabled={actionId === req.id}
                        style={denyBtnStyle}
                      >
                        {actionId === req.id ? "Processing…" : "✗ Deny"}
                      </button>
                    </div>
                  )}

                  <p style={{ margin: "10px 0 0", fontSize: "11px", color: "#9ca3af" }}>
                    Submitted: {new Date(req.requested_at).toLocaleString()}
                    {req.resolved_at && ` · Resolved: ${new Date(req.resolved_at).toLocaleString()}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const cardStyle        = { border: "1px solid #e5e7eb", borderRadius: "10px", padding: "20px", background: "#fff" };
const badgeStyle       = { fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" };
const routeRowStyle    = { display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap", background: "#f9fafb", borderRadius: "8px", padding: "12px 16px" };
const routeBoxStyle    = { display: "flex", flexDirection: "column", gap: "3px" };
const routeLabelStyle  = { fontSize: "10px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" };
const routeValueStyle  = { fontSize: "14px", fontWeight: "500", color: "#111827" };
const remarksInputStyle = { flex: 1, minWidth: "200px", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "13px" };
const approveBtnStyle  = { padding: "8px 16px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500" };
const denyBtnStyle     = { padding: "8px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer" };