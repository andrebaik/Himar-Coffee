import React from 'react';
import { Link } from 'react-router-dom';
import { Clock3, MapPin, MessageCircle, Navigation } from 'lucide-react';
import SectionIntro from '../components/SectionIntro.jsx';
import ImageWithFallback from '../components/ImageWithFallback.jsx';

const whatsappUrl = 'https://wa.me/62895620019593';
const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=Himar+Coffee+Garut';
const mapsEmbedUrl = 'https://www.google.com/maps?q=Himar%20Coffee%20Garut&output=embed';

const visitImage =
  'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=85';

export default function Visit() {
  return (
    <div>
      <section className="border-b border-[#ded2c1] bg-[#f7f2e9]">
        <div className="editorial-container py-14 md:py-20">
          <SectionIntro
            eyebrow="Kunjungi Himar"
            title="Mampir, duduk, dan minum pelan."
            description="Kami ada di Tarogong Kidul, Garut. Buka setiap hari dari pagi sampai malam — cocok untuk bekerja, bertemu teman, atau pulang pelan-pelan."
          />
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-2 bg-[#b5532c] px-5 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#8c3f25]"
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              Buka rute
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-2 border border-[#281a13] px-5 text-xs font-bold uppercase tracking-[0.1em] text-[#281a13] transition hover:bg-[#281a13] hover:text-[#fffdf8]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Tanya barista
            </a>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="editorial-container grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-start md:gap-16">
          <div className="space-y-8">
            <div className="flex gap-4 border-b border-[#ded2c1] pb-8">
              <MapPin className="mt-1 h-6 w-6 shrink-0 text-[#b5532c]" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold">Alamat</h2>
                <p className="mt-2 text-sm leading-7 text-[#6b625b]">
                  Jl. Patriot No. 12
                  <br />
                  Tarogong Kidul, Garut, Jawa Barat
                </p>
                <a
                  className="editorial-link mt-3 inline-block"
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Lihat di Google Maps
                </a>
              </div>
            </div>

            <div className="flex gap-4 border-b border-[#ded2c1] pb-8">
              <Clock3 className="mt-1 h-6 w-6 shrink-0 text-[#b5532c]" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold">Jam buka</h2>
                <p className="mt-2 text-sm leading-7 text-[#6b625b]">
                  Senin sampai Minggu
                  <br />
                  10.00 sampai 22.00 WIB
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <MessageCircle className="mt-1 h-6 w-6 shrink-0 text-[#b5532c]" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold">Sebelum datang</h2>
                <p className="mt-2 text-sm leading-7 text-[#6b625b]">
                  Untuk rombongan besar atau acara, hubungi barista lebih dulu agar tempat duduk
                  bisa kami siapkan.
                </p>
                <a
                  className="editorial-link mt-3 inline-block"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp barista
                </a>
              </div>
            </div>
          </div>

          <div className="image-frame">
            <ImageWithFallback
              src={visitImage}
              alt="Suasana ruang kedai kopi"
              aspectRatio="aspect-[4/3]"
              fallbackLabel="Foto suasana Himar"
            />
          </div>
        </div>
      </section>

      <section className="section-space border-t border-[#ded2c1] pt-0">
        <div className="editorial-container">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">Peta</span>
              <h2 className="mt-3 text-3xl leading-tight md:text-4xl">Temukan kami di peta.</h2>
            </div>
            <a
              className="editorial-link"
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Buka aplikasi peta
            </a>
          </div>
          <div className="image-frame aspect-[4/3] w-full md:aspect-[16/9]">
            <iframe
              title="Peta lokasi Himar Coffee Garut"
              src={mapsEmbedUrl}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className="bg-[#4f6d52] text-[#fffdf8]">
        <div className="editorial-container flex flex-col gap-6 py-14 md:flex-row md:items-center md:justify-between md:py-16">
          <div>
            <span className="eyebrow text-[#e5eedf]">Sudah di jalan?</span>
            <h2 className="mt-3 max-w-xl text-3xl leading-tight md:text-4xl">
              Lihat menu dulu, pesan saat sampai.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/menu"
              className="inline-flex min-h-12 items-center bg-[#fffdf8] px-5 text-xs font-bold uppercase tracking-[0.1em] text-[#281a13] transition hover:bg-[#e5eedf]"
            >
              Lihat menu
            </Link>
            <Link
              to="/events"
              className="inline-flex min-h-12 items-center border border-[#fffdf8]/50 px-5 text-xs font-bold uppercase tracking-[0.1em] text-[#fffdf8] transition hover:bg-[#fffdf8] hover:text-[#4f6d52]"
            >
              Agenda Himar
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
