import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MeshGradient } from "@paper-design/shaders-react";
import { signup } from "../../services/transportService";

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    roll_number: "",
    department: "",
    batch: "",
    phone: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


 const handleSignup = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    await signup(formData);

    // SAVE EMAIL for OTP page


    // REDIRECT TO OTP PAGE
   
    localStorage.setItem("otp_email", formData.email);
navigate("/verify-otp", { state: { email: formData.email } });

  } catch (err) {
    setError(JSON.stringify(err.response?.data || "Signup failed"));
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={styles.root}>
      <MeshGradient
  style={styles.shader}
  colors={["#291919", "#ef9898", "#b31c1c", "#c42828"]}
  distortion={0.5}
  swirl={0.3}
  speed={0.5}
/>

      <div style={styles.grain} />

      <div style={styles.scroll}>
        <div style={styles.container}>
          <div style={styles.brand}>
            <div style={styles.logoMark}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="8" width="24" height="12" rx="2" stroke="white" strokeWidth="1.5" />
                <circle cx="8" cy="22" r="3" fill="white" />
                <circle cx="20" cy="22" r="3" fill="white" />
                <path d="M2 12h6l2-4h8l2 4" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p style={styles.brandSub}>FAST NUCES</p>
              <h1 style={styles.brandName}>Transport Portal</h1>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Create account</h2>
              <p style={styles.cardDesc}>Register for student transport access</p>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} style={styles.form}>
              {/* Account Section */}
              <div style={styles.sectionLabel}>Account</div>

              <div style={styles.field}>
                <label style={styles.label}>Username <span style={styles.req}>*</span></label>
                <input name="username" type="text" placeholder="e.g. ali_khan" onChange={handleChange} required
                  style={styles.input}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, styles.input)} />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Email <span style={styles.req}>*</span></label>
                <input name="email" type="email" placeholder="you@nu.edu.pk" onChange={handleChange} required
                  style={styles.input}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, styles.input)} />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Password <span style={styles.req}>*</span></label>
                <input name="password" type="password" placeholder="Min. 8 characters" onChange={handleChange} required
                  style={styles.input}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, styles.input)} />
              </div>

              {/* Student Details Section */}
              <div style={{ ...styles.sectionLabel, marginTop: "8px" }}>Student Details</div>

              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Roll Number <span style={styles.req}>*</span></label>
                  <input name="roll_number" type="text" placeholder="22K-1234" onChange={handleChange} required
                    style={styles.input}
                    onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                    onBlur={(e) => Object.assign(e.target.style, styles.input)} />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Batch</label>
                  <input name="batch" type="text" placeholder="e.g. 2022" onChange={handleChange}
                    style={styles.input}
                    onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                    onBlur={(e) => Object.assign(e.target.style, styles.input)} />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Department</label>
                  <input name="department" type="text" placeholder="e.g. CS, SE" onChange={handleChange}
                    style={styles.input}
                    onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                    onBlur={(e) => Object.assign(e.target.style, styles.input)} />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Phone</label>
                  <input name="phone" type="text" placeholder="+92 300 0000000" onChange={handleChange}
                    style={styles.input}
                    onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                    onBlur={(e) => Object.assign(e.target.style, styles.input)} />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Home Address</label>
                <input name="address" type="text" placeholder="Your pickup area" onChange={handleChange}
                  style={styles.input}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, styles.input)} />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                onMouseEnter={(e) => { if (!loading) Object.assign(e.target.style, styles.buttonHover); }}
                onMouseLeave={(e) => { if (!loading) Object.assign(e.target.style, styles.button); }}
              >
                {loading ? <span style={styles.spinner} /> : "Create Account"}
              </button>
            </form>

            <p style={styles.footer}>
              Already have an account?{" "}
              <Link to="/login" style={styles.link}>Sign in</Link>
            </p>
          </div>

          <p style={styles.bottomNote}>
            © {new Date().getFullYear()} FAST-NUCES · Transport Management System
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    background: "#000",
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
  },
  shader: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  grain: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
    backgroundRepeat: "repeat",
    backgroundSize: "128px 128px",
    pointerEvents: "none",
  },
  scroll: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    height: "100%",
    overflowY: "auto",
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
    boxSizing: "border-box",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "28px",
    width: "100%",
    maxWidth: "460px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  logoMark: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(8px)",
  },
  brandSub: {
    margin: 0,
    fontSize: "10px",
    letterSpacing: "0.2em",
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    fontWeight: 500,
  },
  brandName: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  card: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "20px",
    padding: "36px 32px",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 32px 64px rgba(0,0,0,0.5)",
    boxSizing: "border-box",
  },
  cardHeader: {
    marginBottom: "28px",
  },
  cardTitle: {
    margin: "0 0 6px",
    fontSize: "22px",
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.03em",
  },
  cardDesc: {
    margin: 0,
    fontSize: "13px",
    color: "rgba(255,255,255,0.4)",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,107,107,0.08)",
    border: "1px solid rgba(255,107,107,0.2)",
    borderRadius: "10px",
    padding: "10px 14px",
    marginBottom: "20px",
    fontSize: "13px",
    color: "#ff6b6b",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sectionLabel: {
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.15em",
    color: "rgba(255,255,255,0.25)",
    textTransform: "uppercase",
    marginBottom: "-6px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 500,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  req: {
    color: "rgba(255,100,100,0.7)",
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "10px",
    padding: "11px 13px",
    fontSize: "13px",
    color: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  inputFocus: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.28)",
    borderRadius: "10px",
    padding: "11px 13px",
    fontSize: "13px",
    color: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  button: {
    marginTop: "8px",
    background: "#fff",
    color: "#000",
    border: "none",
    borderRadius: "10px",
    padding: "13px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: "-0.01em",
    boxSizing: "border-box",
  },
  buttonHover: {
    marginTop: "8px",
    background: "#e0e0e0",
    color: "#000",
    border: "none",
    borderRadius: "10px",
    padding: "13px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: "-0.01em",
    boxSizing: "border-box",
  },
  buttonDisabled: {
    background: "rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.4)",
    cursor: "not-allowed",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(0,0,0,0.2)",
    borderTopColor: "#000",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  footer: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "13px",
    color: "rgba(255,255,255,0.35)",
    marginBottom: 0,
  },
  link: {
    color: "rgba(255,255,255,0.75)",
    textDecoration: "none",
    fontWeight: 500,
    borderBottom: "1px solid rgba(255,255,255,0.2)",
    paddingBottom: "1px",
  },
  bottomNote: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.18)",
    letterSpacing: "0.03em",
    textAlign: "center",
    margin: "0 0 20px",
  },
};

export default Signup;