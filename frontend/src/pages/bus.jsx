import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function BusPage() {
  const [buses, setBuses] = useState([]);
  const [form, setForm] = useState({ bus_number: "", capacity: "", model: "" });
  const navigate = useNavigate();

  const token = localStorage.getItem("access");
  if (!token) navigate("/login");

  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/buses/", { headers: authHeader });
      setBuses(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch buses.");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const createBus = async (e) => {
    e.preventDefault();
    if (!form.bus_number || !form.capacity) {
      alert("Bus number and capacity are required");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/buses/", form, { headers: authHeader });
      setForm({ bus_number: "", capacity: "", model: "" });
      fetchBuses();
    } catch (err) {
      console.error(err);
      alert("Failed to add bus. Make sure you are admin.");
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Buses</h2>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>

      <form
        onSubmit={createBus}
        style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}
      >
        <input
          name="bus_number"
          placeholder="Bus Number"
          value={form.bus_number}
          onChange={handleChange}
          style={{ flex: "1 1 150px", padding: "8px" }}
        />
        <input
          name="capacity"
          placeholder="Capacity"
          type="number"
          value={form.capacity}
          onChange={handleChange}
          style={{ flex: "1 1 100px", padding: "8px" }}
        />
        <input
          name="model"
          placeholder="Model"
          value={form.model}
          onChange={handleChange}
          style={{ flex: "1 1 150px", padding: "8px" }}
        />
        <button type="submit" style={{ padding: "8px 16px" }}>Add Bus</button>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={thStyle}>Bus Number</th>
            <th style={thStyle}>Capacity</th>
            <th style={thStyle}>Model</th>
            <th style={thStyle}>Active</th>
          </tr>
        </thead>
        <tbody>
          {buses.map((bus) => (
            <tr key={bus.id}>
              <td style={tdStyle}>{bus.bus_number}</td>
              <td style={tdStyle}>{bus.capacity}</td>
              <td style={tdStyle}>{bus.model}</td>
              <td style={tdStyle}>{bus.is_active ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = { border: "1px solid #ddd", padding: "8px", textAlign: "left" };
const tdStyle = { border: "1px solid #ddd", padding: "8px" };

export default BusPage;