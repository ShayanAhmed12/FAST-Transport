import { useEffect, useState } from "react";

function Students() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("access");

    fetch("http://127.0.0.1:8000/api/students/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setStudents(data));
  }, []);

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>All Students</h2>

      <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>UserName</th>
            <th>Email</th>
            <th>RollNumber</th>
            <th>Batch</th>
            <th>Department</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
               <td>{s.id}</td>
               <td>{s.user.username}</td>
               <td>{s.user.email}</td>
               <td>{s.roll_number}</td>
               <td>{s.batch}</td>
               <td>{s.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Students;