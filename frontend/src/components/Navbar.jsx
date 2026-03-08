import { useNavigate } from "react-router-dom";

function Navbar({ title = "FAST Transport" }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        background: "#1a1a2e",
        color: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      }}
    >
      <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{title}</span>
      <button
        onClick={handleLogout}
        style={{
          padding: "6px 14px",
          cursor: "pointer",
          background: "#e74c3c",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Logout
      </button>
    </nav>
  );
}

export default Navbar;
