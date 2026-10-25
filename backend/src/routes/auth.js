import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import validate from '../middleware/validate.js';
import requireAdmin from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { loginSchema, refreshSchema } from '../validators/authValidator.js';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.get('/me', requireAdmin, authController.me);

export default router;
