import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMapPin, FiNavigation } from 'react-icons/fi';
import api from '../api/client.js';
import BackHeader from '../components/BackHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LocationSelect() {
  const navigate = useNavigate();
  const { user, loadUser } = useAuth();
  const [form, setForm] = useState({
    label: 'Home',
    fullName: user?.name || '',
    phone: user?.phone || '',
    house: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: true,
  });
  const [busy, setBusy] = useState(false);

  const detect = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    toast.loading('Detecting location...', { id: 'loc' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.success('Location detected — fill remaining details', { id: 'loc' });
        setForm((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude }));
      },
      () => toast.error('Could not detect location', { id: 'loc' })
    );
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/users/addresses', form);
      await loadUser();
      toast.success('Location saved');
      navigate('/home', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <BackHeader title="Select Location" />
      <div className="form-wrap">
        <button type="button" className="btn btn-ghost mb" onClick={detect}>
          <FiNavigation /> Use my current location
        </button>
        <form onSubmit={save}>
          <div className="field"><label><FiMapPin /> House / Flat</label><input required value={form.house} onChange={(e) => setForm({ ...form, house: e.target.value })} placeholder="12, Green Residency" /></div>
          <div className="field"><label>Area / Street</label><input required value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="MG Road" /></div>
          <div className="grid-2">
            <div className="field"><label>City</label><input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div className="field"><label>State</label><input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
          </div>
          <div className="grid-2">
            <div className="field"><label>Pincode</label><input required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} /></div>
            <div className="field"><label>Phone</label><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <button className="btn" disabled={busy}>{busy ? 'Saving...' : 'Save & Continue'}</button>
          <button type="button" className="link mt" style={{ width: '100%', background: 'none' }} onClick={() => navigate('/home')}>Skip for now</button>
        </form>
      </div>
    </div>
  );
}
