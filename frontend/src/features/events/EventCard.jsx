import React from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import ImageWithFallback from '../../components/ImageWithFallback.jsx';
import { formatTanggal } from '../../lib/format.js';
import { getEventImage } from '../../lib/media.js';

export default function EventCard({ event, featured = false, compact = false }) {
  const eventTime = new Date(event.event_date).getTime();
  const isPast = eventTime < Date.now();

  if (compact) {
    return (
      <article className="grid gap-4 border-b border-[#ded2c1] pb-5 sm:grid-cols-[7rem_1fr] sm:items-start">
        <div className="border-l-2 border-[#4f6d52] pl-3">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#4f6d52]">{isPast ? 'Selesai' : 'Mendatang'}</p>
          <p className="mt-2 text-xs leading-5 text-[#6b625b]">{formatTanggal(event.event_date)}</p>
        </div>
        <div>
          <h3 className="text-2xl leading-none text-[#281a13]">{event.title}</h3>
          {event.location && (
            <p className="mt-3 flex items-center gap-2 text-xs text-[#6b625b]">
              <MapPin className="h-3.5 w-3.5 text-[#b5532c]" aria-hidden="true" />
              {event.location}
            </p>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className={`group overflow-hidden border border-[#ded2c1] bg-[#fffdf8] ${featured ? 'grid md:grid-cols-[1.08fr_0.92fr]' : ''}`}>
      <div className={`image-frame ${featured ? 'min-h-[20rem] md:min-h-full' : 'aspect-[16/10]'}`}>
        <ImageWithFallback
          src={getEventImage(event)}
          alt={`Visual ${event.title}`}
          aspectRatio={featured ? 'h-full w-full' : 'h-full w-full'}
          fallbackLabel="Poster event belum tersedia"
          className="h-full transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-4 top-4 bg-[#281a13] px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white">
          {isPast ? 'Selesai' : 'Mendatang'}
        </span>
      </div>

      <div className={`flex flex-col justify-between gap-8 p-6 ${featured ? 'md:p-10' : ''}`}>
        <div>
          <p className="flex items-start gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#b5532c]">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {formatTanggal(event.event_date)}
          </p>
          <h3 className={`mt-5 leading-[0.98] text-[#281a13] ${featured ? 'text-4xl md:text-5xl' : 'text-2xl'}`}>
            {event.title}
          </h3>
          {event.description && <p className="mt-4 max-w-lg text-sm leading-7 text-[#6b625b]">{event.description}</p>}
        </div>

        {event.location && (
          <p className="flex items-center gap-2 border-t border-[#ded2c1] pt-4 text-xs text-[#6b625b]">
            <MapPin className="h-4 w-4 text-[#4f6d52]" aria-hidden="true" />
            {event.location}
          </p>
        )}
      </div>
    </article>
  );
}
