import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import { getBuses, createBus } from "../../services/transportService";

function BusesPage() {
  const [buses, setBuses] = useState([]);
  const [form, setForm] = useState({ bus_number: "", capacity: "", model: "" });

  

  const fetchBuses = () =>
    getBuses()
      .then((res) => setBuses(res.data))
      .catch(() => alert("Failed to fetch buses."));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  useEffect(() => {
    fetchBuses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bus_number || !form.capacity) {
      alert("Bus number and capacity are required");
      return;
    }
    try {
      await createBus(form);
      setForm({ bus_number: "", capacity: "", model: "" });
      fetchBuses();
    } catch {
      alert("Failed to add bus. Make sure you are admin.");
    }
  };

  const columns = [
    { key: "bus_number", label: "Bus Number" },
    { key: "capacity", label: "Capacity" },
    { key: "model", label: "Model" },
    { key: "is_active", label: "Active", render: (row) => (row.is_active ? "Yes" : "No") },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="staff" />
      <div style={{ flex: 1 }}>
        <Navbar title="Admin — Buses" />
        <div style={{ padding: "24px" }}>
          <h2>Buses</h2>
          <form onSubmit={handleSubmit} style={formStyle}>
            <input
              name="bus_number"
              placeholder="Bus Number"
              value={form.bus_number}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="capacity"
              placeholder="Capacity"
              type="number"
              value={form.capacity}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="model"
              placeholder="Model"
              value={form.model}
              onChange={handleChange}
              style={inputStyle}
            />
            <button type="submit" style={btnStyle}>Add Bus</button>
          </form>
          <Table columns={columns} rows={buses} />
        </div>
      </div>
    </div>
  );
}

const formStyle = { marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" };
const inputStyle = { flex: "1 1 150px", padding: "8px" };
const btnStyle = { padding: "8px 16px" };

export default BusesPage;
