import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle, Coffee } from 'lucide-react';
import client, { normalizeError } from '../../api/client.js';
import AdminLayout from '../../features/admin/AdminLayout.jsx';
import MenuFormModal from '../../features/admin/MenuFormModal.jsx';
import { formatRupiah } from '../../lib/format.js';
import toast from 'react-hot-toast';

export default function AdminMenus() {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [deletingMenu, setDeletingMenu] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await client.get('/menus');
      setMenus(res.data.data || []);

      const catRes = await client.get('/menus/categories');
      setCategories(catRes.data.data || []);
    } catch (err) {
      toast.error(normalizeError(err).message || 'Gagal memuat data menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleDelete = async () => {
    if (!deletingMenu) return;
    setIsDeleting(true);
    try {
      await client.delete(`/admin/menus/${deletingMenu.id}`);
      toast.success(`Menu "${deletingMenu.name}" berhasil dihapus`);
      setDeletingMenu(null);
      fetchMenus();
    } catch (err) {
      toast.error(normalizeError(err).message || 'Gagal menghapus menu');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMenus = menus.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Kelola Katalog Menu">
      <div className="space-y-6">
        {/* Top Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[#E7DCCB]">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2B1B12]/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari menu atau kategori..."
              className="w-full pl-10 pr-4 py-2 bg-[#FAF4EA]/40 border border-[#E7DCCB] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#B5532C]"
            />
          </div>

          <button
            onClick={() => {
              setEditingMenu(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#B5532C] hover:bg-[#a04622] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Menu
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E7DCCB] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2B1B12]">
              <thead className="bg-[#FAF4EA] text-[11px] uppercase tracking-wider text-[#2B1B12]/70 border-b border-[#E7DCCB]">
                <tr>
                  <th className="py-3 px-4">Foto</th>
                  <th className="py-3 px-4">Nama Menu</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Harga Dasar</th>
                  <th className="py-3 px-4">Unggulan</th>
                  <th className="py-3 px-4">Tersedia</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCCB]/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#2B1B12]/50">
                      Memuat daftar menu...
                    </td>
                  </tr>
                ) : filteredMenus.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#2B1B12]/50">
                      Tidak ada menu yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredMenus.map((menu) => (
                    <tr key={menu.id} className="hover:bg-[#FAF4EA]/30 transition">
                      <td className="py-3 px-4">
                        {menu.image_url ? (
                          <img
                            src={menu.image_url}
                            alt={menu.name}
                            className="w-12 h-10 object-cover rounded-lg border border-[#E7DCCB]"
                          />
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-[#FAF4EA] border border-[#E7DCCB] flex items-center justify-center text-[#B5532C]">
                            <Coffee className="w-4 h-4" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#2B1B12]">
                        {menu.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-[#FAF4EA] text-[#6F8F72] font-semibold border border-[#E7DCCB] px-2 py-0.5 rounded text-[11px]">
                          {menu.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-[#B5532C]">
                        {formatRupiah(menu.price)}
                      </td>
                      <td className="py-3 px-4">
                        {menu.is_featured ? (
                          <span className="text-[#B5532C] font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5" /> Ya
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {menu.is_available ? (
                          <span className="text-[#6F8F72] font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5" /> Tersedia
                          </span>
                        ) : (
                          <span className="text-red-500 font-semibold flex items-center gap-1 text-[11px]">
                            <XCircle className="w-3.5 h-3.5" /> Habis
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingMenu(menu);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Ubah menu"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingMenu(menu)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Hapus menu"
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

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <MenuFormModal
            menu={editingMenu}
            categories={categories}
            onClose={() => {
              setIsModalOpen(false);
              setEditingMenu(null);
            }}
            onSuccess={fetchMenus}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deletingMenu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => !isDeleting && setDeletingMenu(null)}
            />
            <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-[#E7DCCB] z-10 text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#2B1B12]">
                Hapus Menu?
              </h3>
              <p className="text-xs text-[#2B1B12]/70 leading-relaxed">
                Apakah kamu yakin ingin menghapus menu{' '}
                <strong className="text-[#2B1B12]">{deletingMenu.name}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingMenu(null)}
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
