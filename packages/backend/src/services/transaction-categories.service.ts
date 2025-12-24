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
        await prisma.transactionCategory.delete({
            where: { id }
        });
    }
};
