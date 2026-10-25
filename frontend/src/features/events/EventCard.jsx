import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import ImageWithFallback from '../../components/ImageWithFallback.jsx';
import { formatTanggal } from '../../lib/format.js';

export default function EventCard({ event }) {
  const eventTime = new Date(event.event_date).getTime();
  const isPast = eventTime < Date.now();

  return (
    <div className="bg-white rounded-2xl border border-[#E7DCCB] overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="relative">
          <ImageWithFallback
            src={event.image_url}
            alt={event.title}
            aspectRatio="aspect-16/9"
          />
          <span
            className={`absolute top-2.5 right-2.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs ${
              isPast
                ? 'bg-gray-500 text-white'
                : 'bg-[#6F8F72] text-white'
            }`}
          >
            {isPast ? 'Selesai' : 'Mendatang'}
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-1.5 text-xs text-[#B5532C] font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formatTanggal(event.event_date)}</span>
          </div>

          <h3 className="font-serif font-bold text-lg text-[#2B1B12] mb-2">
            {event.title}
          </h3>

          {event.description && (
            <p className="text-xs text-[#2B1B12]/70 line-clamp-3 leading-relaxed mb-4">
              {event.description}
            </p>
          )}
        </div>
      </div>

      {event.location && (
        <div className="px-5 py-3 border-t border-[#E7DCCB]/40 bg-[#FAF4EA]/40 flex items-center gap-2 text-xs text-[#2B1B12]/70">
          <MapPin className="w-3.5 h-3.5 text-[#B5532C] shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
      )}
    </div>
  );
}
