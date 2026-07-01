import { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

const emptyCart = { items: [], subtotal: 0, discount: 0, deliveryCharge: 0, total: 0, couponCode: '' };

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem('sg_token')) {
      setCart(emptyCart);
      return;
    }
    try {
      const { data } = await api.get('/cart');
      setCart(data.cart);
    } catch {
      // ignore
    }
  }, []);

  const requireLogin = () => {
    if (!user && !localStorage.getItem('sg_token')) {
      toast.error('Please login first');
      return false;
    }
    return true;
  };

  const addToCart = async (payload) => {
    if (!requireLogin()) return false;
    setLoading(true);
    try {
      const { data } = await api.post('/cart', payload);
      setCart(data.cart);
      toast.success('Added to cart');
      return true;
    } catch (e) {
      toast.error(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/item/${itemId}`, { quantity });
      setCart(data.cart);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/item/${itemId}`);
      setCart(data.cart);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const clearCart = async () => {
    try {
      const { data } = await api.delete('/cart');
      setCart(data.cart);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const applyCoupon = async (code) => {
    try {
      const { data } = await api.post('/cart/coupon', { code });
      setCart(data.cart);
      toast.success('Coupon applied');
      return true;
    } catch (e) {
      toast.error(e.message);
      return false;
    }
  };

  const removeCoupon = async () => {
    try {
      const { data } = await api.delete('/cart/coupon');
      setCart(data.cart);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const count = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        count,
        loading,
        refresh,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        resetCart: () => setCart(emptyCart),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
