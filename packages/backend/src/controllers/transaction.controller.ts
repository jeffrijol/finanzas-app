import { Request, Response } from 'express';
import prisma from '../prisma';

export const listTransactions = async (req: Request, res: Response) => {
    const { page = 1, limit = 50, categoria, itemAsignadoId, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (categoria) where.categoria = String(categoria);
    if (itemAsignadoId) where.itemAsignadoId = String(itemAsignadoId);
    if (search) {
        where.descripcion = { contains: String(search), mode: 'insensitive' };
    }

    const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { fechaValor: 'desc' },
            include: { itemAsignado: true }
        }),
        prisma.transaction.count({ where })
    ]);

    res.json({
        success: true,
        data: transactions,
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
        }
    });
};

export const updateTransaction = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { itemAsignadoId, categoria, descripcion } = req.body;

    const transaction = await prisma.transaction.update({
        where: { id },
        data: {
            itemAsignadoId,
            categoria,
            descripcion
        },
        include: { itemAsignado: true }
    });

    res.json({ success: true, data: transaction });
};

export const getStats = async (req: Request, res: Response) => {
    // Basic stats by category (assigned Item)
    const stats = await prisma.transaction.groupBy({
        by: ['itemAsignadoId'],
        _sum: { importe: true },
        _count: { id: true },
        where: {
            itemAsignadoId: { not: null } // Only analyzed ones
        }
    });

    // Enrich with Item names
    const enrichedStats = await Promise.all(stats.map(async (s) => {
        const item = s.itemAsignadoId ? await prisma.item.findUnique({ where: { id: s.itemAsignadoId } }) : null;
        return {
            ...s,
            itemName: item?.nombre || 'Unknown',
            color: item?.color
        };
    }));

    res.json({ success: true, data: enrichedStats });
};
