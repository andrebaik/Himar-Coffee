import React from 'react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import CartDrawer from '../features/cart/CartDrawer.jsx';
import ChatWidget from '../features/chat/ChatWidget.jsx';

export default function Layout({ children }) {
  return (
    <div className="site-shell flex min-h-screen flex-col text-[#281a13]">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
    </div>
  );
}
