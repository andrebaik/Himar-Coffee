import { randomUUID } from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const uploadImage = async (file, folder) => {
  if (!file) {
    throw new AppError('UPLOAD_INVALID', 400, 'File gambar wajib diunggah');
  }

  if (!ALLOWED_MIME.includes(file.mimetype)) {
    throw new AppError('UPLOAD_INVALID', 400, 'Tipe file harus JPEG, PNG, atau WebP');
  }

  if (file.size > MAX_SIZE) {
    throw new AppError('UPLOAD_INVALID', 413, 'Ukuran file maksimal 2 MB');
  }

  const ext = MIME_TO_EXT[file.mimetype];
  const fileName = `${folder}/${randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from('menu-images')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new AppError('INTERNAL_ERROR', 500, 'Gagal mengunggah gambar');
  }

  const { data: urlData } = supabaseAdmin.storage
    .from('menu-images')
    .getPublicUrl(fileName);

  return {
    url: urlData.publicUrl,
    path: fileName,
  };
};

export const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    const bucketBase = supabaseAdmin.storage.from('menu-images').getPublicUrl('').data.publicUrl;
    if (!imageUrl.startsWith(bucketBase)) return;

    const path = imageUrl.replace(bucketBase, '');
    await supabaseAdmin.storage.from('menu-images').remove([path]);
  } catch {
    // Best effort — don't fail the request
    console.error('[uploadService] Gagal menghapus gambar (best effort)');
  }
};
