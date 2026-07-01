import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client.js';
import Layout from '../components/Layout.jsx';
import Loader from '../components/Loader.jsx';
import { dateFmt } from '../utils/format.js';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => { const { data } = await api.get('/admin/users'); setUsers(data.users); setLoading(false); };
  useEffect(() => { load(); }, []);

  const toggleBlock = async (u) => {
    try { await api.put(`/admin/users/${u._id}/block`, { isBlocked: !u.isBlocked }); toast.success(u.isBlocked ? 'Unblocked' : 'Blocked'); load(); }
    catch (err) { toast.error(err.message); }
  };

  const filtered = users.filter((u) => (u.name + u.email + (u.phone || '')).toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout title="Users">
      <div className="toolbar"><input className="search-input" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      <div className="card">
        {loading ? <Loader /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Addresses</th><th>Joined</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id}>
                    <td><b>{u.name}</b></td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>{u.addresses?.length || 0}</td>
                    <td className="muted">{dateFmt(u.createdAt)}</td>
                    <td>
                      <button className={`pill ${u.isBlocked ? 'pill-red' : 'pill-green'}`} onClick={() => toggleBlock(u)}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="empty">No users</div>}
          </div>
        )}
      </div>
    </Layout>
  );
}
