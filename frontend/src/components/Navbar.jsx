import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../features/cart/CartContext.jsx';

const navLinks = [
  { name: 'Beranda', path: '/' },
  { name: 'Menu', path: '/menu' },
  { name: 'Event', path: '/events' },
  { name: 'Kunjungi', path: '/#kunjungi' },
];

export default function Navbar() {
  const location = useLocation();
  const { totalQuantity, setIsOpen } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    document.body.classList.toggle('overlay-open', isMenuOpen);

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('overlay-open');
    };
  }, [isMenuOpen]);

  const isActive = (path) => {
    if (path === '/#kunjungi') return location.pathname === '/' && location.hash === '#kunjungi';
    return location.pathname === path;
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#ded2c1] bg-[#f7f2e9]">
      <div className="editorial-container flex min-h-[4.5rem] items-center justify-between gap-5">
        <Link to="/" className="group inline-flex min-h-11 items-center gap-3" onClick={closeMenu}>
          <span className="flex h-9 w-9 items-center justify-center bg-[#281a13] font-serif text-lg text-[#fffdf8] transition group-hover:bg-[#b5532c]">
            H
          </span>
          <span className="leading-none">
            <span className="block font-serif text-xl tracking-[-0.04em] text-[#281a13]">Himar Coffee</span>
            <span className="mt-1 block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#4f6d52]">Garut</span>
          </span>
        </Link>

        <nav id="public-navigation" className="hidden items-center gap-7 lg:flex" aria-label="Navigasi utama">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative inline-flex min-h-11 items-center text-xs font-bold uppercase tracking-[0.1em] transition ${
                isActive(link.path) ? 'text-[#b5532c]' : 'text-[#6b625b] hover:text-[#281a13]'
              }`}
            >
              {link.name}
              {isActive(link.path) && <span className="absolute bottom-1 left-0 h-px w-5 bg-[#b5532c]" aria-hidden="true" />}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative inline-flex min-h-11 items-center gap-2 border border-[#281a13] px-3 text-xs font-bold uppercase tracking-[0.08em] text-[#281a13] transition hover:bg-[#281a13] hover:text-[#fffdf8]"
            aria-label="Buka keranjang pesanan"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Pesanan</span>
            {totalQuantity > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center bg-[#b5532c] px-1 text-[0.62rem] font-bold text-white">
                {totalQuantity > 99 ? '99+' : totalQuantity}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center border border-[#ded2c1] text-[#281a13] lg:hidden"
            aria-label={isMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div id="mobile-navigation" className="border-t border-[#ded2c1] bg-[#fffdf8] lg:hidden">
          <nav className="editorial-container grid gap-1 py-3" aria-label="Navigasi mobile">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMenu}
                className={`flex min-h-12 items-center justify-between border-b border-[#ded2c1] text-lg ${
                  isActive(link.path) ? 'font-semibold text-[#b5532c]' : 'text-[#281a13]'
                }`}
              >
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
