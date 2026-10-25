import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, ArrowRight, MessageSquare, Sparkles, Calendar, CheckCircle2 } from 'lucide-react';
import client, { normalizeError } from '../api/client.js';
import MenuCard from '../features/catalog/MenuCard.jsx';
import MenuDetailModal from '../features/catalog/MenuDetailModal.jsx';
import EventCard from '../features/events/EventCard.jsx';
import { MenuCardSkeleton, EventCardSkeleton } from '../components/Skeleton.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function Home() {
  const [featuredMenus, setFeaturedMenus] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [menuError, setMenuError] = useState(null);
  const [eventError, setEventError] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);

  const fetchFeaturedMenus = async () => {
    setLoadingMenus(true);
    setMenuError(null);
    try {
      const res = await client.get('/menus?featured=true');
      setFeaturedMenus(res.data.data || []);
    } catch (err) {
      setMenuError(normalizeError(err).message);
    } finally {
      setLoadingMenus(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    setLoadingEvents(true);
    setEventError(null);
    try {
      const res = await client.get('/events?scope=upcoming');
      setUpcomingEvents((res.data.data || []).slice(0, 3));
    } catch (err) {
      setEventError(normalizeError(err).message);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchFeaturedMenus();
    fetchUpcomingEvents();
  }, []);

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-linear-to-b from-[#FFFFFF] to-[#FAF4EA] border border-[#E7DCCB] p-8 md:p-14 overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF4EA] border border-[#E7DCCB] text-[#B5532C] text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kedai Kopi Bersahaja di Garut</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#2B1B12] leading-[1.15] mb-4">
            Secangkir Kehangatan di Tengah Sejuknya Kota Garut
          </h1>

          <p className="text-sm md:text-base text-[#2B1B12]/80 leading-relaxed mb-8">
            Nikmati signature blend <em>The Lost Sheep</em> dan racikan unik <em>Merry Gloss</em> bersama kami. Pesan langsung dengan mudah via WhatsApp tanpa ribet login.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-[#B5532C] hover:bg-[#a04622] text-white px-6 py-3.5 rounded-xl font-medium shadow-sm transition cursor-pointer text-sm"
            >
              <Coffee className="w-4 h-4" />
              <span>Lihat Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => {
                const chatBtn = document.getElementById('himar-chat-toggle');
                if (chatBtn) chatBtn.click();
              }}
              className="inline-flex items-center gap-2 bg-white hover:bg-[#FAF4EA] border border-[#E7DCCB] text-[#2B1B12] px-6 py-3.5 rounded-xl font-medium transition cursor-pointer text-sm"
            >
              <MessageSquare className="w-4 h-4 text-[#6F8F72]" />
              <span>Tanya Asisten AI</span>
            </button>
          </div>
        </div>
      </section>

      {/* Menu Unggulan Section */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#6F8F72] font-semibold block mb-1">
              Paling Disukai
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2B1B12]">
              Menu Unggulan Kami
            </h2>
          </div>
          <Link
            to="/menu"
            className="text-xs font-semibold text-[#B5532C] hover:text-[#a04622] inline-flex items-center gap-1 transition"
          >
            Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {menuError ? (
          <ErrorMessage message={menuError} onRetry={fetchFeaturedMenus} />
        ) : loadingMenus ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <MenuCardSkeleton />
            <MenuCardSkeleton />
            <MenuCardSkeleton />
            <MenuCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredMenus.map((menu) => (
              <MenuCard key={menu.id} menu={menu} onSelect={setSelectedMenu} />
            ))}
          </div>
        )}
      </section>

      {/* 3 Langkah Cara Pesan */}
      <section className="bg-white rounded-3xl border border-[#E7DCCB] p-8 md:p-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-wider text-[#B5532C] font-semibold block mb-1">
            Praktis & Cepat
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2B1B12] mb-2">
            Cara Pesan di Himar Coffee
          </h2>
          <p className="text-xs md:text-sm text-[#2B1B12]/70">
            Hanya butuh 3 langkah singkat, pesananmu langsung terhubung ke kasir kami di WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF4EA] text-[#B5532C] font-serif font-bold text-xl flex items-center justify-center mx-auto mb-4 border border-[#E7DCCB]">
              1
            </div>
            <h3 className="font-serif font-bold text-base text-[#2B1B12] mb-2">
              Pilih Menu & Varian
            </h3>
            <p className="text-xs text-[#2B1B12]/70 leading-relaxed">
              Jelajahi katalog menu favoritmu, sesuaikan varian panas/dingin atau ukuran sesuai seleramu.
            </p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF4EA] text-[#B5532C] font-serif font-bold text-xl flex items-center justify-center mx-auto mb-4 border border-[#E7DCCB]">
              2
            </div>
            <h3 className="font-serif font-bold text-base text-[#2B1B12] mb-2">
              Cek Keranjang & Catatan
            </h3>
            <p className="text-xs text-[#2B1B12]/70 leading-relaxed">
              Periksa ringkasan pesananmu dan tambahkan catatan khusus bila ada permintaan tambahan.
            </p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF4EA] text-[#B5532C] font-serif font-bold text-xl flex items-center justify-center mx-auto mb-4 border border-[#E7DCCB]">
              3
            </div>
            <h3 className="font-serif font-bold text-base text-[#2B1B12] mb-2">
              Kirim ke WhatsApp Barista
            </h3>
            <p className="text-xs text-[#2B1B12]/70 leading-relaxed">
              Format pesanan otomatis dibuat rapi, kamu tinggal klik kirim untuk konfirmasi dengan barista kami.
            </p>
          </div>
        </div>
      </section>

      {/* Event Mendatang Section */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#6F8F72] font-semibold block mb-1">
              Kegiatan Komunitas
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2B1B12]">
              Event Mendatang
            </h2>
          </div>
          <Link
            to="/events"
            className="text-xs font-semibold text-[#B5532C] hover:text-[#a04622] inline-flex items-center gap-1 transition"
          >
            Lihat Jadwal Lengkap <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {eventError ? (
          <ErrorMessage message={eventError} onRetry={fetchUpcomingEvents} />
        ) : loadingEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E7DCCB] p-8 text-center text-xs text-[#2B1B12]/60">
            Belum ada event mendatang dalam waktu dekat. Pantau terus halaman ini!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}
      </section>

      {/* Modal Detail Menu */}
      {selectedMenu && (
        <MenuDetailModal
          menu={selectedMenu}
          onClose={() => setSelectedMenu(null)}
        />
      )}
    </div>
  );
}
