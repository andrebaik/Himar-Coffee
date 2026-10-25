import React from 'react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import CartDrawer from '../features/cart/CartDrawer.jsx';
import ChatWidget from '../features/chat/ChatWidget.jsx';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF4EA] text-[#2B1B12]">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
    </div>
  );
}
