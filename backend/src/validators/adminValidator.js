import Joi from 'joi';

export const menuCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Nama menu minimal 2 karakter',
    'string.max': 'Nama menu maksimal 100 karakter',
    'any.required': 'Nama menu wajib diisi',
  }),
  description: Joi.string().max(1000).allow('', null).optional().messages({
    'string.max': 'Deskripsi maksimal 1000 karakter',
  }),
  price: Joi.number().integer().min(0).max(10000000).required().messages({
    'number.min': 'Harga tidak boleh negatif',
    'number.max': 'Harga maksimal Rp10.000.000',
    'any.required': 'Harga wajib diisi',
  }),
  category: Joi.string().trim().min(2).max(50).required().messages({
    'string.min': 'Kategori minimal 2 karakter',
    'string.max': 'Kategori maksimal 50 karakter',
    'any.required': 'Kategori wajib diisi',
  }),
  variants: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().min(1).max(50).required().messages({
          'any.required': 'Nama varian wajib diisi',
          'string.max': 'Nama varian maksimal 50 karakter',
        }),
        extra_price: Joi.number().integer().min(0).default(0).messages({
          'number.min': 'Harga tambahan varian tidak boleh negatif',
        }),
      })
    )
    .max(10)
    .default([])
    .messages({
      'array.max': 'Maksimal 10 varian',
    }),
  image_url: Joi.string().uri().allow('', null).optional(),
  is_featured: Joi.boolean().default(false),
  is_available: Joi.boolean().default(true),
});

export const eventCreateSchema = Joi.object({
  title: Joi.string().trim().min(3).max(120).required().messages({
    'string.min': 'Judul event minimal 3 karakter',
    'string.max': 'Judul event maksimal 120 karakter',
    'any.required': 'Judul event wajib diisi',
  }),
  description: Joi.string().max(2000).allow('', null).optional().messages({
    'string.max': 'Deskripsi maksimal 2000 karakter',
  }),
  event_date: Joi.date().iso().required().messages({
    'date.format': 'Format tanggal harus ISO 8601',
    'any.required': 'Tanggal event wajib diisi',
  }),
  location: Joi.string().max(200).allow('', null).optional().messages({
    'string.max': 'Lokasi maksimal 200 karakter',
  }),
  image_url: Joi.string().uri().allow('', null).optional(),
  is_published: Joi.boolean().default(true),
});

export const uploadFolderSchema = Joi.object({
  folder: Joi.string().valid('menus', 'events').required().messages({
    'any.only': 'Folder harus menus atau events',
    'any.required': 'Folder wajib diisi',
  }),
});

export const chatLogQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  intent: Joi.string().trim().optional(),
});
