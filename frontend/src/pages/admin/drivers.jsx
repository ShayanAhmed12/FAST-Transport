import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import { getDrivers, createDriver, updateDriver } from "../../services/transportService";

function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({ name: "", cnic: "", license_no: "", phone: "", address: "" });
  const [pendingToggle, setPendingToggle] = useState(null);

  const fetchDrivers = () =>
    getDrivers()
      .then((res) => setDrivers(res.data))
      .catch(() => alert("Failed to fetch drivers."));

  const handleToggle = (id, currentValue) => {
    if (currentValue) {
      setPendingToggle({ id, currentValue });
    } else {
      doToggle(id, currentValue);
    }
  };

  const doToggle = async (id, currentValue) => {
    try {
      await updateDriver(id, { is_available: !currentValue });
      fetchDrivers();
    } catch (err) {
      const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert(`Failed to update driver: ${detail}`);
    }
  };

  const handleConfirm = () => {
    doToggle(pendingToggle.id, pendingToggle.currentValue);
    setPendingToggle(null);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

   useEffect(() => {
    fetchDrivers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.cnic) {
      alert("Name and CNIC are required");
      return;
    }
    try {
      await createDriver(form);
      setForm({ name: "", cnic: "", license_no: "", phone: "", address: "" });
      fetchDrivers();
    } catch (err) {
      const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert(`Failed to add driver: ${detail}`);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "cnic", label: "CNIC" },
    { key: "license_no", label: "License No" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" },
    {
      key: "is_available",
      label: "Available",
      render: (row) => (
        <span
          style={row.is_available ? badgeGreen : badgeGrey}
          onClick={() => handleToggle(row.id, row.is_available)}
          title="Click to toggle"
        >
          {row.is_available ? "Available" : "Unavailable"}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="staff" />
      <div style={{ flex: 1 }}>
        <Navbar title="Admin — Drivers" />
        <div style={{ padding: "24px" }}>
          {pendingToggle && (
            <div style={modalOverlayStyle}>
              <div style={modalBoxStyle}>
                <h3 style={{ margin: "0 0 12px", color: "#c0392b" }}>⚠ Mark Driver Unavailable?</h3>
                <p style={{ margin: "0 0 20px", color: "#333" }}>
                  Setting this driver to <strong>unavailable</strong> will also automatically deactivate
                  all corresponding assignments linked to this driver.
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button onClick={() => setPendingToggle(null)} style={modalCancelBtnStyle}>Cancel</button>
                  <button onClick={handleConfirm} style={modalConfirmBtnStyle}>Yes, Mark Unavailable</button>
                </div>
              </div>
            </div>
          )}
          <h2>Drivers</h2>
          <form onSubmit={handleSubmit} style={formStyle}>
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} style={inputStyle} />
            <input name="cnic" placeholder="CNIC" value={form.cnic} onChange={handleChange} style={inputStyle} />
            <input name="license_no" placeholder="License No" value={form.license_no} onChange={handleChange} style={inputStyle} />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} style={inputStyle} />
            <input
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              style={{ ...inputStyle, flex: "2 1 250px" }}
            />
            <button type="submit" style={btnStyle}>Add Driver</button>
          </form>

          <div style={sectionWrapStyle}>
            <h3 style={sectionHeadingStyle}>Available Drivers</h3>
            <div style={tableWrapStyle}>
              {drivers.filter(d => d.is_available).length === 0
                ? <p style={emptyStyle}>No available drivers.</p>
                : <Table columns={columns} rows={drivers.filter(d => d.is_available)} />}
            </div>
          </div>

          <div style={{ ...sectionWrapStyle, marginTop: "32px" }}>
            <h3 style={sectionHeadingStyle}>Unavailable Drivers</h3>
            <div style={tableWrapStyle}>
              {drivers.filter(d => !d.is_available).length === 0
                ? <p style={emptyStyle}>No unavailable drivers.</p>
                : <Table columns={columns} rows={drivers.filter(d => !d.is_available)} />}
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

export default DriversPage;
