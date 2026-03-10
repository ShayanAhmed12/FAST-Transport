import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import { getSemesters, createSemester, updateSemester } from "../../services/transportService";

function Toggle({ name, checked, onChange, label }) {
  return (
    <label style={toggleWrapStyle}>
      <span style={toggleTrackStyle(checked)} onClick={() => onChange({ target: { name, type: "checkbox", checked: !checked } })}>
        <span style={toggleThumbStyle(checked)} />
      </span>
      <span style={{ fontSize: "13px", color: "#444" }}>{label}</span>
    </label>
  );
}

function SemestersPage() {
  const [semesters, setSemesters] = useState([]);
  const [form, setForm] = useState({
    year: "",
    term: "",
    start_date: "",
    end_date: "",
    is_active: false,
    registration_open: false,
  });
  const [pendingToggle, setPendingToggle] = useState(null);

  const fetchSemesters = () =>
    getSemesters()
      .then((res) => setSemesters(res.data))
      .catch(() => alert("Failed to fetch semesters."));

  const handleToggle = (id, field, currentValue) => {
    if (field === "is_active" && currentValue) {
      setPendingToggle({ id, field, currentValue });
    } else {
      doToggle(id, field, currentValue);
    }
  };

  const doToggle = async (id, field, currentValue) => {
    try {
      await updateSemester(id, { [field]: !currentValue });
      fetchSemesters();
    } catch (err) {
      const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert(`Failed to update semester: ${detail}`);
    }
  };

  const handleConfirm = () => {
    doToggle(pendingToggle.id, pendingToggle.field, pendingToggle.currentValue);
    setPendingToggle(null);
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.year || !form.term || !form.start_date || !form.end_date) {
      alert("Year, term, start date, and end date are required.");
      return;
    }
    try {
      const payload = Object.fromEntries(
        Object.entries({ ...form, name: `${form.term} ${form.year}` }).filter(([, v]) => v !== "")
      );
      await createSemester(payload);
      setForm({ year: "", term: "", start_date: "", end_date: "", is_active: false, registration_open: false });
      fetchSemesters();
    } catch (err) {
      const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert(`Failed to add semester: ${detail}`);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "year", label: "Year" },
    { key: "term", label: "Term" },
    { key: "start_date", label: "Start Date" },
    { key: "end_date", label: "End Date" },
    {
      key: "is_active",
      label: "Active",
      render: (row) => (
        <span
          style={row.is_active ? badgeGreen : badgeGrey}
          onClick={() => handleToggle(row.id, "is_active", row.is_active)}
          title="Click to toggle"
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "registration_open",
      label: "Registration Open",
      render: (row) => (
        <span
          style={row.registration_open ? badgeBlue : badgeGrey}
          onClick={() => handleToggle(row.id, "registration_open", row.registration_open)}
          title="Click to toggle"
        >
          {row.registration_open ? "Open" : "Closed"}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="staff" />
      <div style={{ flex: 1 }}>
        <Navbar title="Admin — Semesters" />
        <div style={{ padding: "24px" }}>
          {pendingToggle && (
            <div style={modalOverlayStyle}>
              <div style={modalBoxStyle}>
                <h3 style={{ margin: "0 0 12px", color: "#c0392b" }}>⚠ Deactivate Semester?</h3>
                <p style={{ margin: "0 0 20px", color: "#333" }}>
                  Setting this semester to <strong>inactive</strong> will also automatically deactivate
                  all corresponding assignments linked to this semester.
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button onClick={() => setPendingToggle(null)} style={modalCancelBtnStyle}>Cancel</button>
                  <button onClick={handleConfirm} style={modalConfirmBtnStyle}>Yes, Deactivate</button>
                </div>
              </div>
            </div>
          )}
          <h2>Semesters</h2>
          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={fieldWrapStyle}>
              <label style={fieldLabelStyle}>Year</label>
              <input
                name="year"
                type="number"
                placeholder="e.g. 2026"
                value={form.year}
                onChange={handleChange}
                style={{ ...inputStyle, flex: "0 1 100px" }}
              />
            </div>
            <div style={fieldWrapStyle}>
              <label style={fieldLabelStyle}>Term</label>
              <select
                name="term"
                value={form.term}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Select Term</option>
                <option value="Spring">Spring</option>
                <option value="Fall">Fall</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
            <div style={fieldWrapStyle}>
              <label style={fieldLabelStyle}>Start Date</label>
              <input
                name="start_date"
                type="date"
                value={form.start_date}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            <div style={fieldWrapStyle}>
              <label style={fieldLabelStyle}>End Date</label>
              <input
                name="end_date"
                type="date"
                value={form.end_date}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            <Toggle name="is_active" checked={form.is_active} onChange={handleChange} label="Active" />
            <Toggle name="registration_open" checked={form.registration_open} onChange={handleChange} label="Registration Open" />
            <button type="submit" style={btnStyle}>Add Semester</button>
          </form>
          <Table columns={columns} rows={semesters} />
        </div>
      </div>
    </div>
  );
}

const formStyle = { marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" };
const fieldWrapStyle = { display: "flex", flexDirection: "row", alignItems: "center", gap: "6px" };
const fieldLabelStyle = { fontSize: "12px", color: "#555", fontWeight: 600, whiteSpace: "nowrap" };
const inputStyle = { padding: "8px", flex: "1 1 150px" };
const btnStyle = { padding: "8px 16px", alignSelf: "flex-end" };

const toggleWrapStyle = { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: "pointer", userSelect: "none", alignSelf: "flex-end"};

const badgeBase = { display: "inline-block", padding: "2px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600, cursor: "pointer", userSelect: "none" };
const badgeGreen = { ...badgeBase, background: "#d4edda", color: "#155724" };
const badgeBlue  = { ...badgeBase, background: "#cce5ff", color: "#004085" };
const badgeGrey  = { ...badgeBase, background: "#e2e3e5", color: "#383d41" };
const modalOverlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalBoxStyle = { background: "#fff", borderRadius: "8px", padding: "28px 32px", maxWidth: "420px", width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" };
const modalCancelBtnStyle = { padding: "8px 18px", border: "1px solid #ccc", borderRadius: "4px", background: "#fff", cursor: "pointer" };
const modalConfirmBtnStyle = { padding: "8px 18px", border: "none", borderRadius: "4px", background: "#c0392b", color: "#fff", cursor: "pointer", fontWeight: 600 };
const toggleTrackStyle = (on) => ({
  width: "44px", height: "24px", borderRadius: "12px",
  background: on ? "#0f3460" : "#ccc",
  position: "relative", transition: "background 0.2s", cursor: "pointer",
  flexShrink: 0,
});
const toggleThumbStyle = (on) => ({
  position: "absolute", top: "3px",
  left: on ? "23px" : "3px",
  width: "18px", height: "18px", borderRadius: "50%",
  background: "#fff", transition: "left 0.2s",
  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
});

export default SemestersPage;
