import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell, { PageTitle, ContentCard } from "../../components/PageShell";
import { Spinner, Banner, Field, selectStyle } from "../../components/ui";
import { btn, colors } from "../../theme";
import { getStops, getSemesters, createRegistration, getRegistration, getChallan } from "../../services/transportService";

function TransportRegistration() {
  const [registration, setRegistration] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [loading, setLoading] = useState(false);
  const [challan, setChallan] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [semRes, stopsRes, regRes] = await Promise.all([getSemesters(), getStops(), getRegistration()]);
        setSemesters(semRes.data);
        setStops(stopsRes.data);
        if (regRes.data?.length > 0) {
          const reg = regRes.data[0];
          setRegistration(reg);
          try { const cr = await getChallan(reg.id); setChallan(cr.data); } catch { setChallan(null); }
        }
      } catch { alert("Failed to load data"); }
    };
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStop || !selectedSemester) { setMessage("Please select both semester and stop."); return; }
    setLoading(true); setMessage("");
    try {
      await createRegistration({ stop_id: selectedStop, semester_id: selectedSemester });
      const regRes = await getRegistration();
      setRegistration(regRes.data[0]);
      setMessage("Registration submitted successfully!");
    } catch (err) {
      console.error(err.response?.data);
      setMessage("Failed to submit registration.");
    } finally { setLoading(false); }
  };

  const status = registration?.status?.toLowerCase();

  return (
    <PageShell role="student" title="Transport Registration" maxWidth="860px">
      <PageTitle sub="Register for transport service this semester.">Transport Registration</PageTitle>

      {/* Status banners */}
      {status === "pending" && (
        challan?.status === "paid" ? (
          <Banner variant="info"><strong>Payment Received</strong> — Your payment has been recorded. Waiting for admin verification.</Banner>
        ) : (
          <Banner variant="warning">
            <strong>Registration Pending</strong> — Please pay the transport fee and wait for admin verification.
            <br />
            <span style={{ fontSize: "13px" }}>Pay via bank transfer using your challan number. Your seat will be confirmed after admin review.</span>
            <div>
              <button style={{ ...btn.primary, marginTop: "10px" }} onClick={() => navigate(`/student/challan/${registration.id}`)}>
                Pay Fee (View Challan)
              </button>
            </div>
          </Banner>
        )
      )}
      {status === "approved" && (
        <Banner variant="success"><strong>Approved</strong> — Your transport registration has been confirmed.</Banner>
      )}

      {/* Form */}
      {!registration && (
        <ContentCard>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Field label="Semester" required>
              <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} style={selectStyle}>
                <option value="">Select Semester</option>
                {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Pickup Stop" required>
              <select value={selectedStop} onChange={(e) => setSelectedStop(e.target.value)} style={selectStyle}>
                <option value="">Select Stop</option>
                {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <button type="submit" disabled={loading} style={{ ...btn.primary, alignSelf: "flex-start", minWidth: "180px", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Submitting…" : "Submit Registration"}
            </button>
            {message && <p style={{ margin: 0, fontSize: "13.5px", color: message.includes("success") ? colors.successText : colors.dangerText }}>{message}</p>}
          </form>
        </ContentCard>
      )}
    </PageShell>
  );
}

export default TransportRegistration;