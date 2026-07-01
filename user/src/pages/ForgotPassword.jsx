import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client.js';
import BackHeader from '../components/BackHeader.jsx';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success('OTP generated');
      if (data.devOtp) {
        setOtp(data.devOtp);
        toast(`Demo OTP: ${data.devOtp}`, { icon: '🔑', duration: 6000 });
      }
      setStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const reset = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/auth/reset-password', { email, otp, password });
      toast.success('Password reset! Please login.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <BackHeader title="Forgot Password" />
      <div className="form-wrap">
        {step === 1 ? (
          <form onSubmit={sendOtp}>
            <p className="muted mb">Enter your registered email to receive an OTP.</p>
            <div className="field">
              <label>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </div>
            <button className="btn" disabled={busy}>{busy ? 'Sending...' : 'Send OTP'}</button>
          </form>
        ) : (
          <form onSubmit={reset}>
            <p className="muted mb">Enter the OTP and your new password.</p>
            <div className="field">
              <label>OTP</label>
              <input required value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" />
            </div>
            <div className="field">
              <label>New Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
            </div>
            <button className="btn" disabled={busy}>{busy ? 'Resetting...' : 'Reset Password'}</button>
          </form>
        )}
      </div>
    </>
  );
}
