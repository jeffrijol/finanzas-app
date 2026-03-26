import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware que inyecta un logger con contexto de tenant en el request
 * Facilita el logging de operaciones con organizationId para auditoría
 */
export const tenantLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Extender el tipo de Request para incluir tenantLogger
  (req as any).tenantLogger = {
    info: (message: string, meta?: any) => {
      const organizationId = (req as any).organizationId;
      const userId = (req as any).userId;
      
      if (organizationId && userId) {
        logger.tenantAction(organizationId, userId, 'INFO', message, meta);
      } else {
        logger.info(message, { organizationId, userId, ...meta });
      }
    },
    
    warn: (message: string, meta?: any) => {
      const organizationId = (req as any).organizationId;
      const userId = (req as any).userId;
      logger.warn(message, { organizationId, userId, ...meta });
    },
    
    error: (message: string, meta?: any) => {
      const organizationId = (req as any).organizationId;
      const userId = (req as any).userId;
      logger.error(message, { organizationId, userId, ...meta });
    },
    
    auditAction: (action: string, resource: string, meta?: any) => {
      const organizationId = (req as any).organizationId;
      const userId = (req as any).userId;
      
      if (organizationId && userId) {
        logger.tenantAction(organizationId, userId, action, resource, meta);
      } else {
        logger.audit(action, userId || 'unknown', resource, { organizationId, ...meta });
      }
    }
  };
  
  next();
};
