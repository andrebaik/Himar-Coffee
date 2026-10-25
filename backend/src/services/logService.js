import { supabaseAdmin } from '../config/supabase.js';

export const saveChatLog = async ({ session_id, user_message, intent, confidence, bot_response }) => {
  try {
    await supabaseAdmin.from('chat_logs').insert({
      session_id,
      user_message,
      intent,
      confidence,
      bot_response,
    });
  } catch {
    // Best effort — don't fail the response
    console.error('[logService] Gagal menyimpan chat log (best effort)');
  }
};

export const getChatLogs = async ({ page = 1, limit = 20, intent }) => {
  const offset = (page - 1) * limit;

  let query = supabaseAdmin.from('chat_logs').select('*', { count: 'exact' });

  if (intent) {
    query = query.eq('intent', intent);
  }

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    throw new Error('Gagal mengambil riwayat chat');
  }

  return {
    items: data,
    page,
    limit,
    total: count || 0,
  };
};
