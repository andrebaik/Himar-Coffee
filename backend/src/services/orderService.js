import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { config } from '../config/env.js';
import { getSnapClient } from '../config/midtrans.js';
import { AppError } from '../utils/AppError.js';

const SIGNATURE_CATEGORY = 'Signature Coffee';

const formatRupiah = (num) => 'Rp' + num.toLocaleString('id-ID');

const generateOrderCode = () => {
  const random = crypto.randomBytes(6).toString('hex').toUpperCase().slice(0, 8);
  return `HIMAR-${random}`;
};

/**
 * Validasi item pesanan terhadap database dan hitung harga server-side.
 * Mengembalikan snapshot item + subtotal asli + subtotal efektif
 * (menu signature dihitung ganda untuk uji minimum order delivery).
 */
const resolveItems = async (items) => {
  const menuIds = [...new Set(items.map((i) => i.menu_id))];

  const { data: menus, error } = await supabaseAdmin
    .from('menus')
    .select('id, name, price, category, variants, is_available')
    .in('id', menuIds);

  if (error) {
    throw new AppError('INTERNAL_ERROR', 500, 'Gagal mengambil data menu');
  }

  const menuMap = new Map((menus || []).map((m) => [m.id, m]));

  const snapshot = [];
  let subtotal = 0;
  let effectiveSubtotal = 0;

  for (const item of items) {
    const menu = menuMap.get(item.menu_id);

    if (!menu) {
      throw new AppError('VALIDATION_ERROR', 400, `Menu dengan ID ${item.menu_id} tidak ditemukan`, [
        { field: 'items', message: `Menu dengan ID ${item.menu_id} tidak ditemukan` },
      ]);
    }

    if (!menu.is_available) {
      throw new AppError('VALIDATION_ERROR', 400, `Menu "${menu.name}" saat ini sedang tidak tersedia`, [
        { field: 'items', message: `Menu "${menu.name}" tidak tersedia` },
      ]);
    }

    let unitPrice = menu.price;
    let variantLabel = null;

    if (item.variant && item.variant.trim()) {
      const vName = item.variant.trim();
      const variantList = Array.isArray(menu.variants) ? menu.variants : [];
      const foundVariant = variantList.find((v) => v.name.toLowerCase() === vName.toLowerCase());

      if (!foundVariant) {
        throw new AppError(
          'VALIDATION_ERROR',
          400,
          `Varian "${vName}" tidak ditemukan pada menu "${menu.name}"`,
          [{ field: 'items', message: `Varian "${vName}" tidak valid untuk menu "${menu.name}"` }]
        );
      }

      unitPrice += foundVariant.extra_price || 0;
      variantLabel = foundVariant.name;
    }

    const isSignature = menu.category === SIGNATURE_CATEGORY;
    const lineTotal = unitPrice * item.quantity;

    subtotal += lineTotal;
    effectiveSubtotal += lineTotal * (isSignature ? 2 : 1);

    snapshot.push({
      menu_id: menu.id,
      name: menu.name,
      variant: variantLabel,
      unit_price: unitPrice,
      quantity: item.quantity,
      is_signature: isSignature,
    });
  }

  return { snapshot, subtotal, effectiveSubtotal };
};

/**
 * Aturan Himar Delivery (amandemen spec 15.3):
 * - delivery: subtotal efektif (signature dihitung ganda) harus >= DELIVERY_MIN_ORDER
 * - pickup: tanpa minimum
 */
const validateDeliveryRules = (fulfillmentType, effectiveSubtotal) => {
  if (fulfillmentType !== 'delivery') return;

  const minimum = config.DELIVERY_MIN_ORDER;
  if (effectiveSubtotal < minimum) {
    const shortage = minimum - effectiveSubtotal;
    throw new AppError(
      'VALIDATION_ERROR',
      400,
      `Minimum pesanan Himar Delivery adalah ${formatRupiah(minimum)}. Kurang ${formatRupiah(
        shortage
      )} lagi — menu signature dihitung ganda, coba tambah menu signature favoritmu!`,
      [{ field: 'items', message: `Kurang ${formatRupiah(shortage)} dari minimum order delivery` }]
    );
  }
};

/**
 * Buat pesanan baru + transaksi Midtrans Snap.
 */
