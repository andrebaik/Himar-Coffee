const STORAGE_KEYS = {
  ACCESS_TOKEN: 'himar_access_token',
  REFRESH_TOKEN: 'himar_refresh_token',
  EXPIRES_AT: 'himar_expires_at',
  EMAIL: 'himar_email',
};

export const getSession = () => {
  const access_token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (!access_token) return null;
  return {
    access_token,
    refresh_token: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
    expires_at: localStorage.getItem(STORAGE_KEYS.EXPIRES_AT),
    email: localStorage.getItem(STORAGE_KEYS.EMAIL),
  };
};

export const setSession = ({ access_token, refresh_token, expires_at, user }) => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
  localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expires_at);
  if (user?.email) localStorage.setItem(STORAGE_KEYS.EMAIL, user.email);
};

export const clearSession = () => {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
};
