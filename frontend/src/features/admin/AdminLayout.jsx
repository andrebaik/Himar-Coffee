import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  Coffee,
  Calendar,
  BarChart3,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from './AuthProvider.jsx';

export default function AdminLayout({ children, title = 'Panel Admin' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Katalog Menu', path: '/admin/menus', icon: Coffee },
    { name: 'Jadwal Event', path: '/admin/events', icon: Calendar },
    { name: 'Dasbor Penjualan', path: '/admin/dashboard', icon: BarChart3 },
    { name: 'Riwayat Chat', path: '/admin/chat-logs', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#FAF4EA] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-[#2B1B12] text-white p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#B5532C] flex items-center justify-center text-white">
            <Coffee className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-base">Himar Admin</span>
        </div>

        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="p-1.5 text-white/80 hover:text-white rounded-lg cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Overlay on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 w-64 bg-[#2B1B12] text-[#FAF4EA] flex flex-col z-50 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="p-6 border-b border-white/10 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B5532C] flex items-center justify-center text-white shadow-sm">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg leading-tight text-white">
              Himar Coffee
            </h2>
            <span className="text-[10px] uppercase tracking-wider text-[#FAF4EA]/60 block">
              Admin Workspace
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-[#B5532C] text-white shadow-xs font-semibold'
                      : 'text-[#FAF4EA]/70 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Actions */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="px-2">
            <span className="text-[10px] text-[#FAF4EA]/50 block">Masuk sebagai:</span>
            <span className="text-xs font-medium text-white truncate block">
              {user?.email || 'admin@himar.com'}
            </span>
          </div>

          <div className="pt-2 border-t border-white/5 space-y-1">
            <Link
              to="/"
              target="_blank"
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#FAF4EA]/70 hover:text-white hover:bg-white/5 rounded-lg transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Web Publik</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-300 hover:text-red-200 hover:bg-red-900/30 rounded-lg transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <div className="bg-white border-b border-[#E7DCCB] px-6 py-4 hidden md:flex items-center justify-between">
          <h1 className="font-serif font-bold text-xl text-[#2B1B12]">{title}</h1>
          <span className="text-xs text-[#2B1B12]/60">Himar Coffee Garut Management</span>
        </div>

        <div className="p-4 md:p-8 flex-1 overflow-x-auto">{children}</div>
      </main>
    </div>
  );
}