export const createOrder = async (payload) => {
  const { items, note, customer_name, customer_phone, fulfillment_type, delivery_address } = payload;

  const { snapshot, subtotal, effectiveSubtotal } = await resolveItems(items);
  validateDeliveryRules(fulfillment_type, effectiveSubtotal);

  const deliveryFee = fulfillment_type === 'delivery' ? config.DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  if (fulfillment_type === 'delivery' && (!delivery_address || !delivery_address.trim())) {
    throw new AppError('VALIDATION_ERROR', 400, 'Alamat pengiriman wajib diisi untuk Himar Delivery', [
      { field: 'delivery_address', message: 'Alamat pengiriman wajib diisi' },
    ]);
  }

  const snap = getSnapClient();
  if (!snap) {
    throw new AppError(
      'INTERNAL_ERROR',
      500,
      'Pembayaran belum dikonfigurasi. Silakan hubungi kedai atau pesan via WhatsApp.'
    );
  }

  let order = null;
  for (let attempt = 0; attempt < 3 && !order; attempt += 1) {
    const orderCode = generateOrderCode();
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert({
        order_code: orderCode,
        customer_name,
        customer_phone,
        fulfillment_type,
        delivery_address: fulfillment_type === 'delivery' ? delivery_address.trim() : null,
        note: note && note.trim() ? note.trim() : null,
        items: snapshot,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        status: 'pending',
      })
      .select()
      .single();

    if (!error) order = data;
  }

  if (!order) {
    throw new AppError('INTERNAL_ERROR', 500, 'Gagal menyimpan pesanan');
  }

  const itemDetails = snapshot.map((item) => ({
    id: item.menu_id,
    price: item.unit_price,
    quantity: item.quantity,
    name: item.variant ? `${item.name} (${item.variant})` : item.name,
  }));

  if (deliveryFee > 0) {
    itemDetails.push({
      id: 'DELIVERY_FEE',
      price: deliveryFee,
      quantity: 1,
      name: 'Ongkir Himar Delivery',
    });
  }

  let snapResponse;
  try {
    snapResponse = await snap.createTransaction({
      transaction_details: {
        order_id: order.order_code,
        gross_amount: total,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: customer_name,
        phone: customer_phone,
      },
      credit_card: { secure: false },
    });
  } catch (err) {
    // Transaksi Snap gagal dibuat: tandai pesanan gagal agar tidak menggantung.
    await supabaseAdmin
      .from('orders')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', order.id);

    throw new AppError(
      'PAYMENT_UNAVAILABLE',
      503,
      'Layanan pembayaran sedang tidak tersedia. Coba lagi sebentar atau pesan via WhatsApp.'
    );
  }

  return {
    order_code: order.order_code,
    snap_token: snapResponse.token,
    redirect_url: snapResponse.redirect_url,
    total,
    subtotal,
    delivery_fee: deliveryFee,
  };
};

/**
 * Ambil status pesanan untuk halaman publik (tanpa data sensitif berlebih).
 */
export const getOrderByCode = async (orderCode) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(
      'order_code, customer_name, fulfillment_type, delivery_address, note, items, subtotal, delivery_fee, total, status, midtrans_payment_type, created_at, paid_at'
    )
    .eq('order_code', orderCode)
    .maybeSingle();

  if (error || !data) {
    throw new AppError('NOT_FOUND', 404, 'Pesanan tidak ditemukan');
  }

  return data;
};

const mapTransactionStatus = (transactionStatus, fraudStatus) => {
  switch (transactionStatus) {
    case 'capture':
      if (fraudStatus === 'challenge') return 'pending';
      if (fraudStatus === 'deny') return 'failed';
      return 'paid';
    case 'settlement':
      return 'paid';
    case 'deny':
    case 'cancel':
    case 'refund':
      return 'failed';
    case 'expire':
      return 'expired';
    case 'pending':
    default:
      return 'pending';
  }
};

/**
 * Webhook notifikasi Midtrans. Validasi pembayaran hanya lewat sini.
 */
export const handlePaymentNotification = async (payload) => {
  const orderId = payload?.order_id;
  const statusCode = payload?.status_code;
  const grossAmount = payload?.gross_amount;
  const signatureKey = payload?.signature_key;
  const transactionStatus = payload?.transaction_status;
  const fraudStatus = payload?.fraud_status || 'accept';

  if (!orderId || !statusCode || !grossAmount || !signatureKey || !transactionStatus) {
    throw new AppError('VALIDATION_ERROR', 400, 'Payload notifikasi tidak lengkap');
  }

  const expectedSignature = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${config.MIDTRANS_SERVER_KEY}`)
    .digest('hex');

  if (expectedSignature !== signatureKey) {
    throw new AppError('FORBIDDEN', 403, 'Signature notifikasi tidak valid');
  }

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, total, status')
    .eq('order_code', orderId)
    .maybeSingle();

  if (error || !order) {
    throw new AppError('NOT_FOUND', 404, 'Pesanan tidak ditemukan');
  }

  const notifiedAmount = Math.round(parseFloat(grossAmount));
  if (Number.isNaN(notifiedAmount) || notifiedAmount !== order.total) {
    throw new AppError('FORBIDDEN', 403, 'Nominal notifikasi tidak sesuai pesanan');
  }

  // Status paid tidak boleh ditimpa mundur oleh notifikasi lama/berulang.
  if (order.status === 'paid') {
    return { order_code: orderId, status: order.status, changed: false };
  }

  const nextStatus = mapTransactionStatus(transactionStatus, fraudStatus);
  const isPaid = nextStatus === 'paid';

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: nextStatus,
      midtrans_transaction_id: payload.transaction_id || null,
      midtrans_payment_type: payload.payment_type || null,
      paid_at: isPaid ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)
    .select('order_code, status')
    .single();

  if (updateError || !updated) {
    throw new AppError('INTERNAL_ERROR', 500, 'Gagal memperbarui status pesanan');
  }

  return { order_code: updated.order_code, status: updated.status, changed: true };
};
