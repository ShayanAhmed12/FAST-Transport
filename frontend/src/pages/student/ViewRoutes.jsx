import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getRouteStops, getDriverById } from "../../services/transportService";

function ViewRoutes() {
  const [routeStops, setRouteStops] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverLoading, setDriverLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getRouteStops();
        setRouteStops(res.data);
      } catch (err) {
        alert("Failed to load routes");
      }
    };
    loadData();
  }, []);

  // ── Fetch driver details on badge click ──
  const handleDriverClick = async (driverId, driverName) => {
    if (!driverId) return;
    setSelectedDriver({ name: driverName, loading: true });
    setDriverLoading(true);
    try {
      const res = await getDriverById(driverId);
      setSelectedDriver(res.data);
    } catch (err) {
      setSelectedDriver({ name: driverName, error: "Could not load driver details." });
    } finally {
      setDriverLoading(false);
    }
  };

  // ── Group by route ──
  const groupedRoutes = routeStops.reduce((acc, rs) => {
    if (!acc[rs.route_name]) acc[rs.route_name] = [];
    acc[rs.route_name].push(rs);
    return acc;
  }, {});

  // ── Filter ──
  const query = searchQuery.toLowerCase().trim();
  const filteredRoutes = Object.keys(groupedRoutes).reduce((acc, routeName) => {
    const stops = groupedRoutes[routeName];
    const busNumber = stops.find((s) => s.bus_number)?.bus_number || "";
    const driverName = stops.find((s) => s.driver_name)?.driver_name || "";
    const routeMatches =
      busNumber.toLowerCase().includes(query) ||
      driverName.toLowerCase().includes(query) ||
      routeName.toLowerCase().includes(query);
    const matchingStops = stops.filter((s) =>
      s.stop_name?.toLowerCase().includes(query)
    );
    if (routeMatches) acc[routeName] = stops;
    else if (matchingStops.length > 0) acc[routeName] = matchingStops;
    return acc;
  }, {});

  const displayRoutes = query ? filteredRoutes : groupedRoutes;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="student" />
      <div style={{ flex: 1 }}>
        <Navbar title="Student — View Routes" />
        <div style={{ padding: "24px" }}>

          {/* ── Top bar ── */}
          <div style={topBarStyle}>
            <h2 style={{ margin: 0 }}>Available Routes</h2>
            <div style={searchWrapperStyle}>
          
              <input
                type="text"
                placeholder="Search by stop, bus number or driver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={searchInputStyle}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={clearBtnStyle}>X</button>
              )}
            </div>
          </div>

          {query && (
            <p style={resultTextStyle}>
              {Object.keys(displayRoutes).length === 0
                ? "No results found."
                : `Showing ${Object.keys(displayRoutes).length} route(s) matching "${searchQuery}"`}
            </p>
          )}

          {/* ── Route cards ── */}
          {Object.keys(displayRoutes).map((routeName) => {
            const stops = displayRoutes[routeName];
            const busNumber = stops.find((s) => s.bus_number)?.bus_number || "-";
            const driverName = stops.find((s) => s.driver_name)?.driver_name || "-";
            const driverId = stops.find((s) => s.driver_id)?.driver_id || null;

            return (
              <div key={routeName} style={cardStyle}>
                <div style={headingRowStyle}>
                  <h3 style={{ margin: 0 }}>{routeName}</h3>
                  <div style={badgeRowStyle}>
                    <span style={badgeStyle}>{busNumber}</span>
                    <span
                      style={{ ...badgeStyle, ...driverClickableStyle }}
                      onClick={() => handleDriverClick(driverId, driverName)}
                      title="Click to view driver details"
                    >
                      Driver: {driverName}
                    </span>
                  </div>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12px" }}>
                  <thead>
                    <tr style={{ background: "#f5f5f5" }}>
                      <th style={thStyle}>Stop</th>
                      <th style={thStyle}>Order</th>
                      <th style={thStyle}>Morning ETA</th>
                      <th style={thStyle}>Evening ETA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stops.map((s, idx) => (
                      <tr
                        key={s.id || idx}
                        style={{
                          borderBottom: "1px solid #eee",
                          background: highlightStop(s, query) ? "#fffbeb" : "transparent",
                        }}
                      >
                        <td style={tdStyle}>{highlightText(s.stop_name, query)}</td>
                        <td style={tdStyle}>{s.stop_order}</td>
                        <td style={tdStyle}>{s.morning_eta || "-"}</td>
                        <td style={tdStyle}>{s.evening_eta || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Driver Modal ── */}
      {selectedDriver && (
        <div style={overlayStyle} onClick={() => setSelectedDriver(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <button style={closeBtnStyle} onClick={() => setSelectedDriver(null)}>X</button>
            <div style={avatarCircleStyle}>DR</div>
            <h3 style={{ textAlign: "center", margin: "12px 0 4px" }}>
              {selectedDriver.name || "Driver"}
            </h3>
            <p style={{ textAlign: "center", color: "#6b7280", fontSize: "13px", margin: "0 0 16px" }}>
              Driver Details
            </p>

            {driverLoading ? (
              <p style={{ textAlign: "center", color: "#9ca3af" }}>Loading...</p>
            ) : selectedDriver.error ? (
              <p style={{ textAlign: "center", color: "#ef4444" }}>{selectedDriver.error}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <DetailRow  label="Phone" value={selectedDriver.phone} />
                <DetailRow  label="License No." value={selectedDriver.license_number} />
                <DetailRow  label="Available" value={selectedDriver.is_available ? "Yes" : "No"} />
              
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small reusable row inside modal ──
function DetailRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f9fafb", borderRadius: "8px" }}>
      <span style={{ fontSize: "13px", color: "#6b7280" }}>{icon} {label}</span>
      <span style={{ fontSize: "13px", fontWeight: "600", color: "#111" }}>{value || "-"}</span>
    </div>
  );
}

// ── Helpers ──
function highlightText(text, query) {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part)
      ? <mark key={i} style={{ background: "#fde68a", borderRadius: "3px", padding: "0 2px" }}>{part}</mark>
      : part
  );
}

function highlightStop(stop, query) {
  return query && stop.stop_name?.toLowerCase().includes(query);
}

// ── Styles ──
const topBarStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" };
const searchWrapperStyle = { display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: "8px", padding: "6px 12px", background: "#fff", gap: "8px", width: "320px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" };
const searchInputStyle = { border: "none", outline: "none", fontSize: "14px", flex: 1, background: "transparent" };
const clearBtnStyle = { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "13px" };
const resultTextStyle = { fontSize: "13px", color: "#6b7280", marginBottom: "12px" };
const cardStyle = { marginBottom: "20px", padding: "16px", border: "1px solid #ddd", borderRadius: "8px", background: "#fff" };
const headingRowStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" };
const badgeRowStyle = { display: "flex", gap: "8px" };
const badgeStyle = { padding: "4px 10px", borderRadius: "20px", background: "#eef2ff", color: "#3730a3", fontSize: "13px", fontWeight: "500", border: "1px solid #c7d2fe" };
const driverClickableStyle = { cursor: "pointer", textDecoration: "underline dotted" };
const thStyle = { textAlign: "left", padding: "8px 12px", fontWeight: "600", fontSize: "13px", color: "#555" };
const tdStyle = { padding: "8px 12px", fontSize: "14px", color: "#333" };
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalStyle = { background: "#fff", borderRadius: "12px", padding: "28px 24px", width: "320px", position: "relative", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" };
const closeBtnStyle = { position: "absolute", top: "12px", right: "14px", background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "#6b7280" };
const avatarCircleStyle = { width: "60px", height: "60px", borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto" };

export default ViewRoutes;