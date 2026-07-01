import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiDownload } from 'react-icons/fi';
import api from '../api/client.js';
import Layout from '../components/Layout.jsx';
import Loader from '../components/Loader.jsx';
import { inr, dateFmt } from '../utils/format.js';

export default function Reports() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/sales-report?from=${from}&to=${to}`);
      setData(data);
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  const exportCsv = () => {
    if (!data?.orders?.length) return;
    const rows = [['Order No', 'Customer', 'Date', 'Payment', 'Status', 'Total']];
    data.orders.forEach((o) => rows.push([o.orderNo, o.user?.name || '', dateFmt(o.createdAt), o.paymentMethod, o.status, o.total]));
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sales-report-${Date.now()}.csv`;
    a.click();
  };

  return (
    <Layout title="Sales Report">
      <div className="card">
        <div className="toolbar">
          <div className="field" style={{ margin: 0 }}><label>From</label><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div className="field" style={{ margin: 0 }}><label>To</label><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          <button className="btn" style={{ alignSelf: 'flex-end' }} onClick={run}>Generate</button>
          {data && <button className="btn btn-light" style={{ alignSelf: 'flex-end' }} onClick={exportCsv}><FiDownload /> Export CSV</button>}
        </div>
      </div>

      {loading && <Loader />}
      {data && (
        <>
          <div className="stat-grid section">
            <div className="stat-card"><div className="label">Total Sales</div><div className="value">{inr(data.summary.totalSales)}</div></div>
            <div className="stat-card"><div className="label">Orders</div><div className="value">{data.summary.count}</div></div>
            <div className="stat-card"><div className="label">COD</div><div className="value">{inr(data.summary.COD)}</div></div>
            <div className="stat-card"><div className="label">UPI</div><div className="value">{inr(data.summary.UPI)}</div></div>
            <div className="stat-card"><div className="label">Total Discount</div><div className="value">{inr(data.summary.totalDiscount)}</div></div>
          </div>
          <div className="card section">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Payment</th><th>Status</th><th>Total</th></tr></thead>
                <tbody>
                  {data.orders.map((o) => (
                    <tr key={o._id}>
                      <td><b>#{o.orderNo}</b></td><td>{o.user?.name}</td><td className="muted">{dateFmt(o.createdAt)}</td>
                      <td>{o.paymentMethod}</td><td><span className={`pill st-${o.status.replace(/ /g, '')}`}>{o.status}</span></td><td>{inr(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.orders.length === 0 && <div className="empty">No orders in this range</div>}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
