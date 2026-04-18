import { useEffect, useRef, useState } from "react";

const LOADING_EVENT = "app:network-loading";
const TOAST_DURATION_MS = 4200;

function AppFeedbackLayer() {
  const [loadingCount, setLoadingCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  useEffect(() => {
    const handleLoadingEvent = (event) => {
      setLoadingCount(Number(event.detail?.count || 0));
    };

    window.addEventListener(LOADING_EVENT, handleLoadingEvent);
    return () => window.removeEventListener(LOADING_EVENT, handleLoadingEvent);
  }, []);

  useEffect(() => {
    const originalAlert = window.alert;

    window.alert = (message) => {
      const id = toastIdRef.current + 1;
      toastIdRef.current = id;

      const text =
        typeof message === "string"
          ? message
          : message != null
            ? String(message)
            : "An unexpected error occurred.";

      setToasts((prev) => [...prev, { id, text }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, TOAST_DURATION_MS);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <>
      <style>
        {`
          @keyframes app-spinner-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      {loadingCount > 0 && (
        <div style={loadingPillStyle}>
          <div style={spinnerStyle} />
          <span style={{ fontSize: "13px", fontWeight: "500" }}>
            {loadingCount > 1 ? `Loading (${loadingCount} requests)...` : "Loading..."}
          </span>
        </div>
      )}

      <div style={toastContainerStyle}>
        {toasts.map((toast) => (
          <div key={toast.id} style={toastStyle}>
            <span style={{ flex: 1 }}>{toast.text}</span>
            <button onClick={() => dismissToast(toast.id)} style={dismissButtonStyle}>
              x
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

const loadingPillStyle = {
  position: "fixed",
  top: "16px",
  right: "16px",
  zIndex: 2000,
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 14px",
  borderRadius: "999px",
  background: "#0f172a",
  color: "#fff",
  boxShadow: "0 10px 24px rgba(0, 0, 0, 0.25)",
};

const spinnerStyle = {
  width: "14px",
  height: "14px",
  borderRadius: "50%",
  border: "2px solid rgba(255, 255, 255, 0.4)",
  borderTopColor: "#fff",
  animation: "app-spinner-spin 0.8s linear infinite",
};

const toastContainerStyle = {
  position: "fixed",
  right: "16px",
  bottom: "16px",
  zIndex: 2100,
  display: "grid",
  gap: "10px",
  width: "min(360px, calc(100vw - 32px))",
};

const toastStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  background: "#b91c1c",
  color: "#fff",
  borderRadius: "10px",
  padding: "10px 12px",
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.18)",
  fontSize: "13px",
};

const dismissButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "700",
  lineHeight: 1,
};

export default AppFeedbackLayer;
