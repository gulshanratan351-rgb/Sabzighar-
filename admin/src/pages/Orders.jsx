import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEye } from 'react-icons/fi';
import api from '../api/client.js';
import Layout from '../components/Layout.jsx';
import Loader from '../components/Loader.jsx';
import Modal from '../components/Modal.jsx';
import { inr, dateFmt, FALLBACK_IMG } from '../utils/format.js';

const STATUSES = ['Pending', 'Confirmed', 'Packed', 'Assigned', 'Out for Delivery', 'Delivered', 'Cancelled'];
const FILTERS = ['all', ...STATUSES];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [boys, setBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState(null);

  const load = async () => {
    setLoading(true);
    const [o, b] = await Promise.all([
      api.get(`/admin/orders?status=${filter}${search ? `&search=${search}` : ''}`),
      api.get('/admin/delivery-boys'),
    ]);
    setOrders(o.data.orders);
    setBoys(b.data.deliveryBoys);
    setLoading(false);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [filter]);

  const changeStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      toast.success(`Marked ${status}`);
      load();
      if (view?._id === id) setView({ ...view, status });
    } catch (err) { toast.error(err.message); }
  };
  const assign = async (id, deliveryBoyId) => {
    if (!deliveryBoyId) return;
    try { await api.put(`/admin/orders/${id}/assign`, { deliveryBoyId }); toast.success('Assigned'); load(); }
    catch (err) { toast.error(err.message); }
  };

  return (
    <Layout title="Orders">
      <div className="chips">
        {FILTERS.map((f) => <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f}</button>)}
      </div>
      <div className="toolbar">
        <input className="search-input" placeholder="Search order no..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
        <button className="btn btn-sm btn-light" onClick={load}>Search</button>
      </div>

      <div className="card">
        {loading ? <Loader /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Pay</th><th>Delivery Boy</th><th>Status</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td><b>#{o.orderNo}</b></td>
                    <td>{o.user?.name}<div className="muted" style={{ fontSize: 12 }}>{o.address?.phone}</div></td>
                    <td>{o.items.length}</td>
                    <td><b>{inr(o.total)}</b></td>
                    <td>{o.paymentMethod}<div className="muted" style={{ fontSize: 11 }}>{o.paymentStatus}</div></td>
                    <td>
                      <select value={o.deliveryBoy?._id || ''} onChange={(e) => assign(o._id, e.target.value)} style={{ padding: 6, borderRadius: 8, border: '1px solid var(--border)' }}>
                        <option value="">— Assign —</option>
                        {boys.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <select value={o.status} className={`pill st-${o.status.replace(/ /g, '')}`} onChange={(e) => changeStatus(o._id, e.target.value)} style={{ border: 'none', fontWeight: 700 }}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="muted">{dateFmt(o.createdAt)}</td>
                    <td><button className="btn btn-sm btn-light" onClick={() => setView(o)}><FiEye /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <div className="empty">No orders</div>}
          </div>
        )}
      </div>

      {view && (
        <Modal title={`Order #${view.orderNo}`} onClose={() => setView(null)}>
          <div className="flex mb"><span className={`pill st-${view.status.replace(/ /g, '')}`}>{view.status}</span><span className="muted">{dateFmt(view.createdAt)}</span></div>
          <b>Customer</b>
          <p className="muted">{view.user?.name} · {view.address?.phone}</p>
          <p className="muted">{view.address?.house}, {view.address?.area}, {view.address?.city}, {view.address?.state} - {view.address?.pincode}</p>
          <b className="mt" style={{ display: 'block', marginTop: 14 }}>Items</b>
          {view.items.map((it, i) => (
            <div key={i} className="flex" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <img src={it.image || FALLBACK_IMG} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} onError={(e)=>{e.target.src=FALLBACK_IMG;}} />
              <div style={{ flex: 1 }}>{it.name}<div className="muted" style={{ fontSize: 12 }}>{it.label} × {it.quantity}</div></div>
              <b>{inr(it.lineTotal)}</b>
            </div>
          ))}
          <div className="flex mt" style={{ justifyContent: 'space-between' }}><span>Subtotal</span><span>{inr(view.subtotal)}</span></div>
          {view.discount > 0 && <div className="flex" style={{ justifyContent: 'space-between' }}><span>Discount</span><span>− {inr(view.discount)}</span></div>}
          <div className="flex" style={{ justifyContent: 'space-between' }}><span>Delivery</span><span>{inr(view.deliveryCharge)}</span></div>
          <div className="flex" style={{ justifyContent: 'space-between', fontWeight: 800, fontSize: 17 }}><span>Total ({view.paymentMethod})</span><span>{inr(view.total)}</span></div>
        </Modal>
      )}
    </Layout>
  );
}
