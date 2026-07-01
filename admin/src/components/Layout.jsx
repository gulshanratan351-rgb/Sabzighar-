import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiBox, FiList, FiImage, FiTag, FiShoppingBag, FiTruck, FiUsers,
  FiBarChart2, FiSettings, FiLogOut, FiMenu,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { to: '/products', label: 'Products', icon: <FiBox /> },
  { to: '/categories', label: 'Categories', icon: <FiList /> },
  { to: '/banners', label: 'Banners', icon: <FiImage /> },
  { to: '/coupons', label: 'Coupons', icon: <FiTag /> },
  { to: '/orders', label: 'Orders', icon: <FiShoppingBag /> },
  { to: '/delivery-boys', label: 'Delivery Boys', icon: <FiTruck /> },
  { to: '/users', label: 'Users', icon: <FiUsers /> },
  { to: '/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
  { to: '/reports', label: 'Sales Report', icon: <FiBarChart2 /> },
  { to: '/settings', label: 'Settings', icon: <FiSettings /> },
];

export default function Layout({ title, children }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const doLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="layout">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="logo">🥬 SabziGhar</div>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}>
              {l.icon} {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="foot">
          <div style={{ marginBottom: 8 }}>👑 {admin?.name}</div>
          <button className="btn btn-sm btn-danger" style={{ width: '100%' }} onClick={doLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>
      <div className={`overlay-backdrop ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <div className="main">
        <div className="topbar">
          <button className="menu-toggle" onClick={() => setOpen(!open)}><FiMenu /></button>
          <h1>{title}</h1>
          <div className="spacer" />
          <span className="muted" style={{ fontSize: 13 }}>{admin?.email}</span>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
