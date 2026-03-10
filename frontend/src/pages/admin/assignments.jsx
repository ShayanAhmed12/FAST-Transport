import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  getRoutes,
  getBuses,
  getDrivers,
  getSemesters,
} from "../../services/transportService";

function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [form, setForm] = useState({ route_id: "", bus_id: "", driver_id: "", semester_id: "" });

  const fetchAssignments = () =>
    getAssignments()
      .then((res) => setAssignments(res.data))
      .catch(() => alert("Failed to fetch assignments."));

  const handleToggle = async (id, currentValue) => {
    try {
      await updateAssignment(id, { is_active: !currentValue });
      fetchAssignments();
    } catch (err) {
      const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert(`Failed to update assignment: ${detail}`);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    fetchAssignments();
    Promise.all([getRoutes(), getBuses(), getDrivers(), getSemesters()])
      .then(([r, b, d, s]) => {
        setRoutes(r.data);
        setBuses(b.data);
        setDrivers(d.data);
        setSemesters(s.data);
      })
      .catch(() => alert("Failed to fetch dropdown data."));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.route_id || !form.bus_id || !form.driver_id || !form.semester_id) {
      alert("All fields are required.");
      return;
    }
    try {
      await createAssignment(form);
      setForm({ route_id: "", bus_id: "", driver_id: "", semester_id: "" });
      fetchAssignments();
    } catch (err) {
      const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert(`Failed to add assignment: ${detail}`);
    }
  };

  const activeSemesters = semesters.filter((s) => s.is_active);
  const activeRoutes = routes.filter((r) => r.is_active);
  const activeBuses = buses.filter((b) => b.is_active);
  const availableDrivers = drivers.filter((d) => d.is_available);
  const activeAssignments = assignments.filter((a) => a.is_active);
  const inactiveAssignments = assignments.filter((a) => !a.is_active);

  const columns = [
    { key: "route", label: "Route", render: (row) => row.route?.name },
    { key: "bus", label: "Bus", render: (row) => row.bus?.bus_number },
    { key: "driver", label: "Driver", render: (row) => row.driver?.name },
    { key: "semester", label: "Semester", render: (row) => row.semester?.name },
    {
      key: "is_active",
      label: "Active",
      render: (row) => (
        <span
          style={row.is_active ? badgeGreen : badgeGrey}
          onClick={() => handleToggle(row.id, row.is_active)}
          title="Click to toggle"
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="staff" />
      <div style={{ flex: 1 }}>
        <Navbar title="Admin — Assignments" />
        <div style={{ padding: "24px" }}>
          <h2>Route Assignments</h2>
          <form onSubmit={handleSubmit} style={formStyle}>
            <select name="route_id" value={form.route_id} onChange={handleChange} style={inputStyle}>
              <option value="">Select Route</option>
              {activeRoutes.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <select name="bus_id" value={form.bus_id} onChange={handleChange} style={inputStyle}>
              <option value="">Select Bus</option>
              {activeBuses.map((b) => (
                <option key={b.id} value={b.id}>{b.bus_number}</option>
              ))}
            </select>
            <select name="driver_id" value={form.driver_id} onChange={handleChange} style={inputStyle}>
              <option value="">Select Driver</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select name="semester_id" value={form.semester_id} onChange={handleChange} style={inputStyle}>
              <option value="">Select Semester</option>
              {activeSemesters.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button type="submit" style={btnStyle}>Add Assignment</button>
          </form>

          <div style={sectionWrapStyle}>
            <h3 style={sectionHeadingStyle}>Active Assignments</h3>
            <div style={tableWrapStyle}>
              {activeAssignments.length === 0
                ? <p style={emptyStyle}>No active assignments.</p>
                : <Table columns={columns} rows={activeAssignments} />}
            </div>
          </div>

          <div style={{ ...sectionWrapStyle, marginTop: "32px" }}>
            <h3 style={sectionHeadingStyle}>Inactive Assignments</h3>
            <div style={tableWrapStyle}>
              {inactiveAssignments.length === 0
                ? <p style={emptyStyle}>No inactive assignments.</p>
                : <Table columns={columns} rows={inactiveAssignments} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const formStyle = { marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" };
const inputStyle = { flex: "1 1 150px", padding: "8px" };
const btnStyle = { padding: "8px 16px" };
const sectionHeadingStyle = { margin: "0 0 10px", fontSize: "16px", color: "#333", whiteSpace: "nowrap" };
const sectionWrapStyle = { display: "block" };
const tableWrapStyle = { overflowX: "auto" };
const emptyStyle = { color: "#888", fontStyle: "italic" };
const badgeBase = { display: "inline-block", padding: "2px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600, cursor: "pointer", userSelect: "none" };
const badgeGreen = { ...badgeBase, background: "#d4edda", color: "#155724" };
const badgeGrey  = { ...badgeBase, background: "#e2e3e5", color: "#383d41" };

export default AssignmentsPage;
