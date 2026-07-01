import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import Loader from '../components/Loader.jsx';
import { inr, dateFmt } from '../utils/format.js';

export default function History() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/delivery/history').then(({ data }) => {
      setOrders(data.orders);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader full />;

  return (
    <div>
      <header className="header"><div className="brand">Delivery History</div></header>
      <div className="page">
        {orders.length === 0 ? (
          <div className="empty"><div className="ic">📜</div><p>No completed deliveries yet.</p></div>
        ) : (
          orders.map((o) => (
            <div key={o._id} className="card order-card" onClick={() => navigate(`/orders/${o._id}`)}>
              <div className="top">
                <b>#{o.orderNo}</b>
                <span className={`pill st-${o.status.replace(/ /g, '')}`}>{o.status}</span>
              </div>
              <div className="muted mt">{o.address?.fullName} · {o.address?.area}</div>
              <div className="flex mt">
                <span className="muted">{dateFmt(o.deliveredAt || o.updatedAt)}</span>
                <div className="spacer" />
                <b>{o.paymentMethod} {inr(o.total)}</b>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
