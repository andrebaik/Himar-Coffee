import React from 'react';
import ImageWithFallback from '../../components/ImageWithFallback.jsx';
import { formatRupiah } from '../../lib/format.js';
import { Plus } from 'lucide-react';

export default function MenuCard({ menu, onSelect }) {
  const isAvailable = menu.is_available !== false;

  return (
    <div
      onClick={() => isAvailable && onSelect(menu)}
      className={`group bg-white rounded-2xl border border-[#E7DCCB] overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        isAvailable ? 'cursor-pointer hover:border-[#B5532C]/40' : 'opacity-60 cursor-not-allowed'
      }`}
    >
      <div>
        {/* Image 4:3 ratio */}
        <div className="relative overflow-hidden">
          <ImageWithFallback
            src={menu.image_url}
            alt={menu.name}
            aspectRatio="aspect-4/3"
            className="group-hover:scale-103 transition-transform duration-300"
          />
          {menu.is_featured && (
            <span className="absolute top-2.5 left-2.5 bg-[#B5532C] text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
              Unggulan
            </span>
          )}
          {!isAvailable && (
            <span className="absolute top-2.5 right-2.5 bg-gray-700 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
              Habis
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <span className="text-[11px] uppercase tracking-wider text-[#6F8F72] font-semibold">
            {menu.category}
          </span>
          <h3 className="font-serif font-bold text-base text-[#2B1B12] mt-0.5 group-hover:text-[#B5532C] transition-colors line-clamp-1">
            {menu.name}
          </h3>
          {menu.description && (
            <p className="text-xs text-[#2B1B12]/70 mt-1 line-clamp-2 leading-relaxed">
              {menu.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer / Price & action */}
      <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-[#E7DCCB]/40">
        <div>
          <span className="text-[10px] text-[#2B1B12]/50 block">Mulai dari</span>
          <span className="font-bold text-sm text-[#B5532C]">
            {formatRupiah(menu.price)}
          </span>
        </div>

        {isAvailable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(menu);
            }}
            className="inline-flex items-center gap-1 bg-[#FAF4EA] hover:bg-[#B5532C] text-[#B5532C] hover:text-white border border-[#E7DCCB] hover:border-[#B5532C] text-xs font-medium px-2.5 py-1.5 rounded-lg transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Pesan
          </button>
        )}
      </div>
    </div>
  );
}
