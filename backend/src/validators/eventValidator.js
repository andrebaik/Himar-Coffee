import Joi from 'joi';

export const eventQuerySchema = Joi.object({
  scope: Joi.string().valid('upcoming', 'past', 'all').default('upcoming'),
});

export const eventIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'ID event tidak valid',
  }),
});
