import { supabaseAuth, supabaseAdmin } from '../config/supabase.js';
import { success } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AppError('UNAUTHORIZED', 401, 'Email atau kata sandi salah');
    }

    return success(res, {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError('UNAUTHORIZED', 401, 'Email atau kata sandi salah'));
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    const { data, error } = await supabaseAuth.auth.refreshSession({
      refresh_token,
    });

    if (error || !data.session) {
      throw new AppError('UNAUTHORIZED', 401, 'Refresh token tidak valid atau sudah kedaluwarsa');
    }

    return success(res, {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError('UNAUTHORIZED', 401, 'Refresh token tidak valid'));
  }
};

export const me = async (req, res, next) => {
  try {
    return success(res, {
      id: req.user.id,
      email: req.user.email,
    });
  } catch (err) {
    next(err);
  }
};
