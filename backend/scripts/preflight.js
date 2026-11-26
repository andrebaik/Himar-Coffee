import dns from 'dns/promises';

// Cek cepat sebelum operasi Supabase: host project harus resolve.
// Mencegah puluhan error "fetch failed" saat URL salah / project sudah dihapus.
export const assertSupabaseHost = async () => {
  if (!process.env.SUPABASE_URL) {
    throw new Error('SUPABASE_URL belum diisi di backend/.env');
  }

  let host;
  try {
    host = new URL(process.env.SUPABASE_URL).hostname;
  } catch {
    throw new Error(`SUPABASE_URL tidak valid: "${process.env.SUPABASE_URL}"`);
  }

  try {
    await dns.lookup(host);
  } catch {
    throw new Error(
      `Host Supabase tidak ditemukan: ${host}\n` +
        'Kemungkinan project sudah dihapus/di-pause atau SUPABASE_URL salah.\n' +
        'Buka https://supabase.com/dashboard, pastikan project aktif, lalu salin\n' +
        'Project URL dari Project Settings > API ke backend/.env.'
    );
  }
};
