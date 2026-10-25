import { supabaseAdmin } from '../config/supabase.js';
import { config } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const formatRupiah = (num) => {
  return 'Rp' + num.toLocaleString('id-ID');
};

export const generateWhatsappOrderLink = async ({ items, note }) => {
  const menuIds = [...new Set(items.map((i) => i.menu_id))];

  // Fetch menus from database
  const { data: menus, error } = await supabaseAdmin
    .from('menus')
    .select('id, name, price, variants, is_available')
    .in('id', menuIds);

  if (error) {
    throw new AppError('INTERNAL_ERROR', 500, 'Gagal mengambil data menu');
  }

  const menuMap = new Map((menus || []).map((m) => [m.id, m]));

  // Check existence
  for (const item of items) {
    const menu = menuMap.get(item.menu_id);
    if (!menu) {
      throw new AppError(
        'VALIDATION_ERROR',
        400,
        `Menu dengan ID ${item.menu_id} tidak ditemukan`,
        [{ field: 'items', message: `Menu dengan ID ${item.menu_id} tidak ditemukan` }]
      );
    }
  }

  // Check availability
  for (const item of items) {
    const menu = menuMap.get(item.menu_id);
    if (!menu.is_available) {
      throw new AppError(
        'VALIDATION_ERROR',
        400,
        `Menu "${menu.name}" saat ini sedang tidak tersedia`,
        [{ field: 'items', message: `Menu "${menu.name}" tidak tersedia` }]
      );
    }
  }

  // Calculate pricing & build lines
  let grandTotal = 0;
  const lines = [];

  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const menu = menuMap.get(item.menu_id);
    let unitPrice = menu.price;
    let variantLabel = '';

    if (item.variant && item.variant.trim()) {
      const vName = item.variant.trim();
      const variantList = Array.isArray(menu.variants) ? menu.variants : [];
      const foundVariant = variantList.find(
        (v) => v.name.toLowerCase() === vName.toLowerCase()
      );

      if (!foundVariant) {
        throw new AppError(
          'VALIDATION_ERROR',
          400,
          `Varian "${vName}" tidak ditemukan pada menu "${menu.name}"`,
          [{ field: 'items', message: `Varian "${vName}" tidak valid untuk menu "${menu.name}"` }]
        );
      }

      unitPrice += foundVariant.extra_price || 0;
      variantLabel = ` (${foundVariant.name})`;
    }

    const itemTotal = unitPrice * item.quantity;
    grandTotal += itemTotal;

    lines.push(
      `${idx + 1}. ${menu.name}${variantLabel} x${item.quantity} - ${formatRupiah(itemTotal)}`
    );
  }

  // Construct message text
  let text = 'Halo Himar Coffee Garut, saya ingin memesan:\n';
  text += lines.join('\n') + '\n\n';
  text += `Total: ${formatRupiah(grandTotal)}\n`;

  if (note && note.trim()) {
    text += `Catatan: ${note.trim()}\n`;
  }

  text += '\nNama pemesan:\nMohon konfirmasi ketersediaan. Terima kasih!';

  const waNumber = config.WHATSAPP_NUMBER.replace(/\D/g, '');
  const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;

  return {
    url,
    text,
    total: grandTotal,
  };
};
