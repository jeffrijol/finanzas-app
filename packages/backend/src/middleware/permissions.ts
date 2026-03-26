import { Request, Response, NextFunction } from 'express';

// Middleware para verificar permisos basados en roles
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const member = (req as any).member;

    if (!member || !allowedRoles.includes(member.roleId)) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};
