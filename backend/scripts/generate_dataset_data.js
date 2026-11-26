import 'dotenv/config';
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

// Membaca "Dataset Himar Coffee.xlsx" lalu menulis snapshot JSON yang dipakai
// seed/import. Jalankan: npm run data:generate -- /path/ke/Dataset.xlsx
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const dataDir = path.join(__dirname, 'data');
const photoDir = path.join(repoRoot, 'product-photos');

const DEFAULT_XLSX_PATHS = [
  process.env.DATASET_XLSX,
  path.join(repoRoot, 'data', 'Dataset Himar Coffee.xlsx'),
  path.join(process.env.HOME ?? '', 'Downloads', 'Dataset Himar Coffee.xlsx'),
].filter(Boolean);

// Nama di dataset yang beda ejaan dari nama berkas foto.
const PHOTO_ALIASES = {
  'Klepon Milky Coffee': 'Coffe Based/Klepon Milky Coffe.png',
  'Pandan Milky Coffee': 'Coffe Based/Pandan Milky Coffe.png',
  'Avocado Milky Coffee': 'Coffe Based/Avocado Milky Coffe.png',
  'Coffee Latte': 'Coffe Based/Coffe Latte.png',
  'Regular Tea': 'Tea Based/Reguler Tea.png',
};

const normalizeName = (value) => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');

const findXlsx = () => {
  const found = DEFAULT_XLSX_PATHS.find((p) => existsSync(p));
  if (!found) {
    throw new Error(
      'File Excel dataset tidak ditemukan. Berikan path-nya:\n' +
        '  npm run data:generate -- "/path/Dataset Himar Coffee.xlsx"'
    );
  }
  return found;
};

const excelDateToIso = (serial) => {
  const ms = Date.UTC(1899, 11, 30) + serial * 86400000;
  return new Date(ms).toISOString().slice(0, 10);
};

const excelTimeToParts = (fraction) => {
  const totalMinutes = Math.round((fraction || 0) * 24 * 60);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return { hours, minutes };
};

const listPhotos = async () => {
  const { readdir } = await import('fs/promises');
  const walk = async (dir, base) => {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      if (entry.name === '_originals') continue;
      const full = path.join(dir, entry.name);
      const rel = base ? `${base}/${entry.name}` : entry.name;
      if (entry.isDirectory()) files.push(...(await walk(full, rel)));
      else if (entry.name.toLowerCase().endsWith('.png')) files.push(rel);
    }
    return files;
  };

  if (!existsSync(photoDir)) return [];
  return walk(photoDir, '');
};

const rowsOf = (wb, sheet) => XLSX.utils.sheet_to_json(wb.Sheets[sheet], { defval: null });

const buildMenus = (wb, photos) => {
  const products = rowsOf(wb, 'Produk');
  const categories = new Map(rowsOf(wb, 'Kategori').map((c) => [c.ID_Kategori, c.Nama_Kategori]));
  const variantsByProduct = new Map();

  for (const v of rowsOf(wb, 'Varian_Harga')) {
    if (!variantsByProduct.has(v.ID_Produk)) variantsByProduct.set(v.ID_Produk, []);
    variantsByProduct.get(v.ID_Produk).push(v);
  }

  const stockByProduct = new Map(rowsOf(wb, 'Stok_Produk').map((s) => [s.ID_Produk, s]));
  const photosBySlug = new Map(photos.map((photo) => [normalizeName(path.basename(photo, '.png')), photo]));

  return products.map((product) => {
    const rawVariants = (variantsByProduct.get(product.ID_Produk) ?? []).sort(
      (a, b) => a.Harga_Satuan_Rp - b.Harga_Satuan_Rp
    );

    const isSinglePrice =
      rawVariants.length === 1 && rawVariants[0].Varian.toLowerCase() === 'single price';

    const basePrice = rawVariants.length ? rawVariants[0].Harga_Satuan_Rp : 0;
    const variants = isSinglePrice
      ? []
      : rawVariants.map((v) => ({
          name: v.Varian,
          extra_price: v.Harga_Satuan_Rp - basePrice,
        }));

    const alias = PHOTO_ALIASES[product.Nama_Produk];
    const photo = alias ?? photosBySlug.get(normalizeName(product.Nama_Produk)) ?? null;
    const stock = stockByProduct.get(product.ID_Produk);

    return {
      name: product.Nama_Produk,
      description: product.Deskripsi_Produk ?? null,
      category: categories.get(product.ID_Kategori) ?? 'Lainnya',
      price: basePrice,
      variants,
      is_featured: Boolean(product.Direkomendasikan),
      is_available: stock ? stock.Status_Stok === 'TERSEDIA' : true,
      photo,
    };
  });
};

