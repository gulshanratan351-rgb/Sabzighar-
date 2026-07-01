import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiClipboard, FiBell, FiHelpCircle, FiLogOut, FiEdit2, FiInfo } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Profile() {
  const { user, logout } = useAuth();
  const { resetCart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    resetCart();
    navigate('/welcome', { replace: true });
  };

  const menu = [
    { icon: <FiClipboard />, label: 'My Orders', to: '/orders' },
    { icon: <FiMapPin />, label: 'My Addresses', to: '/addresses' },
    { icon: <FiBell />, label: 'Notifications', to: '/notifications' },
    { icon: <FiHelpCircle />, label: 'Help & Support', to: '/help' },
  ];

  return (
    <div>
      <div className="profile-head">
        <div className="avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 18 }}>{user?.name}</h2>
          <div style={{ fontSize: 13, opacity: 0.9 }}>{user?.email}</div>
          {user?.phone && <div style={{ fontSize: 13, opacity: 0.9 }}>📞 {user.phone}</div>}
        </div>
        <FiEdit2 onClick={() => navigate('/addresses')} style={{ cursor: 'pointer' }} />
      </div>
      <div className="page">
        <div className="menu-list">
          {menu.map((m) => (
            <a key={m.to} onClick={() => navigate(m.to)}>
              <span className="ic">{m.icon}</span>
              {m.label}
            </a>
          ))}
          <a>
            <span className="ic"><FiInfo /></span>
            SabziGhar v1.0.0
          </a>
          <button onClick={handleLogout} style={{ color: 'var(--red)' }}>
            <span className="ic" style={{ color: 'var(--red)' }}><FiLogOut /></span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
