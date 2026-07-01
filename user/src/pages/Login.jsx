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
      toast.success('Welcome back!');
      navigate('/home', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form-wrap">
      <div className="text-center mb">
        <div style={{ fontSize: 46 }}>🥬</div>
        <h1 style={{ fontSize: 24 }}>Welcome Back</h1>
        <p className="muted">Login to continue shopping</p>
      </div>
      <form onSubmit={submit}>
        <div className="field">
          <label>Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
        </div>
        <div className="text-center mb">
          <Link to="/forgot-password" className="link">Forgot Password?</Link>
        </div>
        <button className="btn" disabled={busy}>{busy ? 'Logging in...' : 'Login'}</button>
      </form>
      <p className="text-center mt muted">
        Don&apos;t have an account? <Link to="/signup" className="link">Sign Up</Link>
      </p>
      <div className="card mt" style={{ padding: 12, fontSize: 12 }}>
        <b>Demo:</b> customer@sabzighar.com / customer123
      </div>
    </div>
  );
}
