import midtransClient from 'midtrans-client';
import { config } from './env.js';

let snapClient = null;

/**
 * Klien Midtrans Snap. Dibuat lazy agar aplikasi tetap bisa start
 * (mis. untuk endpoint publik lain) meski kunci Midtrans belum diisi.
 */
export const getSnapClient = () => {
  if (!config.MIDTRANS_SERVER_KEY || !config.MIDTRANS_CLIENT_KEY) {
    return null;
  }
  if (!snapClient) {
    snapClient = new midtransClient.Snap({
      isProduction: config.MIDTRANS_IS_PRODUCTION,
      serverKey: config.MIDTRANS_SERVER_KEY,
      clientKey: config.MIDTRANS_CLIENT_KEY,
    });
  }
  return snapClient;
};
