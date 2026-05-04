// frontend/src/components/Navbar.jsx
import { useNavigate } from "react-router-dom";
import { colors, fonts, shadow } from "../theme";

function Navbar({ title = "FAST Transport" }) {
  const navigate = useNavigate();

  const isStaff  = localStorage.getItem("is_staff") === "true";
  const fullName = localStorage.getItem("full_name") 
                || localStorage.getItem("username") 
                || "";

  const initials = fullName
    ? fullName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : isStaff ? "AD" : "ST";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header style={styles.navbar}>
      <div style={styles.left}>
        <div style={styles.titleWrap}>
          <p style={styles.eyebrow}>FAST NUCES · Transport</p>
          <h1 style={styles.title}>{title}</h1>
        </div>
      </div>

      <div style={styles.right}>
        <span style={isStaff ? styles.roleAdmin : styles.roleStudent}>
          {isStaff ? "Admin" : "Student"}
        </span>

        <div style={styles.divider} />

        {fullName && (
          <div style={styles.userChip}>
            <div style={styles.avatar}>{initials}</div>
            <span style={styles.username}>{fullName}</span>
          </div>
        )}

        <button onClick={handleLogout} style={styles.logoutBtn} title="Sign out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}

const styles = {
  navbar: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    padding:        "0 28px",
    height:         "64px",
    background:     "#fff",
    borderBottom:   `1px solid ${colors.borderLight}`,
    boxShadow:      shadow.navbar,
    fontFamily:     fonts.body,
    gap:            "16px",
    flexShrink:     0,
    position:       "sticky",
    top:            0,
    zIndex:         100,
  },
  left: {
    display:    "flex",
    alignItems: "center",
    gap:        "14px",
    minWidth:   0,
  },
  titleWrap: {
    display:       "flex",
    flexDirection: "column",
    gap:           "1px",
    overflow:      "hidden",
  },
  eyebrow: {
    margin:        0,
    fontSize:      "10px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color:         colors.textMuted,
    fontWeight:    500,
    whiteSpace:    "nowrap",
  },
  title: {
    margin:        0,
    fontSize:      "16px",
    fontWeight:    "700",
    color:         colors.textPrimary,
    letterSpacing: "-0.02em",
    whiteSpace:    "nowrap",
    overflow:      "hidden",
    textOverflow:  "ellipsis",
    fontFamily:    fonts.heading,
  },
  right: {
    display:    "flex",
    alignItems: "center",
    gap:        "10px",
    flexShrink: 0,
  },
  roleAdmin: {
    fontSize:     "10.5px",
    fontWeight:   "700",
    letterSpacing:"0.06em",
    textTransform:"uppercase",
    padding:      "4px 10px",
    borderRadius: "999px",
    background:   "rgba(40,141,196,0.1)",
    color:        colors.accent,
    border:       `1px solid rgba(40,141,196,0.2)`,
  },
  roleStudent: {
    fontSize:     "10.5px",
    fontWeight:   "700",
    letterSpacing:"0.06em",
    textTransform:"uppercase",
    padding:      "4px 10px",
    borderRadius: "999px",
    background:   "rgba(34,197,94,0.08)",
    color:        "#15803d",
    border:       "1px solid rgba(34,197,94,0.2)",
  },
  divider: {
    width:      "1px",
    height:     "22px",
    background: colors.borderLight,
  },
  userChip: {
    display:    "flex",
    alignItems: "center",
    gap:        "8px",
    padding:    "5px 10px 5px 5px",
    borderRadius:"999px",
    background: colors.pageBg,
    border:     `1px solid ${colors.borderLight}`,
  },
  avatar: {
    width:          "28px",
    height:         "28px",
    borderRadius:   "50%",
    background:     colors.accent,
    color:          "#fff",
    fontSize:       "10px",
    fontWeight:     "800",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    letterSpacing:  "0.04em",
    flexShrink:     0,
  },
  username: {
    fontSize:    "13px",
    fontWeight:  "600",
    color:       colors.textPrimary,
    maxWidth:    "140px",
    overflow:    "hidden",
    textOverflow:"ellipsis",
    whiteSpace:  "nowrap",
  },
  logoutBtn: {
    display:      "flex",
    alignItems:   "center",
    gap:          "6px",
    padding:      "7px 14px",
    background:   "transparent",
    border:       `1px solid ${colors.borderMid}`,
    borderRadius: "9px",
    color:        colors.textSecondary,
    fontSize:     "13px",
    fontWeight:   "500",
    cursor:       "pointer",
    fontFamily:   fonts.body,
    transition:   "all 0.15s",
    flexShrink:   0,
  },
};

export default Navbar;