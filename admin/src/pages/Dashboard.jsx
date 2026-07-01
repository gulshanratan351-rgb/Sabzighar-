import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import Layout from '../components/Layout.jsx';
import Loader from '../components/Loader.jsx';
import { inr, dateFmt } from '../utils/format.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setData(data));
  }, []);

  if (!data) return <Layout title="Dashboard"><Loader /></Layout>;

  const { stats, lowStock, recentOrders } = data;
  const cards = [
    { label: "Today's Sales", value: inr(stats.todaySales), ic: '💰' },
    { label: 'Total Revenue', value: inr(stats.revenue), ic: '📈' },
    { label: 'Total Orders', value: stats.totalOrders, ic: '🛍️' },
    { label: 'Pending Orders', value: stats.pendingOrders, ic: '⏳' },
    { label: 'Delivered', value: stats.deliveredOrders, ic: '✅' },
    { label: 'Customers', value: stats.totalUsers, ic: '👥' },
    { label: 'Products', value: stats.totalProducts, ic: '📦' },
    { label: 'Delivery Boys', value: stats.totalDeliveryBoys, ic: '🛵' },
  ];

  return (
    <Layout title="Dashboard">
      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <span className="ic">{c.ic}</span>
            <div className="label">{c.label}</div>
            <div className="value">{c.value}</div>
          </div>
        ))}
      </div>

      {stats.lowStockCount > 0 && (
        <div className="card section" style={{ borderLeft: '4px solid var(--amber)' }}>
          <div className="section-title">⚠️ Low Stock Alert ({stats.lowStockCount})</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Product</th><th>Stock left</th><th>Threshold</th></tr></thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td><span className="pill pill-red">{p.stock} {p.unitType === 'weight' ? 'g' : 'pcs'}</span></td>
                    <td>{p.lowStockThreshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card section">
        <div className="section-title">Recent Orders <div className="spacer" /><button className="btn btn-sm btn-light" onClick={() => navigate('/orders')}>View all</button></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o._id} onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }}>
                  <td><b>#{o.orderNo}</b></td>
                  <td>{o.user?.name || '—'}</td>
                  <td>{inr(o.total)}</td>
                  <td>{o.paymentMethod}</td>
                  <td><span className={`pill st-${o.status.replace(/ /g, '')}`}>{o.status}</span></td>
                  <td className="muted">{dateFmt(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
