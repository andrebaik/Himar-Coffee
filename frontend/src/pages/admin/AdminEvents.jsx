import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle2, FileText } from 'lucide-react';
import client, { normalizeError } from '../../api/client.js';
import AdminLayout from '../../features/admin/AdminLayout.jsx';
import EventFormModal from '../../features/admin/EventFormModal.jsx';
import { formatTanggal } from '../../lib/format.js';
import { getEventImage } from '../../lib/media.js';
import toast from 'react-hot-toast';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await client.get('/admin/events');
      setEvents(res.data.data || []);
    } catch (err) {
      toast.error(normalizeError(err).message || 'Gagal memuat daftar event');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async () => {
    if (!deletingEvent) return;
    setIsDeleting(true);
    try {
      await client.delete(`/admin/events/${deletingEvent.id}`);
      toast.success(`Event “${deletingEvent.title}” berhasil dihapus`);
      setDeletingEvent(null);
      fetchEvents();
    } catch (err) {
      toast.error(normalizeError(err).message || 'Gagal menghapus event');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEvents = events.filter((event) => event.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Jadwal event">
      <div className="space-y-8">
        <div className="flex flex-col gap-5 border-b border-[#ded2c1] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-sm leading-7 text-[#6b625b]">Publikasikan kegiatan yang ingin pelanggan temukan di halaman event.</p><p className="mt-2 text-xs text-[#6b625b]">{events.length} event tersimpan</p></div>
          <button type="button" onClick={() => { setEditingEvent(null); setIsModalOpen(true); }} className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#b5532c] px-5 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#8c3f25]"><Plus className="h-4 w-4" aria-hidden="true" />Tambah event</button>
        </div>

        <div className="relative max-w-md"><label htmlFor="admin-event-search" className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#281a13]">Cari jadwal</label><Search className="pointer-events-none absolute bottom-3.5 left-0 h-4 w-4 text-[#b5532c]" aria-hidden="true" /><input id="admin-event-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Judul event" className="min-h-12 w-full border-b border-[#281a13] bg-transparent pl-7 text-sm placeholder:text-[#6b625b]/70 focus:border-[#b5532c] focus:outline-none" /></div>

        <div className="overflow-hidden border-y border-[#ded2c1] bg-[#fffdf8]">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-[#ded2c1] bg-[#eee5d8] text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6b625b]"><tr><th className="px-5 py-4">Event</th><th className="px-5 py-4">Waktu</th><th className="px-5 py-4">Lokasi</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Aksi</th></tr></thead>
              <tbody className="divide-y divide-[#ded2c1]">
                {loading ? <tr><td colSpan="5" className="px-5 py-16 text-center text-sm text-[#6b625b]">Memuat jadwal event.</td></tr> : filteredEvents.length === 0 ? <tr><td colSpan="5" className="px-5 py-16 text-center text-sm text-[#6b625b]">Tidak ada event yang sesuai.</td></tr> : filteredEvents.map((event) => (
                  <tr key={event.id} className="transition hover:bg-[#f7f2e9]"><td className="px-5 py-4"><div className="flex items-center gap-4"><img src={getEventImage(event) || '/favicon.svg'} alt="" className="h-14 w-20 bg-[#eee5d8] object-cover p-2" loading="lazy" /><div><p className="font-semibold text-[#281a13]">{event.title}</p><p className="mt-1 text-xs text-[#6b625b]">{event.description || 'Tanpa deskripsi'}</p></div></div></td><td className="px-5 py-4 whitespace-nowrap text-[#b5532c]">{formatTanggal(event.event_date)}</td><td className="px-5 py-4 text-[#6b625b]">{event.location || 'Belum diisi'}</td><td className="px-5 py-4">{event.is_published ? <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#4f6d52]"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Terbit</span> : <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#6b625b]"><FileText className="h-4 w-4" aria-hidden="true" /> Draft</span>}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => { setEditingEvent(event); setIsModalOpen(true); }} className="inline-flex min-h-11 min-w-11 items-center justify-center border border-[#ded2c1] text-[#281a13] transition hover:border-[#b5532c] hover:text-[#b5532c]" aria-label={`Ubah ${event.title}`}><Edit2 className="h-4 w-4" aria-hidden="true" /></button><button type="button" onClick={() => setDeletingEvent(event)} className="inline-flex min-h-11 min-w-11 items-center justify-center border border-[#ded2c1] text-[#6b625b] transition hover:border-[#b5532c] hover:text-[#b5532c]" aria-label={`Hapus ${event.title}`}><Trash2 className="h-4 w-4" aria-hidden="true" /></button></div></td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[#ded2c1] md:hidden">
            {loading ? <p className="px-5 py-16 text-center text-sm text-[#6b625b]">Memuat jadwal event.</p> : filteredEvents.length === 0 ? <p className="px-5 py-16 text-center text-sm text-[#6b625b]">Tidak ada event yang sesuai.</p> : filteredEvents.map((event) => (
              <article key={event.id} className="flex gap-4 p-4"><img src={getEventImage(event) || '/favicon.svg'} alt="" className="h-16 w-20 shrink-0 bg-[#eee5d8] object-cover p-2" loading="lazy" /><div className="min-w-0 flex-1"><p className="font-semibold text-[#281a13]">{event.title}</p><p className="mt-2 text-xs text-[#b5532c]">{formatTanggal(event.event_date)}</p><p className="mt-1 text-xs text-[#6b625b]">{event.location || 'Lokasi belum diisi'}</p><div className="mt-3 flex gap-2"><button type="button" onClick={() => { setEditingEvent(event); setIsModalOpen(true); }} className="inline-flex min-h-11 items-center gap-2 border border-[#ded2c1] px-3 text-xs font-semibold"><Edit2 className="h-4 w-4" aria-hidden="true" /> Ubah</button><button type="button" onClick={() => setDeletingEvent(event)} className="inline-flex min-h-11 items-center gap-2 border border-[#ded2c1] px-3 text-xs font-semibold text-[#b5532c]"><Trash2 className="h-4 w-4" aria-hidden="true" /> Hapus</button></div></div></article>
            ))}
          </div>
        </div>

        {isModalOpen && <EventFormModal event={editingEvent} onClose={() => { setIsModalOpen(false); setEditingEvent(null); }} onSuccess={fetchEvents} />}

        {deletingEvent && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#281a13]/65 p-4"><div className="w-full max-w-md border border-[#ded2c1] bg-[#fffdf8] p-6 shadow-[0_24px_70px_rgba(40,26,19,0.22)] md:p-8"><Trash2 className="h-7 w-7 text-[#b5532c]" aria-hidden="true" /><h2 className="mt-5 text-3xl leading-none">Hapus event?</h2><p className="mt-4 text-sm leading-7 text-[#6b625b]">Event “{deletingEvent.title}” akan dihapus dari daftar publik dan panel admin.</p><div className="mt-7 flex gap-3"><button type="button" disabled={isDeleting} onClick={() => setDeletingEvent(null)} className="inline-flex min-h-12 flex-1 items-center justify-center border border-[#ded2c1] text-xs font-bold uppercase tracking-[0.08em]">Batal</button><button type="button" disabled={isDeleting} onClick={handleDelete} className="inline-flex min-h-12 flex-1 items-center justify-center bg-[#b5532c] text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#8c3f25] disabled:bg-[#6b625b]">{isDeleting ? 'Menghapus' : 'Ya, hapus'}</button></div></div></div>}
      </div>
    </AdminLayout>
  );
}
