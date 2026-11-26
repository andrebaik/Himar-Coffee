import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, MapPin, Store, RefreshCw, ReceiptText } from 'lucide-react';
import { getOrderStatus } from '../api/orders.js';
import { formatRupiah } from '../lib/format.js';
import toast from 'react-hot-toast';

const POLL_INTERVAL_MS = 3000;

const STATUS_META = {
  pending: {
    label: 'Menunggu Pembayaran',
    tone: 'border-[#d9a441]/50 bg-[#fdf6e7] text-[#8a6414]',
    icon: Clock,
    description: 'Selesaikan pembayaran lewat popup Midtrans. Halaman ini diperbarui otomatis setelah pembayaran diterima.',
  },
  paid: {
    label: 'Pembayaran Diterima',
    tone: 'border-[#6f8f72]/50 bg-[#f2f6f2] text-[#3f5c42]',
    icon: CheckCircle2,
    description: 'Terima kasih! Pesananmu sedang disiapkan barista. Kami akan menghubungi nomor HP-mu bila ada kendala.',
  },
  failed: {
    label: 'Pembayaran Gagal',
    tone: 'border-[#b5532c]/50 bg-[#fff8f3] text-[#8c3f25]',
    icon: XCircle,
    description: 'Pembayaran tidak berhasil atau dibatalkan. Silakan pesan ulang dari halaman menu.',
  },
  expired: {
    label: 'Pesanan Kedaluwarsa',
    tone: 'border-[#b5532c]/50 bg-[#fff8f3] text-[#8c3f25]',
    icon: XCircle,
    description: 'Waktu pembayaran habis. Silakan pesan ulang dari halaman menu.',
  },
  cancelled: {
    label: 'Pesanan Dibatalkan',
    tone: 'border-[#b5532c]/50 bg-[#fff8f3] text-[#8c3f25]',
    icon: XCircle,
    description: 'Pesanan dibatalkan. Silakan pesan ulang dari halaman menu.',
  },
};

export default function OrderStatus() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    document.title = 'Status Pesanan — Himar Coffee Garut';
  }, []);

  useEffect(() => {
    let active = true;

    const fetchStatus = async () => {
      try {
        const data = await getOrderStatus(code);
        if (!active) return;
        setOrder(data);
        setError(null);

        if (data.status !== 'pending') {
          clearInterval(pollRef.current);
        }
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.error?.message || 'Pesanan tidak ditemukan');
        clearInterval(pollRef.current);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchStatus();
    pollRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(pollRef.current);
    };
  }, [code]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20" aria-busy="true">
        <div className="mx-auto h-40 max-w-md animate-pulse bg-[#eee5d8]" />
        <div className="mx-auto mt-6 h-6 w-56 animate-pulse bg-[#eee5d8]" />
        <div className="mx-auto mt-3 h-4 w-72 animate-pulse bg-[#eee5d8]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <XCircle className="mx-auto mb-4 h-10 w-10 text-[#b5532c]" aria-hidden="true" />
        <h1 className="font-serif text-4xl text-[#281a13]">Pesanan tidak ditemukan</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#6b625b]">
          {error || 'Kode pesanan tidak dikenali. Periksa kembali tautanmu.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="mt-8 inline-flex min-h-12 items-center justify-center bg-[#b5532c] px-6 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#8c3f25]"
        >
          Kembali ke Menu
        </button>
      </div>
    );
  }

  const meta = STATUS_META[order.status] || STATUS_META.pending;
  const StatusIcon = meta.icon;
  const isPaid = order.status === 'paid';

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <div className={`border p-6 md:p-8 ${meta.tone}`} role="status" aria-live="polite">
        <div className="flex items-start gap-4">
          <StatusIcon className="h-8 w-8 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em]">Kode Pesanan: {order.order_code}</p>
            <h1 className="mt-2 font-serif text-3xl leading-none md:text-4xl">{meta.label}</h1>
            <p className="mt-3 text-sm leading-6">{meta.description}</p>
            {order.status === 'pending' && (
              <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Memeriksa status pembayaran otomatis…
              </p>
            )}
          </div>
        </div>
      </div>

      <section aria-label="Detail pesanan" className="mt-8 border border-[#ded2c1] bg-[#fffdf8] p-6 md:p-8">
        <h2 className="flex items-center gap-2 font-serif text-2xl text-[#281a13]">
          <ReceiptText className="h-5 w-5 text-[#b5532c]" aria-hidden="true" />
          Detail Pesanan
        </h2>

        <div className="mt-5 divide-y divide-[#ded2c1] border-y border-[#ded2c1]">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#281a13]">
                  {item.name}
                  {item.variant ? ` (${item.variant})` : ''}
                </p>
                <p className="mt-0.5 text-xs text-[#6b625b]">
                  {formatRupiah(item.unit_price)} × {item.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold text-[#b5532c]">
                {formatRupiah(item.unit_price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[#6b625b]">Subtotal</dt>
            <dd className="font-semibold text-[#281a13]">{formatRupiah(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#6b625b]">Ongkir</dt>
            <dd className="font-semibold text-[#281a13]">
              {order.delivery_fee > 0 ? formatRupiah(order.delivery_fee) : 'Gratis'}
            </dd>
          </div>
          <div className="flex justify-between border-t border-[#ded2c1] pt-3">
            <dt className="font-bold text-[#281a13]">Total</dt>
            <dd className="font-serif text-2xl text-[#b5532c]">{formatRupiah(order.total)}</dd>
          </div>
        </dl>

        <div className="mt-6 grid gap-3 border-t border-[#ded2c1] pt-5 text-sm text-[#6b625b] sm:grid-cols-2">
          <p className="flex items-center gap-2">
            {order.fulfillment_type === 'delivery' ? (
              <>
                <MapPin className="h-4 w-4 shrink-0 text-[#4f6d52]" aria-hidden="true" />
                <span>Himar Delivery — {order.delivery_address}</span>
              </>
            ) : (
              <>
                <Store className="h-4 w-4 shrink-0 text-[#4f6d52]" aria-hidden="true" />
                <span>Ambil di kedai (Tarogong Kidul, Garut)</span>
              </>
            )}
          </p>
          {order.midtrans_payment_type && (
            <p>
              Metode bayar: <strong className="text-[#281a13]">{order.midtrans_payment_type}</strong>
            </p>
          )}
          {order.note && <p className="sm:col-span-2">Catatan: {order.note}</p>}
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {isPaid && (
          <button
            type="button"
            onClick={() => toast.success('Pesananmu sedang diproses barista!')}
            className="inline-flex min-h-12 items-center justify-center bg-[#6f8f72] px-6 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#5a745d]"
          >
            Pesanan Diterima
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="inline-flex min-h-12 items-center justify-center border border-[#281a13] px-6 text-xs font-bold uppercase tracking-[0.1em] text-[#281a13] transition hover:bg-[#281a13] hover:text-white"
        >
          Pesan Lagi
        </button>
      </div>
    </div>
  );
}
