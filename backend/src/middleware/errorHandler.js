import { AppError } from '../utils/AppError.js';
import { error as errorResponse } from '../utils/response.js';

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return errorResponse(res, err.code, err.status, err.message, err.details);
  }

  if (err.isJoi || (err.details && err.name === 'ValidationError')) {
    const details = err.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return errorResponse(res, 'VALIDATION_ERROR', 400, 'Data tidak valid', details);
  }

  if (err.name === 'MulterError') {
    return errorResponse(res, 'UPLOAD_INVALID', 400, 'File upload tidak valid');
  }

  console.error('Unhandled error:', err);

  const message =
    process.env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan pada server'
      : err.message || 'Terjadi kesalahan pada server';

  return errorResponse(res, 'INTERNAL_ERROR', 500, message);
};

export default errorHandler;
