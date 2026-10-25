export const success = (res, data, message = null, status = 200) => {
  const body = { success: true, data };
  if (message) body.message = message;
  return res.status(status).json(body);
};

export const error = (res, code, status, message, details = null) => {
  const body = { success: false, error: { code, message } };
  if (details) body.error.details = details;
  return res.status(status).json(body);
};
