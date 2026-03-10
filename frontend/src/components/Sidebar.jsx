import { NavLink } from "react-router-dom";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/buses", label: "Buses" },
  { to: "/admin/drivers", label: "Drivers" },
  { to: "/admin/routes", label: "Routes" },
  { to: "/admin/assignments", label: "Assignments" },
  { to: "/admin/stops", label: "Stops" },
  { to: "/admin/semesters", label: "Semesters" },
];

const studentLinks = [
  { to: "/student/dashboard", label: "Dashboard" },
  { to: "/student/transport", label: "My Transport" },
  { to: "/student/complaints", label: "Complaints" },
];

function Sidebar({ role = "student" }) {
  const links = role === "staff" ? adminLinks : studentLinks;

  return (
    <aside
      style={{
        width: "200px",
        minHeight: "100vh",
        background: "#16213e",
        color: "#fff",
        padding: "20px 0",
        flexShrink: 0,
      }}
    >
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            display: "block",
            padding: "12px 20px",
            color: isActive ? "#fff" : "#aaa",
            background: isActive ? "#0f3460" : "transparent",
            textDecoration: "none",
            borderLeft: isActive ? "3px solid #e94560" : "3px solid transparent",
          })}
        >
          {label}
        </NavLink>
      ))}
    </aside>
  );
}

export default Sidebar;
