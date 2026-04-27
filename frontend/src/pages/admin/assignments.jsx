import { useEffect, useState } from "react";
import PageShell, { PageTitle } from "../../components/PageShell";
import Table from "../../components/Table";
import { StatusBadge, FormCard, Field, SectionBlock, selectStyle } from "../../components/ui";
import {
  getAssignments, createAssignment, updateAssignment,
  getRoutes, getBuses, getDrivers, getSemesters,
} from "../../services/transportService";

function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [form, setForm] = useState({ route_id: "", bus_id: "", driver_id: "", semester_id: "" });

  const fetchAssignments = () =>
    getAssignments().then((res) => setAssignments(res.data)).catch(() => alert("Failed to fetch assignments."));

  const handleToggle = async (id, currentValue) => {
    try {
      await updateAssignment(id, { is_active: !currentValue });
      fetchAssignments();
    } catch (err) {
      alert(`Failed to update assignment: ${JSON.stringify(err.response?.data || err.message)}`);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    fetchAssignments();
    Promise.all([getRoutes(), getBuses(), getDrivers(), getSemesters()])
      .then(([r, b, d, s]) => { setRoutes(r.data); setBuses(b.data); setDrivers(d.data); setSemesters(s.data); })
      .catch(() => alert("Failed to fetch dropdown data."));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.route_id || !form.bus_id || !form.driver_id || !form.semester_id) {
      alert("All fields are required."); return;
    }
    try {
      await createAssignment(form);
      setForm({ route_id: "", bus_id: "", driver_id: "", semester_id: "" });
      fetchAssignments();
    } catch (err) {
      alert(`Failed to add assignment: ${JSON.stringify(err.response?.data || err.message)}`);
    }
  };

  const columns = [
    { key: "route",    label: "Route",    render: (row) => row.route?.name },
    { key: "bus",      label: "Bus",      render: (row) => row.bus?.bus_number },
    { key: "driver",   label: "Driver",   render: (row) => row.driver?.name },
    { key: "semester", label: "Semester", render: (row) => row.semester?.name },
    {
      key: "is_active", label: "Status",
      render: (row) => <StatusBadge active={row.is_active} onClick={() => handleToggle(row.id, row.is_active)} />,
    },
  ];

  const activeRoutes     = routes.filter(r => r.is_active);
  const activeBuses      = buses.filter(b => b.is_active);
  const availDrivers     = drivers.filter(d => d.is_available);
  const activeSemesters  = semesters.filter(s => s.is_active);

  return (
    <PageShell role="staff" title="Admin — Assignments">
      <PageTitle sub="Assign buses and drivers to routes for each semester.">Route Assignments</PageTitle>

      <FormCard title="Create Assignment" onSubmit={handleSubmit} submitLabel="Add Assignment">
        <Field label="Route" required flex="1 1 140px">
          <select name="route_id" value={form.route_id} onChange={handleChange} style={selectStyle}>
            <option value="">Select Route</option>
            {activeRoutes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </Field>
        <Field label="Bus" required flex="1 1 140px">
          <select name="bus_id" value={form.bus_id} onChange={handleChange} style={selectStyle}>
            <option value="">Select Bus</option>
            {activeBuses.map(b => <option key={b.id} value={b.id}>{b.bus_number}</option>)}
          </select>
        </Field>
        <Field label="Driver" required flex="1 1 140px">
          <select name="driver_id" value={form.driver_id} onChange={handleChange} style={selectStyle}>
            <option value="">Select Driver</option>
            {availDrivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
        <Field label="Semester" required flex="1 1 140px">
          <select name="semester_id" value={form.semester_id} onChange={handleChange} style={selectStyle}>
            <option value="">Select Semester</option>
            {activeSemesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
      </FormCard>

      <SectionBlock title="Active Assignments">
        <Table columns={columns} rows={assignments.filter(a => a.is_active)} emptyMessage="No active assignments." />
      </SectionBlock>

      <SectionBlock title="Inactive Assignments">
        <Table columns={columns} rows={assignments.filter(a => !a.is_active)} emptyMessage="No inactive assignments." />
      </SectionBlock>
    </PageShell>
  );
}

export default AssignmentsPage;