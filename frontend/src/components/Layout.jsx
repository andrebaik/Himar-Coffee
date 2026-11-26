import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import CartDrawer from '../features/cart/CartDrawer.jsx';
import ChatWidget from '../features/chat/ChatWidget.jsx';

// React Router tidak men-scroll otomatis ke anchor (#kunjungi). Komponen ini
// menjalankan scroll setiap ada navigasi yang membawa hash, termasuk saat
// pengguna mengklik ulang tautan yang sama.
function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const frame = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      return () => cancelAnimationFrame(frame);
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default function Layout({ children }) {
  return (
    <div className="site-shell flex min-h-screen flex-col text-[#281a13]">
      <ScrollToHash />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
    </div>
  );
}
