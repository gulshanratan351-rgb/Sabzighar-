import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPhone, FiMapPin, FiNavigation } from 'react-icons/fi';
import api from '../api/client.js';
import Loader from '../components/Loader.jsx';
import { inr, dateFmt, FALLBACK_IMG } from '../utils/format.js';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/delivery/order/${id}`);
      setOrder(data.order);
    } catch (err) {
      toast.error(err.message);
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader full />;
  if (!order) return null;

  const setStatus = async (status) => {
    setBusy(true);
    try {
      const { data } = await api.put(`/delivery/order/${id}/status`, { status });
      setOrder(data.order);
      toast.success(`Marked ${status}`);
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const collectCod = async () => {
    setBusy(true);
    try {
      const { data } = await api.put(`/delivery/order/${id}/cod`, { collected: true });
      setOrder(data.order);
      toast.success('COD marked collected');
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const a = order.address;
  const isDelivered = order.status === 'Delivered';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.area}, ${a.city}, ${a.pincode}`)}`;

  return (
    <div>
      <div className="back-header">
        <button onClick={() => navigate('/orders')}><FiArrowLeft size={22} /></button>
        <div className="title">Order #{order.orderNo}</div>
        <div className="spacer" />
        <span className={`pill st-${order.status.replace(/ /g, '')}`}>{order.status}</span>
      </div>

      <div className="page">
        <div className="card">
          <div className="flex">
            <div>
              <b>{a.fullName}</b>
              <div className="muted">📞 {a.phone}</div>
            </div>
            <div className="spacer" />
            <a href={`tel:${a.phone}`} className="btn btn-blue btn-sm"><FiPhone /> Call</a>
          </div>
          <div className="mt" style={{ display: 'flex', gap: 8 }}>
            <FiMapPin style={{ marginTop: 3 }} color="var(--green)" />
            <div>{a.house}, {a.area}, {a.city}, {a.state} - {a.pincode}{a.landmark ? ` (${a.landmark})` : ''}</div>
          </div>
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm mt" style={{ width: '100%' }}>
            <FiNavigation /> Navigate on Maps
          </a>
        </div>

        <div className="card">
          <b>Items ({order.items.length})</b>
          {order.items.map((it, i) => (
            <div key={i} className="item-row">
              <img src={it.image || FALLBACK_IMG} alt="" onError={(e)=>{e.target.src=FALLBACK_IMG;}} />
              <div style={{ flex: 1 }}>{it.name}<div className="muted">{it.label} × {it.quantity}</div></div>
              <b>{inr(it.lineTotal)}</b>
            </div>
          ))}
          <div className="flex mt"><span>Total</span><div className="spacer" /><b style={{ fontSize: 18 }}>{inr(order.total)}</b></div>
          <div className="cod-badge mt">
            {order.paymentMethod === 'COD'
              ? (order.codCollected ? `✅ COD Collected — ${inr(order.total)}` : `💵 Collect COD — ${inr(order.total)}`)
              : `📱 Paid via UPI (${order.paymentStatus})`}
          </div>
        </div>

        {!isDelivered ? (
          <div className="card">
            <b>Update Status</b>
            <div className="mt" style={{ display: 'grid', gap: 10 }}>
              {order.status !== 'Out for Delivery' && (
                <button className="btn btn-amber" disabled={busy} onClick={() => setStatus('Out for Delivery')}>
                  🛵 Picked Up / Out for Delivery
                </button>
              )}
              {order.paymentMethod === 'COD' && !order.codCollected && (
                <button className="btn btn-blue" disabled={busy} onClick={collectCod}>
                  💵 Mark COD Collected
                </button>
              )}
              <button className="btn" disabled={busy} onClick={() => setStatus('Delivered')}>
                ✅ Mark Delivered
              </button>
            </div>
          </div>
        ) : (
          <div className="card text-center">
            <div style={{ fontSize: 40 }}>✅</div>
            <b>Delivered</b>
            <div className="muted">{dateFmt(order.deliveredAt || order.updatedAt)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
