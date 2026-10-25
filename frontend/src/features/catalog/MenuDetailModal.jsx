import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import ImageWithFallback from '../../components/ImageWithFallback.jsx';
import { formatRupiah } from '../../lib/format.js';
import { useCart } from '../cart/CartContext.jsx';

export default function MenuDetailModal({ menu, onClose }) {
  const { addToCart } = useCart();

  const variants = Array.isArray(menu?.variants) ? menu.variants : [];
  const [selectedVariant, setSelectedVariant] = useState(
    variants.length > 0 ? variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);

  if (!menu) return null;

  const extraPrice = selectedVariant?.extra_price || 0;
  const unitPrice = menu.price + extraPrice;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(menu, selectedVariant, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col border border-[#E7DCCB]">
        {/* Header with image */}
        <div className="relative">
          <ImageWithFallback
            src={menu.image_url}
            alt={menu.name}
            aspectRatio="aspect-16/10"
            className="rounded-t-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
          {menu.is_featured && (
            <span className="absolute bottom-3 left-3 bg-[#B5532C] text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
              Unggulan
            </span>
          )}
        </div>

        {/* Scrollable body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-wider text-[#6F8F72] font-semibold">
                {menu.category}
              </span>
              <span className="text-sm font-semibold text-[#B5532C]">
                {formatRupiah(menu.price)}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#2B1B12] mt-1">
              {menu.name}
            </h2>
            {menu.description && (
              <p className="text-sm text-[#2B1B12]/80 mt-2 leading-relaxed">
                {menu.description}
              </p>
            )}
          </div>

          {/* Variants */}
          {variants.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2B1B12]/70 mb-2">
                Pilih Varian
              </label>
              <div className="grid grid-cols-2 gap-2">
                {variants.map((v) => {
                  const isSelected = selectedVariant?.name === v.name;
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-2.5 rounded-xl border text-left transition text-sm cursor-pointer ${
                        isSelected
                          ? 'border-[#B5532C] bg-[#FAF4EA] text-[#B5532C] font-semibold shadow-xs'
                          : 'border-[#E7DCCB] hover:border-[#B5532C]/40 text-[#2B1B12]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{v.name}</span>
                        {v.extra_price > 0 && (
                          <span className="text-xs text-[#B5532C]/80">
                            +{formatRupiah(v.extra_price)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2B1B12]/70 mb-2">
              Jumlah
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#E7DCCB] rounded-xl bg-[#FAF4EA]/50">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 hover:bg-[#FAF4EA] text-[#2B1B12] rounded-l-xl cursor-pointer"
                  aria-label="Kurangi"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-semibold text-sm text-[#2B1B12]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                  className="p-2 hover:bg-[#FAF4EA] text-[#2B1B12] rounded-r-xl cursor-pointer"
                  aria-label="Tambah"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm text-[#2B1B12]/60">
                Total: <span className="font-bold text-[#2B1B12]">{formatRupiah(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Add to Order button */}
        <div className="p-4 border-t border-[#E7DCCB] bg-[#FAF4EA]/50 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[#2B1B12]/60">Total Harga</div>
            <div className="font-serif font-bold text-xl text-[#B5532C]">
              {formatRupiah(totalPrice)}
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#B5532C] hover:bg-[#a04622] text-white py-3 px-5 rounded-xl font-medium shadow transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            Tambah ke Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}
