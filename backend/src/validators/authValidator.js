import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Format email tidak valid',
    'any.required': 'Email wajib diisi',
  }),
  password: Joi.string().min(1).required().messages({
    'any.required': 'Kata sandi wajib diisi',
  }),
});

export const refreshSchema = Joi.object({
  refresh_token: Joi.string().required().messages({
    'any.required': 'Refresh token wajib diisi',
  }),
});
