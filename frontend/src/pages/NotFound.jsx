import { Link } from "react-router-dom";

function NotFoundPage() {
  const isAuthenticated = Boolean(localStorage.getItem("access"));
  const isStaff = localStorage.getItem("is_staff") === "true";

  const fallbackPath = isAuthenticated
    ? isStaff
      ? "/admin/dashboard"
      : "/student/dashboard"
    : "/";

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <p style={codeStyle}>404</p>
        <h1 style={titleStyle}>Page Not Found</h1>
        <p style={bodyStyle}>
          The page you requested does not exist or has been moved.
        </p>
        <Link to={fallbackPath} style={buttonStyle}>
          Go Back
        </Link>
      </div>
    </div>
  );
}

const containerStyle = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
  padding: "24px",
};

const cardStyle = {
  width: "min(520px, 100%)",
  background: "#fff",
  borderRadius: "14px",
  padding: "36px 30px",
  textAlign: "center",
  boxShadow: "0 20px 40px rgba(15, 23, 42, 0.12)",
};

const codeStyle = {
  margin: 0,
  fontSize: "52px",
  fontWeight: 800,
  color: "#0f172a",
  letterSpacing: "1px",
};

const titleStyle = {
  margin: "10px 0 8px",
  fontSize: "28px",
  color: "#1e293b",
};

const bodyStyle = {
  margin: "0 0 22px",
  color: "#475569",
};

const buttonStyle = {
  display: "inline-block",
  padding: "10px 18px",
  borderRadius: "8px",
  textDecoration: "none",
  background: "#0f172a",
  color: "#fff",
  fontWeight: "600",
};

export default NotFoundPage;
