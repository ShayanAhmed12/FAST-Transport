import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import {
  getChallan,
  createPaymentIntent,
  confirmStripePayment,
  verifyPaymentOtp,
} from "../../services/transportService";

// ── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  const steps = ["Card Details", "OTP Verification", "Complete"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "28px" }}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "70px" }}>
              <div
                style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  display: "grid", placeItems: "center", fontSize: "13px", fontWeight: 600,
                  background: done ? "#639922" : active ? "#4f46e5" : "#e5e7eb",
                  color: done || active ? "#fff" : "#9ca3af",
                  transition: "all 0.3s",
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: "11px", marginTop: "4px", color: active ? "#4f46e5" : "#9ca3af", fontWeight: active ? 600 : 400 }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: "2px", background: done ? "#639922" : "#e5e7eb", margin: "0 6px", transition: "all 0.3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Simulated Stripe card form ───────────────────────────────────────────────
function StripeCardForm({ amount, onSuccess, onCancel }) {
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/29");
  const [cvc, setCvc] = useState("123");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handlePay = () => {
    setError("");
    const cleanCard = card.replace(/\s/g, "");
    if (cleanCard.length !== 16) { setError("Invalid card number"); return; }
    if (!expiry.match(/^\d{2}\/\d{2}$/)) { setError("Invalid expiry (MM/YY)"); return; }
    if (cvc.length < 3) { setError("Invalid CVC"); return; }
    setProcessing(true);
    // Simulate 1.5s processing delay
    setTimeout(() => { setProcessing(false); onSuccess(); }, 1500);
  };

  return (
    <div style={stripeFormStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="6" fill="#635BFF" />
          <text x="6" y="19" fill="white" fontSize="12" fontWeight="700" fontFamily="sans-serif">Stripe</text>
        </svg>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Stripe Test Payment</span>
        <span style={{ marginLeft: "auto", fontSize: "11px", padding: "2px 8px", borderRadius: "4px", background: "#e0e7ff", color: "#4f46e5", fontWeight: 500 }}>MASTERCARD/VISA</span>
      </div>

      <div style={{ fontSize: "22px", fontWeight: 700, color: "#111", marginBottom: "20px" }}>PKR {amount}</div>

      {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "12px" }}>{error}</div>}

      <label style={stripeLabelStyle}>Card Number</label>
      <input
        value={card}
        onChange={(e) => setCard(e.target.value)}
        placeholder="4242 4242 4242 4242"
        style={stripeInputStyle}
        maxLength={19}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
        <div>
          <label style={stripeLabelStyle}>Expiry</label>
          <input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" style={stripeInputStyle} maxLength={5} />
        </div>
        <div>
          <label style={stripeLabelStyle}>CVC</label>
          <input value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="123" style={stripeInputStyle} maxLength={4} type="password" />
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button onClick={onCancel} style={cancelBtnStyle} disabled={processing}>Cancel</button>
        <button onClick={handlePay} disabled={processing} style={stripePayBtnStyle}>
          {processing ? (
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />
              Processing…
            </span>
          ) : `Pay PKR ${amount}`}
        </button>
      </div>

      <p style={{ fontSize: "11px", color: "#9ca3af", margin: "14px 0 0", textAlign: "center" }}>
        🔒 Test mode — use card 4242 4242 4242 4242
      </p>
    </div>
  );
}

// ── OTP input ────────────────────────────────────────────────────────────────
function OTPInput({ emailHint, onVerify, onResend }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const refs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length !== 6) { setError("Please enter all 6 digits."); return; }
    setError("");
    setVerifying(true);
    try {
      await onVerify(code);
    } catch (err) {
      setError(err.response?.data?.detail || "Verification failed.");
      setVerifying(false);
    }
  };

  return (
    <div style={otpContainerStyle}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#e0e7ff", display: "grid", placeItems: "center", margin: "0 auto 12px" }}>
          <span style={{ fontSize: "24px" }}>📧</span>
        </div>
        <h3 style={{ margin: "0 0 6px", fontSize: "18px" }}>OTP Verification</h3>
        <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
          We've sent a 6-digit code to <strong>{emailHint || "your email"}</strong>
        </p>
      </div>

      {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "12px", textAlign: "center" }}>{error}</div>}

      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "20px" }}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            style={otpDigitStyle}
            maxLength={1}
            inputMode="numeric"
          />
        ))}
      </div>

      <button onClick={handleSubmit} disabled={verifying} style={stripePayBtnStyle}>
        {verifying ? "Verifying…" : "Verify OTP"}
      </button>

      <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", margin: "14px 0 0" }}>
        Didn't receive the code?{" "}
        <span onClick={onResend} style={{ color: "#4f46e5", cursor: "pointer", fontWeight: 500 }}>Resend OTP</span>
      </p>
    </div>
  );
}

