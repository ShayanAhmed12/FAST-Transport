import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import { getRoutes, createRoute } from "../../services/transportService";

function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = () =>
    getRoutes()
      .then((res) => setRoutes(res.data))
      .catch(() => alert("Failed to fetch routes."));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      alert("Route name is required");
      return;
    }
    try {
      await createRoute(form);
      setForm({ name: "", description: "" });
      fetchRoutes();
    } catch {
      alert("Failed to add route. Make sure you are admin.");
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    { key: "is_active", label: "Active", render: (row) => (row.is_active ? "Yes" : "No") },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="staff" />
      <div style={{ flex: 1 }}>
        <Navbar title="Admin — Routes" />
        <div style={{ padding: "24px" }}>
          <h2>Routes</h2>
          <form onSubmit={handleSubmit} style={formStyle}>
            <input
              name="name"
              placeholder="Route Name"
              value={form.name}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              style={{ ...inputStyle, flex: "2 1 300px" }}
            />
            <button type="submit" style={btnStyle}>Add Route</button>
          </form>
          <Table columns={columns} rows={routes} />
        </div>
      </div>
    </div>
  );
}

const formStyle = { marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" };
const inputStyle = { flex: "1 1 150px", padding: "8px" };
const btnStyle = { padding: "8px 16px" };

export default RoutesPage;
