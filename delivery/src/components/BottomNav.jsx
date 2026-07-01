import { NavLink } from 'react-router-dom';
import { FiPackage, FiClock, FiUser } from 'react-icons/fi';

export default function BottomNav() {
  const items = [
    { to: '/orders', label: 'Orders', icon: <FiPackage /> },
    { to: '/history', label: 'History', icon: <FiClock /> },
    { to: '/profile', label: 'Profile', icon: <FiUser /> },
  ];
  return (
    <nav className="bottom-nav">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="ic">{it.icon}</span>
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}
