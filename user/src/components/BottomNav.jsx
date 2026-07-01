import { NavLink } from 'react-router-dom';
import { FiHome, FiGrid, FiShoppingCart, FiClipboard, FiUser } from 'react-icons/fi';
import { useCart } from '../context/CartContext.jsx';

export default function BottomNav() {
  const { count } = useCart();
  const items = [
    { to: '/home', label: 'Home', icon: <FiHome /> },
    { to: '/categories', label: 'Categories', icon: <FiGrid /> },
    { to: '/cart', label: 'Cart', icon: <FiShoppingCart />, badge: count },
    { to: '/orders', label: 'Orders', icon: <FiClipboard /> },
    { to: '/profile', label: 'Profile', icon: <FiUser /> },
  ];
  return (
    <nav className="bottom-nav">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className={`ic ${it.badge ? 'cart-dot' : ''}`}>
            {it.icon}
            {it.badge > 0 && <em>{it.badge}</em>}
          </span>
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}
