import { supabaseAdmin } from '../config/supabase.js';

const formatRupiah = (num) => 'Rp' + num.toLocaleString('id-ID');

export const getMockReply = async (message) => {
  const lower = message.toLowerCase();

  // 1. Pemesanan intent takes precedence when order verbs appear
  if (/(pesan|order|beli|checkout|cara pesan)/i.test(lower)) {
    return {
      intent: 'pemesanan',
      confidence: 0.95,
      reply:
        'Untuk memesan, kamu bisa menambahkan menu ke keranjang di website ini lalu klik tombol "Pesan via WhatsApp". Kamu juga bisa langsung chat barista kami melalui WhatsApp!',
    };
  }

  // 2. Keluhan intent
  if (/(keluhan|kecewa|lambat|komplain|kritik|masalah|saran)/i.test(lower)) {
    return {
      intent: 'keluhan',
      confidence: 0.95,
      reply:
        'Mohon maaf atas ketidaknyamanan yang kamu alami. Kami sangat menghargai setiap masukan untuk peningkatan pelayanan Himar Coffee Garut. Silakan sampaikan pesan langsung ke pengelola kami.',
    };
  }

  // 3. Tanya event
  if (/(event|acara|jadwal|komunitas|workshop|live music|akustik)/i.test(lower)) {
    let reply = 'Halo! Berikut adalah jadwal event di Himar Coffee Garut:';
    try {
      const now = new Date().toISOString();
      const { data: events } = await supabaseAdmin
        .from('events')
        .select('title, event_date')
        .eq('is_published', true)
        .gte('event_date', now)
        .order('event_date', { ascending: true })
        .limit(3);

      if (events && events.length > 0) {
        const lines = events.map(
          (e, idx) =>
            `${idx + 1}. ${e.title} (${new Date(e.event_date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })})`
        );
        reply += '\n' + lines.join('\n') + '\n\nYuk datang dan ramaikan bersama teman-teman!';
      } else {
        reply = 'Saat ini belum ada event mendatang yang dijadwalkan. Silakan pantau terus jadwal event kami!';
      }
    } catch {
      reply = 'Silakan cek jadwal event kami untuk informasi acara terbaru!';
    }

    return {
      intent: 'tanya_event',
      confidence: 0.95,
      reply,
    };
  }

  // 4. Tanya menu
  if (/(menu|harga|kopi|minum|makan|katalog|daftar)/i.test(lower)) {
    let reply = 'Halo! Di Himar Coffee Garut ada berbagai menu pilihan, antara lain:';
    try {
      const { data: menus } = await supabaseAdmin
        .from('menus')
        .select('name, price')
        .eq('is_available', true)
        .order('is_featured', { ascending: false })
        .limit(3);

      if (menus && menus.length > 0) {
        const lines = menus.map(
          (m, idx) => `${idx + 1}. ${m.name} - ${formatRupiah(m.price)}`
        );
        reply += '\n' + lines.join('\n') + '\n\nSilakan cek menu lengkap kami untuk melihat seluruh varian!';
      } else {
        reply += '\n1. The Lost Sheep - Rp25.000\n2. Merry Gloss - Rp28.000\n\nSilakan cek menu lengkap kami!';
      }
    } catch {
      reply += '\n1. The Lost Sheep - Rp25.000\n2. Merry Gloss - Rp28.000';
    }

    return {
      intent: 'tanya_menu',
      confidence: 0.95,
      reply,
    };
  }

  // 5. Di luar konteks
  return {
    intent: 'di_luar_konteks',
    confidence: 0.9,
    reply:
      'Maaf, aku hanya bisa membantu seputar menu, event, dan pemesanan di Himar Coffee Garut.',
  };
};
