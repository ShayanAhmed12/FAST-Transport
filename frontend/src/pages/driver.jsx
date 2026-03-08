import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function DriverPage() {
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({ name: "", cnic: "", license_no: "", phone: "", address: "" });
  const navigate = useNavigate();

  const token = localStorage.getItem("access");
  if (!token) navigate("/login");

  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/drivers/", { headers: authHeader });
      setDrivers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch drivers.");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const createDriver = async (e) => {
    e.preventDefault();
    if (!form.name || !form.cnic) {
      alert("Name and CNIC are required");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/drivers/", form, { headers: authHeader });
      setForm({ name: "", cnic: "", license_no: "", phone: "", address: "" });
      fetchDrivers();
    } catch (err) {
      console.error(err);
      alert("Failed to add driver. Make sure you are admin.");
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Drivers</h2>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>

      <form
        onSubmit={createDriver}
        style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}
      >
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} style={{ flex: "1 1 150px", padding: "8px" }} />
        <input name="cnic" placeholder="CNIC" value={form.cnic} onChange={handleChange} style={{ flex: "1 1 150px", padding: "8px" }} />
        <input name="license_no" placeholder="License No" value={form.license_no} onChange={handleChange} style={{ flex: "1 1 150px", padding: "8px" }} />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} style={{ flex: "1 1 150px", padding: "8px" }} />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} style={{ flex: "2 1 250px", padding: "8px" }} />
        <button type="submit" style={{ padding: "8px 16px" }}>Add Driver</button>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>CNIC</th>
            <th style={thStyle}>License No</th>
            <th style={thStyle}>Phone</th>
            <th style={thStyle}>Address</th>
            <th style={thStyle}>Available</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d) => (
            <tr key={d.id}>
              <td style={tdStyle}>{d.name}</td>
              <td style={tdStyle}>{d.cnic}</td>
              <td style={tdStyle}>{d.license_no}</td>
              <td style={tdStyle}>{d.phone}</td>
              <td style={tdStyle}>{d.address}</td>
              <td style={tdStyle}>{d.is_available ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = { border: "1px solid #ddd", padding: "8px", textAlign: "left" };
const tdStyle = { border: "1px solid #ddd", padding: "8px" };

export default DriverPage;