import { TransactionFilters, PaginationParams, TransactionStats } from '../types/transaction.types';
import prisma from '../lib/prisma';

export class TransactionsService {
    static async getTransactions(
        organizationId: string,
        filters: TransactionFilters = {},
        pagination: PaginationParams = {}
    ) {
        const {
            startDate,
            endDate,
            categoria,
            itemAsignadoId,
            excelUploadId,
            tipoItem,
            search,
            minAmount,
            maxAmount,
            categoryId, // Add this
        } = filters;

        const {
            page = 1,
            limit = 50,
            sortBy = 'fechaValor',
            sortOrder = 'desc',
        } = pagination;

        const skip = (Number(page) - 1) * Number(limit);

        // Construir where clause
        const where: any = {
            organizationId,
            excelUpload: {
                processed: true
            }
        };

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

        // Filtrar por categoría (String match - old logic)
        if (categoria) {
            where.categoria = {
                contains: categoria,
            };
        }

        // Filtrar por categoryId (Relation)
        if (categoryId && categoryId !== 'ALL') {
            where.categoryId = categoryId;
        }

        // Filtrar por item asignado
        if (itemAsignadoId && itemAsignadoId !== 'ALL') {
            where.itemAsignadoId = itemAsignadoId;
        }

        // Filtrar por tipo de item
        // Filtrar por tipo de item
        if (tipoItem && tipoItem !== 'ALL') {
            // Si el ID parece CUID (25 chars aprox), filtramos por id
            // Si no, asumimos que es el CODE antiguo o nombre?
            // El frontend enviará el ID del tipo ahora si actualizamos el filtro.
            where.itemAsignado = {
                itemTypeId: tipoItem
            };
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

        // Filter by Excel Upload ID
        if (excelUploadId) {
            where.excelUploadId = excelUploadId;
        }

        // Obtener total de transacciones
        const total = await prisma.transaction.count({ where });

        // Obtener transacciones con paginación
        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                itemAsignado: {
                    include: { itemType: true }
                },
                categoryRel: true
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

    static async createTransaction(
        organizationId: string,
        userId: string,
        data: {
            fechaValor: Date;
            descripcion: string;
            importe: number;
            categoria: string;
            saldo?: number;
            itemAsignadoId?: string | null;
            categoryId?: string | null;
            metadata?: string | null;
            excelUploadId?: string | null;
        }
    ) {
        return prisma.transaction.create({
            data: {
                organizationId,
                userId,
                fechaValor: data.fechaValor,
                descripcion: data.descripcion,
                importe: data.importe,
                categoria: data.categoria,
                saldo: data.saldo || 0,
                itemAsignadoId: data.itemAsignadoId || null,
                categoryId: data.categoryId || null,
                metadata: data.metadata || null,
                excelUploadId: data.excelUploadId || null,
            },
            include: {
                itemAsignado: true,
            },
        });
    }

    static async updateTransaction(
        organizationId: string,
        id: string,
        data: {
            itemAsignadoId?: string | null;
            categoria?: string;
            descripcion?: string;
        }
    ) {
        return prisma.transaction.update({
            where: { id, organizationId },
            data: {
                ...data,
                itemAsignadoId: data.itemAsignadoId === '' ? null : data.itemAsignadoId,
            },
            include: {
                itemAsignado: true,
            },
        });
    }

    static async deleteTransaction(userId: string, id: string) {
        return prisma.transaction.delete({
            where: { id, userId },
        });
    }

    static async getStats(organizationId: string, filters: TransactionFilters = {}): Promise<TransactionStats> {
        const {
            startDate,
            endDate,
            categoria,
            itemAsignadoId,
            tipoItem,
            categoryId, // Add this
        } = filters;

        const where: any = {
            organizationId,
            excelUpload: {
                processed: true
            }
        };

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

        if (itemAsignadoId && itemAsignadoId !== 'ALL') {
            where.itemAsignadoId = itemAsignadoId;
        }

        if (categoryId && categoryId !== 'ALL') {
            where.categoryId = categoryId;
        }

        if (tipoItem && tipoItem !== 'ALL') {
            where.itemAsignado = {
                itemTypeId: tipoItem
            };
        }

        // Obtener todas las transacciones para calcular estadísticas
        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                itemAsignado: { include: { itemType: true } },
                categoryRel: true
            }
        });

        const items = await prisma.item.findMany({
            where: { activo: true },
            include: { itemType: true }
        });

