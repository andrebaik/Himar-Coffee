import 'dotenv/config';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { realMenus } from './real-menu-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const photoDir = process.env.PHOTO_DIR
  ? path.resolve(process.env.PHOTO_DIR)
  : path.join(repoRoot, 'product-photos');
const outputFile = path.join(__dirname, 'image-map.json');

const BUCKET = 'menu-images';
const DRY_RUN = process.env.DRY_RUN === '1' || process.argv.includes('--dry-run');
const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const uploadImages = async () => {
  if (!existsSync(photoDir)) {
    throw new Error(
      `Folder foto tidak ditemukan: ${photoDir}\n` +
        'Letakkan foto produk di folder product-photos/ atau set PHOTO_DIR.'
    );
  }

  const images = {};
  let uploaded = 0;

  for (const menu of realMenus) {
    const filePath = path.join(photoDir, menu.photo);
    if (!existsSync(filePath)) {
      console.warn(`  ⚠️  Foto tidak ditemukan, dilewati: ${menu.photo}`);
      continue;
    }

    const ext = path.extname(menu.photo).toLowerCase();
    const contentType = MIME_BY_EXT[ext];
    if (!contentType) {
      console.warn(`  ⚠️  Tipe file tidak didukung, dilewati: ${menu.photo}`);
      continue;
    }

    const storagePath = `menus/${slugify(path.basename(menu.photo, ext))}${ext}`;
    const fileBuffer = await readFile(filePath);

    if (!DRY_RUN) {
      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
        contentType,
        upsert: true,
      });

      if (error) {
        console.error(`  ❌ Gagal upload "${menu.name}":`, error.message);
        continue;
      }
    }

    const publicUrl = DRY_RUN
      ? `${process.env.SUPABASE_URL?.replace(/\/$/, '')}/storage/v1/object/public/${BUCKET}/${storagePath}`
      : supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;

    images[menu.name] = { url: publicUrl, path: storagePath };
    uploaded += 1;
    console.log(`  ${DRY_RUN ? '🔎' : '✅'} ${menu.name} -> ${storagePath}`);
  }

  if (DRY_RUN) {
    console.log(`\n🔎 Dry run: ${uploaded}/${realMenus.length} foto siap diunggah (tidak ada perubahan).`);
    return;
  }

  await writeFile(
    outputFile,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        bucket: BUCKET,
        base_url: process.env.SUPABASE_URL,
        images,
      },
      null,
      2
    ) + '\n'
  );

  console.log(`\n🎉 ${uploaded}/${realMenus.length} foto diunggah.`);
  console.log(`   Mapping disimpan di ${path.relative(repoRoot, outputFile)}`);
};

uploadImages().catch((err) => {
  console.error('Upload gagal:', err.message);
  process.exit(1);
});
