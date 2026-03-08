import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import { getStudents } from "../../services/transportService";

function StudentsPage() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    getStudents()
      .then((res) => setStudents(res.data))
      .catch(() => alert("Failed to fetch students."));
  }, []);

  const columns = [
    { key: "id", label: "ID" },
    { key: "username", label: "Username", render: (row) => row.user.username },
    { key: "email", label: "Email", render: (row) => row.user.email },
    { key: "roll_number", label: "Roll Number" },
    { key: "batch", label: "Batch" },
    { key: "department", label: "Department" },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role="staff" />
      <div style={{ flex: 1 }}>
        <Navbar title="Admin — Students" />
        <div style={{ padding: "24px" }}>
          <h2>All Students</h2>
          <Table columns={columns} rows={students} />
        </div>
      </div>
    </div>
  );
}

export default StudentsPage;
