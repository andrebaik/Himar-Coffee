import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, MessageCircle } from 'lucide-react';
import client, { normalizeError } from '../api/client.js';
import SectionIntro from '../components/SectionIntro.jsx';
import EditorialFeature from '../components/EditorialFeature.jsx';
import VisitPanel from '../components/VisitPanel.jsx';
import ImageWithFallback from '../components/ImageWithFallback.jsx';
import MenuCard from '../features/catalog/MenuCard.jsx';
import MenuDetailModal from '../features/catalog/MenuDetailModal.jsx';
import EventCard from '../features/events/EventCard.jsx';
import { MenuCardSkeleton, EventCardSkeleton } from '../components/Skeleton.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';

const heroImage =
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1800&q=85';

const signatureImages = [
  'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=85',
];

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

  const featuredPair = useMemo(() => featuredMenus.slice(0, 2), [featuredMenus]);
  const supportingMenus = useMemo(() => featuredMenus.slice(2), [featuredMenus]);

  const openChat = () => {
    document.getElementById('himar-chat-toggle')?.click();
  };

  return (
    <div>
      <section className="border-b border-[#ded2c1] bg-[#f7f2e9]">
        <div className="editorial-container grid gap-8 py-8 md:grid-cols-[0.82fr_1.18fr] md:items-stretch md:gap-12 md:py-12 lg:py-16">
          <div className="flex flex-col justify-between gap-10 py-4 md:py-8">
            <div className="space-y-6">
              <span className="eyebrow">Kedai kopi di Garut</span>
              <h1 className="display-title">Tempat singgah untuk minum pelan.</h1>
              <p className="max-w-md text-base leading-8 text-[#6b625b] md:text-lg">
                Himar menyajikan kopi, makanan, dan ruang untuk bertemu di Tarogong Kidul.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/menu"
                className="inline-flex min-h-12 items-center gap-2 bg-[#b5532c] px-5 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#8c3f25]"
              >
                <Coffee className="h-4 w-4" aria-hidden="true" />
                Lihat menu
              </Link>
              <button
                type="button"
                onClick={openChat}
                className="inline-flex min-h-12 items-center gap-2 border border-[#281a13] px-5 text-xs font-bold uppercase tracking-[0.1em] text-[#281a13] transition hover:bg-[#281a13] hover:text-[#fffdf8]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Tanya barista
              </button>
            </div>
          </div>

          <div className="image-frame min-h-[25rem] md:min-h-[34rem]">
            <ImageWithFallback
              src={heroImage}
              alt="Suasana kedai kopi yang hangat"
              aspectRatio="aspect-[4/5] md:aspect-auto md:h-full"
              fallbackLabel="Foto suasana Himar"
              className="h-full"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#281a13]/75 via-[#281a13]/15 to-transparent p-6 pt-24 text-[#fffdf8] md:p-8 md:pt-32">
              <p className="max-w-sm text-sm leading-6 text-[#fffdf8]/80">
                Referensi visual sementara. Ganti dengan foto ruang Himar saat aset asli tersedia.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="editorial-container">
          <SectionIntro
            eyebrow="Pilihan Himar"
            title="Dua gelas yang sering jadi awal cerita."
            description="Mulai dari menu unggulan, lalu temukan minuman lain yang cocok untuk soremu."
            linkLabel="Buka semua menu"
            linkTo="/menu"
          />

          <div className="mt-10 space-y-5">
            {menuError ? (
              <ErrorMessage message={menuError} onRetry={fetchFeaturedMenus} />
            ) : loadingMenus ? (
              <div className="grid gap-5 md:grid-cols-2">
                <MenuCardSkeleton />
                <MenuCardSkeleton />
              </div>
            ) : featuredPair.length === 0 ? (
              <EmptyState
                title="Menu unggulan belum tersedia"
                description="Tambahkan menu yang ingin ditampilkan dari panel admin."
                action={<Link className="editorial-link" to="/menu">Lihat katalog</Link>}
              />
            ) : (
              <div className="grid gap-5">
                {featuredPair.map((menu, index) => (
                  <EditorialFeature
                    key={menu.id}
                    label={menu.category}
                    title={menu.name}
                    description={menu.description || 'Racikan Himar yang dibuat untuk dinikmati di tempat.'}
                    meta={`Mulai dari ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(menu.price)}`}
                    imageSrc={menu.image_url || signatureImages[index]}
                    imageAlt={`Visual ${menu.name}`}
                    actionLabel="Pilih menu ini"
                    onAction={() => setSelectedMenu(menu)}
                    reverse={index === 1}
                    tone={index === 1 ? 'dark' : 'paper'}
                    imageNote="Referensi visual"
                  />
                ))}
              </div>
            )}
          </div>

          {supportingMenus.length > 0 && (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {supportingMenus.map((menu) => (
                <MenuCard key={menu.id} menu={menu} onSelect={setSelectedMenu} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-[#ded2c1] bg-[#eee5d8] py-12 md:py-16">
        <div className="editorial-container grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <span className="eyebrow text-[#b5532c]">Lini rasa</span>
            <h2 className="mt-4 max-w-sm text-4xl leading-[0.98] md:text-5xl">Pilih sesuai suasana.</h2>
          </div>
          <nav className="grid divide-y divide-[#281a13]/15 border-y border-[#281a13]/15" aria-label="Kategori menu">
            {['Kopi', 'Non-Kopi', 'Makanan'].map((category) => (
              <Link
                key={category}
                to={`/menu?category=${encodeURIComponent(category)}`}
                className="flex min-h-16 items-center justify-between text-2xl text-[#281a13] transition hover:pl-3 hover:text-[#b5532c] md:text-3xl"
              >
                <span>{category}</span>
                <span className="text-sm text-[#6b625b]">Lihat pilihan</span>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="section-space">
        <div className="editorial-container">
          <SectionIntro
            eyebrow="Agenda Himar"
            title="Event yang membuat kedai terasa lebih dekat."
            description="Lihat kegiatan mendatang, dari musik sampai pertemuan komunitas."
            linkLabel="Lihat jadwal"
            linkTo="/events"
          />

          <div className="mt-10">
            {eventError ? (
              <ErrorMessage message={eventError} onRetry={fetchUpcomingEvents} />
            ) : loadingEvents ? (
              <div className="grid gap-5 md:grid-cols-3">
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <EmptyState
                title="Belum ada event mendatang"
                description="Jadwal baru akan muncul di sini setelah dipublikasikan dari panel admin."
                action={<Link className="editorial-link" to="/events">Buka halaman event</Link>}
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
                <EventCard event={upcomingEvents[0]} featured />
                <div className="grid gap-5">
                  {upcomingEvents.slice(1).map((event) => (
                    <EventCard key={event.id} event={event} compact />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div id="kunjungi">
        <VisitPanel />
      </div>

      {selectedMenu && <MenuDetailModal menu={selectedMenu} onClose={() => setSelectedMenu(null)} />}
    </div>
  );
}
