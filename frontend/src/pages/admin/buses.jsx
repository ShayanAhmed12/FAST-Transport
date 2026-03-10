import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import { getBuses, createBus, updateBus } from "../../services/transportService";

function BusesPage() {
  const [buses, setBuses] = useState([]);
  const [form, setForm] = useState({ bus_number: "", capacity: "", model: "" });
  const [pendingToggle, setPendingToggle] = useState(null);

  const fetchBuses = () =>
    getBuses()
      .then((res) => setBuses(res.data))
      .catch(() => alert("Failed to fetch buses."));

  const handleToggle = (id, currentValue) => {
    if (currentValue) {
      setPendingToggle({ id, currentValue });
    } else {
      doToggle(id, currentValue);
    }
  };

  const doToggle = async (id, currentValue) => {
    try {
      await updateBus(id, { is_active: !currentValue });
      fetchBuses();
    } catch (err) {
      const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert(`Failed to update bus: ${detail}`);
    }
  };

  const handleConfirm = () => {
    doToggle(pendingToggle.id, pendingToggle.currentValue);
    setPendingToggle(null);
  };

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
    } catch (err) {
      const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert(`Failed to add bus: ${detail}`);
    }
  };

  const columns = [
    { key: "bus_number", label: "Bus Number" },
    { key: "capacity", label: "Capacity" },
    { key: "model", label: "Model" },
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
        <Navbar title="Admin — Buses" />
        <div style={{ padding: "24px" }}>
          {pendingToggle && (
            <div style={modalOverlayStyle}>
              <div style={modalBoxStyle}>
                <h3 style={{ margin: "0 0 12px", color: "#c0392b" }}>⚠ Deactivate Bus?</h3>
                <p style={{ margin: "0 0 20px", color: "#333" }}>
                  Setting this bus to <strong>inactive</strong> will also automatically deactivate
                  all corresponding assignments linked to this bus.
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button onClick={() => setPendingToggle(null)} style={modalCancelBtnStyle}>Cancel</button>
                  <button onClick={handleConfirm} style={modalConfirmBtnStyle}>Yes, Deactivate</button>
                </div>
              </div>
            </div>
          )}
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

          <div style={sectionWrapStyle}>
            <h3 style={sectionHeadingStyle}>Active Buses</h3>
            <div style={tableWrapStyle}>
              {buses.filter(b => b.is_active).length === 0
                ? <p style={emptyStyle}>No active buses.</p>
                : <Table columns={columns} rows={buses.filter(b => b.is_active)} />}
            </div>
          </div>

          <div style={{ ...sectionWrapStyle, marginTop: "32px" }}>
            <h3 style={sectionHeadingStyle}>Inactive Buses</h3>
            <div style={tableWrapStyle}>
              {buses.filter(b => !b.is_active).length === 0
                ? <p style={emptyStyle}>No inactive buses.</p>
                : <Table columns={columns} rows={buses.filter(b => !b.is_active)} />}
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
const modalOverlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalBoxStyle = { background: "#fff", borderRadius: "8px", padding: "28px 32px", maxWidth: "420px", width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" };
const modalCancelBtnStyle = { padding: "8px 18px", border: "1px solid #ccc", borderRadius: "4px", background: "#fff", cursor: "pointer" };
const modalConfirmBtnStyle = { padding: "8px 18px", border: "none", borderRadius: "4px", background: "#c0392b", color: "#fff", cursor: "pointer", fontWeight: 600 };

export default BusesPage;
