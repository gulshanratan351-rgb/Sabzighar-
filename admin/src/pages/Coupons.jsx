import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../api/client.js';
import Layout from '../components/Layout.jsx';
import Loader from '../components/Loader.jsx';
import Modal from '../components/Modal.jsx';
import { inr } from '../utils/format.js';

const blank = { code: '', description: '', discountType: 'percent', discountValue: '', maxDiscount: '', minOrder: '', usageLimit: '', expiresAt: '', isActive: true };

export default function Coupons() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const load = async () => { const { data } = await api.get('/coupons/admin'); setItems(data.coupons); setLoading(false); };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(blank); setModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c, expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '' }); setModal(true); };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form };
      if (editing) await api.put(`/coupons/${editing._id}`, payload);
      else await api.post('/coupons', payload);
      toast.success('Saved'); setModal(false); load();
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  const del = async (c) => { if (!window.confirm(`Delete ${c.code}?`)) return; await api.delete(`/coupons/${c._id}`); toast.success('Deleted'); load(); };

  return (
    <Layout title="Coupons">
      <div className="toolbar"><div className="spacer" /><button className="btn" onClick={openNew}><FiPlus /> Add Coupon</button></div>
      <div className="card">
        {loading ? <Loader /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Max Disc</th><th>Used</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c._id}>
                    <td><b>{c.code}</b><div className="muted" style={{ fontSize: 12 }}>{c.description}</div></td>
                    <td>{c.discountType}</td>
                    <td>{c.discountType === 'percent' ? `${c.discountValue}%` : inr(c.discountValue)}</td>
                    <td>{inr(c.minOrder)}</td>
                    <td>{c.maxDiscount ? inr(c.maxDiscount) : '—'}</td>
                    <td>{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
                    <td>{c.isActive ? <span className="pill pill-green">Active</span> : <span className="pill pill-red">Off</span>}</td>
                    <td><div className="flex">
                      <button className="btn btn-sm btn-light" onClick={() => openEdit(c)}><FiEdit2 /></button>
                      <button className="btn btn-sm btn-danger" onClick={() => del(c)}><FiTrash2 /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && <div className="empty">No coupons</div>}
          </div>
        )}
      </div>

      {modal && (
        <Modal title={editing ? 'Edit Coupon' : 'Add Coupon'} onClose={() => setModal(false)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn" onClick={save} disabled={busy}>Save</button></>}>
          <form onSubmit={save}>
            <div className="field"><label>Code</label><input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="WELCOME20" /></div>
            <div className="field"><label>Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="form-grid">
              <div className="field"><label>Discount Type</label><select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}><option value="percent">Percent (%)</option><option value="flat">Flat (₹)</option></select></div>
              <div className="field"><label>Value</label><input type="number" required value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} /></div>
            </div>
            <div className="form-grid">
              <div className="field"><label>Min Order (₹)</label><input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} /></div>
              <div className="field"><label>Max Discount (₹, 0=none)</label><input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} /></div>
            </div>
            <div className="form-grid">
              <div className="field"><label>Usage Limit (0=unlimited)</label><input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} /></div>
              <div className="field"><label>Expires At</label><input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} /></div>
            </div>
            <label className="flex"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
