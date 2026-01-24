import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to verify if user is an admin
 * Uses either environment variable ADMIN_EMAIL or ADMIN_USER_IDS
 * This is a simple MVP approach without database roles
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    // Option 1: Check by user ID (comma-separated list in .env)
    const adminUserIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || [];
    if (adminUserIds.length > 0 && adminUserIds.includes(user.id)) {
      next();
      return;
    }

    // Option 2: Check by email (single or comma-separated in .env)
    const adminEmails = process.env.ADMIN_EMAIL?.split(',').map(email => email.trim().toLowerCase()) || [];
    if (adminEmails.length > 0 && adminEmails.includes(user.email?.toLowerCase())) {
      next();
      return;
    }

    // If no admin configuration exists, deny access for security
    if (adminUserIds.length === 0 && adminEmails.length === 0) {
      res.status(500).json({
        success: false,
        message: 'Configuración de administradores no definida. Contacta al administrador del sistema.',
      });
      return;
    }

    // Not an admin
    res.status(403).json({
      success: false,
      message: 'Acceso no autorizado. Solo administradores pueden acceder a este recurso.',
    });
  } catch (error) {
    console.error('Error in requireAdmin middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};
