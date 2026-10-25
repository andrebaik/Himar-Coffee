import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Coffee, ShoppingBag, Calendar, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../features/cart/CartContext.jsx';

export default function Navbar() {
  const location = useLocation();
  const { totalQuantity, setIsOpen } = useCart();

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Event', path: '/events' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF4EA]/90 backdrop-blur-md border-b border-[#E7DCCB]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 text-[#2B1B12] hover:opacity-90 transition">
          <div className="w-9 h-9 rounded-xl bg-[#B5532C] text-white flex items-center justify-center shadow-xs">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg leading-tight block tracking-tight">
              Himar Coffee
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#2B1B12]/60 block font-sans">
              Garut
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'text-[#B5532C] bg-[#E7DCCB]/40 font-semibold'
                    : 'text-[#2B1B12]/80 hover:text-[#B5532C] hover:bg-white/50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Cart Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2.5 rounded-xl bg-white border border-[#E7DCCB] text-[#2B1B12] hover:border-[#B5532C] hover:text-[#B5532C] transition shadow-xs cursor-pointer flex items-center gap-2"
            aria-label="Buka keranjang pesanan"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-semibold">Pesanan</span>
            {totalQuantity > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#B5532C] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {totalQuantity > 99 ? '99+' : totalQuantity}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7DCCB] px-4 py-2 flex justify-around shadow-lg">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          let Icon = Coffee;
          if (link.name === 'Menu') Icon = UtensilsCrossed;
          if (link.name === 'Event') Icon = Calendar;

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs transition ${
                isActive
                  ? 'text-[#B5532C] font-semibold'
                  : 'text-[#2B1B12]/60 hover:text-[#2B1B12]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
