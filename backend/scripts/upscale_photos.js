import { execFileSync } from 'child_process';
import { readdir, mkdir, copyFile, rename, stat, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Perbaiki foto produk beresolusi rendah (aslinya 67-237 px) agar tidak burem
// saat ditampilkan di kartu menu.
//
// Prioritas: Real-ESRGAN (AI, hasil paling tajam) -> fallback ImageMagick Lanczos.
// Pasang Real-ESRGAN (opsional):
//   https://github.com/xinntao/Real-ESRGAN/releases (realesrgan-ncnn-vulkan)
//   lalu set env REALESRGAN=/path/ke/realesrgan-ncnn-vulkan
//
// Jalankan dari folder backend/: node scripts/upscale_photos.js
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const photoDir = path.join(repoRoot, 'product-photos');
const backupDir = path.join(photoDir, '_originals');

// Real-ESRGAN menskalakan 4x. Batas akhir menjaga ukuran file tetap wajar.
const MAX_DIMENSION = 1200;

const hasCommand = (cmd) => {
  try {
    execFileSync(cmd, ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const findRealEsrgan = () => {
  const candidates = [
    process.env.REALESRGAN,
    path.join(repoRoot, 'tools/realesrgan-ncnn-vulkan'),
    '/tmp/opencode/esrgan/realesrgan-ncnn-vulkan',
  ].filter(Boolean);

  return candidates.find((candidate) => existsSync(candidate)) ?? null;
};

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '_originals') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.name.toLowerCase().endsWith('.png')) files.push(full);
  }
  return files;
};

const run = async () => {
  if (!existsSync(photoDir)) throw new Error(`Folder tidak ditemukan: ${photoDir}`);

  const realEsrgan = findRealEsrgan();
  const hasMagick = hasCommand('magick');

  if (!realEsrgan && !hasMagick) {
    throw new Error(
      'Butuh Real-ESRGAN atau ImageMagick (`magick`).\n' +
        'Lihat komentar di atas file ini untuk cara pasang.'
    );
  }

  await mkdir(backupDir, { recursive: true });
  const files = await walk(photoDir);
  let processed = 0;
  let skipped = 0;

  console.log(
    realEsrgan ? '🔎 Memakai Real-ESRGAN (AI 4x)' : '🔎 Memakai ImageMagick Lanczos'
  );

  for (const file of files) {
    const rel = path.relative(photoDir, file);
    const backup = path.join(backupDir, rel);
    await mkdir(path.dirname(backup), { recursive: true });
    if (!existsSync(backup)) await copyFile(file, backup);

    const source = backup;
    const tmpRaw = `${file}.raw.png`;
    const tmpOut = `${file}.tmp.png`;

    if (realEsrgan) {
      execFileSync(realEsrgan, ['-i', source, '-o', tmpRaw, '-n', 'realesrgan-x4plus', '-s', '4'], {
        stdio: 'ignore',
      });
    } else {
      await copyFile(source, tmpRaw);
    }

    if (hasMagick) {
      execFileSync('magick', [
        tmpRaw,
        '-resize', `${MAX_DIMENSION}x${MAX_DIMENSION}>`,
        '-strip',
        tmpOut,
      ]);
    } else {
      await copyFile(tmpRaw, tmpOut);
    }

    await rename(tmpOut, file);
    await unlink(tmpRaw).catch(() => {});
    const { size: oldSize } = await stat(source);
    const { size: newSize } = await stat(file);
    processed += 1;
    console.log(
      `  ✅ ${rel} (${Math.round(oldSize / 1024)} KB -> ${Math.round(newSize / 1024)} KB)`
    );
  }

  console.log(`\n🎉 ${processed} foto diproses (${skipped} dilewati).`);
  console.log('   Lanjut: npm run upload:images && npm run seed');
};

run().catch((err) => {
  console.error('Upscale gagal:', err.message);
  process.exit(1);
});
