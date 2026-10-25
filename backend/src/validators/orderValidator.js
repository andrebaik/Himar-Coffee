import Joi from 'joi';

export const orderWhatsappSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        menu_id: Joi.string().uuid().required().messages({
          'string.guid': 'ID menu tidak valid',
          'any.required': 'ID menu wajib diisi',
        }),
        quantity: Joi.number().integer().min(1).max(50).required().messages({
          'number.min': 'Jumlah item minimal 1',
          'number.max': 'Jumlah item maksimal 50',
          'any.required': 'Jumlah item wajib diisi',
        }),
        variant: Joi.string().trim().max(50).optional().allow('', null),
      })
    )
    .min(1)
    .max(30)
    .required()
    .messages({
      'array.min': 'Pesanan minimal berisi 1 item',
      'array.max': 'Pesanan maksimal berisi 30 item',
      'any.required': 'Daftar item pesanan wajib diisi',
    }),
  note: Joi.string().trim().max(200).optional().allow('', null).messages({
    'string.max': 'Catatan maksimal 200 karakter',
  }),
});
