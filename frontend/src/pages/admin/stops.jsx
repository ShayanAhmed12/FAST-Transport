import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import { getStops, createStop } from "../../services/transportService";

function StopsPage() {
  const [stops, setStops] = useState([]);
  const [form, setForm] = useState({ name: "", latitude: "", longitude: "", address: "" });

 

  const fetchStops = () =>
    getStops()
      .then((res) => setStops(res.data))
      .catch(() => alert("Failed to fetch stops."));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
   useEffect(() => {
    fetchStops();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      alert("Stop name is required");
      return;
    }
    try {
      await createStop(form);
      setForm({ name: "", latitude: "", longitude: "", address: "" });
      fetchStops();
    } catch {
      alert("Failed to add stop. Make sure you are admin.");
    }
  };

  const columns = [
    { key: "name", label: "Stop Name" },
    { key: "latitude", label: "Latitude" },
    { key: "longitude", label: "Longitude" },
    { key: "address", label: "Address" },
    { key: "created_at", label: "Created At" },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="staff" />
      <div style={{ flex: 1 }}>
        <Navbar title="Admin — Stops" />
        <div style={{ padding: "24px" }}>
          <h2>Stops</h2>
          <form onSubmit={handleSubmit} style={formStyle}>
            <input
              name="name"
              placeholder="Stop Name"
              value={form.name}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="latitude"
              type="number"
              step="0.000001"
              placeholder="Latitude"
              value={form.latitude}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="longitude"
              type="number"
              step="0.000001"
              placeholder="Longitude"
              value={form.longitude}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              style={{ ...inputStyle, flex: "2 1 300px" }}
            />
            <button type="submit" style={btnStyle}>Add Stop</button>
          </form>
          <Table columns={columns} rows={stops} />
        </div>
      </div>
    </div>
  );
}

const formStyle = { marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" };
const inputStyle = { flex: "1 1 150px", padding: "8px" };
const btnStyle = { padding: "8px 16px" };

export default StopsPage;