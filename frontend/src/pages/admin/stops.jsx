import { useEffect, useState } from "react";
import PageShell, { PageTitle } from "../../components/PageShell";
import Table from "../../components/Table";
import { FormCard, Field, inputStyle } from "../../components/ui";
import { getStops, createStop } from "../../services/transportService";

function StopsPage() {
  const [stops, setStops] = useState([]);
  const [form, setForm] = useState({ name: "", latitude: "", longitude: "", address: "" });

  const fetchStops = () =>
    getStops()
      .then((res) => setStops(res.data))
      .catch(() => alert("Failed to fetch stops."));

  useEffect(() => { fetchStops(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
  ];

  return (
    <PageShell role="staff" title="Admin — Stops">
      <PageTitle sub="Manage pickup/dropoff stops.">Stops</PageTitle>
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