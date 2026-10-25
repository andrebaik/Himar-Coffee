import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Send, AlertCircle, ExternalLink } from 'lucide-react';
import { useCart } from './CartContext.jsx';
import { formatRupiah } from '../../lib/format.js';
import client, { normalizeError } from '../../api/client.js';
import toast from 'react-hot-toast';

export default function CartDrawer() {
  const {
    items,
    note,
    setNote,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeFromCart,
    estimatedTotal,
    clearCart,
  } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [popupBlockedUrl, setPopupBlockedUrl] = useState(null);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsLoading(true);
    setPopupBlockedUrl(null);

    try {
      const payload = {
        items: items.map((i) => ({
          menu_id: i.menu_id,
          quantity: i.quantity,
          variant: i.variant || undefined,
        })),
        note: note ? note.trim() : undefined,
      };

      const res = await client.post('/orders/whatsapp-link', payload);
      const { url } = res.data.data;

      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup was blocked by browser
        setPopupBlockedUrl(url);
        toast('Popup browser diblokir. Klik tautan manual di bawah.', { icon: '⚠️' });
      } else {
        toast.success('Membuka WhatsApp untuk mengirim pesanan...');
        setIsOpen(false);
      }
    } catch (err) {
      const errorObj = normalizeError(err);
      toast.error(errorObj.message || 'Gagal membuat pesanan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-xs"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="p-4 border-b border-[#E7DCCB] flex items-center justify-between bg-[#FAF4EA]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#B5532C]" />
            <h2 className="font-serif font-bold text-lg text-[#2B1B12]">Keranjang Pesanan</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-[#2B1B12]/60 hover:text-[#2B1B12] rounded-lg hover:bg-white/60 transition cursor-pointer"
            aria-label="Tutup keranjang"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-[#2B1B12]/60">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-[#E7DCCB]" />
              <p className="font-serif font-medium text-base text-[#2B1B12] mb-1">
                Keranjangmu masih kosong
              </p>
              <p className="text-sm text-[#2B1B12]/60">
                Pilih menu kopi atau cemilan favoritmu untuk mulai memesan.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const unitPrice = item.price + (item.extra_price || 0);
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={`${item.menu_id}-${item.variant || 'default'}`}
                    className="p-3 bg-[#FAF4EA]/50 border border-[#E7DCCB] rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-[#2B1B12] truncate">
                        {item.name}
                      </h4>
                      {item.variant && (
                        <span className="inline-block text-xs bg-white text-[#B5532C] px-2 py-0.5 rounded border border-[#E7DCCB] mt-0.5">
                          {item.variant}
                        </span>
                      )}
                      <p className="text-xs text-[#2B1B12]/70 mt-1">
                        {formatRupiah(unitPrice)} × {item.quantity} ={' '}
                        <span className="font-semibold text-[#2B1B12]">
                          {formatRupiah(itemTotal)}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-[#E7DCCB] rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.menu_id, item.variant, -1)}
                          className="p-1 hover:bg-[#FAF4EA] text-[#2B1B12] rounded-l cursor-pointer"
                          aria-label="Kurangi jumlah"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-[#2B1B12]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menu_id, item.variant, 1)}
                          className="p-1 hover:bg-[#FAF4EA] text-[#2B1B12] rounded-r cursor-pointer"
                          aria-label="Tambah jumlah"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.menu_id, item.variant)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        aria-label="Hapus item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Note input */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-[#2B1B12] mb-1">
                  Catatan untuk Pesanan (opsional):
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, 200))}
                  placeholder="Contoh: Kurangi gula, es batu dipisah..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E7DCCB] focus:outline-none focus:ring-1 focus:ring-[#B5532C] bg-white resize-none"
                />
                <div className="text-right text-[10px] text-[#2B1B12]/50 mt-0.5">
                  {note.length}/200
                </div>
              </div>
            </div>
          )}

          {/* Popup blocked banner if applicable */}
          {popupBlockedUrl && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Popup WhatsApp otomatis diblokir peramban. Silakan klik tombol di bawah untuk membuka langsung:
                </span>
              </div>
              <a
                href={popupBlockedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] text-white py-2 px-3 rounded-lg font-medium hover:bg-[#20ba59] transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Buka WhatsApp Manual
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-[#E7DCCB] bg-[#FAF4EA]/70 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-[#2B1B12]/70">Perkiraan Total:</span>
              <span className="font-serif font-bold text-lg text-[#B5532C]">
                {formatRupiah(estimatedTotal)}
              </span>
            </div>
            <p className="text-[11px] text-[#2B1B12]/60 italic">
              * Angka final dan ketersediaan stok akan dikonfirmasi oleh barista lewat WhatsApp.
            </p>

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-medium shadow transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Menyiapkan pesanan...' : 'Pesan via WhatsApp'}
            </button>

            <button
              onClick={clearCart}
              className="w-full text-center text-xs text-[#2B1B12]/50 hover:text-red-600 py-1 transition cursor-pointer"
            >
              Kosongkan Keranjang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
