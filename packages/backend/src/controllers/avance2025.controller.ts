import { Request, Response } from 'express';
import prisma from '../prisma';

const ORG_ID = 'c5d2bd58-34c9-4c78-85d0-d813239c5d32'; // Organización "Avance"
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const getAvance2025Data = async (req: Request, res: Response) => {
  try {
    const startDate = new Date('2025-01-01T00:00:00Z');
    const endDate = new Date('2026-01-01T00:00:00Z');

    const transactions = await prisma.transaction.findMany({
      where: {
        organizationId: ORG_ID,
        fechaValor: { gte: startDate, lt: endDate }
      },
      include: {
        itemAsignado: { include: { itemType: true } },
        categoryRel: true
      },
      orderBy: { fechaValor: 'asc' }
    });

    // ─────────── 1. MÉTRICAS GLOBALES ───────────
    const totalIncome = transactions.filter(t => t.importe > 0).reduce((s, t) => s + t.importe, 0);
    const totalExpense = transactions.filter(t => t.importe < 0).reduce((s, t) => s + Math.abs(t.importe), 0);
    const transactionCount = transactions.length;
    const assignedCount = transactions.filter(t => t.itemAsignadoId).length;

    // ─────────── 2. EVOLUCIÓN MENSUAL GLOBAL (para el gráfico de portada) ───────────
    const monthlyGlobal = MONTHS.map((name, i) => {
      const monthTx = transactions.filter(t => new Date(t.fechaValor).getMonth() === i);
      const ingresos = monthTx.filter(t => t.importe > 0).reduce((s, t) => s + t.importe, 0);
      const gastos = monthTx.filter(t => t.importe < 0).reduce((s, t) => s + Math.abs(t.importe), 0);
      return { month: name, shortMonth: name.slice(0, 3), ingresos, gastos, balance: ingresos - gastos };
    });

    // ─────────── 3. ANÁLISIS POR ITEM TYPE ───────────
    // Estructura agrupada: { "Avanze Sociedad": { items: { "Empresa X": {...} }, categories: {...} } }
    const itemTypeMap: Record<string, {
      totalIncome: number;
      totalExpense: number;
      txCount: number;
      items: Record<string, {
        ingresos: number;
        gastos: number;
        txCount: number;
        mensual: { month: string; shortMonth: string; balance: number; ingresos: number; gastos: number }[];
      }>;
      topIncomeCategories: { name: string; amount: number }[];
      topExpenseCategories: { name: string; amount: number }[];
    }> = {};

    for (const t of transactions) {
      if (!t.itemAsignado) continue;
      const typeName = t.itemAsignado.itemType.name;
      const itemName = t.itemAsignado.nombre;
      const categoryName = t.categoryRel?.name ?? 'Sin categoría';
      const monthIdx = new Date(t.fechaValor).getMonth();
      const isIncome = t.importe > 0;
      const absAmount = Math.abs(t.importe);

      if (!itemTypeMap[typeName]) {
        itemTypeMap[typeName] = {
          totalIncome: 0, totalExpense: 0, txCount: 0,
          items: {},
          topIncomeCategories: [],
          topExpenseCategories: []
        };
      }
      const typeEntry = itemTypeMap[typeName];
      isIncome ? (typeEntry.totalIncome += absAmount) : (typeEntry.totalExpense += absAmount);
      typeEntry.txCount++;

      if (!typeEntry.items[itemName]) {
        typeEntry.items[itemName] = {
          ingresos: 0, gastos: 0, txCount: 0,
          mensual: MONTHS.map((m, i) => ({ month: m, shortMonth: m.slice(0, 3), balance: 0, ingresos: 0, gastos: 0 }))
        };
      }
      const itemEntry = typeEntry.items[itemName];
      isIncome ? (itemEntry.ingresos += absAmount) : (itemEntry.gastos += absAmount);
      itemEntry.txCount++;
      if (isIncome) {
        itemEntry.mensual[monthIdx].ingresos += absAmount;
      } else {
        itemEntry.mensual[monthIdx].gastos += absAmount;
      }
      itemEntry.mensual[monthIdx].balance += t.importe;
    }

    // Calcular top categorías por ItemType
    for (const t of transactions) {
      if (!t.itemAsignado) continue;
      const typeName = t.itemAsignado.itemType.name;
      const categoryName = t.categoryRel?.name ?? 'Sin categoría';
      const typeEntry = itemTypeMap[typeName];
      const absAmount = Math.abs(t.importe);
      const isIncome = t.importe > 0;

      if (isIncome) {
        const existing = typeEntry.topIncomeCategories.find(c => c.name === categoryName);
        existing ? (existing.amount += absAmount) : typeEntry.topIncomeCategories.push({ name: categoryName, amount: absAmount });
      } else {
        const existing = typeEntry.topExpenseCategories.find(c => c.name === categoryName);
        existing ? (existing.amount += absAmount) : typeEntry.topExpenseCategories.push({ name: categoryName, amount: absAmount });
      }
    }

    // Ordenar y limitar a top 5
    for (const key of Object.keys(itemTypeMap)) {
      itemTypeMap[key].topIncomeCategories.sort((a, b) => b.amount - a.amount);
      itemTypeMap[key].topIncomeCategories = itemTypeMap[key].topIncomeCategories.slice(0, 5);
      itemTypeMap[key].topExpenseCategories.sort((a, b) => b.amount - a.amount);
      itemTypeMap[key].topExpenseCategories = itemTypeMap[key].topExpenseCategories.slice(0, 5);
    }

    res.json({
      success: true,
      data: {
        organization: 'Avance',
        year: 2025,
        global: { totalIncome, totalExpense, transactionCount, assignedCount, netCapital: totalIncome - totalExpense },
        monthlyGlobal,
        itemTypeAnalysis: itemTypeMap
      }
    });
  } catch (error) {
    console.error('Error en getAvance2025Data:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
