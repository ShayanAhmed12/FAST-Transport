import { useEffect, useState } from "react";
import PageShell, { PageTitle } from "../../components/PageShell";
import Table from "../../components/Table";
import { ConfirmModal, StatusBadge, FormCard, Field, SectionBlock, inputStyle } from "../../components/ui";
import { getRoutes, createRoute, updateRoute } from "../../services/transportService";

function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [pendingToggle, setPendingToggle] = useState(null);

  const fetchRoutes = () =>
    getRoutes().then((res) => setRoutes(res.data)).catch(() => alert("Failed to fetch routes."));

  const handleToggle = (id, currentValue) => {
    if (currentValue) setPendingToggle({ id, currentValue });
    else doToggle(id, currentValue);
  };

  const doToggle = async (id, currentValue) => {
    try {
      await updateRoute(id, { is_active: !currentValue });
      fetchRoutes();
    } catch (err) {
      alert(`Failed to update route: ${JSON.stringify(err.response?.data || err.message)}`);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  useEffect(() => { fetchRoutes(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { alert("Route name is required"); return; }
    try {
      await createRoute(form);
      setForm({ name: "", description: "" });
      fetchRoutes();
    } catch (err) {
      alert(`Failed to add route: ${JSON.stringify(err.response?.data || err.message)}`);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    {
      key: "is_active", label: "Status",
      render: (row) => <StatusBadge active={row.is_active} onClick={() => handleToggle(row.id, row.is_active)} />,
    },
  ];

  return (
    <PageShell role="staff" title="Admin — Routes">
      {pendingToggle && (
        <ConfirmModal
          title="Deactivate Route?"
          message="Setting this route to inactive will also automatically deactivate all corresponding assignments linked to it."
          confirmLabel="Yes, Deactivate"
          onConfirm={() => { doToggle(pendingToggle.id, pendingToggle.currentValue); setPendingToggle(null); }}
          onCancel={() => setPendingToggle(null)}
        />
      )}

      <PageTitle sub="Manage transport routes.">Routes</PageTitle>

      <FormCard title="Add New Route" onSubmit={handleSubmit} submitLabel="Add Route">
        <Field label="Route Name" required flex="1 1 160px">
          <input name="name" placeholder="e.g. Gulshan Route" value={form.name} onChange={handleChange} style={inputStyle} />
        </Field>
        <Field label="Description" flex="2 1 280px">
          <input name="description" placeholder="Brief description" value={form.description} onChange={handleChange} style={inputStyle} />
        </Field>
      </FormCard>

      <SectionBlock title="Active Routes">
        <Table columns={columns} rows={routes.filter(r => r.is_active)} emptyMessage="No active routes." />
      </SectionBlock>

      <SectionBlock title="Inactive Routes">
        <Table columns={columns} rows={routes.filter(r => !r.is_active)} emptyMessage="No inactive routes." />
      </SectionBlock>
    </PageShell>
  );
}

export default RoutesPage;