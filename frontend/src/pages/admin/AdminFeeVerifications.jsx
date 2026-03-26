import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import { listFeeVerifications, verifyFee } from "../../services/transportService";

function AdminFeeVerifications() {
  const [fees, setFees] = useState([]);
  const [verifying, setVerifying] = useState(null);

  const fetchFees = () =>
    listFeeVerifications()
      .then((res) => setFees(res.data))
      .catch(() => alert("Failed to load fee verifications."));

  useEffect(() => { fetchFees(); }, []);

  const handleVerify = async (id) => {
    setVerifying(id);
    try {
      await verifyFee(id);
      fetchFees();
    } catch (err) {
      alert(err.response?.data?.detail || "Verification failed.");
    } finally {
      setVerifying(null);
    }
  };

  const columns = [
    { key: "roll_number",    label: "Roll No." },
    { key: "student_name",   label: "Student" },
    { key: "semester",       label: "Semester" },
    { key: "challan_number", label: "Challan No." },
    { key: "amount",         label: "Amount" },
    { key: "status",         label: "Status" },
    { key: "action",         label: "Action" },
  ];

  const rows = fees.map((f) => ({
    ...f,
    status: f.is_verified ? (
      <span style={verifiedBadge}>Verified</span>
    ) : (
      <span style={pendingBadge}>Pending</span>
    ),
    action: f.is_verified ? (
      <span style={{ fontSize: "13px", color: "#6b7280" }}>—</span>
    ) : (
      <button
        style={verifyBtnStyle}
        disabled={verifying === f.id}
        onClick={() => handleVerify(f.id)}
      >
        {verifying === f.id ? "Verifying..." : "Verify"}
      </button>
    ),
  }));

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="staff" />
      <div style={{ flex: 1 }}>
        <Navbar title="Admin — Fee Verifications" />
        <div style={{ padding: "24px", maxWidth: "1000px" }}>
          <h2>Fee Verifications</h2>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}>
            Students who have paid their transport fee and are awaiting verification.
          </p>
          <Table columns={columns} rows={rows} />
        </div>
      </div>
    </div>
  );
}

const verifiedBadge = { fontSize: "12px", fontWeight: "500", background: "#EAF3DE", color: "#3B6D11", padding: "2px 10px", borderRadius: "20px" };
const pendingBadge  = { fontSize: "12px", fontWeight: "500", background: "#fff3cd", color: "#856404", padding: "2px 10px", borderRadius: "20px" };
const verifyBtnStyle = { padding: "6px 12px", fontSize: "13px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" };

export default AdminFeeVerifications;