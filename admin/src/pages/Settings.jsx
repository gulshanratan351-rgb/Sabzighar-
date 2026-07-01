import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client.js';
import Layout from '../components/Layout.jsx';
import Loader from '../components/Loader.jsx';

export default function Settings() {
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/settings').then(({ data }) => setForm({ ...data.settings, servicePincodes: (data.settings.servicePincodes || []).join(', ') }));
  }, []);

  if (!form) return <Layout title="Settings"><Loader /></Layout>;

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, servicePincodes: form.servicePincodes ? form.servicePincodes.split(',').map((p) => p.trim()).filter(Boolean) : [] };
      await api.put('/settings', payload);
      toast.success('Settings saved');
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <Layout title="Settings">
      <form onSubmit={save} className="card" style={{ maxWidth: 700 }}>
        <div className="section-title">Store Info</div>
        <div className="form-grid">
          <div className="field"><label>Store Name</label><input value={form.storeName} onChange={(e) => set('storeName', e.target.value)} /></div>
          <div className="field"><label>Tagline</label><input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} /></div>
          <div className="field"><label>Support Phone</label><input value={form.supportPhone} onChange={(e) => set('supportPhone', e.target.value)} /></div>
          <div className="field"><label>Support Email</label><input value={form.supportEmail} onChange={(e) => set('supportEmail', e.target.value)} /></div>
        </div>

        <div className="section-title mt">Delivery & Charges</div>
        <div className="form-grid">
          <div className="field"><label>Delivery Charge (₹)</label><input type="number" value={form.deliveryCharge} onChange={(e) => set('deliveryCharge', Number(e.target.value))} /></div>
          <div className="field"><label>Free Delivery Above (₹)</label><input type="number" value={form.freeDeliveryAbove} onChange={(e) => set('freeDeliveryAbove', Number(e.target.value))} /></div>
        </div>
        <div className="field"><label>Service Pincodes (comma separated, empty = all)</label><input value={form.servicePincodes} onChange={(e) => set('servicePincodes', e.target.value)} placeholder="452001, 452002" /></div>

        <div className="section-title mt">Payments</div>
        <div className="form-grid">
          <div className="field"><label>UPI ID</label><input value={form.upiId} onChange={(e) => set('upiId', e.target.value)} /></div>
        </div>
        <div className="flex" style={{ gap: 24, flexWrap: 'wrap' }}>
          <label className="flex"><input type="checkbox" checked={form.codEnabled} onChange={(e) => set('codEnabled', e.target.checked)} /> COD Enabled</label>
          <label className="flex"><input type="checkbox" checked={form.upiEnabled} onChange={(e) => set('upiEnabled', e.target.checked)} /> UPI Enabled</label>
          <label className="flex"><input type="checkbox" checked={form.isStoreOpen} onChange={(e) => set('isStoreOpen', e.target.checked)} /> Store Open</label>
        </div>

        <button className="btn mt" disabled={busy}>{busy ? 'Saving...' : 'Save Settings'}</button>
      </form>
    </Layout>
  );
}
