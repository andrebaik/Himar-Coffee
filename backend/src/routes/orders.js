import { Router } from 'express';
import * as orderController from '../controllers/orderController.js';
import validate from '../middleware/validate.js';
import { orderWhatsappSchema } from '../validators/orderValidator.js';

const router = Router();

router.post('/whatsapp-link', validate(orderWhatsappSchema), orderController.createWhatsappOrderLink);

export default router;
