import { Request, Response, NextFunction } from 'express';
import { TransactionCategoriesService } from '../services/transaction-categories.service';
import { categorySchema } from '../utils/validators';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = (req as any).organizationId;
        const categories = await TransactionCategoriesService.getAllCategories(organizationId);
        res.json({ data: categories });
    } catch (error) {
        next(error);
    }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const organizationId = (req as any).organizationId;
        const category = await TransactionCategoriesService.getCategoryById(organizationId, id);
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        res.json({ data: category });
    } catch (error) {
        next(error);
    }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = (req as any).organizationId;
        const userId = (req as any).user.id;
        const validatedData = categorySchema.parse(req.body);
        const category = await TransactionCategoriesService.createCategory(organizationId, userId, validatedData);
        res.status(201).json({ data: category });
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const organizationId = (req as any).organizationId;
        // Allow partial updates for flexibility, though usually we update full object in forms
        const partialSchema = categorySchema.partial();
        const validatedData = partialSchema.parse(req.body);

        const category = await TransactionCategoriesService.updateCategory(organizationId, id, validatedData);
        res.json({ data: category });
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const organizationId = (req as any).organizationId;
        await TransactionCategoriesService.deleteCategory(organizationId, id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
