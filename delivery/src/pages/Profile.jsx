import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiTruck, FiMapPin, FiPhone } from 'react-icons/fi';
import api from '../api/client.js';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { inr } from '../utils/format.js';

export default function Profile() {
  const { rider, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/delivery/stats').then(({ data }) => setStats(data.stats));
  }, []);

  const doLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div>
      <header className="header"><div className="brand">Profile</div></header>
      <div className="page">
        <div className="card text-center">
          <div style={{ fontSize: 48 }}>🛵</div>
          <h2>{rider?.name}</h2>
          <div className="muted">{rider?.email}</div>
          {rider?.phone && <div className="muted"><FiPhone /> {rider.phone}</div>}
          {rider?.profile?.vehicleNumber && <div className="muted"><FiTruck /> {rider.profile.vehicleNumber}</div>}
          {rider?.profile?.area && <div className="muted"><FiMapPin /> {rider.profile.area}</div>}
        </div>

        {!stats ? <Loader /> : (
          <div className="stat-row">
            <div className="stat-box"><div className="v">{stats.totalDeliveries}</div><div className="l">Total Deliveries</div></div>
            <div className="stat-box"><div className="v">{inr(stats.codCollected)}</div><div className="l">COD Collected</div></div>
            <div className="stat-box"><div className="v">{stats.assigned}</div><div className="l">Active</div></div>
            <div className="stat-box"><div className="v">{stats.delivered}</div><div className="l">Delivered</div></div>
          </div>
        )}

        <button className="btn btn-outline mt" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={doLogout}>
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
}
