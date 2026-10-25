import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, MapPin, Clock, MessageSquare, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#2B1B12] text-[#FAF4EA] pt-12 pb-24 md:pb-12 mt-16 border-t border-[#E7DCCB]/20">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#B5532C] flex items-center justify-center text-white">
              <Coffee className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-xl text-[#FAF4EA]">
              Himar Coffee Garut
            </span>
          </div>
          <p className="text-xs text-[#FAF4EA]/70 leading-relaxed mb-4">
            Kedai kopi hangat dan bersahaja di Garut. Menyajikan racikan kopi istimewa dan ruang bercengkrama yang nyaman.
          </p>
        </div>

        {/* Info & Hours */}
        <div>
          <h4 className="font-serif font-semibold text-sm text-[#FAF4EA] mb-3">
            Jam Operasional
          </h4>
          <div className="space-y-2 text-xs text-[#FAF4EA]/70">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-[#B5532C] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#FAF4EA]">Senin – Minggu</p>
                <p>10.00 – 22.00 WIB</p>
              </div>
            </div>
            <div className="flex items-start gap-2 pt-1">
              <MapPin className="w-4 h-4 text-[#B5532C] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#FAF4EA]">Alamat</p>
                <p>Jl. Patriot No. 12, Tarogong Kidul, Garut</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-serif font-semibold text-sm text-[#FAF4EA] mb-3">
            Navigasi Cepat
          </h4>
          <ul className="space-y-2 text-xs text-[#FAF4EA]/70">
            <li>
              <Link to="/menu" className="hover:text-[#B5532C] transition">
                Katalog Menu Lengkap
              </Link>
            </li>
            <li>
              <Link to="/events" className="hover:text-[#B5532C] transition">
                Jadwal Event & Workshop
              </Link>
            </li>
            <li>
              <a
                href="https://wa.me/62895620019593"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#B5532C] transition inline-flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Hubungi Kami via WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto px-4 pt-6 border-t border-[#FAF4EA]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#FAF4EA]/50">
        <p>© {new Date().getFullYear()} Himar Coffee Garut. Hak cipta dilindungi.</p>
        <div className="flex items-center gap-4">
          <Link
            to="/admin/login"
            className="hover:text-[#FAF4EA]/80 transition inline-flex items-center gap-1 text-[11px]"
          >
            <Shield className="w-3 h-3" />
            Portal Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
