import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPhone } from 'react-icons/fi';
import api from '../api/client.js';
import BackHeader from '../components/BackHeader.jsx';
import Loader from '../components/Loader.jsx';
import { inr, dateFmt, FALLBACK_IMG } from '../utils/format.js';

const FLOW = ['Pending', 'Confirmed', 'Packed', 'Assigned', 'Out for Delivery', 'Delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.order);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    // Live status polling
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  if (loading) return <Loader full />;
  if (!order) return null;

  const cancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const { data } = await api.put(`/orders/${id}/cancel`, { reason: 'Cancelled by user' });
      setOrder(data.order);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const cancellable = ['Pending', 'Confirmed', 'Packed'].includes(order.status);
  const isCancelled = order.status === 'Cancelled';
  const currentIdx = FLOW.indexOf(order.status);

  const statusTime = (s) => {
    const h = order.statusHistory?.find((x) => x.status === s);
    return h ? dateFmt(h.at) : '';
  };

  return (
    <div>
      <BackHeader title={`Order #${order.orderNo}`} />
      <div className="page">
        <div className="card" style={{ padding: 16 }}>
          <div className="flex">
            <b>Status</b>
            <div className="spacer" />
            <span className={`status-pill st-${order.status.replace(/ /g, '')}`}>{order.status}</span>
          </div>

          {isCancelled ? (
            <p className="muted mt">This order was cancelled. {order.cancelReason}</p>
          ) : (
            <div className="timeline mt">
              {FLOW.map((s, i) => {
                const done = i <= currentIdx;
                return (
                  <div key={s} className={`tl-step ${done ? 'done' : ''}`}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div className="dot" />
                      {i < FLOW.length - 1 && <div className="line" />}
                    </div>
                    <div className="tl-body">
                      <div className="s-name">{s}</div>
                      <div className="s-time">{statusTime(s)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {order.deliveryBoy && (
          <div className="card mt" style={{ padding: 14 }}>
            <div className="flex">
              <div>
                <b>Delivery Partner</b>
                <div className="muted">{order.deliveryBoy.name}</div>
              </div>
              <div className="spacer" />
              <a href={`tel:${order.deliveryBoy.phone}`} className="btn btn-sm btn-ghost">
                <FiPhone /> Call
              </a>
            </div>
          </div>
        )}

        <div className="section-title">Items</div>
        <div className="card">
          {order.items.map((it, i) => (
            <div key={i} className="cart-item">
              <img src={it.image || FALLBACK_IMG} alt={it.name} onError={(e)=>{e.target.src=FALLBACK_IMG;}} />
              <div style={{ flex: 1 }}>
                <div className="ci-name">{it.name}</div>
                <div className="ci-unit">{it.label} × {it.quantity}</div>
              </div>
              <b>{inr(it.lineTotal)}</b>
            </div>
          ))}
        </div>

        <div className="section-title">Delivery Address</div>
        <div className="card" style={{ padding: 14 }}>
          <b>{order.address.fullName}</b>
          <div className="muted">{order.address.house}, {order.address.area}, {order.address.city}, {order.address.state} - {order.address.pincode}</div>
          <div className="muted">📞 {order.address.phone}</div>
        </div>

        <div className="card mt" style={{ padding: 16 }}>
          <div className="bill-row"><span>Item Total</span><span>{inr(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="bill-row"><span>Discount ({order.couponCode})</span><span className="free">− {inr(order.discount)}</span></div>}
          <div className="bill-row"><span>Delivery</span>{order.deliveryCharge > 0 ? <span>{inr(order.deliveryCharge)}</span> : <span className="free">FREE</span>}</div>
          <div className="bill-row total"><span>Total ({order.paymentMethod})</span><span>{inr(order.total)}</span></div>
          <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>Payment: {order.paymentStatus}</div>
        </div>

        {cancellable && (
          <button className="btn btn-outline mt" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={cancel}>
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}
