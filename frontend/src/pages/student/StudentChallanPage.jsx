import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import PageShell, { PageTitle, ContentCard } from "../../components/PageShell";
import { Spinner, DetailRow, Pill } from "../../components/ui";
import { btn, colors } from "../../theme";

function StudentChallanPage() {
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const res = await api.get("/api/transport-registrations/");
        const data = res.data;
        if (Array.isArray(data)) setRegistration(data.length > 0 ? data[0] : null);
        else if (data?.results) setRegistration(data.results.length > 0 ? data.results[0] : null);
        else if (data?.id) setRegistration(data);
        else setRegistration(null);
      } catch { setRegistration(null); }
      finally { setLoading(false); }
    };
    fetchRegistration();
  }, []);

  return (
    <PageShell role="student" title="My Challan">
      <PageTitle sub="View your transport registration and payment details.">My Transport Details</PageTitle>

      {loading ? (
        <Spinner />
      ) : !registration ? (
        <p style={{ color: colors.textMuted, fontSize: "13.5px" }}>No transport registration found.</p>
      ) : (
        <ContentCard style={{ maxWidth: "520px" }}>
          <DetailRow label="Route"    value={registration.route_name} />
          <DetailRow label="Stop"     value={registration.stop_name} />
          <DetailRow label="Semester" value={registration.semester_name} />
          <DetailRow label="Status"   value={
            <Pill
              label={registration.status}
              variant={registration.status === "Approved" ? "success" : registration.status === "Rejected" ? "danger" : "warning"}
            />
          } />
          <div style={{ marginTop: "16px" }}>
            <button style={btn.primary} onClick={() => navigate(`/student/challan/${registration.id}`)}>
              View Challan →
            </button>
          </div>
        </ContentCard>
      )}
    </PageShell>
  );
}

export default StudentChallanPage;