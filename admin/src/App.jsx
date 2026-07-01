import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Loader from './components/Loader.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Categories from './pages/Categories.jsx';
import Banners from './pages/Banners.jsx';
import Coupons from './pages/Coupons.jsx';
import Orders from './pages/Orders.jsx';
import DeliveryBoys from './pages/DeliveryBoys.jsx';
import Users from './pages/Users.jsx';
import Analytics from './pages/Analytics.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';

const Protected = ({ children }) => {
  const { admin, loading } = useAuth();
  if (loading) return <Loader />;
  if (!admin) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/products" element={<Protected><Products /></Protected>} />
      <Route path="/categories" element={<Protected><Categories /></Protected>} />
      <Route path="/banners" element={<Protected><Banners /></Protected>} />
      <Route path="/coupons" element={<Protected><Coupons /></Protected>} />
      <Route path="/orders" element={<Protected><Orders /></Protected>} />
      <Route path="/delivery-boys" element={<Protected><DeliveryBoys /></Protected>} />
      <Route path="/users" element={<Protected><Users /></Protected>} />
      <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
      <Route path="/reports" element={<Protected><Reports /></Protected>} />
      <Route path="/settings" element={<Protected><Settings /></Protected>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
