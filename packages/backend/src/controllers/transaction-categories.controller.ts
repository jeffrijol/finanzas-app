import { Request, Response, NextFunction } from 'express';
import { TransactionCategoriesService } from '../services/transaction-categories.service';
import { categorySchema } from '../utils/validators';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const categories = await TransactionCategoriesService.getAllCategories(userId);
        res.json({ data: categories });
    } catch (error) {
        next(error);
    }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const category = await TransactionCategoriesService.getCategoryById(userId, id);
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
        const userId = (req as any).user.id;
        const validatedData = categorySchema.parse(req.body);
        const category = await TransactionCategoriesService.createCategory(userId, validatedData);
        res.status(201).json({ data: category });
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        // Allow partial updates for flexibility, though usually we update full object in forms
        const partialSchema = categorySchema.partial();
        const validatedData = partialSchema.parse(req.body);

        const category = await TransactionCategoriesService.updateCategory(userId, id, validatedData);
        res.json({ data: category });
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        await TransactionCategoriesService.deleteCategory(userId, id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
