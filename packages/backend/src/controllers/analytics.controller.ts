import { Request, Response } from 'express';
import { TransactionsService } from '../services/transactions.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import prisma from '../lib/prisma';

export class AnalyticsController {

    // Wrapper for the existing powerful getStats
    static async getGeneralStats(req: Request, res: Response) {
        try {
            const { year, quarter, tipoItem, itemAsignadoId } = req.query;

            let startDate: Date | undefined;
            let endDate: Date | undefined;
            const yearNum = Number(year);

            if (year && !isNaN(yearNum)) {
                if (quarter && quarter !== 'all') {
                    const quarterNum = Number(quarter);
                    // Native JS Quarter Logic
                    // Q1 (1) -> Month 0
                    // Q2 (2) -> Month 3
                    const startMonth = (quarterNum - 1) * 3;
                    const endMonth = startMonth + 3; // 3 for Q1 -> April (Index 3). Day 0 of April is March 31.

                    startDate = new Date(yearNum, startMonth, 1);
                    endDate = new Date(yearNum, endMonth, 0, 23, 59, 59, 999);
                } else {
                    startDate = new Date(yearNum, 0, 1);
                    endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999);
                }
            }

            const stats = await TransactionsService.getStats({
                startDate: startDate, // Pass Date object
                endDate: endDate,     // Pass Date object
                tipoItem: tipoItem as string,
                itemAsignadoId: itemAsignadoId as string
            });

            res.json(ApiResponseHelper.success(stats));
        } catch (error) {
            console.error('Error in getGeneralStats:', error);
            res.status(500).json(ApiResponseHelper.error('Error fetching general stats'));
        }
    }

    // Specific stats when viewing a Type (e.g. "Inmuebles")
    static async getTypeStats(req: Request, res: Response) {
        try {
            const { typeId } = req.params;
            const { year } = req.query;
            const yearNum = Number(year);

            // Fetch raw transactions for aggregation
            const transactions = await prisma.transaction.findMany({
                where: {
                    itemAsignado: { itemTypeId: typeId },
                    fechaValor: {
                        gte: new Date(yearNum, 0, 1),
                        lte: new Date(yearNum, 11, 31, 23, 59, 59)
                    }
                },
                select: {
                    fechaValor: true,
                    importe: true,
                    categoria: true,
                    itemAsignadoId: true
                }
            });

            // 1. Monthly Trend
            const monthlyTrend = Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                ingresos: 0,
                gastos: 0
            }));

            // 2. Category Distribution
            const categoriesMap: Record<string, { ingresos: number, gastos: number }> = {};

            // 3. Top Items (Re-calc from memory to avoid double DB call if dataset is small enough)
            const itemsMap: Record<string, number> = {}; // ItemId -> Expense

            transactions.forEach(t => {
                const month = t.fechaValor.getMonth(); // 0-11
                const isIncome = t.importe > 0;
                const absAmount = Math.abs(t.importe);

                // Trend
                if (isIncome) monthlyTrend[month].ingresos += t.importe;
                else monthlyTrend[month].gastos += absAmount;

                // Categories
                const cat = t.categoria || 'Sin Categoría';
                if (!categoriesMap[cat]) categoriesMap[cat] = { ingresos: 0, gastos: 0 };
                if (isIncome) categoriesMap[cat].ingresos += t.importe;
                else categoriesMap[cat].gastos += absAmount;

                // Items (Expenses Only for top items usually)
                if (t.itemAsignadoId && !isIncome) {
                    itemsMap[t.itemAsignadoId] = (itemsMap[t.itemAsignadoId] || 0) + absAmount;
                }
            });

            // Format Categories
            const categoryDistribution = Object.entries(categoriesMap).map(([name, vals]) => ({
                categoria: name,
                ...vals
            })).sort((a, b) => b.gastos - a.gastos); // Sort by expenses by default

            // Format Top Items
            // Need names
            const topItemIds = Object.entries(itemsMap)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([id]) => id);

            let topItemsWithNames: any[] = [];
            if (topItemIds.length > 0) {
                const dbItems = await prisma.item.findMany({
                    where: { id: { in: topItemIds } },
                    select: { id: true, nombre: true }
                });
                topItemsWithNames = topItemIds.map(id => ({
                    name: dbItems.find(i => i.id === id)?.nombre || 'Unknown',
                    amount: itemsMap[id]
                }));
            }

            res.json(ApiResponseHelper.success({
                monthlyTrend,
                categoryDistribution,
                topItems: topItemsWithNames
            }));

        } catch (error) {
            console.error('Error in getTypeStats:', error);
            res.status(500).json(ApiResponseHelper.error('Error fetching type stats'));
        }
    }

    // Specific stats when viewing an Item
    static async getItemStats(req: Request, res: Response) {
        try {
            const { itemId } = req.params;
            const { year } = req.query;
            const yearNum = Number(year);

            // Fetch transactions
            const transactions = await prisma.transaction.findMany({
                where: {
                    itemAsignadoId: itemId,
                    fechaValor: {
                        gte: new Date(yearNum, 0, 1),
                        lte: new Date(yearNum, 11, 31, 23, 59, 59)
                    }
                },
                select: {
                    fechaValor: true,
                    importe: true,
                    categoria: true
                },
                orderBy: { fechaValor: 'asc' }
            });

            // 1. Monthly Trend
            const monthlyTrend = Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                ingresos: 0,
                gastos: 0
            }));

            // 2. Totals
            let totalIngresos = 0;
            let totalGastos = 0;

            // 3. Category Distribution (How this item is categorized in bank)
            const categoriesMap: Record<string, { ingresos: number, gastos: number }> = {};

            transactions.forEach(t => {
                const month = t.fechaValor.getMonth();
                const isIncome = t.importe > 0;
                const absAmount = Math.abs(t.importe);

                // Trend
                if (isIncome) monthlyTrend[month].ingresos += t.importe;
                else monthlyTrend[month].gastos += absAmount;

                // Totals
                if (isIncome) totalIngresos += t.importe;
                else totalGastos += absAmount;

                // Categories
                const cat = t.categoria || 'Sin Categoría';
                if (!categoriesMap[cat]) categoriesMap[cat] = { ingresos: 0, gastos: 0 };
                if (isIncome) categoriesMap[cat].ingresos += t.importe;
                else categoriesMap[cat].gastos += absAmount;
            });

            const categoryDistribution = Object.entries(categoriesMap).map(([name, vals]) => ({
                categoria: name,
                ...vals
            })).sort((a, b) => b.gastos - a.gastos);

            res.json(ApiResponseHelper.success({
                monthlyTrend,
                categoryDistribution,
                totalIngresos,
                totalGastos,
                averageMonthlyExpense: totalGastos / 12 // Simple avg
            }));

        } catch (error) {
            console.error('Error in getItemStats:', error);
            res.status(500).json(ApiResponseHelper.error('Error fetching item stats'));
        }
    }

    // Specific stats when viewing a Category
    static async getCategoryStats(req: Request, res: Response) {
        try {
            const { categoryId } = req.params;
            const { year } = req.query;
            const yearNum = Number(year);

            // Fetch transactions
            // Note: We filter by the RELATION categoryId, not the raw string 'categoria'
            const transactions = await prisma.transaction.findMany({
                where: {
                    categoryId: categoryId,
                    fechaValor: {
                        gte: new Date(yearNum, 0, 1),
                        lte: new Date(yearNum, 11, 31, 23, 59, 59)
                    }
                },
                select: {
                    fechaValor: true,
                    importe: true,
                    itemAsignadoId: true
                },
                orderBy: { fechaValor: 'asc' }
            });

            // 1. Monthly Trend
            const monthlyTrend = Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                ingresos: 0,
                gastos: 0
            }));

            // 2. Top Items in this Category
            const itemsMap: Record<string, number> = {};

            transactions.forEach(t => {
                const month = t.fechaValor.getMonth();
                const isIncome = t.importe > 0;
                const absAmount = Math.abs(t.importe);

                if (isIncome) monthlyTrend[month].ingresos += t.importe;
                else monthlyTrend[month].gastos += absAmount;

                if (t.itemAsignadoId && !isIncome) {
                    itemsMap[t.itemAsignadoId] = (itemsMap[t.itemAsignadoId] || 0) + absAmount;
                }
            });

            // Top Items Names
            // Need names
            const topItemIds = Object.entries(itemsMap)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([id]) => id);

            let topItemsWithNames: any[] = [];
            if (topItemIds.length > 0) {
                const dbItems = await prisma.item.findMany({
                    where: { id: { in: topItemIds } },
                    select: { id: true, nombre: true }
                });
                topItemsWithNames = topItemIds.map(id => ({
                    name: dbItems.find(i => i.id === id)?.nombre || 'Unknown',
                    amount: itemsMap[id]
                }));
            }

            res.json(ApiResponseHelper.success({
                monthlyTrend,
                topItems: topItemsWithNames
            }));

        } catch (error) {
            console.error('Error in getCategoryStats:', error);
            res.status(500).json(ApiResponseHelper.error('Error fetching category stats'));
        }
    }
}

