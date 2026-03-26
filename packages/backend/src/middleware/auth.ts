import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import prisma from '../lib/prisma';

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

  // NUEVO: Obtener organization_id del header o query param
  const orgId = req.headers['x-organization-id'] || req.query.organizationId;

  // Solo validar organización si la ruta lo requiere
  const requiresOrg =
    !req.originalUrl.includes('/profile') &&
    !req.originalUrl.includes('/organizations') &&
    !req.originalUrl.includes('/health');

  if (requiresOrg && !orgId) {
    return res.status(400).json({
      error: 'ORGANIZATION_REQUIRED',
      message: 'Organization ID is required for this endpoint',
    });
  }

  // Si hay orgId, verificar membresía
  if (orgId) {
    try {
      const member = await prisma.member.findFirst({
        where: {
          userId: user.id,
          organizationId: orgId as string,
        },
        include: { role: true },
      });

      if (!member) {
        return res.status(403).json({
          error: 'NOT_MEMBER',
          message: 'User is not a member of this organization',
        });
      }

      (req as any).member = member;
      (req as any).organizationId = orgId;
    } catch (err) {
      logger.error('MEMBERSHIP_CHECK_FAILED', { userId: user.id, orgId, error: err });
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Failed to verify organization membership',
      });
    }
  }

  next();
};
