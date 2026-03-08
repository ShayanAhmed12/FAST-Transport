import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RoutePage() {
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const navigate = useNavigate();

  const token = localStorage.getItem("access");
  if (!token) navigate("/login"); // redirect if not logged in

  const authHeader = { Authorization: `Bearer ${token}` };

  // Fetch all routes
  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/routes/", {
        headers: authHeader,
      });
      setRoutes(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch routes.");
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create new route
  const createRoute = async (e) => {
    e.preventDefault();
    if (!form.name) {
      alert("Route name is required");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/routes/", form, {
        headers: authHeader,
      });
      setForm({ name: "", description: "" }); // clear form
      fetchRoutes(); // refresh list
    } catch (err) {
      console.error(err);
      alert("Failed to add route. Make sure you are admin.");
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Routes</h2>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>

      <form
        onSubmit={createRoute}
        style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}
      >
        <input
          name="name"
          placeholder="Route Name"
          value={form.name}
          onChange={handleChange}
          style={{ flex: "1 1 200px", padding: "8px" }}
        />
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          style={{ flex: "2 1 300px", padding: "8px" }}
        />
        <button type="submit" style={{ padding: "8px 16px" }}>
          Add Route
        </button>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Active</th>
          </tr>
        </thead>

        <tbody>
          {routes.map((route) => (
            <tr key={route.id}>
              <td style={tdStyle}>{route.name}</td>
              <td style={tdStyle}>{route.description}</td>
              <td style={tdStyle}>{route.is_active ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "left",
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "8px",
};

export default RoutePage;