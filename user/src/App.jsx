import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useCart } from './context/CartContext.jsx';
import Loader from './components/Loader.jsx';
import BottomNav from './components/BottomNav.jsx';

import Splash from './pages/Splash.jsx';
import Welcome from './pages/Welcome.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import LocationSelect from './pages/LocationSelect.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import ProductList from './pages/ProductList.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import MyOrders from './pages/MyOrders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Profile from './pages/Profile.jsx';
import Addresses from './pages/Addresses.jsx';
import Help from './pages/Help.jsx';
import Notifications from './pages/Notifications.jsx';
import Categories from './pages/Categories.jsx';

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader full />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const navPaths = ['/home', '/categories', '/cart', '/orders', '/profile'];

export default function App() {
  const { loading, user } = useAuth();
  const { refresh } = useCart();
  const location = useLocation();

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  if (loading) return <Loader full />;

  const showNav = navPaths.some((p) => location.pathname === p || location.pathname.startsWith(p + '/'));

  return (
    <>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/location" element={<Protected><LocationSelect /></Protected>} />

        <Route path="/home" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/search" element={<Search />} />
        <Route path="/category/:slug" element={<ProductList />} />
        <Route path="/product/:slug" element={<ProductDetail />} />

        <Route path="/cart" element={<Protected><Cart /></Protected>} />
        <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
        <Route path="/order-success/:id" element={<Protected><OrderSuccess /></Protected>} />
        <Route path="/orders" element={<Protected><MyOrders /></Protected>} />
        <Route path="/orders/:id" element={<Protected><OrderDetail /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/addresses" element={<Protected><Addresses /></Protected>} />
        <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
        <Route path="/help" element={<Help />} />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
}
