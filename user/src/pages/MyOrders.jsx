import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { inr, dateFmt } from '../utils/format.js';

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(({ data }) => {
      setOrders(data.orders);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader full />;

  return (
    <div>
      <header className="header"><div className="brand">My Orders</div></header>
      <div className="page">
        {orders.length === 0 ? (
          <EmptyState icon="📦" title="No orders yet" text="Your orders will appear here" actionLabel="Shop Now" actionTo="/home" />
        ) : (
          orders.map((o) => (
            <div key={o._id} className="card order-card" onClick={() => navigate(`/orders/${o._id}`)}>
              <div className="oc-top">
                <b>#{o.orderNo}</b>
                <span className={`status-pill st-${o.status.replace(/ /g, '')}`}>{o.status}</span>
              </div>
              <div className="muted" style={{ fontSize: 12, margin: '6px 0' }}>{dateFmt(o.createdAt)}</div>
              <div className="flex">
                <span className="muted">{o.items.length} item(s) · {o.paymentMethod}</span>
                <div className="spacer" />
                <b>{inr(o.total)}</b>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
