import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import BackHeader from '../components/BackHeader.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { dateFmt } from '../utils/format.js';

const ICONS = { order: '📦', offer: '🎁', system: '🔔' };

export default function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get('/notifications');
    setItems(data.notifications);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const open = async (n) => {
    if (!n.isRead) await api.put(`/notifications/${n._id}/read`);
    if (n.link) navigate(n.link);
    else load();
  };

  const readAll = async () => {
    await api.put('/notifications/read-all');
    load();
  };

  if (loading) return <Loader full />;

  return (
    <div>
      <BackHeader title="Notifications" right={items.length > 0 && <button className="link" onClick={readAll}>Read all</button>} />
      {items.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications" text="You're all caught up!" />
      ) : (
        <div className="card" style={{ margin: 12 }}>
          {items.map((n) => (
            <div key={n._id} className={`notif ${n.isRead ? '' : 'unread'}`} onClick={() => open(n)}>
              <span className="n-ic">{ICONS[n.type] || '🔔'}</span>
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: 14 }}>{n.title}</b>
                <div className="muted" style={{ fontSize: 13 }}>{n.message}</div>
                <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{dateFmt(n.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
