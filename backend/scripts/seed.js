import 'dotenv/config';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { realMenus, datasetEvents } from './real-menu-data.js';
import { assertSupabaseHost } from './preflight.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imageMapPath = path.join(__dirname, 'image-map.json');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);

const loadImageMap = async () => {
  if (!existsSync(imageMapPath)) {
    throw new Error(
      `Mapping foto belum ada: ${path.relative(process.cwd(), imageMapPath)}\n` +
        'Jalankan "npm run upload:images" terlebih dahulu.'
    );
  }

  const raw = await readFile(imageMapPath, 'utf8');
  return JSON.parse(raw).images ?? {};
};

const seed = async () => {
  await assertSupabaseHost();

  // Paksa perbarui URL foto menu yang sudah ada (dipakai setelah foto diganti).
  const FORCE_IMAGES = process.env.FORCE_IMAGES === '1';

  const images = await loadImageMap();
  console.log('🌱 Memulai seed dataset Himar Coffee...\n');

  let insertedMenus = 0;
  let updatedMenus = 0;
  let refreshedImages = 0;
  let skippedMenus = 0;

  for (const menu of realMenus) {
    const { photo, ...menuFields } = menu;
    const image = images[menu.name];

    const { data: existing } = await supabase
      .from('menus')
      .select('id, description, image_url')
      .eq('name', menu.name)
      .maybeSingle();

    if (existing) {
      const isDummy = String(existing.description ?? '').startsWith('[DUMMY]');

      if (!isDummy) {
        const shouldUpdateImage =
          image?.url && (FORCE_IMAGES || !existing.image_url) && existing.image_url !== image.url;

        if (shouldUpdateImage) {
          const { error } = await supabase
            .from('menus')
            .update({ image_url: image.url })
            .eq('id', existing.id);

          if (error) {
            console.error(`  ❌ Gagal memasang foto "${menu.name}":`, error.message);
            continue;
          }

          refreshedImages += 1;
          console.log(`  🖼️  Foto untuk menu "${menu.name}" dipasang.`);
        } else {
          skippedMenus += 1;
          console.log(`  ⏭️  Menu "${menu.name}" sudah ada, dilewati.`);
        }
        continue;
      }

      const { error } = await supabase
        .from('menus')
        .update({ ...menuFields, image_url: image?.url ?? existing.image_url ?? null })
        .eq('id', existing.id);

      if (error) {
        console.error(`  ❌ Gagal memperbarui menu "${menu.name}":`, error.message);
        continue;
      }

      updatedMenus += 1;
      console.log(`  ♻️  Menu dummy "${menu.name}" diperbarui dengan data asli.`);
      continue;
    }

    const { error } = await supabase.from('menus').insert({
      ...menuFields,
      image_url: image?.url ?? null,
    });

    if (error) {
      console.error(`  ❌ Gagal insert menu "${menu.name}":`, error.message);
      continue;
    }

    insertedMenus += 1;
    const photoNote = image ? '' : ' (tanpa foto — jalankan upload:images)';
    console.log(`  ✅ Menu "${menu.name}" ditambahkan${photoNote}.`);
  }

  console.log('\n📅 Seed event...\n');

  let insertedEvents = 0;
  let skippedEvents = 0;

  for (const event of datasetEvents) {
    const { data: existing } = await supabase
      .from('events')
      .select('id')
      .eq('title', event.title)
      .maybeSingle();

    if (existing) {
      skippedEvents += 1;
      console.log(`  ⏭️  Event "${event.title}" sudah ada, dilewati.`);
      continue;
    }

    const { error } = await supabase.from('events').insert(event);

    if (error) {
      console.error(`  ❌ Gagal insert event "${event.title}":`, error.message);
      continue;
    }

    insertedEvents += 1;
    console.log(`  ✅ Event "${event.title}" ditambahkan.`);
  }

  const parts = [
    `${insertedMenus} menu baru`,
    `${updatedMenus} dummy diperbarui`,
    `${refreshedImages} URL foto diperbarui`,
    `${skippedMenus} dilewati`,
  ];
  console.log(
    `\n🎉 Selesai: ${parts.join(', ')}; ` +
      `${insertedEvents} event baru, ${skippedEvents} dilewati.`
  );
  console.log('ℹ️  Data mengikuti Dataset Himar Coffee.xlsx; ubah harga via halaman admin bila perlu.');
};

seed().catch((err) => {
  console.error('Seed gagal:', err.message);
  process.exit(1);
});
