import { Router } from 'express';
import * as orderController from '../controllers/orderController.js';
import validate from '../middleware/validate.js';
import { orderWhatsappSchema, createOrderSchema } from '../validators/orderValidator.js';
import { orderLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Amandemen spec 15.4: checkout utama via Midtrans Snap.
router.post('/', orderLimiter, validate(createOrderSchema), orderController.createOrder);
router.get('/:code', orderController.getOrderStatus);

// Fallback lama: pesan via WhatsApp (tetap dipertahankan).
router.post('/whatsapp-link', validate(orderWhatsappSchema), orderController.createWhatsappOrderLink);

export default router;
