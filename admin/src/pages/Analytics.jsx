import { useEffect, useState } from 'react';
import api from '../api/client.js';
import Layout from '../components/Layout.jsx';
import Loader from '../components/Loader.jsx';
import { inr } from '../utils/format.js';

const RANGES = [
  { key: 'daily', label: 'Daily (14d)' },
  { key: 'weekly', label: 'Weekly (12w)' },
  { key: 'monthly', label: 'Monthly (12m)' },
];

export default function Analytics() {
  const [range, setRange] = useState('daily');
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    api.get(`/admin/analytics?range=${range}`).then(({ data }) => setData(data));
  }, [range]);

  const maxSales = data?.data?.reduce((m, d) => Math.max(m, d.sales), 0) || 1;

  return (
    <Layout title="Analytics">
      <div className="chips">
        {RANGES.map((r) => <button key={r.key} className={`chip ${range === r.key ? 'active' : ''}`} onClick={() => setRange(r.key)}>{r.label}</button>)}
      </div>

      {!data ? <Loader /> : (
        <>
          <div className="card">
            <div className="section-title">Sales Trend</div>
            {data.data.length === 0 ? <div className="empty">No sales data yet</div> : (
              <div className="bar-chart">
                {data.data.map((d) => (
                  <div key={d._id} className="bar" style={{ height: `${(d.sales / maxSales) * 100}%` }} title={`${d._id}: ${inr(d.sales)} (${d.orders} orders)`}>
                    <span>{inr(d.sales)}</span>
                    <em>{d._id.slice(5)}</em>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card section">
            <div className="section-title">Top Selling Products</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Product</th><th>Sold</th><th>Price</th></tr></thead>
                <tbody>
                  {data.topProducts.map((p) => (
                    <tr key={p._id}><td><b>{p.name}</b></td><td>{p.soldCount}</td><td>{inr(p.price)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
