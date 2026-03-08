import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RouteAssignmentPage() {
  const [assignments, setAssignments] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [form, setForm] = useState({ route: "", bus: "", driver: "", semester: "" });
  const navigate = useNavigate();

  const token = localStorage.getItem("access");
  if (!token) navigate("/login");

  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchAssignments();
    fetchData();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/route-assignments/", { headers: authHeader });
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch route assignments.");
    }
  };

  const fetchData = async () => {
    try {
      const [routesRes, busesRes, driversRes, semestersRes] = await Promise.all([
        axios.get("http://localhost:8000/api/routes/", { headers: authHeader }),
        axios.get("http://localhost:8000/api/buses/", { headers: authHeader }),
        axios.get("http://localhost:8000/api/drivers/", { headers: authHeader }),
        axios.get("http://localhost:8000/api/semesters/", { headers: authHeader }),
      ]);
      setRoutes(routesRes.data);
      setBuses(busesRes.data);
      setDrivers(driversRes.data);
      setSemesters(semestersRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch data for dropdowns.");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const createAssignment = async (e) => {
    e.preventDefault();
    if (!form.route || !form.bus || !form.driver || !form.semester) {
      alert("All fields are required.");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/route-assignments/", form, { headers: authHeader });
      setForm({ route: "", bus: "", driver: "", semester: "" });
      fetchAssignments();
    } catch (err) {
      console.error(err);
      alert("Failed to add assignment. Make sure you are admin.");
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Route Assignments</h2>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>

      <form
        onSubmit={createAssignment}
        style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}
      >
        <select
          name="route"
          value={form.route}
          onChange={handleChange}
          style={{ flex: "1 1 200px", padding: "8px" }}
        >
          <option value="">Select Route</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <select
          name="bus"
          value={form.bus}
          onChange={handleChange}
          style={{ flex: "1 1 150px", padding: "8px" }}
        >
          <option value="">Select Bus</option>
          {buses.map((b) => (
            <option key={b.id} value={b.id}>{b.bus_number}</option>
          ))}
        </select>

        <select
          name="driver"
          value={form.driver}
          onChange={handleChange}
          style={{ flex: "1 1 150px", padding: "8px" }}
        >
          <option value="">Select Driver</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          name="semester"
          value={form.semester}
          onChange={handleChange}
          style={{ flex: "1 1 150px", padding: "8px" }}
        >
          <option value="">Select Semester</option>
          {semesters.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <button type="submit" style={{ padding: "8px 16px" }}>Add Assignment</button>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={thStyle}>Route</th>
            <th style={thStyle}>Bus</th>
            <th style={thStyle}>Driver</th>
            <th style={thStyle}>Semester</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((a) => (
            <tr key={a.id}>
              <td style={tdStyle}>{a.route.name}</td>
              <td style={tdStyle}>{a.bus.bus_number}</td>
              <td style={tdStyle}>{a.driver.name}</td>
              <td style={tdStyle}>{a.semester.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = { border: "1px solid #ddd", padding: "8px", textAlign: "left" };
const tdStyle = { border: "1px solid #ddd", padding: "8px" };

export default RouteAssignmentPage;