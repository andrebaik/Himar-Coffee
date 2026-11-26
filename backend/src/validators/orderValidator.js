import Joi from 'joi';

const itemsSchema = Joi.array()
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
  });

const noteSchema = Joi.string().trim().max(200).optional().allow('', null).messages({
  'string.max': 'Catatan maksimal 200 karakter',
});

export const orderWhatsappSchema = Joi.object({
  items: itemsSchema,
  note: noteSchema,
});

export const createOrderSchema = Joi.object({
  items: itemsSchema,
  note: noteSchema,
  customer_name: Joi.string().trim().min(2).max(60).required().messages({
    'string.min': 'Nama minimal 2 karakter',
    'string.max': 'Nama maksimal 60 karakter',
    'any.required': 'Nama pemesan wajib diisi',
  }),
  customer_phone: Joi.string()
    .trim()
    .custom((value, helpers) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 9 || digits.length > 16) {
        return helpers.error('format');
      }
      if (!/^(0|62|8)\d+$/.test(digits)) {
        return helpers.error('format');
      }
      return value;
    })
    .required()
    .messages({
      format: 'Nomor HP tidak valid (contoh: 081234567890)',
      'any.required': 'Nomor HP wajib diisi',
    }),
  fulfillment_type: Joi.string().valid('pickup', 'delivery').required().messages({
    'any.only': 'Metode pesanan harus pickup atau delivery',
    'any.required': 'Metode pesanan wajib dipilih',
  }),
  delivery_address: Joi.string().trim().max(250).optional().allow('', null).messages({
    'string.max': 'Alamat maksimal 250 karakter',
  }),
  delivery_map_url: Joi.string()
    .trim()
    .max(500)
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Link Google Maps maksimal 500 karakter',
      'string.uri': 'Link lokasi harus berupa URL yang valid (mis. link Google Maps)',
    }),
});