// ── Success card ─────────────────────────────────────────────────────────────
function SuccessCard({ amount, onClose }) {
  return (
    <div style={overlayStyle}>
      <div style={successCardStyle}>
        <div style={iconWrapStyle}>
          <svg viewBox="0 0 80 80" width="80" height="80" style={{ animation: "pulse 2s ease-in-out 0.8s infinite" }}>
            <circle cx="40" cy="40" r="38" fill="#EAF3DE" stroke="#639922" strokeWidth="1.5" />
            <polyline
              points="22,40 35,53 58,28"
              fill="none" stroke="#3B6D11" strokeWidth="5"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ animation: "drawCheck 0.45s ease-out 0.3s forwards", strokeDasharray: 60, strokeDashoffset: 60 }}
            />
          </svg>
        </div>

        <p style={{ fontSize: "18px", fontWeight: "500", margin: "0 0 8px", animation: "fadeUp 0.4s ease 0.5s both" }}>
          Payment Verified
        </p>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 1.5rem", animation: "fadeUp 0.4s ease 0.6s both" }}>
          Your fee payment has been verified via OTP.<br />Wait for admin to confirm registration.
        </p>

        <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "12px 16px", textAlign: "left", marginBottom: "1.5rem", animation: "fadeUp 0.4s ease 0.7s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "13px", color: "#6b7280" }}>Amount</span>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>PKR {amount}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", color: "#6b7280" }}>Status</span>
            <span style={{ fontSize: "12px", fontWeight: "500", background: "#EAF3DE", color: "#3B6D11", padding: "2px 10px", borderRadius: "20px" }}>Paid & Verified</span>
          </div>
        </div>

        <button onClick={onClose} style={doneButtonStyle}>Done</button>
      </div>

      <style>{`
        @keyframes popIn { 0%{transform:scale(0.4);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes drawCheck { from{stroke-dashoffset:60} to{stroke-dashoffset:0} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
      `}</style>
    </div>
  );
}

