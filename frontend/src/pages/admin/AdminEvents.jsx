import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar, CheckCircle, Clock } from 'lucide-react';
import client, { normalizeError } from '../../api/client.js';
import AdminLayout from '../../features/admin/AdminLayout.jsx';
import EventFormModal from '../../features/admin/EventFormModal.jsx';
import { formatTanggal } from '../../lib/format.js';
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

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async () => {
    if (!deletingEvent) return;
    setIsDeleting(true);
    try {
      await client.delete(`/admin/events/${deletingEvent.id}`);
      toast.success(`Event "${deletingEvent.title}" berhasil dihapus`);
      setDeletingEvent(null);
      fetchEvents();
    } catch (err) {
      toast.error(normalizeError(err).message || 'Gagal menghapus event');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Kelola Jadwal Event">
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[#E7DCCB]">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2B1B12]/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul event..."
              className="w-full pl-10 pr-4 py-2 bg-[#FAF4EA]/40 border border-[#E7DCCB] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#B5532C]"
            />
          </div>

          <button
            onClick={() => {
              setEditingEvent(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#B5532C] hover:bg-[#a04622] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Event
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E7DCCB] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2B1B12]">
              <thead className="bg-[#FAF4EA] text-[11px] uppercase tracking-wider text-[#2B1B12]/70 border-b border-[#E7DCCB]">
                <tr>
                  <th className="py-3 px-4">Poster</th>
                  <th className="py-3 px-4">Judul Event</th>
                  <th className="py-3 px-4">Tanggal (WIB)</th>
                  <th className="py-3 px-4">Lokasi</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCCB]/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[#2B1B12]/50">
                      Memuat daftar event...
                    </td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[#2B1B12]/50">
                      Tidak ada event ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-[#FAF4EA]/30 transition">
                      <td className="py-3 px-4">
                        {evt.image_url ? (
                          <img
                            src={evt.image_url}
                            alt={evt.title}
                            className="w-14 h-10 object-cover rounded-lg border border-[#E7DCCB]"
                          />
                        ) : (
                          <div className="w-14 h-10 rounded-lg bg-[#FAF4EA] border border-[#E7DCCB] flex items-center justify-center text-[#B5532C]">
                            <Calendar className="w-4 h-4" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#2B1B12]">
                        {evt.title}
                      </td>
                      <td className="py-3 px-4 text-[#B5532C] font-medium whitespace-nowrap">
                        {formatTanggal(evt.event_date)}
                      </td>
                      <td className="py-3 px-4 text-[#2B1B12]/70">
                        {evt.location || '—'}
                      </td>
                      <td className="py-3 px-4">
                        {evt.is_published ? (
                          <span className="bg-[#6F8F72]/15 text-[#6F8F72] border border-[#6F8F72]/30 font-semibold px-2 py-0.5 rounded text-[11px]">
                            Terbit
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 border border-gray-300 font-semibold px-2 py-0.5 rounded text-[11px]">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingEvent(evt);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Ubah event"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingEvent(evt)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Hapus event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <EventFormModal
            event={editingEvent}
            onClose={() => {
              setIsModalOpen(false);
              setEditingEvent(null);
            }}
            onSuccess={fetchEvents}
          />
        )}

        {/* Delete Modal */}
        {deletingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => !isDeleting && setDeletingEvent(null)}
            />
            <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-[#E7DCCB] z-10 text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#2B1B12]">
                Hapus Event?
              </h3>
              <p className="text-xs text-[#2B1B12]/70 leading-relaxed">
                Apakah kamu yakin ingin menghapus event{' '}
                <strong className="text-[#2B1B12]">{deletingEvent.title}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingEvent(null)}
                  className="flex-1 py-2 rounded-xl border border-[#E7DCCB] text-xs font-semibold text-[#2B1B12] hover:bg-[#FAF4EA] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
