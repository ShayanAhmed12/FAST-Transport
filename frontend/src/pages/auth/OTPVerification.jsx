import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function OTPVerification() {
  const location = useLocation();
  const navigate = useNavigate();

  // SAFE EMAIL HANDLING
  const email =
    location.state?.email ||
    localStorage.getItem("otp_email");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!otp) {
      setError("Please enter OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:8000/api/verify-otp/", {
        email,
        otp,
      });

      // ✅ CLEANUP (IMPORTANT)
      localStorage.removeItem("otp_email");

      alert("OTP Verified Successfully!");

      // redirect to login
      navigate("/login");

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setError("");

      await axios.post("http://localhost:8000/api/resend-otp/", {
        email,
      });

      alert("New OTP sent to your email!");

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Failed to resend OTP"
      );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <h2 style={styles.title}>OTP Verification</h2>

        <p style={styles.subtitle}>
          Enter OTP sent to: <b>{email}</b>
        </p>

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          style={styles.input}
        />

        {error && (
          <p style={styles.error}>{error}</p>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          onClick={handleResend}
          style={styles.resend}
        >
          Resend OTP
        </button>

      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f0f0f",
    fontFamily: "sans-serif",
  },
  card: {
    width: "350px",
    padding: "25px",
    borderRadius: "12px",
    background: "#1c1c1c",
    color: "#fff",
    textAlign: "center",
  },
  title: {
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#aaa",
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "1px solid #333",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#4caf50",
    border: "none",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "10px",
  },
  resend: {
    background: "transparent",
    border: "none",
    color: "#4caf50",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: "12px",
    marginBottom: "10px",
  },
};

export default OTPVerification;