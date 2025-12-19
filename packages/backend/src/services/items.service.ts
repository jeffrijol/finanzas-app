import { ItemCreateInput, ItemUpdateInput, ItemWithStats } from '../types/item.types';
import prisma from '../lib/prisma';

export class ItemsService {
    static async getAllItems(includeInactive: boolean = false) {
        const where = includeInactive ? {} : { activo: true };

        const items = await prisma.item.findMany({
            where,
            orderBy: {
                nombre: 'asc',
            },
        });

        // Obtener estadísticas para cada item
        const itemsWithStats = await Promise.all(
            items.map(async (item) => {
                const transactionCount = await prisma.transaction.count({
                    where: { itemAsignadoId: item.id },
                });

                const transactions = await prisma.transaction.findMany({
                    where: { itemAsignadoId: item.id },
                    select: { importe: true },
                });

                const totalAmount = transactions.reduce((sum, t) => sum + t.importe, 0);

                return {
                    ...item,
                    transactionCount,
                    totalAmount,
                } as ItemWithStats;
            })
        );

        return itemsWithStats;
    }

    static async getItemById(id: string) {
        const item = await prisma.item.findUnique({
            where: { id },
        });

        if (!item) return null;

        const transactionCount = await prisma.transaction.count({
            where: { itemAsignadoId: id },
        });

        const transactions = await prisma.transaction.findMany({
            where: { itemAsignadoId: id },
            select: { importe: true },
        });

        const totalAmount = transactions.reduce((sum, t) => sum + t.importe, 0);

        return {
            ...item,
            transactionCount,
            totalAmount,
        } as ItemWithStats;
    }

    static async createItem(data: ItemCreateInput) {
        // Verificar si ya existe un item con el mismo nombre
        const existing = await prisma.item.findUnique({
            where: { nombre: data.nombre },
        });

        if (existing) {
            throw new Error('Ya existe un item con este nombre');
        }

        return prisma.item.create({
            data: {
                ...data,
                color: data.color || '#3B82F6', // Color por defecto azul
            },
        });
    }

    static async updateItem(id: string, data: ItemUpdateInput) {
        // Si se está actualizando el nombre, verificar que no exista otro
        if (data.nombre) {
            const existing = await prisma.item.findFirst({
                where: {
                    nombre: data.nombre,
                    NOT: { id },
                },
            });

            if (existing) {
                throw new Error('Ya existe otro item con este nombre');
            }
        }

        return prisma.item.update({
            where: { id },
            data,
        });
    }

    static async deleteItem(id: string) {
        // Soft delete
        return prisma.item.update({
            where: { id },
            data: { activo: false },
        });
    }
}
