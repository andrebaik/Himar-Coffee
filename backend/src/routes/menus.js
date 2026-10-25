import { Router } from 'express';
import * as menuController from '../controllers/menuController.js';
import validate from '../middleware/validate.js';
import { menuQuerySchema, menuIdSchema } from '../validators/menuValidator.js';

const router = Router();

router.get('/', validate(menuQuerySchema, 'query'), menuController.getMenus);
router.get('/categories', menuController.getCategories);
router.get('/:id', validate(menuIdSchema, 'params'), menuController.getMenuById);

export default router;
