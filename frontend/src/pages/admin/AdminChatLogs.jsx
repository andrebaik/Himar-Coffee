import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import client, { normalizeError } from '../../api/client.js';
import AdminLayout from '../../features/admin/AdminLayout.jsx';
import { formatTanggal } from '../../lib/format.js';
import toast from 'react-hot-toast';

const intentLabels = {
  tanya_menu: 'Tanya menu',
  tanya_event: 'Tanya event',
  pemesanan: 'Pemesanan',
  keluhan: 'Keluhan',
  di_luar_konteks: 'Di luar konteks',
};

export default function AdminChatLogs() {
  const [logs, setLogs] = useState([]);
  const [intent, setIntent] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (intent) params.intent = intent;
      const res = await client.get('/admin/chat-logs', { params });
      const data = res.data.data;
      setLogs(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error(normalizeError(err).message || 'Gagal memuat log chat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page, intent]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <AdminLayout title="Riwayat chat">
      <div className="space-y-8">
        <div className="flex flex-col gap-5 border-b border-[#ded2c1] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="max-w-2xl text-sm leading-7 text-[#6b625b]">Baca pertanyaan pelanggan untuk menemukan menu atau informasi yang perlu dibuat lebih jelas.</p><p className="mt-2 text-xs text-[#6b625b]">{total} interaksi tercatat</p></div>
          <div className="flex items-center gap-3"><Filter className="h-4 w-4 text-[#b5532c]" aria-hidden="true" /><label htmlFor="intent-filter" className="text-xs font-bold uppercase tracking-[0.1em]">Filter intent</label><select id="intent-filter" value={intent} onChange={(event) => { setIntent(event.target.value); setPage(1); }} className="min-h-11 border border-[#281a13] bg-transparent px-3 text-sm focus:border-[#b5532c] focus:outline-none"><option value="">Semua intent</option>{Object.entries(intentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        </div>

        <div className="border-y border-[#ded2c1] bg-[#fffdf8]">
          <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[820px] text-left text-sm"><thead className="border-b border-[#ded2c1] bg-[#eee5d8] text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6b625b]"><tr><th className="px-5 py-4">Waktu</th><th className="px-5 py-4">Intent</th><th className="px-5 py-4">Pesan pelanggan</th><th className="px-5 py-4">Jawaban asisten</th></tr></thead><tbody className="divide-y divide-[#ded2c1]">{loading ? <tr><td colSpan="4" className="px-5 py-16 text-center text-sm text-[#6b625b]">Memuat riwayat chat.</td></tr> : logs.length === 0 ? <tr><td colSpan="4" className="px-5 py-16 text-center text-sm text-[#6b625b]">Belum ada riwayat chat untuk filter ini.</td></tr> : logs.map((log) => <tr key={log.id} className="align-top transition hover:bg-[#f7f2e9]"><td className="whitespace-nowrap px-5 py-5 text-xs text-[#6b625b]">{formatTanggal(log.created_at)}</td><td className="px-5 py-5"><span className="inline-flex border border-[#4f6d52]/50 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#4f6d52]">{intentLabels[log.intent] || log.intent || 'Belum diklasifikasikan'}</span></td><td className="max-w-sm px-5 py-5 font-medium leading-6 text-[#281a13]">{log.user_message}</td><td className="max-w-lg whitespace-pre-wrap px-5 py-5 leading-6 text-[#6b625b]">{log.bot_response}</td></tr>)}</tbody></table></div>

          <div className="divide-y divide-[#ded2c1] md:hidden">{loading ? <p className="px-5 py-16 text-center text-sm text-[#6b625b]">Memuat riwayat chat.</p> : logs.length === 0 ? <p className="px-5 py-16 text-center text-sm text-[#6b625b]">Belum ada riwayat chat untuk filter ini.</p> : logs.map((log) => <article key={log.id} className="p-5"><div className="flex items-center justify-between gap-3"><span className="inline-flex border border-[#4f6d52]/50 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#4f6d52]">{intentLabels[log.intent] || log.intent || 'Belum diklasifikasikan'}</span><span className="text-xs text-[#6b625b]">{formatTanggal(log.created_at)}</span></div><div className="mt-5 grid gap-4"><div><p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6b625b]">Pesan pelanggan</p><p className="mt-2 text-sm leading-6 text-[#281a13]">{log.user_message}</p></div><div><p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6b625b]">Jawaban asisten</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#6b625b]">{log.bot_response}</p></div></div></article>)}</div>

          {totalPages > 1 && <div className="flex items-center justify-between border-t border-[#ded2c1] bg-[#eee5d8] px-5 py-4"><span className="text-xs text-[#6b625b]">Halaman {page} dari {totalPages}</span><div className="flex gap-2"><button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1} className="inline-flex min-h-11 min-w-11 items-center justify-center border border-[#ded2c1] disabled:opacity-40" aria-label="Halaman sebelumnya"><ChevronLeft className="h-4 w-4" aria-hidden="true" /></button><button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page >= totalPages} className="inline-flex min-h-11 min-w-11 items-center justify-center border border-[#ded2c1] disabled:opacity-40" aria-label="Halaman berikutnya"><ChevronRight className="h-4 w-4" aria-hidden="true" /></button></div></div>}
        </div>
      </div>
    </AdminLayout>
  );
}
