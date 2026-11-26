import 'dotenv/config';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { assertSupabaseHost } from './preflight.js';

// Import penuh dataset Excel ke Supabase: menu, event, dan riwayat penjualan.
// PENTING: script ini MENGHAPUS isi tabel menus, events, dan sales lebih dulu.
//
// Urutan pemakaian:
//   npm run data:generate      # baca xlsx -> scripts/data/*.json
//   npm run data:import -- --yes
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const dataDir = path.join(__dirname, 'data');
const datasetPath = path.join(dataDir, 'dataset.json');
const salesPath = path.join(dataDir, 'sales.json');
const imageMapPath = path.join(__dirname, 'image-map.json');

const CHUNK_SIZE = 500;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);

const normalizeName = (value) => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');

const loadJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

const loadImageUrls = async () => {
  if (!existsSync(imageMapPath)) return new Map();
  const map = await loadJson(imageMapPath);
  const images = new Map();
  for (const [menuName, entry] of Object.entries(map.images ?? {})) {
    images.set(normalizeName(menuName), entry.url);
  }
  return images;
};

const chunk = (items, size) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
};

const deleteAll = async (table) => {
  const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw new Error(`Gagal mengosongkan tabel ${table}: ${error.message}`);
};

const insertAll = async (table, rows) => {
  let inserted = 0;
  for (const part of chunk(rows, CHUNK_SIZE)) {
    const { error } = await supabase.from(table).insert(part);
    if (error) throw new Error(`Gagal insert ke ${table}: ${error.message}`);
    inserted += part.length;
  }
  return inserted;
};

const run = async () => {
  if (!process.argv.includes('--yes')) {
    console.error(
      'Script ini menghapus seluruh isi tabel menus, events, dan sales.\n' +
        'Jalankan ulang dengan flag konfirmasi:\n' +
        '  npm run data:import -- --yes'
    );
    process.exit(1);
  }

  if (!existsSync(datasetPath) || !existsSync(salesPath)) {
    throw new Error('Snapshot dataset belum ada. Jalankan "npm run data:generate" dulu.');
  }

  await assertSupabaseHost();

  const dataset = await loadJson(datasetPath);
  const salesSnapshot = await loadJson(salesPath);
  const imageUrls = await loadImageUrls();

  const menus = dataset.menus.map(({ photo, ...menu }) => ({
    ...menu,
    image_url: imageUrls.get(normalizeName(menu.name)) ?? null,
  }));
  const events = dataset.events;

  const sales = salesSnapshot.rows.map(([transaction_date, menu_name, category, unit_price, quantity, total_amount]) => ({
    transaction_date,
    menu_name,
    category,
    unit_price,
    quantity,
    total_amount,
  }));

  console.log('🧹 Mengosongkan tabel sales, menus, events...');
  await deleteAll('sales');
  await deleteAll('menus');
  await deleteAll('events');

  console.log('🍽️  Mengisi menu...');
  const menuCount = await insertAll('menus', menus);

  console.log('📅 Mengisi event...');
  const eventCount = await insertAll('events', events);

  console.log('📊 Mengisi riwayat penjualan...');
  const salesCount = await insertAll('sales', sales);

  const withoutImage = menus.filter((m) => !m.image_url).length;

  console.log(
    `\n🎉 Selesai: ${menuCount} menu (${menuCount - withoutImage} dengan foto), ${eventCount} event, ${salesCount} transaksi.`
  );
  if (withoutImage) {
    console.log(`   ${withoutImage} menu belum punya foto (tambah foto lalu jalankan upload:images + seed).`);
  }
};

run().catch((err) => {
  console.error('Import dataset gagal:', err.message);
  process.exit(1);
});
