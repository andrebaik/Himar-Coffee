import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './features/cart/CartContext.jsx';
import { AuthProvider, ProtectedRoute } from './features/admin/AuthProvider.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Events from './pages/Events.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/admin/Login.jsx';
import AdminMenus from './pages/admin/AdminMenus.jsx';
import AdminEvents from './pages/admin/AdminEvents.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminChatLogs from './pages/admin/AdminChatLogs.jsx';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Public Routes with Layout (Navbar, Footer, CartDrawer, ChatWidget) */}
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/menu"
            element={
              <Layout>
                <Menu />
              </Layout>
            }
          />
          <Route
            path="/events"
            element={
              <Layout>
                <Events />
              </Layout>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<Navigate to="/admin/menus" replace />} />
          <Route
            path="/admin/menus"
            element={
              <ProtectedRoute>
                <AdminMenus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute>
                <AdminEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/chat-logs"
            element={
              <ProtectedRoute>
                <AdminChatLogs />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
