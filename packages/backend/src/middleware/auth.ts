import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required but not configured. Please add it to your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token = req.headers.authorization;

  if (token && token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  if (!token) {
    logger.warn('AUTH_FAILED', { path: req.path, method: req.method, reason: 'No token provided' });
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized. No token provided.',
    });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    logger.warn('AUTH_FAILED', { path: req.path, method: req.method, reason: error?.message || 'Invalid token' });
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized. Invalid token.',
    });
  }

  logger.audit('AUTH_SUCCESS', user.id, `${req.method} ${req.path}`);
  (req as any).user = user;
  next();
};
