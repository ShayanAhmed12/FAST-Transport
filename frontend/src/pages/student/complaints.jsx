import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import { getComplaints, createComplaint } from "../../services/transportService";

function StudentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ subject: "", description: "", priority: "Medium" });

 
  const fetchComplaints = () =>
    getComplaints()
      .then((res) => setComplaints(res.data))
      .catch(() => alert("Failed to fetch complaints."));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
   useEffect(() => {
    fetchComplaints();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.description) {
      alert("Subject and description are required.");
      return;
    }
    try {
      await createComplaint(form);
      setForm({ subject: "", description: "", priority: "Medium" });
      fetchComplaints();
    } catch {
      alert("Failed to submit complaint.");
    }
  };

  const columns = [
    { key: "subject", label: "Subject" },
    { key: "description", label: "Description" },
    { key: "priority", label: "Priority" },
    { key: "status", label: "Status" },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="student" />
      <div style={{ flex: 1 }}>
        <Navbar title="My Complaints" />
        <div style={{ padding: "24px", maxWidth: "900px" }}>
          <h2>Complaints</h2>
          <form onSubmit={handleSubmit} style={formStyle}>
            <input
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleChange}
              style={inputStyle}
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              style={{ ...inputStyle, flex: "2 1 300px", resize: "vertical" }}
            />
            <select name="priority" value={form.priority} onChange={handleChange} style={inputStyle}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <button type="submit" style={{ ...btnStyle, alignSelf: "flex-start" }}>Submit</button>
          </form>
          <Table columns={columns} rows={complaints} />
        </div>
      </div>
    </div>
  );
}

const formStyle = { marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-start" };
const inputStyle = { flex: "1 1 150px", padding: "8px" };
const btnStyle = { padding: "8px 16px" };

export default StudentComplaints;
