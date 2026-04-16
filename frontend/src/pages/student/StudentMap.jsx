import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from "axios";

const SIMULATION_INTERVAL_MS = 20000; // advance one stop every 20 seconds

// --- GPS LIVE LOCATION (commented for future use) ---
// When GPS is ready, replace the simulation block below with:
// const fetchLiveLocation = async () => {
//   const res = await axios.get("http://localhost:8000/api/student/bus-tracking/", { headers });
//   const { lat, lng } = res.data.live_location;
//   moveBusMarker(lat, lng);
// };
// useEffect(() => {
//   const id = setInterval(fetchLiveLocation, 5000);
//   return () => clearInterval(id);
// }, [mapReady]);
// ---

export default function StudentMap() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const busMarkerRef = useRef(null);

  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState("");
  const [simStopIndex, setSimStopIndex] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState(SIMULATION_INTERVAL_MS / 1000);

  const headers = { Authorization: `Bearer ${localStorage.getItem("access")}` };

  // Fetch route data
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/student/bus-tracking/", { headers })
      .then((res) => setTrackingData(res.data))
      .catch((err) =>
        setError(err.response?.data?.detail || "Failed to load tracking data")
      );
  }, []);

  // Init map once data is ready
  useEffect(() => {
    if (!trackingData || mapRef.current) return;
    const stops = trackingData.stops;
    if (!stops.length) return;

    const center = [stops[0].lng, stops[0].lat];

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center,
      zoom: 13,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      const coords = stops.map((s) => [s.lng, s.lat]);

      // Draw route line
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords },
        },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: { "line-color": "#3B82F6", "line-width": 4, "line-opacity": 0.8 },
      });

      // Stop markers
      stops.forEach((stop, i) => {
        const isStudentStop = stop.name === trackingData.student_stop_name;

        const el = document.createElement("div");
        el.style.cssText = `
          width: 14px; height: 14px;
          border-radius: 50%;
          background: ${isStudentStop ? "#F59E0B" : "#6B7280"};
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
          cursor: pointer;
        `;

        new maplibregl.Marker({ element: el })
          .setLngLat([stop.lng, stop.lat])
          .setPopup(
            new maplibregl.Popup({ offset: 12 }).setHTML(
              `<strong>${stop.name}</strong>${
                stop.morning_eta ? `<br/>ETA: ${stop.morning_eta}` : ""
              }${isStudentStop ? "<br/><em>📍 Your stop</em>" : ""}`
            )
          )
          .addTo(map);
      });

      // Bus marker (simulation starts at first stop)
      const busEl = document.createElement("div");
      busEl.innerHTML = "🚌";
      busEl.style.cssText = "font-size: 28px; cursor: pointer;";

      busMarkerRef.current = new maplibregl.Marker({ element: busEl })
        .setLngLat([stops[0].lng, stops[0].lat])
        .addTo(map);

      mapRef.current = map;
    });

    return () => map.remove();
  }, [trackingData]);

  // Simulation: advance bus one stop every interval
  useEffect(() => {
    if (!trackingData) return;
    const stops = trackingData.stops;
    if (stops.length < 2) return;

    // ETA countdown
    const countdownId = setInterval(() => {
      setEtaSeconds((prev) => {
        if (prev <= 1) return SIMULATION_INTERVAL_MS / 1000;
        return prev - 1;
      });
    }, 1000);

    // Advance stop
    const advanceId = setInterval(() => {
      setSimStopIndex((prev) => {
        const next = (prev + 1) % stops.length;
        if (busMarkerRef.current) {
          busMarkerRef.current.setLngLat([stops[next].lng, stops[next].lat]);
          mapRef.current?.flyTo({ center: [stops[next].lng, stops[next].lat], speed: 0.8 });
        }
        setEtaSeconds(SIMULATION_INTERVAL_MS / 1000);
        return next;
      });
    }, SIMULATION_INTERVAL_MS);

    return () => {
      clearInterval(countdownId);
      clearInterval(advanceId);
    };
  }, [trackingData]);

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
        <div className="alert alert-warning">{error}</div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  const stops = trackingData.stops;
  const nextStop = stops[(simStopIndex + 1) % stops.length];
  const currentStop = stops[simStopIndex];

  const etaMin = Math.floor(etaSeconds / 60);
  const etaSec = etaSeconds % 60;

  return (
    <div className="container-fluid py-3">
      {/* Info bar */}
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <small className="text-muted">Route</small>
              <div className="fw-semibold">{trackingData.route_name}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <small className="text-muted">Bus</small>
              <div className="fw-semibold">
                {trackingData.bus?.bus_number ?? "—"}
                {trackingData.bus?.driver_name && (
                  <span className="text-muted fw-normal"> · {trackingData.bus.driver_name}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <small className="text-muted">Currently at</small>
              <div className="fw-semibold">{currentStop.name}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card h-100 border-0 shadow-sm bg-primary text-white">
            <div className="card-body">
              <small style={{ opacity: 0.8 }}>Next stop · ETA</small>
              <div className="fw-semibold">{nextStop.name}</div>
              <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                {etaMin}m {etaSec.toString().padStart(2, "0")}s
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div
        ref={mapContainer}
        style={{ height: "520px", borderRadius: "12px", overflow: "hidden" }}
        className="shadow-sm"
      />

      <p className="text-muted mt-2" style={{ fontSize: "0.75rem" }}>
        🟡 Yellow marker = your stop &nbsp;|&nbsp; 🔵 Blue line = route &nbsp;|&nbsp; 🚌 Bus position is simulated
      </p>
    </div>
  );
}