import React from 'react';
import ImageWithFallback from '../../components/ImageWithFallback.jsx';
import { formatRupiah } from '../../lib/format.js';
import { getMenuImage } from '../../lib/media.js';
import { Plus } from 'lucide-react';

export default function MenuCard({ menu, onSelect, featured = false }) {
  const isAvailable = menu.is_available !== false;

  return (
    <article className={`group ${featured ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
      <div className={`block w-full text-left ${isAvailable ? '' : 'opacity-55'}`}>
        <div className="image-frame aspect-[4/3] border border-[#ded2c1]">
          <ImageWithFallback
            src={getMenuImage(menu)}
            alt={`Visual ${menu.name}`}
            aspectRatio="h-full w-full"
            fallbackLabel="Foto menu belum tersedia"
            className="h-full transition duration-500 group-hover:scale-[1.03]"
          />
          {menu.is_featured && (
            <span className="absolute left-3 top-3 bg-[#b5532c] px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white">
              Unggulan
            </span>
          )}
          {!isAvailable && (
            <span className="absolute right-3 top-3 bg-[#281a13] px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white">
              Habis
            </span>
          )}
        </div>

        <div className="border-b border-[#ded2c1] py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#4f6d52]">{menu.category}</p>
              <h3 className="mt-2 text-2xl leading-none text-[#281a13] transition group-hover:text-[#b5532c]">{menu.name}</h3>
            </div>
            <span className="pt-1 text-sm font-semibold text-[#b5532c]">{formatRupiah(menu.price)}</span>
          </div>
          {menu.description && <p className="mt-3 line-clamp-2 max-w-md text-sm leading-6 text-[#6b625b]">{menu.description}</p>}
        </div>
      </div>

      {isAvailable && (
        <button
          type="button"
          onClick={() => onSelect(menu)}
          className="mt-3 inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#281a13] transition hover:text-[#b5532c]"
        >
          <span className="flex h-7 w-7 items-center justify-center border border-[#b5532c] text-[#b5532c] transition group-hover:bg-[#b5532c] group-hover:text-white">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </span>
          Tambah ke pesanan
        </button>
      )}
    </article>
  );
}
