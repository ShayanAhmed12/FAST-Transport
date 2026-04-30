import { useEffect, useState } from "react";
import PageShell, { PageTitle } from "../../components/PageShell";
import Table from "../../components/Table";
import { ConfirmModal, FormModal, FormCard, Field, inputStyle } from "../../components/ui";
import { btn } from "../../theme";
import { getStops, createStop, updateStop, deleteStop } from "../../services/transportService";

const actionBtn = { ...btn.ghost, padding: "7px 12px", fontSize: "12px" };

function StopsPage() {
  const [stops, setStops] = useState([]);
  const [form, setForm] = useState({ name: "", latitude: "", longitude: "", address: "" });
  const [pendingDelete, setPendingDelete] = useState(null);
  const [editingStop, setEditingStop] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", latitude: "", longitude: "", address: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchStops = () =>
    getStops()
      .then((res) => setStops(res.data))
      .catch(() => alert("Failed to fetch stops."));

  useEffect(() => { fetchStops(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEditOpen = (stop) => {
    setEditingStop(stop);
    setEditForm({
      name: stop.name || "",
      latitude: stop.latitude ?? "",
      longitude: stop.longitude ?? "",
      address: stop.address || "",
    });
  };

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleDelete = (stop) => setPendingDelete(stop);

  const confirmDelete = async () => {
    try {
      await deleteStop(pendingDelete.id);
      setPendingDelete(null);
      fetchStops();
    } catch (err) {
      alert(`Failed to delete stop: ${JSON.stringify(err.response?.data || err.message)}`);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name) { alert("Stop name is required"); return; }
    setSavingEdit(true);
    try {
      const payload = Object.fromEntries(Object.entries(editForm).filter(([, v]) => v !== ""));
      if (payload.latitude !== undefined) payload.latitude = Number(payload.latitude);
      if (payload.longitude !== undefined) payload.longitude = Number(payload.longitude);
      await updateStop(editingStop.id, payload);
      setEditingStop(null);
      fetchStops();
    } catch (err) {
      alert(`Failed to update stop: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { alert("Stop name is required"); return; }
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ""));
      await createStop(payload);
      setForm({ name: "", latitude: "", longitude: "", address: "" });
      fetchStops();
    } catch (err) {
      alert(`Failed to add stop: ${JSON.stringify(err.response?.data || err.message)}`);
    }
  };

  const columns = [
    { key: "name", label: "Stop Name" },
    { key: "latitude", label: "Latitude" },
    { key: "longitude", label: "Longitude" },
    { key: "address", label: "Address" },
    { key: "created_at", label: "Created At" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={() => handleEditOpen(row)} style={actionBtn}>Edit</button>
          <button onClick={() => handleDelete(row)} style={{ ...btn.danger, padding: "7px 12px", fontSize: "12px" }}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <PageShell role="staff" title="Admin — Stops">
      <PageTitle sub="Manage pickup/dropoff stops.">Stops</PageTitle>
      {pendingDelete && (
        <ConfirmModal
          title="Delete Stop?"
          message={`Deleting stop ${pendingDelete.name} will remove any route stops, semester registrations, transport registrations, and route change requests tied to this stop. This cannot be undone.`}
          confirmLabel="Yes, Delete"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
      {editingStop && (
        <FormModal
          title="Edit Stop"
          sub="Update stop details."
          submitLabel="Save Changes"
          loading={savingEdit}
          onClose={() => setEditingStop(null)}
          onSubmit={handleEditSubmit}
          width="700px"
        >
          <Field label="Stop Name" required flex="1 1 180px">
            <input name="name" placeholder="e.g. Gulshan Chowrangi" value={editForm.name} onChange={handleEditChange} style={inputStyle} />
          </Field>
          <Field label="Latitude" flex="0 1 140px">
            <input name="latitude" type="number" step="0.000001" placeholder="24.9215" value={editForm.latitude} onChange={handleEditChange} style={inputStyle} />
          </Field>
          <Field label="Longitude" flex="0 1 140px">
            <input name="longitude" type="number" step="0.000001" placeholder="67.0847" value={editForm.longitude} onChange={handleEditChange} style={inputStyle} />
          </Field>
          <Field label="Address" flex="2 1 280px">
            <input name="address" placeholder="Full address" value={editForm.address} onChange={handleEditChange} style={inputStyle} />
          </Field>
        </FormModal>
      )}
      <FormCard title="Add New Stop" onSubmit={handleSubmit} submitLabel="Add Stop">
        <Field label="Stop Name" required flex="1 1 160px">
          <input name="name" placeholder="e.g. Gulshan Chowrangi" value={form.name} onChange={handleChange} style={inputStyle} />
        </Field>
        <Field label="Latitude" flex="0 1 130px">
          <input name="latitude" type="number" step="0.000001" placeholder="24.9215" value={form.latitude} onChange={handleChange} style={inputStyle} />
        </Field>
        <Field label="Longitude" flex="0 1 130px">
          <input name="longitude" type="number" step="0.000001" placeholder="67.0847" value={form.longitude} onChange={handleChange} style={inputStyle} />
        </Field>
        <Field label="Address" flex="2 1 280px">
          <input name="address" placeholder="Full address" value={form.address} onChange={handleChange} style={inputStyle} />
        </Field>
      </FormCard>
      <Table columns={columns} rows={stops} />
    </PageShell>
  );
}

export default StopsPage;