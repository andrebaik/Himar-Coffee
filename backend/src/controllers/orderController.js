import * as whatsappService from '../services/whatsappService.js';
import * as orderService from '../services/orderService.js';
import { success } from '../utils/response.js';

export const createWhatsappOrderLink = async (req, res, next) => {
  try {
    const data = await whatsappService.generateWhatsappOrderLink(req.body);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const data = await orderService.createOrder(req.body);
    return success(res, data, 'Pesanan berhasil dibuat. Silakan lanjutkan pembayaran.', 201);
  } catch (err) {
    next(err);
  }
};

export const getOrderStatus = async (req, res, next) => {
  try {
    const data = await orderService.getOrderByCode(req.params.code);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

export const paymentNotification = async (req, res, next) => {
  try {
    const data = await orderService.handlePaymentNotification(req.body);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};
