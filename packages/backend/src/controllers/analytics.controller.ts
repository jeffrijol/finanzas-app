import { Request, Response } from 'express';
import { TransactionsService } from '../services/transactions.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import prisma from '../lib/prisma';

export class AnalyticsController {

    // Helper to get date range
    private static getRange(year: number, quarter?: any) {
        let start = new Date(year, 0, 1);
        let end = new Date(year, 11, 31, 23, 59, 59);
        let monthsInRange: number[] = Array.from({ length: 12 }, (_, i) => i + 1);

        if (quarter && quarter !== 'all') {
            const q = Number(quarter);
            if (!isNaN(q)) {
                const startMonth = (q - 1) * 3;
                start = new Date(year, startMonth, 1);
                end = new Date(year, startMonth + 3, 0, 23, 59, 59);
                monthsInRange = [startMonth + 1, startMonth + 2, startMonth + 3];
            }
        }
        return { start, end, monthsInRange };
    }

    // Helper to initialize trend based on months in range
    private static initTrend(months: number[]) {
        return months.map(m => ({
            month: m,
            ingresos: 0,
            gastos: 0
        }));
    }

    // Wrapper for the existing powerful getStats
    static async getGeneralStats(req: Request, res: Response) {
        try {
            const { year, quarter, tipoItem, itemAsignadoId } = req.query;

            let startDate: Date | undefined;
            let endDate: Date | undefined;
            const yearNum = Number(year);

            if (year && !isNaN(yearNum)) {
                const { start, end } = AnalyticsController.getRange(yearNum, quarter);
                startDate = start;
                endDate = end;
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
            const { year, quarter } = req.query;
            const yearNum = Number(year);
            const { start, end, monthsInRange } = AnalyticsController.getRange(yearNum, quarter);

            // Fetch raw transactions for aggregation
            const transactions = await prisma.transaction.findMany({
                where: {
                    itemAsignado: { itemTypeId: typeId },
                    fechaValor: {
                        gte: start,
                        lte: end
                    }
                },
                select: {
                    fechaValor: true,
                    importe: true,
                    categoria: true,
                    itemAsignadoId: true,
                    categoryRel: { select: { name: true } }
                }
            });

            // 1. Monthly Trend
            const monthlyTrend = AnalyticsController.initTrend(monthsInRange);

            // 2. Category Distribution
            // Using internal Categories (categoryRel)
            const categoriesMap: Record<string, { ingresos: number, gastos: number }> = {};

            // 3. Top Items (Re-calc from memory to avoid double DB call if dataset is small enough)
            const itemsMap: Record<string, number> = {}; // ItemId -> Expense

            transactions.forEach(t => {
                const month = t.fechaValor.getMonth(); // 0-11
                const isIncome = t.importe > 0;
                const absAmount = Math.abs(t.importe);

                // Trend
                const trendEntry = monthlyTrend.find(mt => mt.month === month + 1);
                if (trendEntry) {
                    if (isIncome) trendEntry.ingresos += t.importe;
                    else trendEntry.gastos += absAmount;
                }

                // Categories (Internal)
                // @ts-ignore
                const cat = t.categoryRel?.name || 'Sin Asignar';
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
            const { year, quarter } = req.query;
            const yearNum = Number(year);
            const { start, end, monthsInRange } = AnalyticsController.getRange(yearNum, quarter);

            // Fetch transactions
            const transactions = await prisma.transaction.findMany({
                where: {
                    itemAsignadoId: itemId,
                    fechaValor: {
                        gte: start,
                        lte: end
                    }
                },
                select: {
                    fechaValor: true,
                    importe: true,
                    categoria: true,
                    categoryRel: { select: { name: true } }
                },
                orderBy: { fechaValor: 'asc' }
            });

            // 1. Monthly Trend
            const monthlyTrend = AnalyticsController.initTrend(monthsInRange);

            // 2. Totals
            let totalIngresos = 0;
            let totalGastos = 0;

            // 3. Category Distribution (How this item is categorized in bank)
            // Now using Internal Category
            const categoriesMap: Record<string, { ingresos: number, gastos: number }> = {};

            transactions.forEach(t => {
                const month = t.fechaValor.getMonth();
                const isIncome = t.importe > 0;
                const absAmount = Math.abs(t.importe);

                // Trend
                const trendEntry = monthlyTrend.find(mt => mt.month === month + 1);
                if (trendEntry) {
                    if (isIncome) trendEntry.ingresos += t.importe;
                    else trendEntry.gastos += absAmount;
                }

                // Totals
                if (isIncome) totalIngresos += t.importe;
                else totalGastos += absAmount;

                // Categories
                // @ts-ignore
                const cat = t.categoryRel?.name || 'Sin Asignar';
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
                averageMonthlyExpense: totalGastos / monthsInRange.length // Dynamic avg
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
            const { year, quarter } = req.query;
            const yearNum = Number(year);
            const { start, end, monthsInRange } = AnalyticsController.getRange(yearNum, quarter);

            // Fetch transactions
            // Note: We filter by the RELATION categoryId, not the raw string 'categoria'
            const transactions = await prisma.transaction.findMany({
                where: {
                    categoryId: categoryId,
                    fechaValor: {
                        gte: start,
                        lte: end
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
            const monthlyTrend = AnalyticsController.initTrend(monthsInRange);

            // 2. Top Items in this Category
            const itemsMap: Record<string, number> = {};

            transactions.forEach(t => {
                const month = t.fechaValor.getMonth();
                const isIncome = t.importe > 0;
                const absAmount = Math.abs(t.importe);

                if (isIncome) {
                    const trendEntry = monthlyTrend.find(mt => mt.month === month + 1);
                    if (trendEntry) trendEntry.ingresos += t.importe;
                } else {
                    const trendEntry = monthlyTrend.find(mt => mt.month === month + 1);
                    if (trendEntry) trendEntry.gastos += absAmount;
                }

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

    // New Endpoint: Quarterly Report
    static async getQuarterlyReport(req: Request, res: Response) {
        try {
            const { year } = req.params;
            const { tipoItem, categoryId } = req.query; // Filters
            const yearNum = Number(year);

            if (isNaN(yearNum)) {
                return res.status(400).json(ApiResponseHelper.error('Invalid year'));
            }

            const qs = [
                { q: 1, start: new Date(yearNum, 0, 1), end: new Date(yearNum, 2, 31, 23, 59, 59) },
                { q: 2, start: new Date(yearNum, 3, 1), end: new Date(yearNum, 5, 30, 23, 59, 59) },
                { q: 3, start: new Date(yearNum, 6, 1), end: new Date(yearNum, 8, 30, 23, 59, 59) },
                { q: 4, start: new Date(yearNum, 9, 1), end: new Date(yearNum, 11, 31, 23, 59, 59) },
            ];

            const quartersData = [];

            for (const quarter of qs) {
                // Build dynamic filters
                const where: any = {
                    fechaValor: { gte: quarter.start, lte: quarter.end }
                };

                if (tipoItem) {
                    where.itemAsignado = {
                        itemTypeId: String(tipoItem)
                    };
                }

                if (categoryId) {
                    where.categoryId = String(categoryId);
                }

                if (req.query.itemAsignadoId) {
                    where.itemAsignadoId = String(req.query.itemAsignadoId);
                }

                const txs = await prisma.transaction.findMany({
                    where,
                    include: { itemAsignado: true }
                });

                let ingresos = 0;
                let gastos = 0;
                txs.forEach(t => {
                    if (t.importe > 0) ingresos += t.importe;
                    else gastos += Math.abs(t.importe);
                });

                quartersData.push({
                    quarter: quarter.q,
                    ingresos,
                    gastos,
                    neto: ingresos - gastos,
                    count: txs.length
                });
            }

            res.json(ApiResponseHelper.success(quartersData));
        } catch (error) {
            console.error('Error in getQuarterlyReport:', error);
            res.status(500).json(ApiResponseHelper.error('Error fetching quarterly report'));
        }
    }

    // New Endpoint: Stacked Trend (Mixed Chart: Stacked Expense + Income Line)
    static async getStackedTrend(req: Request, res: Response) {
        try {
            const { year } = req.params;
            const { tipoItem, categoryId, itemAsignadoId, quarter } = req.query; // Filters
            const yearNum = Number(year);

            if (isNaN(yearNum)) {
                return res.status(400).json(ApiResponseHelper.error('Invalid year'));
            }

            // Determine date range using existing helper
            const { start, end, monthsInRange } = AnalyticsController.getRange(yearNum, quarter);

            // Build dynamic filters
            const where: any = {
                fechaValor: {
                    gte: start,
                    lte: end
                }
            };

            if (tipoItem) where.itemAsignado = { itemTypeId: String(tipoItem) };
            if (categoryId) where.categoryId = String(categoryId);
            if (itemAsignadoId) where.itemAsignadoId = String(itemAsignadoId);

            // 1. Get all transactions for range
            const transactions = await prisma.transaction.findMany({
                where,
                include: { categoryRel: true, itemAsignado: { include: { itemType: true } } }
            });

            // 2. Identify Top 5 Expense Categories Overall
            const expenseCatTotals: Record<string, number> = {};
            transactions.forEach(t => {
                if (t.importe < 0) {
                    // @ts-ignore
                    const cat = t.categoryRel?.name || t.categoria || 'Otros';
                    expenseCatTotals[cat] = (expenseCatTotals[cat] || 0) + Math.abs(t.importe);
                }
            });

            const topCategories = Object.entries(expenseCatTotals)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5) // Top 5
                .map(([name]) => name);

            // 3. Build Buckets based on monthsInRange
            const buckets = monthsInRange.map(m => ({
                month: m,
                ingresos: 0,
                ...topCategories.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
                Otros: 0
            }));

            // 4. Fill Buckets
            transactions.forEach(t => {
                const m = t.fechaValor.getMonth() + 1; // 1-12
                const bucket = buckets.find(b => b.month === m);

                if (bucket) {
                    if (t.importe > 0) {
                        bucket.ingresos += t.importe;
                    } else {
                        // @ts-ignore
                        const cat = t.categoryRel?.name || t.categoria || 'Otros';
                        const absAmount = Math.abs(t.importe);

                        if (topCategories.includes(cat)) {
                            // @ts-ignore
                            bucket[cat] += absAmount;
                        } else {
                            bucket['Otros'] += absAmount;
                        }
                    }
                }
            });

            res.json(ApiResponseHelper.success({
                data: buckets,
                keys: [...topCategories, 'Otros']
            }));

        } catch (e) {
            console.error('Error in getStackedTrend:', e);
            res.status(500).json(ApiResponseHelper.error('Error fetching stacked trend'));
        }
    }
}