// ── Main ChallanPage ─────────────────────────────────────────────────────────
function ChallanPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0); // 0=details, 1=card, 2=otp, 3=success
  const [emailHint, setEmailHint] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const pollRef = useRef(null);

  const fetchChallan = () =>
    getChallan(id)
      .then((res) => setData(res.data))
      .catch(() => {});

  useEffect(() => {
    getChallan(id)
      .then((res) => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  // Poll while paid but not approved
  useEffect(() => {
    const isPaidNotApproved =
      data?.status === "paid" &&
      (data?.registration_status || "").toLowerCase() !== "approved";

    if (isPaidNotApproved) {
      pollRef.current = setInterval(fetchChallan, 10000);
    } else {
      clearInterval(pollRef.current);
    }
    return () => clearInterval(pollRef.current);
  }, [data?.status, data?.registration_status]);

  // Step 1: User clicks Pay → create PaymentIntent → show card form
  const handleStartPayment = async () => {
    try {
      await createPaymentIntent(id);
      setStep(1); // Show card form
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to start payment");
    }
  };

  // Step 2: Card "payment" succeeds → confirm with backend → show OTP
  const handleCardSuccess = async () => {
    try {
      const res = await confirmStripePayment(id);
      setEmailHint(res.data.email_hint || "");
      setStep(2); // Show OTP input
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to confirm payment");
    }
  };

  // Step 3: OTP verified → mark challan paid → show success
  const handleOTPVerify = async (otpCode) => {
    const res = await verifyPaymentOtp(id, otpCode);
    setData((prev) => ({ ...prev, status: "paid" }));
    setStep(3);
    setShowSuccess(true);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      const res = await confirmStripePayment(id);
      setEmailHint(res.data.email_hint || "");
      alert("A new OTP has been sent to your email.");
    } catch {
      alert("Failed to resend OTP.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Challan not found</p>;

  const isPaid = data.status === "paid";
  const isApproved = (data.registration_status || "").toLowerCase() === "approved";

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="student" />
      <div style={{ flex: 1 }}>
        <Navbar title="Fee Challan" />
        <div style={{ padding: "24px", maxWidth: "600px" }}>
          <h2>Transport Fee Challan</h2>

          <div style={cardStyle}>
            <DetailRow label="Student" value={data.student_name} />
            <DetailRow label="Semester" value={data.semester_name} />
            <DetailRow label="Route" value={data.route_name} />
            <DetailRow label="Stop" value={data.stop_name} />
            <DetailRow label="Amount" value={`PKR ${data.amount}`} />
            <DetailRow label="Status" value={data.status} />
          </div>

          {/* Payment flow — only show for unpaid challans */}
          {!isPaid && step === 0 && (
            <>
              <div style={cardStyle}>
                <h3 style={{ margin: "0 0 10px" }}>Payment Instructions</h3>
                <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "14px", color: "#555", lineHeight: "1.8" }}>
                  <li>Click "Pay with Stripe" to enter card details</li>
                  <li>Use test card: <strong>4242 4242 4242 4242</strong></li>
                  <li>Verify the OTP sent to your email</li>
                  <li>After verification, wait for admin approval</li>
                </ul>
              </div>
              <button onClick={handleStartPayment} style={payButtonStyle}>
                💳 Pay with Stripe
              </button>
            </>
          )}

          {!isPaid && step >= 1 && step <= 2 && (
            <StepIndicator current={step - 1} />
          )}

          {!isPaid && step === 1 && (
            <StripeCardForm
              amount={data.amount}
              onSuccess={handleCardSuccess}
              onCancel={() => setStep(0)}
            />
          )}

          {!isPaid && step === 2 && (
            <OTPInput
              emailHint={emailHint}
              onVerify={handleOTPVerify}
              onResend={handleResendOtp}
            />
          )}

          {/* Paid but not yet verified */}
          {isPaid && !isApproved && !showSuccess && (
            <div style={waitingBannerStyle}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#92400e" }}>Pending</span>
              <div>
                <p style={{ margin: 0, fontWeight: "500", fontSize: "14px", color: "#92400e" }}>
                  Waiting for admin verification
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#b45309" }}>
                  Page refreshes automatically every 10 seconds.
                </p>
              </div>
            </div>
          )}

          {/* Paid and approved */}
          {isPaid && isApproved && (
            <div style={approvedBannerStyle}>
              <div>
                <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "#166534" }}>
                  Fee Verified &amp; Registration Approved
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#15803d" }}>
                  Your transport registration is now active for this semester.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSuccess && (
        <SuccessCard
          amount={data.amount}
          onClose={() => { setShowSuccess(false); fetchChallan(); }}
        />
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
      <span style={{ fontSize: "13px", color: "#6b7280" }}>{label}</span>
      <span style={{ fontSize: "14px", fontWeight: "500" }}>{value || "—"}</span>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const cardStyle          = { border: "1px solid #ddd", borderRadius: "8px", padding: "16px", marginBottom: "20px" };
const payButtonStyle     = { padding: "12px 24px", background: "#635BFF", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" };
const doneButtonStyle    = { width: "100%", padding: "10px", background: "#639922", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", animation: "fadeUp 0.4s ease 0.8s both" };
const overlayStyle       = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const successCardStyle   = { background: "#fff", borderRadius: "16px", padding: "2.5rem 2rem", maxWidth: "320px", width: "90%", textAlign: "center", animation: "popIn 0.5s cubic-bezier(.34,1.56,.64,1) both" };
const iconWrapStyle      = { width: "80px", height: "80px", margin: "0 auto 1.5rem" };
const waitingBannerStyle = { display: "flex", alignItems: "flex-start", gap: "12px", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px", padding: "14px 16px", fontSize: "14px" };
const approvedBannerStyle = { display: "flex", alignItems: "flex-start", gap: "12px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "14px 16px", fontSize: "14px" };

const stripeFormStyle    = { border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px", background: "#fafafa", marginBottom: "20px" };
const stripeLabelStyle   = { fontSize: "12px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.04em" };
const stripeInputStyle   = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px", color: "#111", background: "#fff", outline: "none", boxSizing: "border-box" };
const stripePayBtnStyle  = { width: "100%", padding: "12px", background: "#635BFF", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: 600, cursor: "pointer" };
const cancelBtnStyle     = { flex: "0 0 auto", padding: "12px 20px", background: "#fff", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", cursor: "pointer", color: "#374151" };

const otpContainerStyle  = { border: "1px solid #e5e7eb", borderRadius: "12px", padding: "28px 24px", background: "#fafafa", marginBottom: "20px" };
const otpDigitStyle      = { width: "44px", height: "52px", textAlign: "center", fontSize: "22px", fontWeight: 700, borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", background: "#fff" };

export default ChallanPage;