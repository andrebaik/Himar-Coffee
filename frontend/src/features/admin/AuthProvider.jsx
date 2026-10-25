import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import client, { normalizeError } from '../../api/client.js';
import { getSession, setSession, clearSession } from '../../lib/session.js';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const session = getSession();
    return session?.email ? { email: session.email } : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const session = getSession();
      if (!session?.access_token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await client.get('/auth/me');
        setUser(res.data.data);
      } catch {
        clearSession();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await client.post('/auth/login', { email, password });
      const data = res.data.data;
      setSession(data);
      setUser(data.user);
      toast.success('Berhasil masuk ke panel admin');
      return { success: true };
    } catch (err) {
      const errorObj = normalizeError(err);
      return { success: false, error: errorObj.message || 'Email atau kata sandi salah' };
    }
  };

  const logout = () => {
    clearSession();
    setUser(null);
    toast.success('Berhasil keluar');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF4EA] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#B5532C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
