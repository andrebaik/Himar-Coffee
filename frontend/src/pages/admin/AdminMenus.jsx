import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import client, { normalizeError } from '../../api/client.js';
import AdminLayout from '../../features/admin/AdminLayout.jsx';
import MenuFormModal from '../../features/admin/MenuFormModal.jsx';
import { formatRupiah } from '../../lib/format.js';
import { getMenuImage } from '../../lib/media.js';
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
      const [menuRes, categoryRes] = await Promise.all([client.get('/menus'), client.get('/menus/categories')]);
      setMenus(menuRes.data.data || []);
      setCategories(categoryRes.data.data || []);
    } catch (err) {
      toast.error(normalizeError(err).message || 'Gagal memuat data menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMenus(); }, []);

  const handleDelete = async () => {
    if (!deletingMenu) return;
    setIsDeleting(true);
    try {
      await client.delete(`/admin/menus/${deletingMenu.id}`);
      toast.success(`Menu “${deletingMenu.name}” berhasil dihapus`);
      setDeletingMenu(null);
      fetchMenus();
    } catch (err) {
      toast.error(normalizeError(err).message || 'Gagal menghapus menu');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMenus = menus.filter((menu) => `${menu.name} ${menu.category}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Katalog menu">
      <div className="space-y-8">
        <div className="flex flex-col gap-5 border-b border-[#ded2c1] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm leading-7 text-[#6b625b]">Atur menu yang tampil di katalog pelanggan dan pilihan unggulan di beranda.</p>
            <p className="mt-2 text-xs text-[#6b625b]">{menus.length} menu tersimpan</p>
          </div>
          <button type="button" onClick={() => { setEditingMenu(null); setIsModalOpen(true); }} className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#b5532c] px-5 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#8c3f25]">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah menu
          </button>
        </div>

        <div className="relative max-w-md">
          <label htmlFor="admin-menu-search" className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#281a13]">Cari katalog</label>
          <Search className="pointer-events-none absolute bottom-3.5 left-0 h-4 w-4 text-[#b5532c]" aria-hidden="true" />
          <input id="admin-menu-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nama menu atau kategori" className="min-h-12 w-full border-b border-[#281a13] bg-transparent pl-7 text-sm placeholder:text-[#6b625b]/70 focus:border-[#b5532c] focus:outline-none" />
        </div>

        <div className="overflow-hidden border-y border-[#ded2c1] bg-[#fffdf8]">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-[#ded2c1] bg-[#eee5d8] text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6b625b]">
                <tr>
                  <th className="px-5 py-4">Menu</th>
                  <th className="px-5 py-4">Kategori</th>
                  <th className="px-5 py-4">Harga</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ded2c1]">
                {loading ? <tr><td colSpan="5" className="px-5 py-16 text-center text-sm text-[#6b625b]">Memuat katalog menu.</td></tr> : filteredMenus.length === 0 ? <tr><td colSpan="5" className="px-5 py-16 text-center text-sm text-[#6b625b]">Tidak ada menu yang sesuai.</td></tr> : filteredMenus.map((menu) => (
                  <tr key={menu.id} className="align-middle transition hover:bg-[#f7f2e9]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <img src={getMenuImage(menu) || '/favicon.svg'} alt="" className="h-14 w-14 bg-[#eee5d8] object-cover p-2" loading="lazy" />
                        <div><p className="font-semibold text-[#281a13]">{menu.name}</p>{menu.is_featured && <span className="mt-1 block text-xs text-[#b5532c]">Unggulan</span>}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#6b625b]">{menu.category}</td>
                    <td className="px-5 py-4 font-semibold text-[#b5532c]">{formatRupiah(menu.price)}</td>
                    <td className="px-5 py-4">{menu.is_available ? <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#4f6d52]"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Tersedia</span> : <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#b5532c]"><XCircle className="h-4 w-4" aria-hidden="true" /> Habis</span>}</td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => { setEditingMenu(menu); setIsModalOpen(true); }} className="inline-flex min-h-11 min-w-11 items-center justify-center border border-[#ded2c1] text-[#281a13] transition hover:border-[#b5532c] hover:text-[#b5532c]" aria-label={`Ubah ${menu.name}`}><Edit2 className="h-4 w-4" aria-hidden="true" /></button><button type="button" onClick={() => setDeletingMenu(menu)} className="inline-flex min-h-11 min-w-11 items-center justify-center border border-[#ded2c1] text-[#6b625b] transition hover:border-[#b5532c] hover:text-[#b5532c]" aria-label={`Hapus ${menu.name}`}><Trash2 className="h-4 w-4" aria-hidden="true" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[#ded2c1] md:hidden">
            {loading ? <p className="px-5 py-16 text-center text-sm text-[#6b625b]">Memuat katalog menu.</p> : filteredMenus.length === 0 ? <p className="px-5 py-16 text-center text-sm text-[#6b625b]">Tidak ada menu yang sesuai.</p> : filteredMenus.map((menu) => (
              <article key={menu.id} className="flex gap-4 p-4">
                <img src={getMenuImage(menu) || '/favicon.svg'} alt="" className="h-16 w-16 shrink-0 bg-[#eee5d8] object-cover p-2" loading="lazy" />
                <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-[#281a13]">{menu.name}</p><p className="mt-1 text-xs text-[#6b625b]">{menu.category}</p></div><p className="text-sm font-semibold text-[#b5532c]">{formatRupiah(menu.price)}</p></div><p className="mt-3 text-xs text-[#6b625b]">{menu.is_available ? 'Tersedia untuk dipesan' : 'Tidak tersedia'}</p><div className="mt-3 flex gap-2"><button type="button" onClick={() => { setEditingMenu(menu); setIsModalOpen(true); }} className="inline-flex min-h-11 items-center gap-2 border border-[#ded2c1] px-3 text-xs font-semibold" aria-label={`Ubah ${menu.name}`}><Edit2 className="h-4 w-4" aria-hidden="true" /> Ubah</button><button type="button" onClick={() => setDeletingMenu(menu)} className="inline-flex min-h-11 items-center gap-2 border border-[#ded2c1] px-3 text-xs font-semibold text-[#b5532c]" aria-label={`Hapus ${menu.name}`}><Trash2 className="h-4 w-4" aria-hidden="true" /> Hapus</button></div></div>
              </article>
            ))}
          </div>
        </div>

        {isModalOpen && <MenuFormModal menu={editingMenu} categories={categories} onClose={() => { setIsModalOpen(false); setEditingMenu(null); }} onSuccess={fetchMenus} />}

        {deletingMenu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#281a13]/65 p-4">
            <div className="w-full max-w-md border border-[#ded2c1] bg-[#fffdf8] p-6 shadow-[0_24px_70px_rgba(40,26,19,0.22)] md:p-8">
              <Trash2 className="h-7 w-7 text-[#b5532c]" aria-hidden="true" />
              <h2 className="mt-5 text-3xl leading-none text-[#281a13]">Hapus menu?</h2>
              <p className="mt-4 text-sm leading-7 text-[#6b625b]">Menu “{deletingMenu.name}” akan dihapus dari katalog. Tindakan ini tidak dapat dibatalkan.</p>
              <div className="mt-7 flex gap-3"><button type="button" disabled={isDeleting} onClick={() => setDeletingMenu(null)} className="inline-flex min-h-12 flex-1 items-center justify-center border border-[#ded2c1] text-xs font-bold uppercase tracking-[0.08em]">Batal</button><button type="button" disabled={isDeleting} onClick={handleDelete} className="inline-flex min-h-12 flex-1 items-center justify-center bg-[#b5532c] text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#8c3f25] disabled:bg-[#6b625b]">{isDeleting ? 'Menghapus' : 'Ya, hapus'}</button></div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
