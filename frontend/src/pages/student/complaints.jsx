import { useEffect, useState } from "react";
import PageShell, { PageTitle } from "../../components/PageShell";
import Table from "../../components/Table";
import { FormCard, Field, inputStyle, selectStyle } from "../../components/ui";
import { getComplaints, createComplaint } from "../../services/transportService";

function StudentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ subject: "", description: "", priority: "Medium" });

  const fetchComplaints = () =>
    getComplaints().then((res) => setComplaints(res.data)).catch(() => alert("Failed to fetch complaints."));

  useEffect(() => { fetchComplaints(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.description) { alert("Subject and description are required."); return; }
    try {
      await createComplaint(form);
      setForm({ subject: "", description: "", priority: "Medium" });
      fetchComplaints();
    } catch { alert("Failed to submit complaint."); }
  };

  const columns = [
    { key: "subject",     label: "Subject" },
    { key: "description", label: "Description" },
    { key: "priority",    label: "Priority" },
    { key: "status",      label: "Status" },
  ];

  return (
    <PageShell role="student" title="My Complaints">
      <PageTitle sub="Submit and track your complaints.">Complaints</PageTitle>

      <FormCard title="Submit New Complaint" onSubmit={handleSubmit} submitLabel="Submit">
        <Field label="Subject" required flex="1 1 200px">
          <input name="subject" placeholder="Brief subject" value={form.subject} onChange={handleChange} style={inputStyle} />
        </Field>
        <Field label="Description" required flex="2 1 300px">
          <textarea
            name="description"
            placeholder="Describe your complaint in detail..."
            value={form.description}
            onChange={handleChange}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </Field>
        <Field label="Priority" flex="0 1 120px">
          <select name="priority" value={form.priority} onChange={handleChange} style={selectStyle}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </Field>
      </FormCard>

      <Table columns={columns} rows={complaints} />
    </PageShell>
  );
}

export default StudentComplaints;