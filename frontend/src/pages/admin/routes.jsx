import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import { getRoutes, createRoute, updateRoute } from "../../services/transportService";

function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [pendingToggle, setPendingToggle] = useState(null);

  const fetchRoutes = () =>
    getRoutes()
      .then((res) => setRoutes(res.data))
      .catch(() => alert("Failed to fetch routes."));

  const handleToggle = (id, currentValue) => {
    if (currentValue) {
      setPendingToggle({ id, currentValue });
    } else {
      doToggle(id, currentValue);
    }
  };

  const doToggle = async (id, currentValue) => {
    try {
      await updateRoute(id, { is_active: !currentValue });
      fetchRoutes();
    } catch (err) {
      const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert(`Failed to update route: ${detail}`);
    }
  };

  const handleConfirm = () => {
    doToggle(pendingToggle.id, pendingToggle.currentValue);
    setPendingToggle(null);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  useEffect(() => {
    fetchRoutes();
  }, []);

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
    } catch (err) {
      const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert(`Failed to add route: ${detail}`);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
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
        <Navbar title="Admin — Routes" />
        <div style={{ padding: "24px" }}>
          {pendingToggle && (
            <div style={modalOverlayStyle}>
              <div style={modalBoxStyle}>
                <h3 style={{ margin: "0 0 12px", color: "#c0392b" }}>⚠ Deactivate Route?</h3>
                <p style={{ margin: "0 0 20px", color: "#333" }}>
                  Setting this route to <strong>inactive</strong> will also automatically deactivate
                  all corresponding assignments linked to this route.
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button onClick={() => setPendingToggle(null)} style={modalCancelBtnStyle}>Cancel</button>
                  <button onClick={handleConfirm} style={modalConfirmBtnStyle}>Yes, Deactivate</button>
                </div>
              </div>
            </div>
          )}
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

          <div style={sectionWrapStyle}>
            <h3 style={sectionHeadingStyle}>Active Routes</h3>
            <div style={tableWrapStyle}>
              {routes.filter(r => r.is_active).length === 0
                ? <p style={emptyStyle}>No active routes.</p>
                : <Table columns={columns} rows={routes.filter(r => r.is_active)} />}
            </div>
          </div>

          <div style={{ ...sectionWrapStyle, marginTop: "32px" }}>
            <h3 style={sectionHeadingStyle}>Inactive Routes</h3>
            <div style={tableWrapStyle}>
              {routes.filter(r => !r.is_active).length === 0
                ? <p style={emptyStyle}>No inactive routes.</p>
                : <Table columns={columns} rows={routes.filter(r => !r.is_active)} />}
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

export default RoutesPage;
