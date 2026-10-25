import { Router } from 'express';
import * as eventController from '../controllers/eventController.js';
import validate from '../middleware/validate.js';
import { eventQuerySchema, eventIdSchema } from '../validators/eventValidator.js';

const router = Router();

router.get('/', validate(eventQuerySchema, 'query'), eventController.getEvents);
router.get('/:id', validate(eventIdSchema, 'params'), eventController.getEventById);

export default router;
