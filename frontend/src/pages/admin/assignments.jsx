import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import {
  getAssignments,
  createAssignment,
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
  const [form, setForm] = useState({ route: "", bus: "", driver: "", semester: "" });

 

  const fetchAssignments = () =>
    getAssignments()
      .then((res) => setAssignments(res.data))
      .catch(() => alert("Failed to fetch assignments."));

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
    if (!form.route || !form.bus || !form.driver || !form.semester) {
      alert("All fields are required.");
      return;
    }
    try {
      await createAssignment(form);
      setForm({ route: "", bus: "", driver: "", semester: "" });
      fetchAssignments();
    } catch {
      alert("Failed to add assignment. Make sure you are admin.");
    }
  };

  const columns = [
    { key: "route", label: "Route", render: (row) => row.route?.name },
    { key: "bus", label: "Bus", render: (row) => row.bus?.bus_number },
    { key: "driver", label: "Driver", render: (row) => row.driver?.name },
    { key: "semester", label: "Semester", render: (row) => row.semester?.name },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="staff" />
      <div style={{ flex: 1 }}>
        <Navbar title="Admin — Assignments" />
        <div style={{ padding: "24px" }}>
          <h2>Route Assignments</h2>
          <form onSubmit={handleSubmit} style={formStyle}>
            <select name="route" value={form.route} onChange={handleChange} style={inputStyle}>
              <option value="">Select Route</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <select name="bus" value={form.bus} onChange={handleChange} style={inputStyle}>
              <option value="">Select Bus</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>{b.bus_number}</option>
              ))}
            </select>
            <select name="driver" value={form.driver} onChange={handleChange} style={inputStyle}>
              <option value="">Select Driver</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select name="semester" value={form.semester} onChange={handleChange} style={inputStyle}>
              <option value="">Select Semester</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button type="submit" style={btnStyle}>Add Assignment</button>
          </form>
          <Table columns={columns} rows={assignments} />
        </div>
      </div>
    </div>
  );
}

const formStyle = { marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" };
const inputStyle = { flex: "1 1 150px", padding: "8px" };
const btnStyle = { padding: "8px 16px" };

export default AssignmentsPage;
