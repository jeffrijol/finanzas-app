import { Request, Response } from 'express';
import { TransactionsService } from '../services/transactions.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import { transactionUpdateSchema } from '../utils/validators';

export const listTransactions = async (req: Request, res: Response) => {
    const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        categoria: req.query.categoria as string,
        itemAsignadoId: req.query.itemAsignadoId as string,
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
    const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        categoria: req.query.categoria as string,
        itemAsignadoId: req.query.itemAsignadoId as string,
    };

    const stats = await TransactionsService.getStats(filters);
    res.json(ApiResponseHelper.success(stats));
};
