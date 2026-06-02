import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ef_user')); } catch { return null; }
  });

  const login = (userData) => {
    localStorage.setItem('ef_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('ef_user');
    setUser(null);
  };

  return { user, login, logout };
}
