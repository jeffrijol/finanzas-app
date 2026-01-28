import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/organizations - Listar organizaciones del usuario
router.get('/', protect, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const members = await prisma.member.findMany({
      where: {
        userId: user.id,
      },
      include: {
        organization: true,
        role: true,
      },
    });

    const organizations = members.map((m: any) => ({
      ...m.organization,
      role: m.role,
      membership: {
        joinedAt: m.joinedAt,
        invitedBy: m.invitedBy,
      },
    }));

    res.json({ success: true, data: organizations });
  } catch (error) {
    logger.error('GET_ORGANIZATIONS_FAILED', error);
    res.status(500).json({ success: false, error: 'Failed to fetch organizations' });
  }
});

// GET /api/organizations/:id - Obtener detalles de una organización
router.get('/:id', protect, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    // Verificar que el usuario es miembro
    const member = await prisma.member.findFirst({
      where: {
        userId: user.id,
        organizationId: id,
      },
    });

    if (!member) {
      return res.status(403).json({ success: false, error: 'Not a member of this organization' });
    }

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            role: true,
          },
        },
      },
    });

    res.json({ success: true, data: organization });
  } catch (error) {
    logger.error('GET_ORGANIZATION_FAILED', error);
    res.status(500).json({ success: false, error: 'Failed to fetch organization' });
  }
});

// POST /api/organizations - Crear nueva organización
router.post('/', protect, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name, slug } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, error: 'Name and slug are required' });
    }

    // Crear organización y asignar usuario como admin
    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        ownerUserId: user.id,
        createdBy: user.id,
        members: {
          create: {
            userId: user.id,
            roleId: 'admin',
          },
        },
      },
      include: {
        members: {
          include: {
            role: true,
          },
        },
      },
    });

    res.status(201).json({ success: true, data: organization });
  } catch (error) {
    logger.error('CREATE_ORGANIZATION_FAILED', error);
    res.status(500).json({ success: false, error: 'Failed to create organization' });
  }
});

// GET /api/organizations/:id/members - Listar miembros de una organización
router.get('/:id/members', protect, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    // Verificar membresía
    const isMember = await prisma.member.findFirst({
      where: {
        userId: user.id,
        organizationId: id,
      },
    });

    if (!isMember) {
      return res.status(403).json({ success: false, error: 'Not a member of this organization' });
    }

    const members = await prisma.member.findMany({
      where: {
        organizationId: id,
      },
      include: {
        role: true,
      },
    });

    res.json({ success: true, data: members });
  } catch (error) {
    logger.error('GET_MEMBERS_FAILED', error);
    res.status(500).json({ success: false, error: 'Failed to fetch members' });
  }
});

export default router;
