import { Request, Response } from 'express';
import { TransactionsService } from '../services/transactions.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import { transactionUpdateSchema } from '../utils/validators';

// Helper para fechas
const getPeriodDates = (yearStr?: string, quarterStr?: string) => {
    if (!yearStr) return {};

    const year = Number(yearStr);
    const quarter = quarterStr ? Number(quarterStr) : undefined;

    let startDate = new Date(year, 0, 1);
    let endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    if (quarter && !isNaN(quarter) && quarter >= 1 && quarter <= 4) {
        const startMonth = (quarter - 1) * 3;
        // Fin del trimestre: último día del tercer mes
        // mes clave para Date: 0=Ene, 1=Feb...
        // Q1: start=0 (Ene), end=2 (Mar). Date(year, 3, 0) -> Ultimo dia Mar
        endDate = new Date(year, startMonth + 3, 0, 23, 59, 59, 999);
        startDate = new Date(year, startMonth, 1);
    }

    return { startDate, endDate };
};

export const listTransactions = async (req: Request, res: Response) => {
    // Calcular fechas desde year/quarter si existen y no hay start/end explícitos
    const periodDates = getPeriodDates(req.query.year as string, req.query.quarter as string);

    const filters = {
        startDate: (req.query.startDate ? new Date(req.query.startDate as string) : undefined) || periodDates.startDate,
        endDate: (req.query.endDate ? new Date(req.query.endDate as string) : undefined) || periodDates.endDate,
        categoria: req.query.categoria as string,
        itemAsignadoId: req.query.itemAsignadoId as string,
        excelUploadId: req.query.excelUploadId as string,
        tipoItem: req.query.tipoItem as string,
        search: req.query.search as string,
        minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
        maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
    };

    const pagination = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const result = await TransactionsService.getTransactions(filters, pagination);

    res.json(ApiResponseHelper.paginated(
        result.transactions,
        result.total,
        result.page,
        result.limit
    ));
};

export const createTransaction = async (req: Request, res: Response) => {
    const { fechaValor, descripcion, importe, categoria, saldo, itemAsignadoId, categoryId, metadata, excelUploadId } = req.body;

    // Validación básica
    if (!fechaValor || !descripcion || importe === undefined) {
        return res.status(400).json(
            ApiResponseHelper.error('Faltan campos requeridos: fechaValor, descripcion, importe')
        );
    }

    const newTransaction = await TransactionsService.createTransaction({
        fechaValor: new Date(fechaValor),
        descripcion,
        importe,
        categoria: categoria || 'Sin categoría',
        saldo: saldo || 0,
        itemAsignadoId: itemAsignadoId || null,
        categoryId: categoryId || null,
        metadata: metadata || null,
        excelUploadId: excelUploadId || null,
    });

    res.status(201).json(ApiResponseHelper.success(newTransaction, 'Transacción creada exitosamente'));
};

export const updateTransaction = async (req: Request, res: Response) => {
    const { id } = req.params;

    const validation = transactionUpdateSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json(
            ApiResponseHelper.error('Datos de actualización inválidos', validation.error.issues)
        );
    }

    const transaction = await TransactionsService.updateTransaction(id, validation.data);
    res.json(ApiResponseHelper.success(transaction));
};

export const getStats = async (req: Request, res: Response) => {
    const periodDates = getPeriodDates(req.query.year as string, req.query.quarter as string);

    const filters = {
        startDate: (req.query.startDate ? new Date(req.query.startDate as string) : undefined) || periodDates.startDate,
        endDate: (req.query.endDate ? new Date(req.query.endDate as string) : undefined) || periodDates.endDate,
        categoria: req.query.categoria as string,
        itemAsignadoId: req.query.itemAsignadoId as string,
        tipoItem: req.query.tipoItem as string,
    };

    const stats = await TransactionsService.getStats(filters);
    res.json(ApiResponseHelper.success(stats));
};
