import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { inr } from '../utils/format.js';

export default function Orders() {
  const navigate = useNavigate();
  const { rider } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [o, s] = await Promise.all([api.get('/delivery/orders'), api.get('/delivery/stats')]);
    setOrders(o.data.orders);
    setStats(s.data.stats);
    setLoading(false);
  };
  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  if (loading) return <Loader full />;

  return (
    <div>
      <header className="header">
        <div>
          <div className="brand">🛵 Hi, {rider?.name?.split(' ')[0]}</div>
          <div className="sub">SabziGhar Delivery Partner</div>
        </div>
      </header>
      <div className="page">
        {stats && (
          <div className="stat-row">
            <div className="stat-box"><div className="v">{stats.assigned}</div><div className="l">Active Orders</div></div>
            <div className="stat-box"><div className="v">{stats.delivered}</div><div className="l">Delivered</div></div>
            <div className="stat-box"><div className="v">{stats.totalDeliveries}</div><div className="l">Total Deliveries</div></div>
            <div className="stat-box"><div className="v">{inr(stats.codCollected)}</div><div className="l">COD Collected</div></div>
          </div>
        )}

        <div className="section-title">Assigned Orders ({orders.length})</div>
        {orders.length === 0 ? (
          <div className="empty"><div className="ic">📭</div><p>No active orders right now.</p></div>
        ) : (
          orders.map((o) => (
            <div key={o._id} className="card order-card" onClick={() => navigate(`/orders/${o._id}`)}>
              <div className="top">
                <b>#{o.orderNo}</b>
                <span className={`pill st-${o.status.replace(/ /g, '')}`}>{o.status}</span>
              </div>
              <div className="muted mt">{o.address?.fullName} · {o.address?.phone}</div>
              <div className="muted">{o.address?.area}, {o.address?.city} - {o.address?.pincode}</div>
              <div className="flex mt">
                <span className="muted">{o.items.length} item(s)</span>
                <div className="spacer" />
                <span className={`pill ${o.paymentMethod === 'COD' ? 'st-Pending' : 'st-Delivered'}`}>{o.paymentMethod} {inr(o.total)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
