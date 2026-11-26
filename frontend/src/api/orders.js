import client from './client.js';

/**
 * Amandemen v2: checkout online dengan Midtrans Snap.
 */
export const createOrder = async (payload) => {
  const res = await client.post('/orders', payload);
  return res.data.data;
};

export const getOrderStatus = async (orderCode) => {
  const res = await client.get(`/orders/${orderCode}`);
  return res.data.data;
};

export const createWhatsappOrderLink = async (payload) => {
  const res = await client.post('/orders/whatsapp-link', payload);
  return res.data.data;
};
