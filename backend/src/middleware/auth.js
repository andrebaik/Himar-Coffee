import { supabaseAdmin } from '../config/supabase.js';
import { config } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('UNAUTHORIZED', 401, 'Token tidak ditemukan');
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new AppError('UNAUTHORIZED', 401, 'Token tidak valid atau sudah kedaluwarsa');
    }

    // Check ADMIN_EMAILS allowlist if configured
    if (config.ADMIN_EMAILS) {
      const allowedEmails = config.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase());
      if (!allowedEmails.includes(user.email.toLowerCase())) {
        throw new AppError('FORBIDDEN', 403, 'Akun ini tidak memiliki akses admin');
      }
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError('UNAUTHORIZED', 401, 'Token tidak valid atau sudah kedaluwarsa'));
  }
};

export default requireAdmin;
