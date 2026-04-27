import { useEffect, useState } from "react";
import PageShell, { PageTitle } from "../../components/PageShell";
import Table from "../../components/Table";
import { Spinner, SectionBlock } from "../../components/ui";
import { btn, colors, radius, input as inputTheme } from "../../theme";
import { listCurrentSeatAllocations, reassignStudentSeat } from "../../services/transportService";

function StudentBusAssignmentsPage() {
  const [allocatedRows, setAllocatedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reassigningId, setReassigningId] = useState(null);
  const [selectedReassignments, setSelectedReassignments] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await listCurrentSeatAllocations();
      const rows = res.data || [];
      setAllocatedRows(rows);
      const defaults = {};
      rows.forEach(r => { defaults[r.registration_id] = String(r.current_route_assignment_id); });
      setSelectedReassignments(defaults);
    } catch { alert("Failed to load student seat assignment data."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleReassign = async (row) => {
    const assignmentId = selectedReassignments[row.registration_id];
    if (!assignmentId) { alert("Please select a target bus assignment first."); return; }
    if (Number(assignmentId) === Number(row.current_route_assignment_id)) {
      alert("Please choose a different bus assignment."); return;
    }
    setReassigningId(row.registration_id);
    try {
      await reassignStudentSeat({ registration_id: row.registration_id, route_assignment_id: Number(assignmentId) });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to reassign seat.");
    } finally { setReassigningId(null); }
  };

  const selectSt = { ...inputTheme, padding: "7px 10px", fontSize: "13px" };

  const columns = [
    { key: "roll_number",   label: "Roll Number" },
    { key: "student_name",  label: "Student" },
    { key: "semester",      label: "Semester" },
    { key: "route",         label: "Route" },
    { key: "stop",          label: "Stop" },
    { key: "current_seat",  label: "Current Seat", render: (row) => `${row.current_bus} – Seat ${row.current_seat_number}` },
    {
      key: "new_assignment", label: "Move To",
      render: (row) => {
        const opts = row.assignment_options || [];
        if (!opts.length) return <span style={{ color: colors.textMuted, fontSize: "13px" }}>No active assignment.</span>;
        const sel = selectedReassignments[row.registration_id] || "";
        const selOpt = opts.find(o => String(o.id) === String(sel));
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "220px" }}>
            <select
              value={sel}
              onChange={(e) => setSelectedReassignments(prev => ({ ...prev, [row.registration_id]: e.target.value }))}
              style={selectSt}
              disabled={reassigningId === row.registration_id}
            >
              <option value="">Select Bus</option>
              {opts.map(o => (
                <option key={o.id} value={o.id}>
                  {o.bus_number} ({o.available_seats}/{o.total_seats} seats)
                </option>
              ))}
            </select>
            {selOpt && <span style={{ fontSize: "11px", color: colors.textMuted }}>Driver: {selOpt.driver_name}</span>}
          </div>
        );
      },
    },
    {
      key: "action", label: "Action",
      render: (row) => {
        const opts = row.assignment_options || [];
        const sel  = selectedReassignments[row.registration_id] || "";
        const selOpt = opts.find(o => String(o.id) === String(sel));
        const busy   = reassigningId === row.registration_id;
        const same   = Number(sel) === Number(row.current_route_assignment_id);
        const noSeat = !selOpt || selOpt.available_seats < 1;
        return (
          <button
            style={{ ...btn.primary, opacity: (busy || !sel || same || noSeat) ? 0.5 : 1 }}
            onClick={() => handleReassign(row)}
            disabled={busy || !sel || same || noSeat}
          >
            {busy ? "Changing…" : "Change Seat"}
          </button>
        );
      },
    },
  ];

  return (
    <PageShell role="staff" title="Admin — Student Bus Assignments">
      <PageTitle sub="Reassign students to a different bus if needed.">Student Bus Assignments</PageTitle>
      <SectionBlock title="Update Existing Seats" sub="Change bus/seat for students who already have an allocated seat.">
        {loading ? <Spinner /> : <Table columns={columns} rows={allocatedRows} emptyMessage="No current seat allocations." />}
      </SectionBlock>
    </PageShell>
  );
}

export default StudentBusAssignmentsPage;