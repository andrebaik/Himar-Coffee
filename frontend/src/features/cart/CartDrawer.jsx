import React, { useEffect, useRef, useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Send, AlertCircle, ExternalLink } from 'lucide-react';
import { useCart } from './CartContext.jsx';
import { formatRupiah } from '../../lib/format.js';
import ImageWithFallback from '../../components/ImageWithFallback.jsx';
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
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    closeButtonRef.current?.focus();
    document.body.classList.add('overlay-open');
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('overlay-open');
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsLoading(true);
    setPopupBlockedUrl(null);

    try {
      const payload = {
        items: items.map((item) => ({
          menu_id: item.menu_id,
          quantity: item.quantity,
          variant: item.variant || undefined,
        })),
        note: note ? note.trim() : undefined,
      };

      const res = await client.post('/orders/whatsapp-link', payload);
      const { url } = res.data.data;
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');

      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        setPopupBlockedUrl(url);
        toast('Popup WhatsApp diblokir. Gunakan tautan manual di bawah.', { icon: '!' });
      } else {
        toast.success('WhatsApp dibuka untuk melanjutkan pesanan.');
        setIsOpen(false);
      }
    } catch (err) {
      toast.error(normalizeError(err).message || 'Gagal membuat pesanan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button type="button" className="absolute inset-0 cursor-default bg-[#281a13]/65" onClick={() => setIsOpen(false)} aria-label="Tutup keranjang" />

      <aside
        className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-[#ded2c1] bg-[#fffdf8] shadow-[0_24px_70px_rgba(40,26,19,0.22)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <header className="flex items-start justify-between border-b border-[#ded2c1] px-5 py-5 md:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4f6d52]">Pesananmu</p>
            <h2 id="cart-title" className="mt-2 text-3xl leading-none text-[#281a13]">Keranjang</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center border border-[#ded2c1] text-[#281a13] transition hover:border-[#281a13] hover:bg-[#f7f2e9]"
            aria-label="Tutup keranjang"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8">
          {items.length === 0 ? (
            <div className="border-y border-[#ded2c1] py-16 text-center">
              <ShoppingBag className="mx-auto mb-4 h-8 w-8 text-[#b5532c]" aria-hidden="true" />
              <h3 className="text-2xl leading-none text-[#281a13]">Keranjang masih kosong</h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-[#6b625b]">Pilih menu dari katalog untuk mulai menyiapkan pesanan.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="divide-y divide-[#ded2c1] border-y border-[#ded2c1]">
                {items.map((item) => {
                  const unitPrice = item.price + (item.extra_price || 0);
                  const itemTotal = unitPrice * item.quantity;

                  return (
                    <div key={`${item.menu_id}-${item.variant || 'default'}`} className="grid grid-cols-[4.5rem_1fr_auto] gap-4 py-5">
                      <ImageWithFallback src={item.image_url} alt="" aspectRatio="h-[4.5rem] w-[4.5rem]" fallbackLabel="Foto belum tersedia" className="h-[4.5rem] w-[4.5rem]" />
                      <div className="min-w-0">
                        <h3 className="truncate text-lg leading-none text-[#281a13]">{item.name}</h3>
                        {item.variant && <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#4f6d52]">{item.variant}</p>}
                        <p className="mt-3 text-sm text-[#6b625b]">{formatRupiah(unitPrice)} per item</p>
                        <p className="mt-1 text-sm font-semibold text-[#b5532c]">{formatRupiah(itemTotal)}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.menu_id, item.variant)}
                          className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#6b625b] transition hover:text-[#b5532c]"
                          aria-label={`Hapus ${item.name} dari keranjang`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <div className="flex min-h-11 items-center border border-[#281a13]">
                          <button type="button" onClick={() => updateQuantity(item.menu_id, item.variant, -1)} className="inline-flex min-h-11 min-w-10 items-center justify-center transition hover:bg-[#f7f2e9]" aria-label="Kurangi jumlah">
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold" aria-live="polite">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.menu_id, item.variant, 1)} className="inline-flex min-h-11 min-w-10 items-center justify-center transition hover:bg-[#f7f2e9]" aria-label="Tambah jumlah">
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label htmlFor="order-note" className="text-xs font-bold uppercase tracking-[0.12em] text-[#281a13]">Catatan pesanan</label>
                <textarea
                  id="order-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value.slice(0, 200))}
                  placeholder="Contoh: kurangi gula atau es dipisah"
                  rows={3}
                  className="mt-3 w-full resize-none border border-[#ded2c1] bg-transparent p-3 text-sm leading-6 text-[#281a13] placeholder:text-[#6b625b]/70 focus:border-[#b5532c] focus:outline-none"
                />
                <div className="mt-2 text-right text-xs text-[#6b625b]">{note.length}/200</div>
              </div>

              {popupBlockedUrl && (
                <div className="border border-[#b5532c]/45 bg-[#fff8f3] p-4 text-sm text-[#6b625b]">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#b5532c]" aria-hidden="true" />
                    <p>Popup WhatsApp diblokir peramban. Buka tautan manual untuk melanjutkan.</p>
                  </div>
                  <a href={popupBlockedUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 border border-[#281a13] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[#281a13] transition hover:bg-[#281a13] hover:text-white">
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Buka WhatsApp
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-[#ded2c1] bg-[#f7f2e9] px-5 py-5 md:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#6b625b]">Perkiraan total</p>
                <p className="mt-1 font-serif text-3xl text-[#b5532c]">{formatRupiah(estimatedTotal)}</p>
              </div>
              <p className="max-w-[12rem] text-right text-xs leading-5 text-[#6b625b]">Harga final dan ketersediaan dikonfirmasi barista.</p>
            </div>
            <button type="button" onClick={handleCheckout} disabled={isLoading} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#25d366] px-5 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#20ba59] disabled:cursor-wait disabled:bg-[#6b625b]">
              <Send className="h-4 w-4" aria-hidden="true" />
              {isLoading ? 'Menyiapkan pesanan' : 'Pesan via WhatsApp'}
            </button>
            <button type="button" onClick={clearCart} className="mt-3 inline-flex min-h-11 w-full items-center justify-center text-xs font-semibold text-[#6b625b] transition hover:text-[#b5532c]">Kosongkan keranjang</button>
          </footer>
        )}
      </aside>
    </div>
  );
}
