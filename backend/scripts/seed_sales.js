import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);

async function seedSales() {
  console.log('📊 Memulai seed data sales (30 hari terakhir)...\n');

  // 1. Ambil daftar menu dari DB
  const { data: menus, error: menuErr } = await supabase
    .from('menus')
    .select('id, name, price, category');

  if (menuErr || !menus || menus.length === 0) {
    console.error('❌ Gagal mengambil menu atau menu kosong.');
    process.exit(1);
  }

  // 2. Cek apakah tabel sales sudah memiliki data
  const { count, error: countErr } = await supabase
    .from('sales')
    .select('id', { count: 'exact', head: true });

  if (count && count > 0) {
    console.log(`⏭️  Tabel sales sudah memiliki ${count} baris data, dilewati.`);
    return;
  }

  // 3. Generate 120 transaksi acak dalam 30 hari terakhir
  const salesRecords = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = 0; i < 120; i++) {
    // Random menu
    const menu = menus[Math.floor(Math.random() * menus.length)];
    // Random quantity 1-4
    const quantity = Math.floor(Math.random() * 3) + 1;
    const totalAmount = menu.price * quantity;

    // Random date in the last 30 days
    const daysAgo = Math.random() * 30;
    const transactionDate = new Date(now - daysAgo * dayMs).toISOString();

    salesRecords.push({
      menu_name: menu.name,
      category: menu.category,
      unit_price: menu.price,
      quantity,
      total_amount: totalAmount,
      transaction_date: transactionDate,
    });
  }

  const { error: insertErr } = await supabase.from('sales').insert(salesRecords);

  if (insertErr) {
    console.error('❌ Gagal insert data sales:', insertErr.message);
  } else {
    console.log(`✅ Berhasil menambahkan ${salesRecords.length} transaksi simulasi ke tabel sales!`);
  }
}

seedSales().catch((err) => {
  console.error('Error seeding sales:', err);
  process.exit(1);
});
