import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().default('development'),
  PORT: Joi.number().default(4000),
  FRONTEND_URL: Joi.string().required(),
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_PUBLISHABLE_KEY: Joi.string().required(),
  SUPABASE_SECRET_KEY: Joi.string().required(),
  ADMIN_EMAILS: Joi.string().allow('').default(''),
  WHATSAPP_NUMBER: Joi.string().required(),
  AI_SERVICE_URL: Joi.string().allow('').default(''),
  AI_MOCK: Joi.string().allow('').default('true'),
  AI_TIMEOUT_MS: Joi.number().default(20000),
  INTERNAL_API_KEY: Joi.string().allow('').default(''),
  MIDTRANS_SERVER_KEY: Joi.string().allow('').default(''),
  MIDTRANS_CLIENT_KEY: Joi.string().allow('').default(''),
  MIDTRANS_IS_PRODUCTION: Joi.string().allow('').default('false'),
  DELIVERY_FEE: Joi.number().integer().min(0).default(8000),
  DELIVERY_MIN_ORDER: Joi.number().integer().min(0).default(30000),
}).unknown(true);

const { error, value } = envSchema.validate(process.env, {
  abortEarly: false,
});

if (error) {
  console.error('Konfigurasi environment tidak valid:');
  error.details.forEach((detail) => {
    console.error(`- ${detail.message}`);
  });
  process.exit(1);
}

const config = {
  NODE_ENV: value.NODE_ENV,
  PORT: value.PORT,
  FRONTEND_URL: value.FRONTEND_URL,
  SUPABASE_URL: value.SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY: value.SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY: value.SUPABASE_SECRET_KEY,
  ADMIN_EMAILS: value.ADMIN_EMAILS,
  WHATSAPP_NUMBER: value.WHATSAPP_NUMBER,
  AI_SERVICE_URL: value.AI_SERVICE_URL,
  AI_MOCK: value.AI_MOCK,
  AI_TIMEOUT_MS: value.AI_TIMEOUT_MS,
  INTERNAL_API_KEY: value.INTERNAL_API_KEY,
  MIDTRANS_SERVER_KEY: value.MIDTRANS_SERVER_KEY,
  MIDTRANS_CLIENT_KEY: value.MIDTRANS_CLIENT_KEY,
  MIDTRANS_IS_PRODUCTION: value.MIDTRANS_IS_PRODUCTION === 'true',
  DELIVERY_FEE: value.DELIVERY_FEE,
  DELIVERY_MIN_ORDER: value.DELIVERY_MIN_ORDER,
};

export default config;
export { config };
