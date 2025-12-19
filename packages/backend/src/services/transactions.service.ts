import { TransactionFilters, PaginationParams, TransactionStats } from '../types/transaction.types';
import prisma from '../lib/prisma';

export class TransactionsService {
    static async getTransactions(
        filters: TransactionFilters = {},
        pagination: PaginationParams = {}
    ) {
        const {
            startDate,
            endDate,
            categoria,
            itemAsignadoId,
            search,
            minAmount,
            maxAmount,
        } = filters;

        const {
            page = 1,
            limit = 50,
            sortBy = 'fechaValor',
            sortOrder = 'desc',
        } = pagination;

        const skip = (Number(page) - 1) * Number(limit);

        // Construir where clause
        const where: any = {};

        // Filtrar por fecha
        if (startDate || endDate) {
            where.fechaValor = {};
            if (startDate) {
                where.fechaValor.gte = new Date(startDate);
            }
            if (endDate) {
                where.fechaValor.lte = new Date(endDate);
            }
        }

        // Filtrar por categoría
        if (categoria) {
            where.categoria = {
                contains: categoria,
                // mode: 'insensitive' as const, // Not supported in simple SQLite prisma strings unless mapped? Actually typically ok, but simple contains is better for compatibility
            };
        }

        // Filtrar por item asignado
        if (itemAsignadoId) {
            where.itemAsignadoId = itemAsignadoId;
        }

        // Filtrar por búsqueda en descripción
        if (search) {
            where.descripcion = {
                contains: search,
                // mode: 'insensitive' as const,
            };
        }

        // Filtrar por monto
        if (minAmount !== undefined || maxAmount !== undefined) {
            where.importe = {};
            if (minAmount !== undefined) {
                where.importe.gte = minAmount;
            }
            if (maxAmount !== undefined) {
                where.importe.lte = maxAmount;
            }
        }

        // Obtener total de transacciones
        const total = await prisma.transaction.count({ where });

        // Obtener transacciones con paginación
        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                itemAsignado: true,
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
            skip,
            take: Number(limit),
        });

        return {
            transactions,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        };
    }

    static async getTransactionById(id: string) {
        return prisma.transaction.findUnique({
            where: { id },
            include: {
                itemAsignado: true,
            },
        });
    }

    static async updateTransaction(
        id: string,
        data: {
            itemAsignadoId?: string | null;
            categoria?: string;
            descripcion?: string;
        }
    ) {
        return prisma.transaction.update({
            where: { id },
            data: {
                ...data,
                itemAsignadoId: data.itemAsignadoId === '' ? null : data.itemAsignadoId,
            },
            include: {
                itemAsignado: true,
            },
        });
    }

    static async deleteTransaction(id: string) {
        return prisma.transaction.delete({
            where: { id },
        });
    }

    static async getStats(filters: TransactionFilters = {}): Promise<TransactionStats> {
        const {
            startDate,
            endDate,
            categoria,
            itemAsignadoId,
        } = filters;

        const where: any = {};

        if (startDate || endDate) {
            where.fechaValor = {};
            if (startDate) {
                where.fechaValor.gte = new Date(startDate);
            }
            if (endDate) {
                where.fechaValor.lte = new Date(endDate);
            }
        }

        if (categoria) {
            where.categoria = categoria;
        }

        if (itemAsignadoId) {
            where.itemAsignadoId = itemAsignadoId;
        }

        // Obtener todas las transacciones para calcular estadísticas
        const transactions = await prisma.transaction.findMany({ where });

        let totalIngresos = 0;
        let totalGastos = 0;

        transactions.forEach((t: { importe: number; }) => {
            if (t.importe > 0) {
                totalIngresos += t.importe;
            } else {
                totalGastos += Math.abs(t.importe);
            }
        });

        const totalTransacciones = transactions.length;
        const transaccionesConItem = await prisma.transaction.count({
            where: { ...where, NOT: { itemAsignadoId: null } },
        });

        // Obtener saldo actual (última transacción)
        const ultimaTransaccion = await prisma.transaction.findFirst({
            where,
            orderBy: { fechaValor: 'desc' },
        });

        const saldoActual = ultimaTransaccion?.saldo || 0;

        // Calcular promedio mensual (simplificado)
        const promedioMensual = totalIngresos - totalGastos;

        return {
            totalIngresos,
            totalGastos,
            saldoActual,
            promedioMensual,
            totalTransacciones,
            transaccionesConItem,
        };
    }

    static async getCategories() {
        const categories = await prisma.transaction.groupBy({
            by: ['categoria'],
            _count: {
                id: true,
            },
            _sum: {
                importe: true,
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
        });

        return categories.map((cat: { categoria: string; _count: { id: number }; _sum: { importe: number | null } }) => ({
            nombre: cat.categoria,
            cantidad: cat._count.id,
            total: cat._sum.importe || 0,
        }));
    }
}
