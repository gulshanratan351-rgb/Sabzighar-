import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../api/client.js';
import Layout from '../components/Layout.jsx';
import Loader from '../components/Loader.jsx';
import Modal from '../components/Modal.jsx';
import { inr } from '../utils/format.js';

const blank = { name: '', email: '', phone: '', password: '', vehicleNumber: '', area: '', pincodes: '' };

export default function DeliveryBoys() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const load = async () => { const { data } = await api.get('/admin/delivery-boys'); setItems(data.deliveryBoys); setLoading(false); };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(blank); setModal(true); };
  const openEdit = (b) => {
    setEditing(b);
    setForm({ name: b.name, email: b.email, phone: b.phone || '', password: '', vehicleNumber: b.profile?.vehicleNumber || '', area: b.profile?.area || '', pincodes: (b.profile?.pincodes || []).join(', ') });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) await api.put(`/admin/delivery-boys/${editing._id}`, form);
      else await api.post('/admin/delivery-boys', form);
      toast.success('Saved'); setModal(false); load();
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  const del = async (b) => { if (!window.confirm(`Remove ${b.name}?`)) return; await api.delete(`/admin/delivery-boys/${b._id}`); toast.success('Removed'); load(); };
  const toggleBlock = async (b) => { await api.put(`/admin/delivery-boys/${b._id}`, { isBlocked: !b.isBlocked }); load(); };

  return (
    <Layout title="Delivery Boys">
      <div className="toolbar"><div className="spacer" /><button className="btn" onClick={openNew}><FiPlus /> Add Delivery Boy</button></div>
      <div className="card">
        {loading ? <Loader /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Contact</th><th>Vehicle</th><th>Area</th><th>Deliveries</th><th>COD Collected</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b._id}>
                    <td><b>{b.name}</b></td>
                    <td>{b.email}<div className="muted" style={{ fontSize: 12 }}>{b.phone}</div></td>
                    <td>{b.profile?.vehicleNumber || '—'}</td>
                    <td>{b.profile?.area || '—'}</td>
                    <td>{b.profile?.totalDeliveries || 0}</td>
                    <td>{inr(b.profile?.codCollected || 0)}</td>
                    <td>
                      <button className={`pill ${b.isBlocked ? 'pill-red' : 'pill-green'}`} onClick={() => toggleBlock(b)}>
                        {b.isBlocked ? 'Blocked' : 'Active'}
                      </button>
                    </td>
                    <td><div className="flex">
                      <button className="btn btn-sm btn-light" onClick={() => openEdit(b)}><FiEdit2 /></button>
                      <button className="btn btn-sm btn-danger" onClick={() => del(b)}><FiTrash2 /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && <div className="empty">No delivery boys</div>}
          </div>
        )}
      </div>

      {modal && (
        <Modal title={editing ? 'Edit Delivery Boy' : 'Add Delivery Boy'} onClose={() => setModal(false)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn" onClick={save} disabled={busy}>Save</button></>}>
          <form onSubmit={save}>
            <div className="field"><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-grid">
              <div className="field"><label>Email</label><input type="email" required disabled={!!editing} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="field"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            {!editing && <div className="field"><label>Password</label><input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>}
            <div className="form-grid">
              <div className="field"><label>Vehicle Number</label><input value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} /></div>
              <div className="field"><label>Area</label><input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></div>
            </div>
            <div className="field"><label>Pincodes (comma separated)</label><input value={form.pincodes} onChange={(e) => setForm({ ...form, pincodes: e.target.value })} placeholder="452001, 452002" /></div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
