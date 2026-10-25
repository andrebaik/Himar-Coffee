import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

export const getEvents = async ({ scope = 'upcoming' }) => {
  let query = supabaseAdmin.from('events').select('*').eq('is_published', true);

  const now = new Date().toISOString();

  if (scope === 'upcoming') {
    query = query.gte('event_date', now).order('event_date', { ascending: true });
  } else if (scope === 'past') {
    query = query.lt('event_date', now).order('event_date', { ascending: false });
  } else {
    // all
    query = query.order('event_date', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw new AppError('INTERNAL_ERROR', 500, 'Gagal mengambil data event');
  return data;
};

export const getEventById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single();

  if (error || !data) {
    throw new AppError('NOT_FOUND', 404, 'Event tidak ditemukan');
  }
  return data;
};
