import { PrismaClient, TransactionCategory } from '@prisma/client';

const prisma = new PrismaClient();

export const TransactionCategoriesService = {
    getAllCategories: async (organizationId: string): Promise<TransactionCategory[]> => {
        return await prisma.transactionCategory.findMany({
            where: { organizationId },
            include: {
                itemType: true
            },
            orderBy: {
                name: 'asc'
            }
        });
    },

    getCategoryById: async (organizationId: string, id: string): Promise<TransactionCategory | null> => {
        return await prisma.transactionCategory.findFirst({
            where: { id, organizationId },
            include: {
                itemType: true
            }
        });
    },

    createCategory: async (organizationId: string, userId: string, data: { name: string; type: string; itemTypeId: string }): Promise<TransactionCategory> => {
        // Check for duplicates
        const existing = await prisma.transactionCategory.findFirst({
            where: {
                name: data.name,
                type: data.type,
                itemTypeId: data.itemTypeId,
                organizationId
            }
        });

        if (existing) {
            throw new Error('Ya existe una categoría con este nombre y tipo para este item.');
        }

        return await prisma.transactionCategory.create({
            data: { ...data, organizationId, userId }
        });
    },

    updateCategory: async (organizationId: string, id: string, data: Partial<{ name: string; type: string; itemTypeId: string }>): Promise<TransactionCategory> => {
        // Verify ownership
        const category = await prisma.transactionCategory.findFirst({ where: { id, organizationId } });
        if (!category) throw new Error("Category not found or access denied");

        return await prisma.transactionCategory.update({
            where: { id },
            data
        });
    },

    deleteCategory: async (organizationId: string, id: string): Promise<void> => {
        // Verify ownership
        const category = await prisma.transactionCategory.findFirst({ where: { id, organizationId } });
        if (!category) throw new Error("Category not found or access denied");

        // Check usage
        const usageCount = await prisma.transaction.count({
            where: { categoryId: id, organizationId }
        });

        if (usageCount > 0) {
            throw new Error(`Esta categoría se usa en ${usageCount} transacciones. No se puede eliminar directamente.`);
        }

        await prisma.transactionCategory.delete({
            where: { id }
        });
    }
};
