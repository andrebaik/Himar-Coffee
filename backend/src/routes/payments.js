import { Router } from 'express';
import * as orderController from '../controllers/orderController.js';

const router = Router();

// Webhook Midtrans. Tanpa auth Bearer, tetapi diverifikasi lewat signature_key.
// URL ini dikonfigurasi di dasbor Midtrans (Payment Notification URL).
router.post('/notifications', orderController.paymentNotification);

export default router;
