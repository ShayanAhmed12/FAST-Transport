import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell, { PageTitle, ContentCard } from "../../components/PageShell";
import { Spinner, DetailRow, Pill, Banner } from "../../components/ui";
import { btn, colors, fonts, radius } from "../../theme";
import { getDashboard } from "../../services/transportService";

function StudentDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const pendingMsg = "Fees paid; Admin will assign seats shortly.";
  const unpaidMsg  = "Registration submitted. Please pay transport fee to proceed.";

  useEffect(() => {
    getDashboard()
      .then((res) => {
        const d = res.data;
        if (d.role === "staff") { navigate("/admin/dashboard", { replace: true }); return; }
        setData(d);
      })
      .catch(() => setError("Failed to load dashboard data."));
  }, [navigate]);

  if (error) return (
    <PageShell role="student" title="Student Dashboard">
      <Banner variant="danger">{error}</Banner>
    </PageShell>
  );
  if (!data) return <PageShell role="student" title="Student Dashboard"><Spinner /></PageShell>;

  const { profile, recent_notifications, active_registration, seat, waitlist_position } = data;
  const normStatus = (active_registration?.status || "").toLowerCase();
  const hasSubmittedFee = Boolean(active_registration?.fee_submitted);
  const displayStatus = (!seat && hasSubmittedFee && ["pending", "approved", "payment_submitted"].includes(normStatus))
    ? pendingMsg : active_registration?.status;

  const canRequestRouteChange = active_registration && ["approved", "confirmed"].includes(normStatus) && seat;

  return (
    <PageShell role="student" title="Student Dashboard">
      <PageTitle sub={`${profile.department} · Batch ${profile.batch}`}>
        Welcome, {profile.roll_number}
      </PageTitle>

      {/* Profile */}
      <ContentCard>
        <h3 style={sectionH}>My Profile</h3>
        <DetailRow label="Roll No"     value={profile.roll_number} />
        <DetailRow label="Department"  value={profile.department} />
        <DetailRow label="Batch"       value={profile.batch} />
        <DetailRow label="Phone"       value={profile.phone} />
        <DetailRow label="Address"     value={profile.address} />
      </ContentCard>

      {/* Notifications */}
      <ContentCard>
        <h3 style={sectionH}>Notifications</h3>
        {recent_notifications?.length > 0 ? (
          <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
            {recent_notifications.map((n, i) => (
              <li key={i} style={{ marginBottom: "8px", opacity: n.is_read ? 0.55 : 1, fontSize: "13.5px", lineHeight: 1.6 }}>
                <strong>{n.title}</strong>: {n.message}
                {!n.is_read && <Pill label="New" variant="info" style={{ marginLeft: "8px" }} />}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0, color: colors.textMuted, fontSize: "13.5px" }}>No notifications.</p>
        )}
      </ContentCard>

      {/* Transport status */}
      <ContentCard>
        <h3 style={sectionH}>Transport Status</h3>
        {active_registration ? (
          <>
            <DetailRow label="Route"  value={active_registration.route} />
            <DetailRow label="Stop"   value={active_registration.stop} />
            <DetailRow label="Status" value={<Pill label={displayStatus} variant={normStatus === "approved" ? "success" : "warning"} />} />
            <div style={{ marginTop: "14px" }}>
              {seat ? (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: colors.successBg, border: `1px solid rgba(34,197,94,0.2)`, borderRadius: radius.md, padding: "10px 16px" }}>
                  <span style={{ fontSize: "20px" }}>🎫</span>
                  <span style={{ fontWeight: "700", color: colors.successText }}>Seat Allocated: #{seat.seat_number}</span>
                </div>
              ) : waitlist_position ? (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: colors.warningBg, border: `1px solid rgba(245,158,11,0.2)`, borderRadius: radius.md, padding: "10px 16px" }}>
                  <span style={{ fontSize: "20px" }}>⏳</span>
                  <span style={{ fontWeight: "700", color: colors.warningText }}>Waitlist Position: #{waitlist_position}</span>
                </div>
              ) : (
                <p style={{ margin: 0, color: colors.textSecondary, fontSize: "13.5px" }}>
                  {hasSubmittedFee ? "Pending seat allocation…" : unpaidMsg}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <Banner variant="warning">{unpaidMsg}</Banner>
            <button onClick={() => navigate("/student/transport")} style={{ ...btn.primary, marginTop: "4px" }}>
              View My Transport
            </button>
          </>
        )}
      </ContentCard>

      {/* Route change CTA */}
      {canRequestRouteChange && (
        <ContentCard style={{ borderLeft: `4px solid ${colors.accent}` }}>
          <h3 style={{ ...sectionH, marginBottom: "6px" }}>Request Route Change</h3>
          <p style={{ margin: "0 0 14px", fontSize: "13.5px", color: colors.textSecondary }}>
            Want to switch to a different route? Submit a request and admin will review seat availability.
          </p>
          <button onClick={() => navigate("/student/route-change")} style={btn.primary}>
            Request Route Change →
          </button>
        </ContentCard>
      )}
    </PageShell>
  );
}

const sectionH = { margin: "0 0 12px", fontSize: "15px", fontWeight: "700", color: colors.textPrimary, fontFamily: fonts.heading };

export default StudentDashboard;