        let totalIngresos = 0;
        let totalGastos = 0;

        const transaccionesPorItem: Record<string, { itemId: string; itemNombre: string; cantidad: number; total: number }> = {};

        // Estructura para agrupar por Tipo de Item
        const porTipoItem: Record<string, { tipo: string; ingresos: number; gastos: number }> = {};

        // Inicializar con tipos existentes
        const allTypes = await prisma.itemType.findMany();
        allTypes.forEach(t => {
            porTipoItem[t.name] = { tipo: t.name, ingresos: 0, gastos: 0 };
        });

        const porCategoria: Record<string, { categoria: string; ingresos: number; gastos: number }> = {};
        const porCategoryRel: Record<string, { categoria: string; ingresos: number; gastos: number }> = {};

        items.forEach(item => {
            transaccionesPorItem[item.id] = {
                itemId: item.id,
                itemNombre: item.nombre,
                cantidad: 0,
                total: 0
            };
        });

        const sinAsignar = {
            cantidad: 0,
            total: 0
        };

        transactions.forEach((t) => {
            const esIngreso = t.importe > 0;
            const importeAbs = Math.abs(t.importe);

            // Ingresos/Gastos globales
            if (esIngreso) {
                totalIngresos += t.importe;
            } else {
                totalGastos += importeAbs;
            }

            // Agrupar por Categoría (String original)
            const catName = t.categoria || 'Sin categoría';
            if (!porCategoria[catName]) {
                porCategoria[catName] = { categoria: catName, ingresos: 0, gastos: 0 };
            }
            if (esIngreso) {
                porCategoria[catName].ingresos += t.importe;
            } else {
                porCategoria[catName].gastos += importeAbs;
            }

            // Agrupar por CategoryRel (Categoría Interna)
            // @ts-ignore - categoryRel exists due to include above
            const relName = t.categoryRel?.name || 'Sin Asignar';
            if (!porCategoryRel[relName]) {
                porCategoryRel[relName] = { categoria: relName, ingresos: 0, gastos: 0 };
            }
            if (esIngreso) {
                porCategoryRel[relName].ingresos += t.importe;
            } else {
                porCategoryRel[relName].gastos += importeAbs;
            }

            // Estadísticas por item y por tipo
            if (t.itemAsignadoId && transaccionesPorItem[t.itemAsignadoId]) {
                const item = items.find(i => i.id === t.itemAsignadoId);
                transaccionesPorItem[t.itemAsignadoId].cantidad++;
                transaccionesPorItem[t.itemAsignadoId].total += t.importe;

                // Agrupar por Tipo
                if (item && item.itemType) {
                    const typeName = item.itemType.name;
                    // Inicializar si no existe (por seguridad)
                    if (!porTipoItem[typeName]) {
                        porTipoItem[typeName] = { tipo: typeName, ingresos: 0, gastos: 0 };
                    }

                    if (esIngreso) {
                        porTipoItem[typeName].ingresos += t.importe;
                    } else {
                        porTipoItem[typeName].gastos += importeAbs; // Guardamos gastos como positivo para gráficos
                    }
                }
            } else {
                sinAsignar.cantidad++;
                sinAsignar.total += t.importe;
            }
        });

        const totalTransacciones = transactions.length;
        const transaccionesConItem = transactions.filter(t => t.itemAsignadoId !== null).length;

        // Obtener saldo actual (última transacción)
        const ultimaTransaccion = await prisma.transaction.findFirst({
            where,
            orderBy: { fechaValor: 'desc' },
        });

        const balance = ultimaTransaccion?.saldo || 0;

        return {
            totalIngresos,
            totalGastos,
            balance,
            transaccionesPorItem: Object.values(transaccionesPorItem),
            porTipoItem: Object.values(porTipoItem), // Retornar array
            porCategoria: Object.values(porCategoria)
                .sort((a, b) => b.gastos - a.gastos) // Ordenar por gastos mayor a menor
                .filter(c => c.gastos > 0 || c.ingresos > 0),
            porCategoryRel: Object.values(porCategoryRel)
                .sort((a, b) => b.gastos - a.gastos)
                .filter(c => c.gastos > 0 || c.ingresos > 0),
            sinAsignar,
            totalTransacciones,
            transaccionesConItem,
        };
    }

    static async getCategories(userId: string) {
        const categories = await prisma.transaction.groupBy({
            by: ['categoria'],
            where: { userId },
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
