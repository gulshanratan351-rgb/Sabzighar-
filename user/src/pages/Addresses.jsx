import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import api from '../api/client.js';
import BackHeader from '../components/BackHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const blank = { label: 'Home', fullName: '', phone: '', house: '', area: '', city: '', state: '', pincode: '', landmark: '', isDefault: false };

export default function Addresses() {
  const { user, loadUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await api.get('/users/addresses');
    setAddresses(data.addresses);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (user && !form.fullName) setForm((f) => ({ ...f, fullName: user.name, phone: user.phone || '' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/users/addresses', form);
      setAddresses(data.addresses);
      setForm(blank);
      setShowForm(false);
      await loadUser();
      toast.success('Address added');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (aid) => {
    const { data } = await api.delete(`/users/addresses/${aid}`);
    setAddresses(data.addresses);
    await loadUser();
  };

  const setDefault = async (aid) => {
    const { data } = await api.put(`/users/addresses/${aid}`, { isDefault: true });
    setAddresses(data.addresses);
    await loadUser();
  };

  return (
    <div>
      <BackHeader title="My Addresses" />
      <div className="page">
        {addresses.map((a) => (
          <div key={a._id} className={`addr-card ${a.isDefault ? 'selected' : ''}`}>
            <div className="flex">
              <div className="addr-label">{a.label} {a.isDefault && '· Default'}</div>
              <div className="spacer" />
              <button onClick={() => remove(a._id)} style={{ color: 'var(--red)' }}><FiTrash2 /></button>
            </div>
            <div className="addr-text">{a.fullName} · {a.phone}</div>
            <div className="addr-text">{a.house}, {a.area}, {a.city}, {a.state} - {a.pincode}</div>
            {!a.isDefault && <button className="link mt" onClick={() => setDefault(a._id)}>Set as default</button>}
          </div>
        ))}

        {!showForm ? (
          <button className="btn btn-outline mt" onClick={() => setShowForm(true)}>
            <FiPlus /> Add New Address
          </button>
        ) : (
          <form onSubmit={save} className="card mt" style={{ padding: 16 }}>
            <div className="section-title" style={{ marginTop: 0 }}>New Address</div>
            <div className="field">
              <label>Label</label>
              <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}>
                <option>Home</option><option>Work</option><option>Other</option>
              </select>
            </div>
            <div className="grid-2">
              <div className="field"><label>Full Name</label><input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
              <div className="field"><label>Phone</label><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="field"><label>House / Flat</label><input required value={form.house} onChange={(e) => setForm({ ...form, house: e.target.value })} /></div>
            <div className="field"><label>Area / Street</label><input required value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></div>
            <div className="grid-2">
              <div className="field"><label>City</label><input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div className="field"><label>State</label><input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
            </div>
            <div className="grid-2">
              <div className="field"><label>Pincode</label><input required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} /></div>
              <div className="field"><label>Landmark</label><input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} /></div>
            </div>
            <div className="flex">
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
