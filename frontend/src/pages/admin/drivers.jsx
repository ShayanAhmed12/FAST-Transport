import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import { getDrivers, createDriver } from "../../services/transportService";

function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({ name: "", cnic: "", license_no: "", phone: "", address: "" });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = () =>
    getDrivers()
      .then((res) => setDrivers(res.data))
      .catch(() => alert("Failed to fetch drivers."));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
    } catch {
      alert("Failed to add driver. Make sure you are admin.");
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "cnic", label: "CNIC" },
    { key: "license_no", label: "License No" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" },
    { key: "is_available", label: "Available", render: (row) => (row.is_available ? "Yes" : "No") },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="staff" />
      <div style={{ flex: 1 }}>
        <Navbar title="Admin — Drivers" />
        <div style={{ padding: "24px" }}>
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
          <Table columns={columns} rows={drivers} />
        </div>
      </div>
    </div>
  );
}

const formStyle = { marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" };
const inputStyle = { flex: "1 1 150px", padding: "8px" };
const btnStyle = { padding: "8px 16px" };

export default DriversPage;
