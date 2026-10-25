import { Router } from 'express';
import multer from 'multer';
import * as adminController from '../controllers/adminController.js';
import requireAdmin from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { menuCreateSchema, eventCreateSchema, chatLogQuerySchema } from '../validators/adminValidator.js';
import { menuIdSchema } from '../validators/menuValidator.js';
import { eventIdSchema } from '../validators/eventValidator.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

// All admin routes require authentication
router.use(requireAdmin);

// Menu CRUD
router.post('/menus', validate(menuCreateSchema), adminController.createMenu);
router.put('/menus/:id', validate(menuIdSchema, 'params'), validate(menuCreateSchema), adminController.updateMenu);
router.delete('/menus/:id', validate(menuIdSchema, 'params'), adminController.deleteMenu);

// Event CRUD
router.post('/events', validate(eventCreateSchema), adminController.createEvent);
router.put('/events/:id', validate(eventIdSchema, 'params'), validate(eventCreateSchema), adminController.updateEvent);
router.delete('/events/:id', validate(eventIdSchema, 'params'), adminController.deleteEvent);
router.get('/events', adminController.getAllEvents);

// Upload
router.post('/uploads', upload.single('file'), adminController.uploadFile);

// Chat logs
router.get('/chat-logs', validate(chatLogQuerySchema, 'query'), adminController.getChatLogsHandler);

export default router;
