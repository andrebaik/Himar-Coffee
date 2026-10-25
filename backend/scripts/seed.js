import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);

const menus = [
  {
    name: 'The Lost Sheep',
    description: '[DUMMY] Signature coffee blend dengan sentuhan karamel dan cokelat, menjadi menu andalan Himar Coffee.',
    price: 25000,
    category: 'Kopi',
    variants: [
      { name: 'Hot', extra_price: 0 },
      { name: 'Iced', extra_price: 3000 },
    ],
    is_featured: true,
    is_available: true,
  },
  {
    name: 'Merry Gloss',
    description: '[DUMMY] Minuman kopi susu dengan glaze berry yang segar dan manis, favorit pelanggan.',
    price: 28000,
    category: 'Kopi',
    variants: [
      { name: 'Hot', extra_price: 0 },
      { name: 'Iced', extra_price: 3000 },
    ],
    is_featured: true,
    is_available: true,
  },
  {
    name: 'Espresso',
    description: '[DUMMY] Espresso klasik dengan biji kopi pilihan dari Garut.',
    price: 18000,
    category: 'Kopi',
    variants: [
      { name: 'Single Shot', extra_price: 0 },
      { name: 'Double Shot', extra_price: 5000 },
    ],
    is_featured: false,
    is_available: true,
  },
  {
    name: 'Matcha Latte',
    description: '[DUMMY] Matcha premium dari Jepang dengan susu segar.',
    price: 30000,
    category: 'Non-Kopi',
    variants: [
      { name: 'Hot', extra_price: 0 },
      { name: 'Iced', extra_price: 3000 },
    ],
    is_featured: false,
    is_available: true,
  },
  {
    name: 'Cokelat Hangat',
    description: '[DUMMY] Cokelat Belgia dengan susu segar, cocok untuk malam yang dingin di Garut.',
    price: 25000,
    category: 'Non-Kopi',
    variants: [
      { name: 'Regular', extra_price: 0 },
      { name: 'Large', extra_price: 5000 },
    ],
    is_featured: false,
    is_available: true,
  },
  {
    name: 'Roti Bakar Cokelat',
    description: '[DUMMY] Roti bakar dengan selai cokelat premium dan keju.',
    price: 20000,
    category: 'Makanan',
    variants: [],
    is_featured: false,
    is_available: true,
  },
  {
    name: 'Pisang Goreng Keju',
    description: '[DUMMY] Pisang goreng crispy dengan taburan keju dan saus cokelat.',
    price: 18000,
    category: 'Makanan',
    variants: [],
    is_featured: false,
    is_available: true,
  },
  {
    name: 'Nasi Goreng Spesial',
    description: '[DUMMY] Nasi goreng dengan topping telur, ayam, dan kerupuk.',
    price: 28000,
    category: 'Makanan',
    variants: [
      { name: 'Regular', extra_price: 0 },
      { name: 'Extra Pedas', extra_price: 3000 },
    ],
    is_featured: false,
    is_available: true,
  },
];

const events = [
  {
    title: '[DUMMY] Live Acoustic Night',
    description: '[DUMMY] Malam akustik bersama musisi lokal Garut. Nikmati kopi sambil mendengarkan musik live.',
    event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Indoor Stage, Himar Coffee',
    is_published: true,
  },
  {
    title: '[DUMMY] Latte Art Workshop',
    description: '[DUMMY] Belajar membuat latte art dari barista profesional. Terbatas untuk 15 peserta.',
    event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Brewing Bar, Himar Coffee',
    is_published: true,
  },
  {
    title: '[DUMMY] Komunitas Kopi Garut Meetup',
    description: '[DUMMY] Pertemuan rutin komunitas pecinta kopi Garut. Sharing session dan cupping bersama.',
    event_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Outdoor Area, Himar Coffee',
    is_published: true,
  },
];

async function seed() {
  console.log('🌱 Memulai seed data...\n');

  // Seed menus
  for (const menu of menus) {
    const { data: existing } = await supabase
      .from('menus')
      .select('id')
      .eq('name', menu.name)
      .single();

    if (existing) {
      console.log(`  ⏭️  Menu "${menu.name}" sudah ada, dilewati.`);
    } else {
      const { error } = await supabase.from('menus').insert(menu);
      if (error) {
        console.error(`  ❌ Gagal insert menu "${menu.name}":`, error.message);
      } else {
        console.log(`  ✅ Menu "${menu.name}" berhasil ditambahkan.`);
      }
    }
  }

  console.log('');

  // Seed events
  for (const event of events) {
    const { data: existing } = await supabase
      .from('events')
      .select('id')
      .eq('title', event.title)
      .single();

    if (existing) {
      console.log(`  ⏭️  Event "${event.title}" sudah ada, dilewati.`);
    } else {
      const { error } = await supabase.from('events').insert(event);
      if (error) {
        console.error(`  ❌ Gagal insert event "${event.title}":`, error.message);
      } else {
        console.log(`  ✅ Event "${event.title}" berhasil ditambahkan.`);
      }
    }
  }

  console.log('\n🎉 Seed selesai!');
}

seed().catch((err) => {
  console.error('Seed gagal:', err);
  process.exit(1);
});
