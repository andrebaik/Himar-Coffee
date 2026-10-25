import React, { useEffect, useState } from 'react';
import { MessageSquare, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import client, { normalizeError } from '../../api/client.js';
import AdminLayout from '../../features/admin/AdminLayout.jsx';
import { formatTanggal } from '../../lib/format.js';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    fetchLogs();
  }, [page, intent]);

  const totalPages = Math.ceil(total / limit) || 1;

  const getIntentBadge = (intentStr) => {
    switch (intentStr) {
      case 'tanya_menu':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'tanya_event':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pemesanan':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'keluhan':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <AdminLayout title="Riwayat Chatbot">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[#E7DCCB]">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#B5532C]" />
            <span className="text-xs font-semibold text-[#2B1B12]">Filter Intent:</span>
            <select
              value={intent}
              onChange={(e) => {
                setIntent(e.target.value);
                setPage(1);
              }}
              className="bg-[#FAF4EA]/50 border border-[#E7DCCB] rounded-xl px-3 py-1.5 text-xs text-[#2B1B12] focus:outline-none focus:ring-1 focus:ring-[#B5532C] cursor-pointer"
            >
              <option value="">Semua Intent</option>
              <option value="tanya_menu">Tanya Menu</option>
              <option value="tanya_event">Tanya Event</option>
              <option value="pemesanan">Pemesanan</option>
              <option value="keluhan">Keluhan</option>
              <option value="di_luar_konteks">Di Luar Konteks</option>
            </select>
          </div>

          <span className="text-xs text-[#2B1B12]/60">
            Total Riwayat: <strong>{total}</strong> interaksi
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E7DCCB] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2B1B12]">
              <thead className="bg-[#FAF4EA] text-[11px] uppercase tracking-wider text-[#2B1B12]/70 border-b border-[#E7DCCB]">
                <tr>
                  <th className="py-3 px-4 w-40">Waktu (WIB)</th>
                  <th className="py-3 px-4 w-32">Intent</th>
                  <th className="py-3 px-4 w-1/3">Pesan Pengguna</th>
                  <th className="py-3 px-4">Jawaban Asisten</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCCB]/60">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-[#2B1B12]/50">
                      Memuat data log chat...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-[#2B1B12]/50">
                      Belum ada riwayat chat tercatat.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAF4EA]/20 transition align-top">
                      <td className="py-3.5 px-4 text-[#2B1B12]/60 whitespace-nowrap text-[11px]">
                        {formatTanggal(log.created_at)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold tracking-wide ${getIntentBadge(
                            log.intent
                          )}`}
                        >
                          {log.intent || '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#2B1B12]">
                        {log.user_message}
                      </td>
                      <td className="py-3.5 px-4 text-[#2B1B12]/80 leading-relaxed whitespace-pre-wrap">
                        {log.bot_response}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#E7DCCB] bg-[#FAF4EA]/40 flex items-center justify-between">
              <span className="text-xs text-[#2B1B12]/60">
                Halaman {page} dari {totalPages}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-[#E7DCCB] text-[#2B1B12] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-[#E7DCCB] text-[#2B1B12] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
