import 'dotenv/config';
import { readFile, writeFile, mkdtemp, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { execFileSync } from 'child_process';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { realMenus } from './real-menu-data.js';
import { assertSupabaseHost } from './preflight.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const photoDir = process.env.PHOTO_DIR
  ? path.resolve(process.env.PHOTO_DIR)
  : path.join(repoRoot, 'product-photos');
const outputFile = path.join(__dirname, 'image-map.json');

const BUCKET = 'menu-images';
const DRY_RUN = process.env.DRY_RUN === '1' || process.argv.includes('--dry-run');
// Naikkan versi ini saat foto diganti, agar CDN/browser tidak memakai cache lama.
const IMAGE_VERSION = process.env.IMAGE_VERSION;
const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

// PNG hasil upscale bisa ~350 KB/foto. WebP memotongnya drastis tanpa
// penurunan kualitas yang terlihat. Set IMAGE_FORMAT=png untuk menonaktifkan.
const IMAGE_FORMAT = (process.env.IMAGE_FORMAT ?? 'webp').toLowerCase();
const WEBP_QUALITY = process.env.WEBP_QUALITY ?? '82';

const hasMagick = () => {
  try {
    execFileSync('magick', ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
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
  // Dry run hanya memvalidasi file & mapping, tidak butuh jaringan.
  if (!DRY_RUN) await assertSupabaseHost();

  if (!existsSync(photoDir)) {
    throw new Error(
      `Folder foto tidak ditemukan: ${photoDir}\n` +
        'Letakkan foto produk di folder product-photos/ atau set PHOTO_DIR.'
    );
  }

  const images = {};
  let uploaded = 0;
  const canConvert = IMAGE_FORMAT === 'webp' && hasMagick();
  if (IMAGE_FORMAT === 'webp' && !canConvert) {
    console.warn('  ⚠️  ImageMagick tidak ada: foto diunggah sebagai file asli.');
  }

  for (const menu of realMenus) {
    const filePath = path.join(photoDir, menu.photo);
    if (!existsSync(filePath)) {
      console.warn(`  ⚠️  Foto tidak ditemukan, dilewati: ${menu.photo}`);
      continue;
    }

    const sourceExt = path.extname(menu.photo).toLowerCase();
    const contentType = MIME_BY_EXT[sourceExt];
    if (!contentType) {
      console.warn(`  ⚠️  Tipe file tidak didukung, dilewati: ${menu.photo}`);
      continue;
    }

    const outExt = canConvert ? '.webp' : sourceExt;
    const outType = canConvert ? 'image/webp' : contentType;
    const storagePath = `menus/${slugify(path.basename(menu.photo, sourceExt))}${outExt}`;

    let fileBuffer;
    if (canConvert && sourceExt !== '.webp') {
      const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'himar-img-'));
      const tmpFile = path.join(tmpDir, 'out.webp');
      try {
        execFileSync('magick', [filePath, '-strip', '-quality', WEBP_QUALITY, tmpFile]);
        fileBuffer = await readFile(tmpFile);
      } finally {
        await rm(tmpDir, { recursive: true, force: true });
      }
    } else {
      fileBuffer = await readFile(filePath);
    }

    if (!DRY_RUN) {
      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
        contentType: outType,
        upsert: true,
      });

      if (error) {
        console.error(`  ❌ Gagal upload "${menu.name}":`, error.message);
        continue;
      }
    }

    const rawUrl = DRY_RUN
      ? `${process.env.SUPABASE_URL?.replace(/\/$/, '')}/storage/v1/object/public/${BUCKET}/${storagePath}`
      : supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
    const publicUrl = IMAGE_VERSION ? `${rawUrl}?v=${IMAGE_VERSION}` : rawUrl;

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
