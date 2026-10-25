import { supabaseAdmin } from '../config/supabase.js';
import { success } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';
import { triggerReindex } from '../services/aiClient.js';
import { uploadImage, deleteImage } from '../services/uploadService.js';
import { getChatLogs } from '../services/logService.js';

// ===== MENUS =====

export const createMenu = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('menus')
      .insert(req.body)
      .select()
      .single();

    if (error) throw new AppError('INTERNAL_ERROR', 500, 'Gagal membuat menu');

    // Fire-and-forget reindex
    triggerReindex().catch(() => {});

    return success(res, data, 'Menu berhasil dibuat', 201);
  } catch (err) {
    next(err);
  }
};

export const updateMenu = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: existing } = await supabaseAdmin
      .from('menus')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new AppError('NOT_FOUND', 404, 'Menu tidak ditemukan');
    }

    const { data, error } = await supabaseAdmin
      .from('menus')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError('INTERNAL_ERROR', 500, 'Gagal memperbarui menu');

    triggerReindex().catch(() => {});

    return success(res, data, 'Menu berhasil diperbarui');
  } catch (err) {
    next(err);
  }
};

export const deleteMenu = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: existing } = await supabaseAdmin
      .from('menus')
      .select('id, image_url')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new AppError('NOT_FOUND', 404, 'Menu tidak ditemukan');
    }

    // Best effort: delete image from storage
    if (existing.image_url) {
      await deleteImage(existing.image_url);
    }

    const { error } = await supabaseAdmin.from('menus').delete().eq('id', id);
    if (error) throw new AppError('INTERNAL_ERROR', 500, 'Gagal menghapus menu');

    triggerReindex().catch(() => {});

    return success(res, null, 'Menu berhasil dihapus');
  } catch (err) {
    next(err);
  }
};

// ===== EVENTS =====

export const createEvent = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('events')
      .insert(req.body)
      .select()
      .single();

    if (error) throw new AppError('INTERNAL_ERROR', 500, 'Gagal membuat event');

    triggerReindex().catch(() => {});

    return success(res, data, 'Event berhasil dibuat', 201);
  } catch (err) {
    next(err);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: existing } = await supabaseAdmin
      .from('events')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new AppError('NOT_FOUND', 404, 'Event tidak ditemukan');
    }

    const { data, error } = await supabaseAdmin
      .from('events')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError('INTERNAL_ERROR', 500, 'Gagal memperbarui event');

    triggerReindex().catch(() => {});

    return success(res, data, 'Event berhasil diperbarui');
  } catch (err) {
    next(err);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: existing } = await supabaseAdmin
      .from('events')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new AppError('NOT_FOUND', 404, 'Event tidak ditemukan');
    }

    const { error } = await supabaseAdmin.from('events').delete().eq('id', id);
    if (error) throw new AppError('INTERNAL_ERROR', 500, 'Gagal menghapus event');

    triggerReindex().catch(() => {});

    return success(res, null, 'Event berhasil dihapus');
  } catch (err) {
    next(err);
  }
};

export const getAllEvents = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) throw new AppError('INTERNAL_ERROR', 500, 'Gagal mengambil data event');

    return success(res, data);
  } catch (err) {
    next(err);
  }
};

// ===== UPLOADS =====

export const uploadFile = async (req, res, next) => {
  try {
    const { folder } = req.body;
    const result = await uploadImage(req.file, folder);
    return success(res, result, 'File berhasil diunggah');
  } catch (err) {
    next(err);
  }
};

// ===== CHAT LOGS =====

export const getChatLogsHandler = async (req, res, next) => {
  try {
    const data = await getChatLogs(req.query);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};
