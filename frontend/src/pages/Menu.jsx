import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import client, { normalizeError } from '../api/client.js';
import SectionIntro from '../components/SectionIntro.jsx';
import MenuCard from '../features/catalog/MenuCard.jsx';
import MenuDetailModal from '../features/catalog/MenuDetailModal.jsx';
import CategoryFilter from '../features/catalog/CategoryFilter.jsx';
import { MenuCardSkeleton } from '../components/Skeleton.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || '';
    if (categoryFromUrl !== selectedCategory) setSelectedCategory(categoryFromUrl);
  }, [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await client.get('/menus/categories');
        setCategories(res.data.data || []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

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

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category) setSearchParams({ category });
    else setSearchParams({});
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSearchParams({});
  };

  return (
    <div>
      <section className="border-b border-[#ded2c1] bg-[#f7f2e9]">
        <div className="editorial-container py-14 md:py-20">
          <SectionIntro
            eyebrow="Katalog Himar"
            title="Minuman untuk pagi, sore, dan percakapan panjang."
            description="Cari menu berdasarkan nama atau pilih lini rasa yang ingin kamu coba hari ini."
          />
        </div>
      </section>

      <section className="section-space">
        <div className="editorial-container">
          <div className="grid gap-6 border-b border-[#ded2c1] pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="relative max-w-xl">
              <label htmlFor="menu-search" className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#6b625b]">
                Cari menu
              </label>
              <Search className="pointer-events-none absolute bottom-3.5 left-0 h-5 w-5 text-[#b5532c]" aria-hidden="true" />
              <input
                id="menu-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Contoh: The Lost Sheep"
                className="min-h-12 w-full border-b border-[#281a13] bg-transparent pl-8 pr-10 text-base text-[#281a13] placeholder:text-[#6b625b]/70 focus:border-[#b5532c] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute bottom-2 right-0 inline-flex min-h-11 min-w-11 items-center justify-center text-[#6b625b] transition hover:text-[#b5532c]"
                  aria-label="Hapus pencarian"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>
            <p className="text-sm text-[#6b625b] lg:max-w-xs lg:text-right">
              Harga ditampilkan dari harga dasar. Varian dan total akhir dihitung saat kamu menyiapkan pesanan.
            </p>
          </div>

          <div className="mt-7">
            <CategoryFilter categories={categories} selected={selectedCategory} onSelect={handleCategorySelect} />
          </div>

          <div className="mt-12">
            {error ? (
              <ErrorMessage message={error} onRetry={fetchMenus} />
            ) : loading ? (
              <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                <MenuCardSkeleton />
                <MenuCardSkeleton />
                <MenuCardSkeleton />
                <MenuCardSkeleton />
                <MenuCardSkeleton />
                <MenuCardSkeleton />
              </div>
            ) : menus.length === 0 ? (
              <EmptyState
                title="Belum menemukan menu"
                description={debouncedQuery ? `Tidak ada menu yang cocok dengan “${debouncedQuery}”.` : 'Belum ada menu tersedia di lini rasa ini.'}
                action={(searchQuery || selectedCategory) && (
                  <button type="button" className="editorial-link" onClick={resetFilters}>
                    Reset pencarian
                  </button>
                )}
              />
            ) : (
              <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {menus.map((menu, index) => (
                  <MenuCard key={menu.id} menu={menu} onSelect={setSelectedMenu} featured={index === 0 && !selectedCategory && !debouncedQuery} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {selectedMenu && <MenuDetailModal menu={selectedMenu} onClose={() => setSelectedMenu(null)} />}
    </div>
  );
}
