import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sg_admin_token');
    if (!token) return setLoading(false);
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (data.user.role === 'admin') setAdmin(data.user);
        else localStorage.removeItem('sg_admin_token');
      })
      .catch(() => localStorage.removeItem('sg_admin_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/admin-login', { email, password });
    localStorage.setItem('sg_admin_token', data.token);
    setAdmin(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('sg_admin_token');
    setAdmin(null);
  };

  return <AuthContext.Provider value={{ admin, loading, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
