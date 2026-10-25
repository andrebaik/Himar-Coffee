import Joi from 'joi';

export const menuQuerySchema = Joi.object({
  category: Joi.string().trim().max(50).optional(),
  q: Joi.string().trim().max(100).optional(),
  featured: Joi.string().valid('true', 'false').optional(),
  available: Joi.string().valid('true', 'false').optional(),
});

export const menuIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'ID menu tidak valid',
  }),
});
