// frontend/src/pages/admin/dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell";
import { Spinner } from "../../components/ui";
import { getDashboard } from "../../services/transportService";
import { colors, fonts } from "../../theme";

const STAT_CONFIG = [
  { key: "total_students",           label: "Total Students",       icon: "👥", path: "/admin/students",           variant: "blue"   },
  { key: "active_buses",             label: "Active Buses",         icon: "🚌", path: "/admin/buses",              variant: "teal"   },
  { key: "active_routes",            label: "Active Routes",        icon: "🛣️", path: "/admin/routes",             variant: "teal"   },
  { key: "active_route_assignments", label: "Assignments",          icon: "📋", path: "/admin/assignments",        variant: "blue"   },
  { key: "pending_complaints",       label: "Pending Complaints",   icon: "💬", path: "/admin/complaints",         variant: "amber"  },
  { key: "open_route_change_requests", label: "Route Requests",    icon: "🔄", path: "/admin/routechangerequests",variant: "amber"  },
  { key: "unverified_fees",          label: "Unverified Fees",      icon: "💳", path: "/admin/feeverifications",   variant: "danger" },
  { key: "pending_maintenance",      label: "Pending Maintenance",  icon: "🔧", path: "/admin/maintenance",        variant: "danger" },
];

const VARIANT_STYLES = {
  blue:   { accent: colors.accent,       bg: colors.infoBg,    text: colors.infoText    },
  teal:   { accent: "#0d9488",           bg: "#f0fdfa",        text: "#115e59"          },
  amber:  { accent: "#d97706",           bg: colors.warningBg, text: colors.warningText },
  danger: { accent: colors.dangerText,   bg: colors.dangerBg,  text: colors.dangerText  },
};

function StatCard({ label, value, icon, path, variant }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const v = VARIANT_STYLES[variant] || VARIANT_STYLES.blue;

  return (
    <div
      onClick={() => navigate(path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? v.bg : "#fff",
        border: `1px solid ${hovered ? v.accent + "40" : colors.borderLight}`,
        borderRadius: "14px",
        padding: "20px",
        cursor: "pointer",
        transition: "all 0.15s",
        boxShadow: hovered
          ? `0 4px 16px ${v.accent}18`
          : "0 1px 3px rgba(11,45,66,0.06)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: v.bg, border: `1px solid ${v.accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px",
        }}>
          {icon}
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hovered ? v.accent : colors.textMuted} strokeWidth="2" strokeLinecap="round">
          <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
        </svg>
      </div>
      <div style={{ fontSize: "30px", fontWeight: "800", color: hovered ? v.accent : colors.textPrimary, fontFamily: fonts.heading, lineHeight: 1, marginBottom: "6px" }}>
        {value ?? "—"}
      </div>
      <div style={{ fontSize: "12.5px", fontWeight: "500", color: colors.textSecondary }}>{label}</div>
    </div>
  );
}

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load dashboard data."));
  }, []);

  if (error) return (
    <PageShell role="staff" title="Admin Dashboard">
      <div style={{ padding: "48px 0", textAlign: "center", color: colors.dangerText }}>{error}</div>
    </PageShell>
  );

  if (!data) return (
    <PageShell role="staff" title="Admin Dashboard"><Spinner /></PageShell>
  );

  const { stats } = data;
  const username = localStorage.getItem("username") || "Admin";

  return (
    <PageShell role="staff" title="Admin Dashboard">
      {/* Welcome header */}
      <div style={styles.welcomeRow}>
        <div>
          <h2 style={styles.welcomeHeading}>Good day, {username} 👋</h2>
          <p style={styles.welcomeSub}>Here's an overview of the transport system for the current semester.</p>
        </div>
        <div style={styles.dateBadge}>
          {new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Stat grid */}
      <div style={styles.grid}>
        {STAT_CONFIG.map((cfg) => (
          <StatCard
            key={cfg.key}
            label={cfg.label}
            value={stats?.[cfg.key]}
            icon={cfg.icon}
            path={cfg.path}
            variant={cfg.variant}
          />
        ))}
      </div>

      {/* Quick actions */}
      <div style={styles.quickActionsCard}>
        <h3 style={styles.sectionHeading}>Quick Actions</h3>
        <div style={styles.quickActionsGrid}>
          {[
            { label: "Add New Bus",        path: "/admin/buses",       icon: "🚌" },
            { label: "Add Driver",         path: "/admin/drivers",     icon: "👤" },
            { label: "Manage Semesters",   path: "/admin/semesters",   icon: "📅" },
            { label: "Verify Fees",        path: "/admin/feeverifications", icon: "✅" },
          ].map((a) => <QuickAction key={a.path} {...a} />)}
        </div>
      </div>
    </PageShell>
  );
}

function QuickAction({ label, path, icon }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => navigate(path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "12px 16px", background: hovered ? colors.pageBg : "#fff",
        border: `1px solid ${hovered ? colors.accent + "50" : colors.borderLight}`,
        borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "600",
        color: hovered ? colors.accent : colors.textPrimary,
        transition: "all 0.15s", fontFamily: fonts.body,
      }}
    >
      <span style={{ fontSize: "16px" }}>{icon}</span>
      {label}
    </button>
  );
}

const styles = {
  welcomeRow: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    flexWrap: "wrap", gap: "12px", marginBottom: "24px",
  },
  welcomeHeading: {
    margin: 0, fontSize: "22px", fontWeight: "800",
    color: colors.textPrimary, fontFamily: fonts.heading, letterSpacing: "-0.02em",
  },
  welcomeSub: { margin: "5px 0 0", fontSize: "13.5px", color: colors.textSecondary },
  dateBadge: {
    fontSize: "12px", fontWeight: "500", color: colors.textMuted,
    background: "#fff", border: `1px solid ${colors.borderLight}`,
    borderRadius: "999px", padding: "6px 14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "14px", marginBottom: "24px",
  },
  quickActionsCard: {
    background: "#fff", borderRadius: "14px",
    border: `1px solid ${colors.borderLight}`,
    padding: "20px 24px",
    boxShadow: "0 1px 3px rgba(11,45,66,0.06)",
  },
  sectionHeading: {
    margin: "0 0 14px", fontSize: "14px", fontWeight: "700",
    color: colors.textPrimary, fontFamily: fonts.heading,
  },
  quickActionsGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px",
  },
};

export default AdminDashboard;