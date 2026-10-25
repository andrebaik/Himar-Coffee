import React, { useEffect, useRef, useState } from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import ImageWithFallback from '../../components/ImageWithFallback.jsx';
import { formatRupiah } from '../../lib/format.js';
import { getMenuImage } from '../../lib/media.js';
import { useCart } from '../cart/CartContext.jsx';

export default function MenuDetailModal({ menu, onClose }) {
  const { addToCart } = useCart();
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const variants = Array.isArray(menu?.variants) ? menu.variants : [];
  const [selectedVariant, setSelectedVariant] = useState(variants.length > 0 ? variants[0] : null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!menu) return undefined;

    closeButtonRef.current?.focus();
    document.body.classList.add('overlay-open');

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('overlay-open');
    };
  }, [menu, onClose]);

  if (!menu) return null;

  const extraPrice = selectedVariant?.extra_price || 0;
  const unitPrice = menu.price + extraPrice;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(menu, selectedVariant, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#281a13]/65 p-0 md:items-center md:p-6" role="presentation">
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Tutup detail menu" />

      <div
        ref={dialogRef}
        className="relative z-10 grid max-h-[94dvh] w-full overflow-y-auto border border-[#ded2c1] bg-[#fffdf8] shadow-[0_24px_70px_rgba(40,26,19,0.22)] md:max-w-4xl md:grid-cols-[0.9fr_1.1fr]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-detail-title"
        tabIndex={-1}
      >
        <div className="image-frame min-h-[15rem] md:min-h-full">
          <ImageWithFallback
            src={getMenuImage(menu)}
            alt={`Visual ${menu.name}`}
            aspectRatio="h-full w-full"
            fallbackLabel="Foto menu belum tersedia"
            className="h-full"
          />
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex min-h-11 min-w-11 items-center justify-center bg-[#fffdf8] text-[#281a13] transition hover:bg-[#b5532c] hover:text-white"
            aria-label="Tutup detail menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="flex-1 space-y-8 overflow-y-auto p-6 md:p-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4f6d52]">{menu.category}</p>
              <div className="mt-3 flex items-start justify-between gap-5">
                <h2 id="menu-detail-title" className="max-w-md text-4xl leading-[0.96] md:text-5xl">{menu.name}</h2>
                <span className="pt-1 text-sm font-semibold text-[#b5532c]">{formatRupiah(menu.price)}</span>
              </div>
              {menu.description && <p className="mt-5 max-w-lg text-sm leading-7 text-[#6b625b]">{menu.description}</p>}
            </div>

            {variants.length > 0 && (
              <fieldset>
                <legend className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#281a13]">Pilih varian</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {variants.map((variant) => {
                    const isSelected = selectedVariant?.name === variant.name;
                    return (
                      <button
                        key={variant.name}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`flex min-h-12 items-center justify-between border px-4 text-left text-sm transition ${
                          isSelected ? 'border-[#b5532c] bg-[#eee5d8] text-[#b5532c]' : 'border-[#ded2c1] text-[#281a13] hover:border-[#b5532c]'
                        }`}
                        aria-pressed={isSelected}
                      >
                        <span>{variant.name}</span>
                        {variant.extra_price > 0 && <span className="text-xs text-[#6b625b]">+{formatRupiah(variant.extra_price)}</span>}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            <div>
              <span className="mb-3 block text-xs font-bold uppercase tracking-[0.12em] text-[#281a13]">Jumlah</span>
              <div className="flex items-center gap-5">
                <div className="flex min-h-12 items-center border border-[#281a13]">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#281a13] transition hover:bg-[#eee5d8]"
                    aria-label="Kurangi jumlah"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="min-w-10 text-center text-sm font-semibold" aria-live="polite">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.min(50, value + 1))}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#281a13] transition hover:bg-[#eee5d8]"
                    aria-label="Tambah jumlah"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-sm text-[#6b625b]">Total sementara <strong className="text-[#281a13]">{formatRupiah(totalPrice)}</strong></p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-[#ded2c1] bg-[#f7f2e9] p-5 sm:flex-row sm:items-center sm:justify-between md:p-7">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[#6b625b]">Total pesanan</p>
              <p className="mt-1 font-serif text-2xl text-[#b5532c]">{formatRupiah(totalPrice)}</p>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#b5532c] px-5 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#8c3f25]"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Tambah ke pesanan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
