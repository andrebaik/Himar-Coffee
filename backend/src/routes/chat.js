import { Router } from 'express';
import * as chatController from '../controllers/chatController.js';
import validate from '../middleware/validate.js';
import { chatLimiter } from '../middleware/rateLimit.js';
import { chatSchema } from '../validators/chatValidator.js';

const router = Router();

router.post('/', chatLimiter, validate(chatSchema), chatController.handleChat);

export default router;
