import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, ShoppingBag, Star, Store, Truck, AlertCircle } from 'lucide-react';
import { useCart } from '../features/cart/CartContext.jsx';
import { createOrder } from '../api/orders.js';
import { normalizeError } from '../api/client.js';
import { formatRupiah } from '../lib/format.js';
import ImageWithFallback from '../components/ImageWithFallback.jsx';
import toast from 'react-hot-toast';

const DELIVERY_FEE = 8000;
const DELIVERY_MIN_ORDER = 30000;
const SNAP_SANDBOX_URL = 'https://app.sandbox.midtrans.com/snap/snap.js';
const SNAP_PRODUCTION_URL = 'https://app.midtrans.com/snap/snap.js';

const loadSnapScript = (clientKey) => {
  return new Promise((resolve, reject) => {
    if (window.snap) {
      resolve(window.snap);
      return;
    }

    const isSandbox = !clientKey || clientKey.startsWith('SB-Mid-client');
    const script = document.createElement('script');
    script.src = isSandbox ? SNAP_SANDBOX_URL : SNAP_PRODUCTION_URL;
    script.dataset.clientKey = clientKey || '';
    script.onload = () => resolve(window.snap);
    script.onerror = () => reject(new Error('Gagal memuat skrip pembayaran Midtrans'));
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const { items, note, estimatedTotal, effectiveTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    fulfillment_type: 'pickup',
    delivery_address: '',
    delivery_map_url: '',
  });
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | loading | error
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snapError, setSnapError] = useState(null);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aSig = a.category === 'Signature Coffee' ? 0 : 1;
      const bSig = b.category === 'Signature Coffee' ? 0 : 1;
      return aSig - bSig;
    });
  }, [items]);

  const isDelivery = form.fulfillment_type === 'delivery';
  const deliveryFee = isDelivery ? DELIVERY_FEE : 0;
  const grandTotal = estimatedTotal + deliveryFee;
  const deliveryShortage = isDelivery ? Math.max(0, DELIVERY_MIN_ORDER - effectiveTotal) : 0;

  useEffect(() => {
    document.title = 'Checkout — Himar Coffee Garut';
  }, []);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Ambil titik lokasi dari GPS perangkat, simpan sebagai link Google Maps.
  const handleSetMaps = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const url = `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
        setField('delivery_map_url', url);
        setGeoStatus('idle');
      },
      () => setGeoStatus('error'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const validateForm = () => {
    const errors = {};

    if (!form.customer_name.trim() || form.customer_name.trim().length < 2) {
      errors.customer_name = 'Nama minimal 2 karakter';
    }

    const digits = form.customer_phone.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 16 || !/^(0|62|8)\d+$/.test(digits)) {
      errors.customer_phone = 'Nomor HP tidak valid (contoh: 081234567890)';
    }

    if (isDelivery && !form.delivery_address.trim()) {
      errors.delivery_address = 'Alamat pengiriman wajib diisi untuk Himar Delivery';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePay = async () => {
    if (items.length === 0 || isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSnapError(null);

    try {
      const order = await createOrder({
        items: items.map((item) => ({
          menu_id: item.menu_id,
          quantity: item.quantity,
          variant: item.variant || undefined,
        })),
        note: note ? note.trim() : undefined,
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        fulfillment_type: form.fulfillment_type,
        delivery_address: isDelivery ? form.delivery_address.trim() : undefined,
        delivery_map_url: isDelivery && form.delivery_map_url.trim() ? form.delivery_map_url.trim() : undefined,
      });

      try {
        const snap = await loadSnapScript(import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
        window.snap.pay(order.snap_token, {
          onSuccess: () => {
            clearCart();
            navigate(`/order/${order.order_code}`);
          },
          onPending: () => {
            clearCart();
            navigate(`/order/${order.order_code}`);
          },
          onError: () => {
            setIsSubmitting(false);
            setSnapError('Pembayaran gagal diproses. Coba lagi atau hubungi barista via WhatsApp.');
          },
          onClose: () => {
            setIsSubmitting(false);
            toast('Popup pembayaran ditutup. Pesananmu masih menunggu pembayaran.', { icon: '!' });
          },
        });
      } catch {
        // snap.js gagal dimuat → fallback redirect ke halaman pembayaran Midtrans.
        window.location.href = order.redirect_url;
      }
    } catch (err) {
      setIsSubmitting(false);
      const normalized = normalizeError(err);
      if (normalized.details && Array.isArray(normalized.details)) {
        const mapped = {};
        normalized.details.forEach((d) => {
          if (d.field) mapped[d.field] = d.message;
        });
        setFieldErrors(mapped);
      }
      toast.error(normalized.message || 'Gagal membuat pesanan');
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 h-10 w-10 text-[#b5532c]" aria-hidden="true" />
        <h1 className="font-serif text-4xl text-[#281a13]">Tidak ada yang bisa di-checkout</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#6b625b]">
          Keranjangmu masih kosong. Pilih menu favoritmu dulu, termasuk menu signature yang dihitung ganda untuk Himar Delivery.
        </p>
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="mt-8 inline-flex min-h-12 items-center justify-center bg-[#b5532c] px-6 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#8c3f25]"
        >
          Lihat Menu
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4f6d52]">Checkout</p>
      <h1 className="mt-3 font-serif text-4xl leading-none text-[#281a13] md:text-5xl">Selesaikan pesananmu</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Form pelanggan & metode */}
        <section aria-label="Data pemesan">
          <h2 className="font-serif text-2xl text-[#281a13]">Data Pemesan</h2>

          <div className="mt-6 grid gap-5">
            <div>
              <label htmlFor="customer_name" className="text-xs font-bold uppercase tracking-[0.12em] text-[#281a13]">
                Nama lengkap
              </label>
              <input
                id="customer_name"
                type="text"
                value={form.customer_name}
                onChange={(e) => setField('customer_name', e.target.value)}
                placeholder="Contoh: Budi Santoso"
                maxLength={60}
                className={`mt-2 min-h-12 w-full border bg-transparent px-4 text-sm text-[#281a13] placeholder:text-[#6b625b]/70 focus:outline-none ${
                  fieldErrors.customer_name ? 'border-[#b5532c]' : 'border-[#ded2c1] focus:border-[#b5532c]'
                }`}
              />
              {fieldErrors.customer_name && (
                <p className="mt-2 text-xs text-[#b5532c]">{fieldErrors.customer_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="customer_phone" className="text-xs font-bold uppercase tracking-[0.12em] text-[#281a13]">
                Nomor HP (WhatsApp)
              </label>
              <input
                id="customer_phone"
                type="tel"
                inputMode="tel"
                value={form.customer_phone}
                onChange={(e) => setField('customer_phone', e.target.value)}
                placeholder="081234567890"
                maxLength={18}
                className={`mt-2 min-h-12 w-full border bg-transparent px-4 text-sm text-[#281a13] placeholder:text-[#6b625b]/70 focus:outline-none ${
                  fieldErrors.customer_phone ? 'border-[#b5532c]' : 'border-[#ded2c1] focus:border-[#b5532c]'
                }`}
              />
              {fieldErrors.customer_phone && (
                <p className="mt-2 text-xs text-[#b5532c]">{fieldErrors.customer_phone}</p>
              )}
            </div>
          </div>

          <h2 className="mt-10 font-serif text-2xl text-[#281a13]">Metode Pesanan</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setField('fulfillment_type', 'pickup')}
              aria-pressed={!isDelivery}
              className={`flex min-h-24 items-start gap-3 border p-4 text-left transition ${
                !isDelivery ? 'border-[#b5532c] bg-[#fff8f3]' : 'border-[#ded2c1] hover:border-[#b5532c]'
              }`}
            >
              <Store className={`mt-0.5 h-5 w-5 ${!isDelivery ? 'text-[#b5532c]' : 'text-[#6b625b]'}`} aria-hidden="true" />
              <span>
                <span className="block text-sm font-bold text-[#281a13]">Ambil di Kedai</span>
                <span className="mt-1 block text-xs leading-5 text-[#6b625b]">Tanpa ongkir, tanpa minimum order. Ambil langsung di Tarogong Kidul.</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setField('fulfillment_type', 'delivery')}
              aria-pressed={isDelivery}
              className={`flex min-h-24 items-start gap-3 border p-4 text-left transition ${
                isDelivery ? 'border-[#b5532c] bg-[#fff8f3]' : 'border-[#ded2c1] hover:border-[#b5532c]'
              }`}
            >
              <Truck className={`mt-0.5 h-5 w-5 ${isDelivery ? 'text-[#b5532c]' : 'text-[#6b625b]'}`} aria-hidden="true" />
              <span>
                <span className="block text-sm font-bold text-[#281a13]">Himar Delivery</span>
                <span className="mt-1 block text-xs leading-5 text-[#6b625b]">
                  Ongkir flat {formatRupiah(DELIVERY_FEE)}. Minimum order {formatRupiah(DELIVERY_MIN_ORDER)} — menu signature dihitung ganda.
                </span>
              </span>
            </button>
          </div>

          {isDelivery && (
            <div className="mt-5">
              <label htmlFor="delivery_address" className="text-xs font-bold uppercase tracking-[0.12em] text-[#281a13]">
                <MapPin className="mr-1 inline h-4 w-4" aria-hidden="true" />
                Alamat pengiriman
              </label>
              <textarea
                id="delivery_address"
                value={form.delivery_address}
                onChange={(e) => setField('delivery_address', e.target.value)}
                placeholder="Nama jalan, nomor rumah, patokan, kelurahan/kecamatan (area Garut)"
                rows={3}
                maxLength={250}
                className={`mt-2 w-full resize-none border bg-transparent p-3 text-sm leading-6 text-[#281a13] placeholder:text-[#6b625b]/70 focus:outline-none ${
                  fieldErrors.delivery_address ? 'border-[#b5532c]' : 'border-[#ded2c1] focus:border-[#b5532c]'
                }`}
              />
              <div className="mt-1 flex justify-between text-xs text-[#6b625b]">
                {fieldErrors.delivery_address ? (
                  <span className="text-[#b5532c]">{fieldErrors.delivery_address}</span>
                ) : <span />}
                <span>{form.delivery_address.length}/250</span>
              </div>

              {/* Titik lokasi: GPS perangkat atau tempel link Google Maps */}
              <div className="mt-4 border border-dashed border-[#ded2c1] bg-[#faf6ef] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#281a13]">
                  Titik lokasi (Google Maps)
                </p>
                <p className="mt-1 text-xs text-[#6b625b]">
                  Bantu kurir menemukan titik tepatnya. Opsional, tapi sangat membantu.
                </p>
                <button
                  type="button"
                  onClick={handleSetMaps}
                  disabled={geoStatus === 'loading'}
                  className="mt-3 inline-flex items-center gap-2 border border-[#281a13] bg-[#281a13] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f5efe4] transition hover:opacity-90 disabled:opacity-60"
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {geoStatus === 'loading' ? 'Mencari lokasi…' : 'Set di Google Maps'}
                </button>
                {geoStatus === 'error' && (
                  <p className="mt-2 text-xs text-[#b5532c]">
                    Gagal mengambil lokasi GPS. Izinkan akses lokasi, atau tempel link Google Maps manual di bawah.
                  </p>
                )}
                {form.delivery_map_url && (
                  <p className="mt-2 text-xs text-[#6b625b]">
                    Titik tersimpan —{' '}
                    <a
                      href={form.delivery_map_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[#b5532c] underline"
                    >
                      lihat di Google Maps
                    </a>
                  </p>
                )}
                <input
                  type="url"
                  value={form.delivery_map_url}
                  onChange={(e) => {
                    setGeoStatus('idle');
                    setField('delivery_map_url', e.target.value);
                  }}
                  placeholder="atau tempel link Google Maps di sini"
                  maxLength={500}
                  className="mt-3 w-full border bg-transparent p-2.5 text-sm text-[#281a13] placeholder:text-[#6b625b]/70 focus:border-[#b5532c] focus:outline-none"
                />
                {fieldErrors.delivery_map_url && (
                  <p className="mt-1 text-xs text-[#b5532c]">{fieldErrors.delivery_map_url}</p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Ringkasan pesanan */}
        <section aria-label="Ringkasan pesanan" className="h-fit border border-[#ded2c1] bg-[#fffdf8] p-6 md:p-8">
          <h2 className="font-serif text-2xl text-[#281a13]">Ringkasan Pesanan</h2>

          <div className="mt-5 divide-y divide-[#ded2c1] border-y border-[#ded2c1]">
            {sortedItems.map((item) => {
              const unitPrice = item.price + (item.extra_price || 0);
              const isSignature = item.category === 'Signature Coffee';
              return (
                <div key={`${item.menu_id}-${item.variant || 'default'}`} className="flex items-start gap-3 py-3">
                  <ImageWithFallback
                    src={item.image_url}
                    alt=""
                    aspectRatio="h-12 w-12"
                    fallbackLabel=""
                    className="h-12 w-12 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[#281a13]">{item.name}</p>
                      {isSignature && (
                        <span className="inline-flex shrink-0 items-center gap-1 bg-[#b5532c] px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-white">
                          <Star className="h-2.5 w-2.5" aria-hidden="true" />
                          Signature
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-[#6b625b]">
                      {item.variant ? `${item.variant} · ` : ''}x{item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#b5532c]">{formatRupiah(unitPrice * item.quantity)}</p>
                </div>
              );
            })}
          </div>

          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#6b625b]">Subtotal</dt>
              <dd className="font-semibold text-[#281a13]">{formatRupiah(estimatedTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6b625b]">Ongkir {isDelivery ? '(Himar Delivery)' : '(pickup)'}</dt>
              <dd className="font-semibold text-[#281a13]">{deliveryFee > 0 ? formatRupiah(deliveryFee) : 'Gratis'}</dd>
            </div>
            <div className="flex justify-between border-t border-[#ded2c1] pt-3 text-base">
              <dt className="font-bold text-[#281a13]">Total bayar</dt>
              <dd className="font-serif text-2xl text-[#b5532c]">{formatRupiah(grandTotal)}</dd>
            </div>
          </dl>

          {isDelivery && deliveryShortage > 0 && (
            <div className="mt-5 flex items-start gap-3 border border-[#b5532c]/45 bg-[#fff8f3] p-4 text-xs leading-5 text-[#6b625b]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#b5532c]" aria-hidden="true" />
              <p>
                Kurang <strong className="text-[#b5532c]">{formatRupiah(deliveryShortage)}</strong> untuk mencapai minimum
                Himar Delivery. Menu signature dihitung ganda — tambah menu signature untuk lebih mudah mencapai minimum.
              </p>
            </div>
          )}

          {snapError && (
            <div className="mt-5 flex items-start gap-3 border border-[#b5532c]/45 bg-[#fff8f3] p-4 text-xs leading-5 text-[#6b625b]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#b5532c]" aria-hidden="true" />
              <p>{snapError}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handlePay}
            disabled={isSubmitting || (isDelivery && deliveryShortage > 0)}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#b5532c] px-5 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#8c3f25] disabled:cursor-not-allowed disabled:bg-[#6b625b]"
          >
            <CreditCard className="h-4 w-4" aria-hidden="true" />
            {isSubmitting ? 'Menyiapkan pembayaran…' : `Bayar ${formatRupiah(grandTotal)}`}
          </button>
          <p className="mt-3 text-center text-[0.65rem] leading-4 text-[#6b625b]">
            Pembayaran aman via Midtrans (QRIS, e-wallet, VA, kartu). Status pesanan hanya dianggap lunas setelah konfirmasi dari Midtrans.
          </p>
        </section>
      </div>
    </div>
  );
}
