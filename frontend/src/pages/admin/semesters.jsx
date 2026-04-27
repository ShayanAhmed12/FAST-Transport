import { useEffect, useState } from "react";
import PageShell, { PageTitle } from "../../components/PageShell";
import Table from "../../components/Table";
import { ConfirmModal, Pill, FormCard, Field, inputStyle, selectStyle } from "../../components/ui";
import { colors, radius } from "../../theme";
import { getSemesters, createSemester, updateSemester } from "../../services/transportService";

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ name, checked, onChange, label }) {
  const handleClick = () => onChange({ target: { name, type: "checkbox", checked: !checked } });
  return (
    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", cursor: "pointer", userSelect: "none", alignSelf: "flex-end" }}>
      <span
        onClick={handleClick}
        style={{
          width: "44px", height: "24px", borderRadius: "12px",
          background: checked ? colors.accent : colors.borderMid,
          position: "relative", transition: "background 0.2s", cursor: "pointer", flexShrink: 0, display: "block",
        }}
      >
        <span style={{
          position: "absolute", top: "3px", left: checked ? "23px" : "3px",
          width: "18px", height: "18px", borderRadius: "50%",
          background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }} />
      </span>
      <span style={{ fontSize: "11px", color: colors.textSecondary, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
    </label>
  );
}

function SemestersPage() {
  const [semesters, setSemesters] = useState([]);
  const [form, setForm] = useState({ year: "", term: "", start_date: "", end_date: "", is_active: false, registration_open: false });
  const [pendingToggle, setPendingToggle] = useState(null);

  const fetchSemesters = () =>
    getSemesters().then((res) => setSemesters(res.data)).catch(() => alert("Failed to fetch semesters."));

  const handleToggle = (id, field, currentValue) => {
    if (field === "is_active" && currentValue) setPendingToggle({ id, field, currentValue });
    else doToggle(id, field, currentValue);
  };

  const doToggle = async (id, field, currentValue) => {
    try {
      await updateSemester(id, { [field]: !currentValue });
      fetchSemesters();
    } catch (err) {
      alert(`Failed to update semester: ${JSON.stringify(err.response?.data || err.message)}`);
    }
  };

  useEffect(() => { fetchSemesters(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.year || !form.term || !form.start_date || !form.end_date) {
      alert("All fields are required."); return;
    }
    try {
      const payload = Object.fromEntries(
        Object.entries({ ...form, name: `${form.term} ${form.year}` }).filter(([, v]) => v !== "")
      );
      await createSemester(payload);
      setForm({ year: "", term: "", start_date: "", end_date: "", is_active: false, registration_open: false });
      fetchSemesters();
    } catch (err) {
      alert(`Failed to add semester: ${JSON.stringify(err.response?.data || err.message)}`);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "year", label: "Year" },
    { key: "term", label: "Term" },
    { key: "start_date", label: "Start Date" },
    { key: "end_date", label: "End Date" },
    {
      key: "is_active", label: "Active",
      render: (row) => (
        <Pill
          label={row.is_active ? "Active" : "Inactive"}
          variant={row.is_active ? "success" : "neutral"}
          onClick={() => handleToggle(row.id, "is_active", row.is_active)}
          style={{ cursor: "pointer" }}
        />
      ),
    },
    {
      key: "registration_open", label: "Registration",
      render: (row) => (
        <Pill
          label={row.registration_open ? "Open" : "Closed"}
          variant={row.registration_open ? "info" : "neutral"}
          onClick={() => handleToggle(row.id, "registration_open", row.registration_open)}
          style={{ cursor: "pointer" }}
        />
      ),
    },
  ];

  return (
    <PageShell role="staff" title="Admin — Semesters">
      {pendingToggle && (
        <ConfirmModal
          title="Deactivate Semester?"
          message="Setting this semester to inactive will also deactivate all corresponding assignments linked to it."
          confirmLabel="Yes, Deactivate"
          onConfirm={() => { doToggle(pendingToggle.id, pendingToggle.field, pendingToggle.currentValue); setPendingToggle(null); }}
          onCancel={() => setPendingToggle(null)}
        />
      )}

      <PageTitle sub="Manage academic semesters and registration windows.">Semesters</PageTitle>

      <FormCard title="Add New Semester" onSubmit={handleSubmit} submitLabel="Add Semester">
        <Field label="Year" required flex="0 1 100px">
          <input name="year" type="number" placeholder="2026" value={form.year} onChange={handleChange} style={inputStyle} />
        </Field>
        <Field label="Term" required flex="0 1 130px">
          <select name="term" value={form.term} onChange={handleChange} style={selectStyle}>
            <option value="">Select Term</option>
            <option value="Spring">Spring</option>
            <option value="Fall">Fall</option>
            <option value="Summer">Summer</option>
          </select>
        </Field>
        <Field label="Start Date" required flex="0 1 150px">
          <input name="start_date" type="date" value={form.start_date} onChange={handleChange} style={inputStyle} />
        </Field>
        <Field label="End Date" required flex="0 1 150px">
          <input name="end_date" type="date" value={form.end_date} onChange={handleChange} style={inputStyle} />
        </Field>
        <Toggle name="is_active" checked={form.is_active} onChange={handleChange} label="Active" />
        <Toggle name="registration_open" checked={form.registration_open} onChange={handleChange} label="Reg. Open" />
      </FormCard>

      <Table columns={columns} rows={semesters} />
    </PageShell>
  );
}

export default SemestersPage;