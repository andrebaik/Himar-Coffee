import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import client, { normalizeError } from '../api/client.js';
import MenuCard from '../features/catalog/MenuCard.jsx';
import MenuDetailModal from '../features/catalog/MenuDetailModal.jsx';
import CategoryFilter from '../features/catalog/CategoryFilter.jsx';
import { MenuCardSkeleton } from '../components/Skeleton.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Menu() {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await client.get('/menus/categories');
        setCategories(res.data.data || []);
      } catch {
        // non-blocking
      }
    };
    fetchCategories();
  }, []);

  // Fetch menus when category or debounced query changes
  const fetchMenus = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (debouncedQuery) params.q = debouncedQuery;

      const res = await client.get('/menus', { params });
      setMenus(res.data.data || []);
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [selectedCategory, debouncedQuery]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-wider text-[#6F8F72] font-semibold block mb-1">
          Koleksi Rasa
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[#2B1B12]">
          Katalog Menu
        </h1>
        <p className="text-xs md:text-sm text-[#2B1B12]/70 mt-1 max-w-xl">
          Dari racikan biji kopi lokal Garut hingga sajian makanan pengganjal lapar, semua disiapkan dengan penuh ketulusan.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2B1B12]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kopi, makanan, atau minuman..."
            className="w-full bg-white border border-[#E7DCCB] rounded-xl pl-10 pr-9 py-2.5 text-xs text-[#2B1B12] placeholder-[#2B1B12]/40 focus:outline-none focus:ring-1 focus:ring-[#B5532C] focus:border-[#B5532C] transition shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#2B1B12]/40 hover:text-[#2B1B12] rounded-full cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Chips */}
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Menu Grid */}
      {error ? (
        <ErrorMessage message={error} onRetry={fetchMenus} />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <MenuCardSkeleton />
          <MenuCardSkeleton />
          <MenuCardSkeleton />
          <MenuCardSkeleton />
          <MenuCardSkeleton />
          <MenuCardSkeleton />
        </div>
      ) : menus.length === 0 ? (
        <EmptyState
          title="Menu Tidak Ditemukan"
          description={
            debouncedQuery
              ? `Tidak ada menu yang cocok dengan kata kunci "${debouncedQuery}".`
              : 'Belum ada menu yang tersedia di kategori ini.'
          }
          action={
            (searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                }}
                className="text-xs font-semibold text-[#B5532C] hover:underline cursor-pointer"
              >
                Reset Filter Pencarian
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {menus.map((menu) => (
            <MenuCard key={menu.id} menu={menu} onSelect={setSelectedMenu} />
          ))}
        </div>
      )}

      {/* Modal Detail Menu */}
      {selectedMenu && (
        <MenuDetailModal
          menu={selectedMenu}
          onClose={() => setSelectedMenu(null)}
        />
      )}
    </div>
  );
}
