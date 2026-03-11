import { useCallback, useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";

import {
  getRoutes,
  getStops,
  getRouteStops,
  createRouteStop,
  deleteRouteStop,
} from "../../services/transportService";

const EMPTY_FORM = {
  route: "",
  stop: "",
  stop_order: 1,
  morning_eta: "",
  evening_eta: "",
};

function RouteStopsPage() {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [routeStops, setRouteStops] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [r, s, rs] = await Promise.all([getRoutes(), getStops(), getRouteStops()]);
      setRoutes(r.data);
      setStops(s.data);
      setRouteStops(rs.data);
    } catch {
      alert("Failed to load route stops.");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.route || !form.stop) {
      alert("Please select a route and a stop.");
      return;
    }

    setLoading(true);
    try {
      await createRouteStop({
        route: form.route,
        stop: form.stop,
        stop_order: Number(form.stop_order),
        morning_eta: form.morning_eta || null,
        evening_eta: form.evening_eta || null,
      });
      setForm(EMPTY_FORM);
      await fetchData();
    } catch {
      alert("Failed to create route stop.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this route stop?")) return;
    try {
      await deleteRouteStop(id);
      await fetchData();
    } catch {
      alert("Failed to delete route stop.");
    }
  };

  const columns = [
    { key: "route_name", label: "Route" },
    { key: "stop_name", label: "Stop" },
    { key: "stop_order", label: "Stop Order" },
    { key: "morning_eta", label: "Morning ETA" },
    { key: "evening_eta", label: "Evening ETA" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button onClick={() => handleDelete(row.id)} style={deleteBtnStyle}>
          Delete
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="staff" />

      <div style={{ flex: 1 }}>
        <Navbar title="Admin — Route Stops" />

        <div style={{ padding: "24px" }}>
          <h2>Assign Stop to Route</h2>

          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={fieldWrapStyle}>
              <label style={fieldLabelStyle}>Route</label>
              <select
                name="route"
                value={form.route}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Select Route</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldWrapStyle}>
              <label style={fieldLabelStyle}>Stop</label>
              <select
                name="stop"
                value={form.stop}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Select Stop</option>
                {stops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldWrapStyle}>
              <label style={fieldLabelStyle}>Stop Order</label>
              <input
                name="stop_order"
                type="number"
                min={1}
                value={form.stop_order}
                onChange={handleChange}
                style={{ ...inputStyle, width: "80px" }}
              />
            </div>

            <div style={fieldWrapStyle}>
              <label style={fieldLabelStyle}>Morning ETA</label>
              <input
                name="morning_eta"
                type="time"
                value={form.morning_eta}
                onChange={handleChange}
                style={{ ...inputStyle, width: "120px" }}
              />
            </div>

            <div style={fieldWrapStyle}>
              <label style={fieldLabelStyle}>Evening ETA</label>
              <input
                name="evening_eta"
                type="time"
                value={form.evening_eta}
                onChange={handleChange}
                style={{ ...inputStyle, width: "120px" }}
              />
            </div>

            <button type="submit" style={btnStyle} disabled={loading}>
              {loading ? "Adding…" : "Add Route Stop"}
            </button>
          </form>

          <Table columns={columns} rows={routeStops} />
        </div>
      </div>
    </div>
  );
}

const formStyle = {
  marginBottom: "20px",
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  alignItems: "flex-end",
};

const fieldWrapStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const fieldLabelStyle = {
  fontSize: "12px",
  color: "#555",
  fontWeight: 600,
};

const inputStyle = {
  padding: "8px",
  minWidth: "150px",
};

const btnStyle = {
  padding: "8px 16px",
};

const deleteBtnStyle = {
  padding: "4px 10px",
  background: "#e94560",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default RouteStopsPage;