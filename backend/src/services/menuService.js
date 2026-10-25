import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

export const getMenus = async ({ category, q, featured, available }) => {
  let query = supabaseAdmin.from('menus').select('*');

  if (category) {
    query = query.eq('category', category);
  }
  if (q) {
    // Escape special LIKE characters
    const escaped = q.replace(/[%_]/g, '\\$&');
    query = query.ilike('name', `%${escaped}%`);
  }
  if (featured === 'true') {
    query = query.eq('is_featured', true);
  }
  if (available === 'true') {
    query = query.eq('is_available', true);
  }

  query = query.order('is_featured', { ascending: false }).order('name', { ascending: true });

  const { data, error } = await query;
  if (error) throw new AppError('INTERNAL_ERROR', 500, 'Gagal mengambil data menu');
  return data;
};

export const getCategories = async () => {
  const { data, error } = await supabaseAdmin
    .from('menus')
    .select('category')
    .order('category', { ascending: true });

  if (error) throw new AppError('INTERNAL_ERROR', 500, 'Gagal mengambil kategori');

  const unique = [...new Set(data.map((d) => d.category))];
  return unique;
};

export const getMenuById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('menus')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new AppError('NOT_FOUND', 404, 'Menu tidak ditemukan');
  }
  return data;
};
