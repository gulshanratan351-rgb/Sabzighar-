import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sg_delivery_token');
    if (!token) return setLoading(false);
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (data.user.role === 'delivery') setRider(data.user);
        else localStorage.removeItem('sg_delivery_token');
      })
      .catch(() => localStorage.removeItem('sg_delivery_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/delivery/login', { email, password });
    localStorage.setItem('sg_delivery_token', data.token);
    setRider(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/delivery/register', payload);
    localStorage.setItem('sg_delivery_token', data.token);
    setRider(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('sg_delivery_token');
    setRider(null);
  };

  return <AuthContext.Provider value={{ rider, loading, login, register, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
