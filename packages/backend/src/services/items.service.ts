import { ItemCreateInput, ItemUpdateInput, ItemWithStats } from '../types/item.types';
import prisma from '../lib/prisma';

export class ItemsService {
    static async getAllItems(userId: string, includeInactive: boolean = false) {
        const where = {
            userId,
            ...(includeInactive ? {} : { activo: true })
        };

        const items = await prisma.item.findMany({
            where,
            include: { itemType: true },
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

    static async getItemById(userId: string, id: string) {
        const item = await prisma.item.findFirst({
            where: { id, userId },
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

    static async createItem(userId: string, data: ItemCreateInput) {
        // Verificar si ya existe un item con el mismo nombre
        const existing = await prisma.item.findFirst({
            where: { nombre: data.nombre, userId },
        });

        if (existing) {
            throw new Error('Ya existe un item con este nombre');
        }

        return prisma.item.create({
            data: {
                ...data,
                userId,
                color: data.color || '#3B82F6', // Color por defecto azul
            },
        });
    }

    static async updateItem(userId: string, id: string, data: ItemUpdateInput) {
        // Enforce ownership
        const item = await prisma.item.findFirst({ where: { id, userId } });
        if (!item) throw new Error("Item not found or access denied");

        // Si se está actualizando el nombre, verificar que no exista otro
        if (data.nombre) {
            const existing = await prisma.item.findFirst({
                where: {
                    nombre: data.nombre,
                    userId,
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

    static async deleteItem(userId: string, id: string) {
        // Soft delete
        const item = await prisma.item.findFirst({ where: { id, userId } });
        if (!item) throw new Error("Item not found or access denied");

        // We allow soft delete even if it has transactions, as it keeps history.
        return prisma.item.update({
            where: { id },
            data: { activo: false },
        });
    }
    static async getItemTypes() {
        return prisma.itemType.findMany({
            include: {
                categories: true
            },
            orderBy: { name: 'asc' }
        });
    }
}
