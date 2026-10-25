import Joi from 'joi';

export const chatSchema = Joi.object({
  session_id: Joi.string()
    .trim()
    .min(8)
    .max(64)
    .pattern(/^[A-Za-z0-9_-]+$/)
    .required()
    .messages({
      'string.min': 'Session ID minimal 8 karakter',
      'string.max': 'Session ID maksimal 64 karakter',
      'string.pattern.base': 'Session ID hanya boleh memuat huruf, angka, garis bawah, dan tanda hubung',
      'any.required': 'Session ID wajib diisi',
    }),
  message: Joi.string()
    .trim()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.min': 'Pesan tidak boleh kosong',
      'string.max': 'Pesan maksimal 500 karakter',
      'any.required': 'Pesan wajib diisi',
    }),
});
