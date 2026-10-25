import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Coffee, CalendarDays, BarChart3, MessageSquare, LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { useAuth } from './AuthProvider.jsx';

const navItems = [
  { name: 'Katalog menu', path: '/admin/menus', icon: Coffee },
  { name: 'Jadwal event', path: '/admin/events', icon: CalendarDays },
  { name: 'Dasbor penjualan', path: '/admin/dashboard', icon: BarChart3 },
  { name: 'Riwayat chat', path: '/admin/chat-logs', icon: MessageSquare },
];

export default function AdminLayout({ children, title = 'Panel admin' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsSidebarOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#f7f2e9] text-[#281a13] md:flex">
      <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-[#ded2c1] bg-[#281a13] px-4 text-[#fffdf8] md:hidden">
        <div>
          <p className="font-serif text-xl leading-none">Himar Coffee</p>
          <p className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[#b9c9af]">Ruang kerja admin</p>
        </div>
        <button type="button" onClick={() => setIsSidebarOpen((open) => !open)} className="inline-flex min-h-11 min-w-11 items-center justify-center border border-[#fffdf8]/25" aria-label={isSidebarOpen ? 'Tutup navigasi admin' : 'Buka navigasi admin'} aria-expanded={isSidebarOpen} aria-controls="admin-sidebar">
          {isSidebarOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </header>

      {isSidebarOpen && <button type="button" className="fixed inset-0 z-40 bg-[#281a13]/60 md:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Tutup navigasi admin" />}

      <aside id="admin-sidebar" className={`fixed inset-y-0 left-0 z-50 flex w-[18rem] flex-col bg-[#281a13] text-[#fffdf8] transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="border-b border-[#fffdf8]/12 px-6 py-7">
          <Link to="/admin/menus" className="flex items-start gap-3" onClick={() => setIsSidebarOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center bg-[#b5532c] font-serif text-lg text-white">H</span>
            <span>
              <span className="block font-serif text-xl leading-none">Himar Coffee</span>
              <span className="mt-2 block text-[0.6rem] font-bold uppercase tracking-[0.16em] text-[#b9c9af]">Ruang kerja admin</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6" aria-label="Navigasi admin">
          <p className="px-3 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#fffdf8]/42">Kelola</p>
          <div className="mt-3 grid gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => `flex min-h-12 items-center gap-3 border-l-2 px-3 text-sm transition ${isActive ? 'border-[#b5532c] bg-[#fffdf8]/8 text-[#fffdf8]' : 'border-transparent text-[#fffdf8]/62 hover:border-[#b5532c]/60 hover:text-[#fffdf8]'}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[#fffdf8]/12 px-5 py-5">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#fffdf8]/42">Masuk sebagai</p>
          <p className="mt-2 truncate text-sm text-[#fffdf8]">{user?.email || 'Admin Himar'}</p>
          <div className="mt-5 grid gap-1">
            <Link to="/" target="_blank" className="flex min-h-11 items-center gap-2 text-xs text-[#fffdf8]/62 transition hover:text-[#fffdf8]">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Lihat web publik
            </Link>
            <button type="button" onClick={handleLogout} className="flex min-h-11 items-center gap-2 text-left text-xs text-[#f5c4b5] transition hover:text-white">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="hidden min-h-20 items-center justify-between border-b border-[#ded2c1] bg-[#fffdf8] px-8 md:flex">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[#4f6d52]">Himar Coffee Garut</p>
            <h1 className="mt-2 text-3xl leading-none text-[#281a13]">{title}</h1>
          </div>
          <p className="text-xs text-[#6b625b]">Atur hal yang pelanggan lihat di web publik.</p>
        </header>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
