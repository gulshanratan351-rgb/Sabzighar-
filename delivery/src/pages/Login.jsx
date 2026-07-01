import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome, partner!');
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
        <p className="text-center muted" style={{ marginBottom: 18 }}>Delivery Partner Login</p>
        <form onSubmit={submit}>
          <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" /></div>
          <div className="field"><label>Password</label><input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></div>
          <button className="btn" disabled={busy}>{busy ? 'Logging in...' : 'Login'}</button>
        </form>
        <p className="text-center muted mt">New partner? <Link to="/signup" className="link">Sign Up</Link></p>
        <div className="card mt" style={{ padding: 10, fontSize: 12, marginBottom: 0 }}><b>Demo:</b> delivery@sabzighar.com / delivery123</div>
      </div>
    </div>
  );
}
