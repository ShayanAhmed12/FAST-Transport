import { useEffect, useState } from "react";
import PageShell, { PageTitle } from "../../components/PageShell";
import Table from "../../components/Table";
import { Pill } from "../../components/ui";
import { btn, colors } from "../../theme";
import { listFeeVerifications, verifyFee } from "../../services/transportService";

function AdminFeeVerifications() {
  const [fees, setFees] = useState([]);
  const [verifying, setVerifying] = useState(null);

  const fetchFees = () =>
    listFeeVerifications().then((res) => setFees(res.data)).catch(() => alert("Failed to load fee verifications."));

  useEffect(() => { fetchFees(); }, []);

  const handleVerify = async (id) => {
    setVerifying(id);
    try { await verifyFee(id); fetchFees(); }
    catch (err) { alert(err.response?.data?.detail || "Verification failed."); }
    finally { setVerifying(null); }
  };

  const columns = [
    { key: "roll_number",    label: "Roll No." },
    {
      key: "student_name", label: "Student",
      render: (row) => {
        const u = row.student?.user;
        if (!u) return row.student_name || "—";
        const name = `${u.first_name || ""} ${u.last_name || ""}`.trim();
        return name || u.username || "—";
      }
    },
    { key: "semester",       label: "Semester" },
    { key: "challan_number", label: "Challan No." },
    { key: "amount",         label: "Amount" },
    { key: "status",         label: "Status" },
    { key: "action",         label: "Action" },
  ];

  const rows = fees.map((f) => ({
    ...f,
    status: <Pill label={f.is_verified ? "Verified" : "Pending"} variant={f.is_verified ? "success" : "warning"} />,
    action: f.is_verified ? (
      <span style={{ color: colors.textMuted, fontSize: "13px" }}>—</span>
    ) : (
      <button
        style={{ ...btn.primary, padding: "6px 14px" }}
        disabled={verifying === f.id}
        onClick={() => handleVerify(f.id)}
      >
        {verifying === f.id ? "Verifying…" : "Verify"}
      </button>
    ),
  }));

  return (
    <PageShell role="staff" title="Admin — Fee Verifications">
      <PageTitle sub="Students who have paid their transport fee and are awaiting verification.">Fee Verifications</PageTitle>
      <Table columns={columns} rows={rows} />
    </PageShell>
  );
}

export default AdminFeeVerifications;