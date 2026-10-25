import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, Coffee } from 'lucide-react';
import client, { normalizeError } from '../../api/client.js';
import toast from 'react-hot-toast';

export default function MenuFormModal({
  menu = null,
  categories = [],
  onClose,
  onSuccess,
}) {
  const isEditing = !!menu?.id;

  const [name, setName] = useState(menu?.name || '');
  const [description, setDescription] = useState(menu?.description || '');
  const [price, setPrice] = useState(menu?.price ?? '');
  const [category, setCategory] = useState(menu?.category || '');
  const [variants, setVariants] = useState(
    Array.isArray(menu?.variants) && menu.variants.length > 0
      ? menu.variants
      : []
  );
  const [imageUrl, setImageUrl] = useState(menu?.image_url || '');
  const [isFeatured, setIsFeatured] = useState(menu?.is_featured ?? false);
  const [isAvailable, setIsAvailable] = useState(menu?.is_available ?? true);

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Add a new empty variant
  const handleAddVariant = () => {
    if (variants.length >= 10) {
      toast.error('Maksimal 10 varian');
      return;
    }
    setVariants([...variants, { name: '', extra_price: 0 }]);
  };

  const handleUpdateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      [field]: field === 'extra_price' ? Number(value) || 0 : value,
    };
    setVariants(updated);
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Upload handler
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype || file.type)) {
      toast.error('Tipe file harus JPEG, PNG, atau WebP');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2 MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'menus');

    try {
      const res = await client.post('/admin/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(res.data.data.url);
      toast.success('Foto berhasil diunggah');
    } catch (err) {
      toast.error(normalizeError(err).message || 'Gagal mengunggah foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');

    // Filter out completely empty variants
    const validVariants = variants
      .filter((v) => v.name && v.name.trim())
      .map((v) => ({ name: v.name.trim(), extra_price: Number(v.extra_price) || 0 }));

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      price: Number(price),
      category: category.trim(),
      variants: validVariants,
      image_url: imageUrl || null,
      is_featured: isFeatured,
      is_available: isAvailable,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await client.put(`/admin/menus/${menu.id}`, payload);
        toast.success('Menu berhasil diperbarui');
      } else {
        await client.post('/admin/menus', payload);
        toast.success('Menu berhasil ditambahkan');
      }
      onSuccess();
      onClose();
    } catch (err) {
      const errorObj = normalizeError(err);
      if (errorObj.details && Array.isArray(errorObj.details)) {
        const errors = {};
        errorObj.details.forEach((d) => {
          errors[d.field] = d.message;
        });
        setFieldErrors(errors);
      } else {
        setGeneralError(errorObj.message || 'Gagal menyimpan menu');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E7DCCB] max-h-[90vh] flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E7DCCB] bg-[#FAF4EA] flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-[#2B1B12]">
            {isEditing ? 'Ubah Menu' : 'Tambah Menu Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#2B1B12]/60 hover:text-[#2B1B12] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {generalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {generalError}
            </div>
          )}

          {/* Nama Menu */}
          <div>
            <label className="block text-xs font-semibold text-[#2B1B12] mb-1">
              Nama Menu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: The Lost Sheep"
              className={`w-full p-2.5 bg-[#FAF4EA]/40 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#B5532C] ${
                fieldErrors.name ? 'border-red-500 bg-red-50/20' : 'border-[#E7DCCB]'
              }`}
            />
            {fieldErrors.name && (
              <p className="text-[11px] text-red-600 mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Kategori & Harga Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#2B1B12] mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                list="category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Kopi, Non-Kopi, Makanan..."
                className={`w-full p-2.5 bg-[#FAF4EA]/40 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#B5532C] ${
                  fieldErrors.category ? 'border-red-500 bg-red-50/20' : 'border-[#E7DCCB]'
                }`}
              />
              <datalist id="category-suggestions">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {fieldErrors.category && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B1B12] mb-1">
                Harga Dasar (Rupiah) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="10000000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25000"
                className={`w-full p-2.5 bg-[#FAF4EA]/40 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#B5532C] ${
                  fieldErrors.price ? 'border-red-500 bg-red-50/20' : 'border-[#E7DCCB]'
                }`}
              />
              {fieldErrors.price && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.price}</p>
              )}
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-semibold text-[#2B1B12] mb-1">
              Deskripsi Menu (opsional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan rasa, bahan, atau keunikan menu ini..."
              rows={3}
              maxLength={1000}
              className={`w-full p-2.5 bg-[#FAF4EA]/40 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#B5532C] resize-none ${
                fieldErrors.description ? 'border-red-500' : 'border-[#E7DCCB]'
              }`}
            />
            {fieldErrors.description && (
              <p className="text-[11px] text-red-600 mt-1">{fieldErrors.description}</p>
            )}
          </div>

          {/* Upload Foto */}
          <div>
            <label className="block text-xs font-semibold text-[#2B1B12] mb-1">
              Foto Menu (JPEG, PNG, WebP — maks 2 MB)
            </label>
            <div className="flex items-center gap-4">
              {imageUrl ? (
                <div className="relative w-24 h-24 rounded-xl border border-[#E7DCCB] overflow-hidden bg-[#FAF4EA] shrink-0">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl border border-dashed border-[#E7DCCB] bg-[#FAF4EA]/50 flex items-center justify-center text-[#2B1B12]/40 shrink-0">
                  <Coffee className="w-8 h-8" />
                </div>
              )}

              <div className="space-y-1.5 flex-1">
                <input
                  type="file"
                  id="menu-photo"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                />
                <label
                  htmlFor="menu-photo"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-[#FAF4EA] border border-[#E7DCCB] rounded-xl text-xs font-medium text-[#2B1B12] transition cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-[#B5532C]" />
                  {isUploading ? 'Mengunggah...' : 'Pilih Foto'}
                </label>
                <p className="text-[10px] text-[#2B1B12]/60">
                  Foto akan disimpan otomatis di Supabase Storage.
                </p>
              </div>
            </div>
          </div>

          {/* Varian Repeater */}
          <div className="pt-2 border-t border-[#E7DCCB]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#2B1B12]">
                Pilihan Varian (opsional)
              </label>
              <button
                type="button"
                onClick={handleAddVariant}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B5532C] hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Tambah Varian
              </button>
            </div>

            {variants.length === 0 ? (
              <p className="text-[11px] text-[#2B1B12]/50 italic">
                Menu ini belum memiliki varian (misal: Panas, Dingin, Ekstra Shot).
              </p>
            ) : (
              <div className="space-y-2">
                {variants.map((v, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => handleUpdateVariant(idx, 'name', e.target.value)}
                      placeholder="Nama Varian (contoh: Iced)"
                      className="flex-1 p-2 bg-[#FAF4EA]/40 border border-[#E7DCCB] rounded-xl text-xs focus:outline-none"
                    />
                    <div className="w-36 flex items-center gap-1">
                      <span className="text-[10px] text-[#2B1B12]/60">+Rp</span>
                      <input
                        type="number"
                        min="0"
                        value={v.extra_price}
                        onChange={(e) => handleUpdateVariant(idx, 'extra_price', e.target.value)}
                        placeholder="3000"
                        className="w-full p-2 bg-[#FAF4EA]/40 border border-[#E7DCCB] rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-2 text-red-500 hover:text-red-700 cursor-pointer"
                      aria-label="Hapus varian"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Switches (Unggulan & Tersedia) */}
          <div className="pt-2 border-t border-[#E7DCCB] flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#2B1B12] cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-[#B5532C] rounded border-[#E7DCCB] focus:ring-[#B5532C]"
              />
              <span>Tandai sebagai Menu Unggulan (Tampil di Beranda)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-[#2B1B12] cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 text-[#B5532C] rounded border-[#E7DCCB] focus:ring-[#B5532C]"
              />
              <span>Menu Tersedia untuk Dipesan</span>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-[#E7DCCB] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E7DCCB] text-xs font-medium text-[#2B1B12] hover:bg-[#FAF4EA] transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-5 py-2.5 rounded-xl bg-[#B5532C] hover:bg-[#a04622] disabled:bg-gray-400 text-white text-xs font-medium transition cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Menu</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