const buildEvents = (wb) => {
  return rowsOf(wb, 'Event').map((event) => {
    const date = excelDateToIso(event.Tanggal);
    const { hours, minutes } = excelTimeToParts(event.Waktu_Mulai);
    const iso = `${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+07:00`;

    const notes = [
      event.Deskripsi,
      event.Harga_Tiket_Rp > 0 ? `Harga tiket: Rp${event.Harga_Tiket_Rp.toLocaleString('id-ID')}.` : null,
      event.Kuota_Tiket ? `Kuota ${event.Kuota_Tiket} orang, sisa ${event.Sisa_Tiket} tiket.` : null,
    ].filter(Boolean);

    return {
      title: event.Nama_Event,
      description: notes.join(' '),
      event_date: iso,
      location: event.Lokasi,
    };
  });
};

// Format ringkas: [tanggal, menu, kategori, harga_satuan, jumlah, total]
const buildSales = (wb) => {
  const rows = rowsOf(wb, 'Transaksi').filter((trx) => trx.Status_Transaksi === 'Selesai');

  return rows.map((trx, index) => {
    const date = excelDateToIso(trx.Tanggal);
    const hour = 8 + (index % 13);
    const minute = (index * 7) % 60;
    const iso = `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+07:00`;

    return [
      iso,
      trx.Nama_Produk,
      trx.Nama_Kategori,
      trx.Harga_Satuan_Rp,
      trx.Jumlah,
      trx.Penjualan_Bersih_Rp,
    ];
  });
};

const run = async () => {
  const xlsxPath = process.argv[2] ? path.resolve(process.argv[2]) : findXlsx();
  console.log(`📖 Membaca: ${xlsxPath}`);

  const wb = XLSX.readFile(xlsxPath);
  const photos = await listPhotos();
  const menus = buildMenus(wb, photos);
  const events = buildEvents(wb);
  const sales = buildSales(wb);

  const withoutPhoto = menus.filter((m) => !m.photo).map((m) => m.name);

  await mkdir(dataDir, { recursive: true });
  await writeFile(
    path.join(dataDir, 'dataset.json'),
    JSON.stringify(
      {
        meta: {
          source: path.basename(xlsxPath),
          generated_at: new Date().toISOString(),
          menus: menus.length,
          events: events.length,
          sales: sales.length,
          menus_without_photo: withoutPhoto.length,
        },
        menus,
        events,
      },
      null,
      2
    ) + '\n'
  );

  await writeFile(
    path.join(dataDir, 'sales.json'),
    JSON.stringify({ format: ['transaction_date', 'menu_name', 'category', 'unit_price', 'quantity', 'total_amount'], rows: sales }) + '\n'
  );

  console.log(`✅ ${menus.length} menu, ${events.length} event, ${sales.length} transaksi.`);
  console.log(`   Foto cocok: ${menus.length - withoutPhoto.length}/${menus.length}`);
  if (withoutPhoto.length) {
    console.log(`   Tanpa foto (${withoutPhoto.length}): ${withoutPhoto.join(', ')}`);
  }
  console.log(`   Snapshot: ${path.relative(repoRoot, dataDir)}/dataset.json & sales.json`);
};

run().catch((err) => {
  console.error('Generate dataset gagal:', err.message);
  process.exit(1);
});
