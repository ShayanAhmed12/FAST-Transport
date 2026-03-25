import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getChallan } from "../../services/transportService";

function SuccessCard({ amount, onClose }) {
  return (
    <div style={overlayStyle}>
      <div style={successCardStyle}>
        <div style={iconWrapStyle}>
          <svg viewBox="0 0 80 80" width="80" height="80" style={{ animation: "pulse 2s ease-in-out 0.8s infinite" }}>
            <circle cx="40" cy="40" r="38" fill="#EAF3DE" stroke="#639922" strokeWidth="1.5" />
            <polyline
              points="22,40 35,53 58,28"
              fill="none"
              stroke="#3B6D11"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: "drawCheck 0.45s ease-out 0.3s forwards", strokeDasharray: 60, strokeDashoffset: 60 }}
            />
          </svg>
        </div>

        <p style={{ fontSize: "18px", fontWeight: "500", margin: "0 0 8px", animation: "fadeUp 0.4s ease 0.5s both" }}>
          Transaction Completed
        </p>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 1.5rem", animation: "fadeUp 0.4s ease 0.6s both" }}>
          Your fee payment has been recorded.<br />Wait for admin verification.
        </p>

        <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "12px 16px", textAlign: "left", marginBottom: "1.5rem", animation: "fadeUp 0.4s ease 0.7s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "13px", color: "#6b7280" }}>Amount</span>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>PKR {amount}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", color: "#6b7280" }}>Status</span>
            <span style={{ fontSize: "12px", fontWeight: "500", background: "#EAF3DE", color: "#3B6D11", padding: "2px 10px", borderRadius: "20px" }}>Paid</span>
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

function ChallanPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    getChallan(id)
      .then((res) => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handlePay = () => {
    setPaid(true);
    setShowSuccess(true);
  };

  if (loading) return <p>Loading...</p>;
  if (!data)   return <p>Challan not found</p>;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="student" />
      <div style={{ flex: 1 }}>
        <Navbar title="Fee Challan" />
        <div style={{ padding: "24px", maxWidth: "600px" }}>
          <h2>Transport Fee Challan</h2>

          <div style={cardStyle}>
            <DetailRow label="Student"  value={data.student_name} />
            <DetailRow label="Semester" value={data.semester_name} />
            <DetailRow label="Route"    value={data.route_name} />
            <DetailRow label="Stop"     value={data.stop_name} />
            <DetailRow label="Amount"   value={`PKR ${data.amount}`} />
            <DetailRow label="Status"   value={data.status} />
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 10px" }}>Payment Instructions</h3>
            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "14px", color: "#555", lineHeight: "1.8" }}>
              <li>Pay via bank transfer or campus office</li>
              <li>Keep your receipt safe</li>
              <li>After payment, wait for admin verification</li>
            </ul>
          </div>

          {!data.is_paid && !paid && (
            <button onClick={handlePay} style={payButtonStyle}>Pay Now</button>
          )}

          {(data.is_paid || paid) && !showSuccess && (
            <p style={{ color: "#3B6D11", fontWeight: "500" }}>Payment Completed</p>
          )}
        </div>
      </div>

      {showSuccess && (
        <SuccessCard
          amount={data.amount}
          onClose={() => setShowSuccess(false)}
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

const cardStyle     = { border: "1px solid #ddd", borderRadius: "8px", padding: "16px", marginBottom: "20px" };
const payButtonStyle = { padding: "10px 20px", background: "#639922", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" };
const doneButtonStyle = { width: "100%", padding: "10px", background: "#639922", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", animation: "fadeUp 0.4s ease 0.8s both" };
const overlayStyle  = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const successCardStyle = { background: "#fff", borderRadius: "16px", padding: "2.5rem 2rem", maxWidth: "320px", width: "90%", textAlign: "center", animation: "popIn 0.5s cubic-bezier(.34,1.56,.64,1) both" };
const iconWrapStyle = { width: "80px", height: "80px", margin: "0 auto 1.5rem" };

export default ChallanPage;