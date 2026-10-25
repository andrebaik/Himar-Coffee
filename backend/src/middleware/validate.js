import { AppError } from '../utils/AppError.js';

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return next(new AppError('VALIDATION_ERROR', 400, 'Data tidak valid', details));
  }
  req[source] = value;
  next();
};

export default validate;
