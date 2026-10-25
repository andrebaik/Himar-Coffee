import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-[#ded2c1] bg-[#281a13] text-[#fffdf8]">
      <div className="editorial-container grid gap-12 py-14 md:grid-cols-[1.4fr_0.7fr_0.7fr] md:py-20">
        <div className="max-w-sm space-y-5">
          <p className="font-serif text-3xl leading-none">Himar Coffee</p>
          <p className="text-sm leading-7 text-[#fffdf8]/68">
            Kedai kopi di Garut untuk minum pelan, bertemu teman, dan pulang membawa cerita yang baik.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#b9c9af]">Jelajah</h2>
          <nav className="mt-5 grid gap-3 text-sm" aria-label="Navigasi footer">
            <Link className="text-[#fffdf8]/75 transition hover:text-[#fffdf8]" to="/menu">Menu</Link>
            <Link className="text-[#fffdf8]/75 transition hover:text-[#fffdf8]" to="/events">Event</Link>
            <Link className="text-[#fffdf8]/75 transition hover:text-[#fffdf8]" to="/#kunjungi">Kunjungi</Link>
          </nav>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#b9c9af]">Hubungi</h2>
          <div className="mt-5 grid gap-3 text-sm text-[#fffdf8]/75">
            <p>Jl. Patriot No. 12</p>
            <p>Tarogong Kidul, Garut</p>
            <a className="transition hover:text-[#fffdf8]" href="https://wa.me/62895620019593" target="_blank" rel="noopener noreferrer">
              WhatsApp barista
            </a>
            <Link className="text-xs text-[#fffdf8]/48 transition hover:text-[#fffdf8]" to="/admin/login">Portal admin</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-[#fffdf8]/12">
        <div className="editorial-container flex flex-col gap-2 py-5 text-xs text-[#fffdf8]/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Himar Coffee Garut</p>
          <p>Senin sampai Minggu, 10.00 sampai 22.00 WIB</p>
        </div>
      </div>
    </footer>
  );
}
