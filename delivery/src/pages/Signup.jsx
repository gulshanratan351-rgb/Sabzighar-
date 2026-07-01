import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', vehicleNumber: '', area: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/orders', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="logo">🛵 SabziGhar</div>
        <p className="text-center muted" style={{ marginBottom: 18 }}>Become a Delivery Partner</p>
        <form onSubmit={submit}>
          <div className="field"><label>Full Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="field"><label>Phone</label><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="field"><label>Vehicle Number</label><input value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} /></div>
          <div className="field"><label>Area</label><input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></div>
          <div className="field"><label>Password</label><input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <button className="btn" disabled={busy}>{busy ? 'Creating...' : 'Sign Up'}</button>
        </form>
        <p className="text-center muted mt">Already registered? <Link to="/login" className="link">Login</Link></p>
      </div>
    </div>
  );
}
