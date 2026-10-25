import React from 'react';
import { Clock3, MapPin, MessageCircle } from 'lucide-react';

const whatsappUrl = 'https://wa.me/62895620019593';

export default function VisitPanel() {
  return (
    <section className="bg-[#4f6d52] text-[#fffdf8]">
      <div className="editorial-container grid gap-10 py-16 md:grid-cols-[1fr_auto] md:items-end md:py-20">
        <div className="max-w-2xl space-y-5">
          <span className="eyebrow text-[#e5eedf]">Datang dan duduk</span>
          <h2 className="max-w-xl text-4xl leading-[0.98] md:text-6xl">
            Sore yang lebih enak dimulai dari Himar.
          </h2>
          <p className="max-w-lg text-sm leading-7 text-[#fffdf8]/78 md:text-base">
            Temui kami di Tarogong Kidul, Garut. Bawa teman, pilih tempat duduk, lalu biarkan barista menyiapkan minumanmu.
          </p>
        </div>

        <div className="grid gap-5 border-t border-[#fffdf8]/30 pt-5 text-sm md:min-w-[22rem] md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <div className="flex gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#f7f2e9]" aria-hidden="true" />
            <div>
              <p className="font-semibold">Senin sampai Minggu</p>
              <p className="mt-1 text-[#fffdf8]/72">10.00 sampai 22.00 WIB</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#f7f2e9]" aria-hidden="true" />
            <div>
              <p className="font-semibold">Jl. Patriot No. 12</p>
              <p className="mt-1 text-[#fffdf8]/72">Tarogong Kidul, Garut</p>
            </div>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-11 w-fit items-center gap-2 border border-[#fffdf8]/50 px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] transition hover:bg-[#fffdf8] hover:text-[#4f6d52]"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Tanya sebelum datang
          </a>
        </div>
      </div>
    </section>
  );
}
