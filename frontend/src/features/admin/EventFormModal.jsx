import React, { useState } from 'react';
import { X, Upload, Calendar } from 'lucide-react';
import client, { normalizeError } from '../../api/client.js';
import toast from 'react-hot-toast';

export default function EventFormModal({
  event = null,
  onClose,
  onSuccess,
}) {
  const isEditing = !!event?.id;

  // Format initial ISO date to local input datetime-local string (YYYY-MM-DDTHH:mm)
  const formatIsoToInput = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      // Format to Asia/Jakarta local ISO without timezone suffix
      const offset = 7 * 60; // WIB is UTC+7
      const local = new Date(d.getTime() + (offset + d.getTimezoneOffset()) * 60000);
      return local.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [eventDate, setEventDate] = useState(formatIsoToInput(event?.event_date));
  const [location, setLocation] = useState(event?.location || '');
  const [imageUrl, setImageUrl] = useState(event?.image_url || '');
  const [isPublished, setIsPublished] = useState(event?.is_published ?? true);

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    formData.append('folder', 'events');

    try {
      const res = await client.post('/admin/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(res.data.data.url);
      toast.success('Foto event berhasil diunggah');
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

    if (!eventDate) {
      setFieldErrors({ event_date: 'Tanggal event wajib diisi' });
      return;
    }

    // Convert datetime-local to ISO string with Asia/Jakarta (+07:00)
    const isoDate = new Date(eventDate).toISOString();

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      event_date: isoDate,
      location: location.trim() || null,
      image_url: imageUrl || null,
      is_published: isPublished,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await client.put(`/admin/events/${event.id}`, payload);
        toast.success('Event berhasil diperbarui');
      } else {
        await client.post('/admin/events', payload);
        toast.success('Event berhasil dibuat');
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
        setGeneralError(errorObj.message || 'Gagal menyimpan event');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#281a13]/65 p-0 md:items-center md:p-6" role="presentation">
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden border border-[#ded2c1] bg-[#fffdf8] shadow-[0_24px_70px_rgba(40,26,19,0.22)]" role="dialog" aria-modal="true" aria-labelledby="event-form-title">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ded2c1] bg-[#eee5d8] p-5">
          <h2 id="event-form-title" className="text-3xl leading-none text-[#281a13]">
            {isEditing ? 'Ubah Event' : 'Tambah Event Baru'}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#6b625b] transition hover:bg-[#fffdf8] hover:text-[#281a13]"
            aria-label="Tutup formulir event"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-5 md:p-7">
          {generalError && (
            <div className="border-l-2 border-[#b5532c] bg-[#fff8f3] p-3 text-sm text-[#6b625b]" role="alert">
              {generalError}
            </div>
          )}

          {/* Judul Event */}
          <div>
            <label className="block text-xs font-semibold text-[#2B1B12] mb-1">
              Judul Event <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Live Acoustic Night"
              className={`w-full p-2.5 bg-[#FAF4EA]/40 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#B5532C] ${
                fieldErrors.title ? 'border-red-500' : 'border-[#E7DCCB]'
              }`}
            />
            {fieldErrors.title && (
              <p className="text-[11px] text-red-600 mt-1">{fieldErrors.title}</p>
            )}
          </div>

          {/* Tanggal & Jam Event */}
          <div>
            <label className="block text-xs font-semibold text-[#2B1B12] mb-1">
              Tanggal & Waktu (WIB) <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={`w-full p-2.5 bg-[#FAF4EA]/40 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#B5532C] ${
                fieldErrors.event_date ? 'border-red-500' : 'border-[#E7DCCB]'
              }`}
            />
            {fieldErrors.event_date && (
              <p className="text-[11px] text-red-600 mt-1">{fieldErrors.event_date}</p>
            )}
          </div>

          {/* Lokasi */}
          <div>
            <label className="block text-xs font-semibold text-[#2B1B12] mb-1">
              Lokasi / Panggung (opsional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: Panggung Indoor, Himar Coffee"
              className="w-full p-2.5 bg-[#FAF4EA]/40 border border-[#E7DCCB] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#B5532C]"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-semibold text-[#2B1B12] mb-1">
              Deskripsi Event
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan detail acara, pengisi acara, atau ketentuan peserta..."
              rows={3}
              maxLength={2000}
              className="w-full p-2.5 bg-[#FAF4EA]/40 border border-[#E7DCCB] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#B5532C] resize-none"
            />
          </div>

          {/* Upload Poster Event */}
          <div>
            <label className="block text-xs font-semibold text-[#2B1B12] mb-1">
              Poster / Foto Event
            </label>
            <div className="flex items-center gap-4">
              {imageUrl ? (
                <div className="relative w-28 h-20 rounded-xl border border-[#E7DCCB] overflow-hidden bg-[#FAF4EA] shrink-0">
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
                <div className="w-28 h-20 rounded-xl border border-dashed border-[#E7DCCB] bg-[#FAF4EA]/50 flex items-center justify-center text-[#2B1B12]/40 shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
              )}

              <div className="space-y-1.5 flex-1">
                <input
                  type="file"
                  id="event-photo"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                />
                <label
                  htmlFor="event-photo"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-[#FAF4EA] border border-[#E7DCCB] rounded-xl text-xs font-medium text-[#2B1B12] transition cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-[#B5532C]" />
                  {isUploading ? 'Mengunggah...' : 'Pilih Poster'}
                </label>
              </div>
            </div>
          </div>

          {/* Switch Status Publikasi */}
          <div className="pt-2 border-t border-[#E7DCCB]">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#2B1B12] cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-[#B5532C] rounded border-[#E7DCCB] focus:ring-[#B5532C]"
              />
              <span>Terbitkan Event (Tampilkan ke Publik)</span>
            </label>
          </div>

          {/* Submit buttons */}
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
                <span>Simpan Event</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
