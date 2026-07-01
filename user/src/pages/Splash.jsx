import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Splash() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => {
      if (user) navigate('/home', { replace: true });
      else navigate('/welcome', { replace: true });
    }, 1800);
    return () => clearTimeout(t);
  }, [navigate, user]);

  return (
    <div className="center-screen splash">
      <div className="logo-big">🥬</div>
      <h1>SabziGhar</h1>
      <p>Tazi Sabzi, Seedhe Ghar Tak</p>
      <div className="spinner" style={{ marginTop: 30, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
    </div>
  );
}
