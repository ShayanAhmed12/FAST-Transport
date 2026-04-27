import { useEffect, useState } from "react";
import PageShell, { PageTitle } from "../../components/PageShell";
import Table from "../../components/Table";
import { ConfirmModal, StatusBadge, FormCard, Field, SectionBlock, inputStyle } from "../../components/ui";
import { getDrivers, createDriver, updateDriver } from "../../services/transportService";

function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({ name: "", cnic: "", license_no: "", phone: "", address: "" });
  const [pendingToggle, setPendingToggle] = useState(null);

  const fetchDrivers = () =>
    getDrivers().then((res) => setDrivers(res.data)).catch(() => alert("Failed to fetch drivers."));

  const handleToggle = (id, currentValue) => {
    if (currentValue) setPendingToggle({ id, currentValue });
    else doToggle(id, currentValue);
  };

  const doToggle = async (id, currentValue) => {
    try {
      await updateDriver(id, { is_available: !currentValue });
      fetchDrivers();
    } catch (err) {
      alert(`Failed to update driver: ${JSON.stringify(err.response?.data || err.message)}`);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  useEffect(() => { fetchDrivers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.cnic) { alert("Name and CNIC are required"); return; }
    try {
      await createDriver(form);
      setForm({ name: "", cnic: "", license_no: "", phone: "", address: "" });
      fetchDrivers();
    } catch (err) {
      alert(`Failed to add driver: ${JSON.stringify(err.response?.data || err.message)}`);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "cnic", label: "CNIC" },
    { key: "license_no", label: "License No" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" },
    {
      key: "is_available", label: "Status",
      render: (row) => (
        <StatusBadge
          active={row.is_available}
          trueLabel="Available"
          falseLabel="Unavailable"
          onClick={() => handleToggle(row.id, row.is_available)}
        />
      ),
    },
  ];

  return (
    <PageShell role="staff" title="Admin — Drivers">
      {pendingToggle && (
        <ConfirmModal
          title="Mark Driver Unavailable?"
          message="Setting this driver to unavailable will also automatically deactivate all corresponding assignments linked to this driver."
          confirmLabel="Yes, Mark Unavailable"
          onConfirm={() => { doToggle(pendingToggle.id, pendingToggle.currentValue); setPendingToggle(null); }}
          onCancel={() => setPendingToggle(null)}
        />
      )}

      <PageTitle sub="Manage bus drivers and their availability.">Drivers</PageTitle>

      <FormCard title="Add New Driver" onSubmit={handleSubmit} submitLabel="Add Driver">
        <Field label="Full Name" required flex="1 1 160px">
          <input name="name" placeholder="e.g. Ahmed Khan" value={form.name} onChange={handleChange} style={inputStyle} />
        </Field>
        <Field label="CNIC" required flex="1 1 140px">
          <input name="cnic" placeholder="42101-1234567-1" value={form.cnic} onChange={handleChange} style={inputStyle} />
        </Field>
        <Field label="License No" flex="1 1 130px">
          <input name="license_no" placeholder="License number" value={form.license_no} onChange={handleChange} style={inputStyle} />
        </Field>
        <Field label="Phone" flex="1 1 130px">
          <input name="phone" placeholder="+92 300 0000000" value={form.phone} onChange={handleChange} style={inputStyle} />
        </Field>
        <Field label="Address" flex="2 1 240px">
          <input name="address" placeholder="Home address" value={form.address} onChange={handleChange} style={inputStyle} />
        </Field>
      </FormCard>

      <SectionBlock title="Available Drivers">
        <Table columns={columns} rows={drivers.filter(d => d.is_available)} emptyMessage="No available drivers." />
      </SectionBlock>

      <SectionBlock title="Unavailable Drivers">
        <Table columns={columns} rows={drivers.filter(d => !d.is_available)} emptyMessage="No unavailable drivers." />
      </SectionBlock>
    </PageShell>
  );
}

export default DriversPage;