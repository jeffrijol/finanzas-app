import { PrismaClient, TransactionCategory } from '@prisma/client';

const prisma = new PrismaClient();

export const TransactionCategoriesService = {
    getAllCategories: async (): Promise<TransactionCategory[]> => {
        return await prisma.transactionCategory.findMany({
            include: {
                itemType: true
            },
            orderBy: {
                name: 'asc'
            }
        });
    },

    getCategoryById: async (id: string): Promise<TransactionCategory | null> => {
        return await prisma.transactionCategory.findUnique({
            where: { id },
            include: {
                itemType: true
            }
        });
    },

    createCategory: async (data: { name: string; type: string; itemTypeId: string }): Promise<TransactionCategory> => {
        // Check for duplicates
        const existing = await prisma.transactionCategory.findFirst({
            where: {
                name: data.name,
                type: data.type,
                itemTypeId: data.itemTypeId
            }
        });

        if (existing) {
            throw new Error('Ya existe una categoría con este nombre y tipo para este item.');
        }

        return await prisma.transactionCategory.create({
            data
        });
    },

    updateCategory: async (id: string, data: Partial<{ name: string; type: string; itemTypeId: string }>): Promise<TransactionCategory> => {
        return await prisma.transactionCategory.update({
            where: { id },
            data
        });
    },

    deleteCategory: async (id: string): Promise<void> => {
        // Check usage
        const usageCount = await prisma.transaction.count({
            where: { categoryId: id }
        });

        if (usageCount > 0) {
            throw new Error(`Esta categoría se usa en ${usageCount} transacciones. No se puede eliminar directamente.`);
        }

        await prisma.transactionCategory.delete({
            where: { id }
        });
    }
};
