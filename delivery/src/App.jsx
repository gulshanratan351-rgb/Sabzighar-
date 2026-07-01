import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Loader from './components/Loader.jsx';
import BottomNav from './components/BottomNav.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import History from './pages/History.jsx';
import Profile from './pages/Profile.jsx';

const Protected = ({ children }) => {
  const { rider, loading } = useAuth();
  if (loading) return <Loader full />;
  if (!rider) return <Navigate to="/login" replace />;
  return children;
};

const navPaths = ['/orders', '/history', '/profile'];

export default function App() {
  const { loading, rider } = useAuth();
  const location = useLocation();
  if (loading) return <Loader full />;
  const showNav = rider && navPaths.some((p) => location.pathname === p);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/orders" element={<Protected><Orders /></Protected>} />
        <Route path="/orders/:id" element={<Protected><OrderDetail /></Protected>} />
        <Route path="/history" element={<Protected><History /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="*" element={<Navigate to="/orders" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
}
