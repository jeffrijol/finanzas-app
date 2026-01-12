import { Request, Response, NextFunction } from 'express';
import { TransactionCategoriesService } from '../services/transaction-categories.service';
import { categorySchema } from '../utils/validators';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await TransactionCategoriesService.getAllCategories();
        res.json({ data: categories });
    } catch (error) {
        next(error);
    }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const category = await TransactionCategoriesService.getCategoryById(id);
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
        const validatedData = categorySchema.parse(req.body);
        const category = await TransactionCategoriesService.createCategory(validatedData);
        res.status(201).json({ data: category });
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        // Allow partial updates for flexibility, though usually we update full object in forms
        const partialSchema = categorySchema.partial();
        const validatedData = partialSchema.parse(req.body);

        const category = await TransactionCategoriesService.updateCategory(id, validatedData);
        res.json({ data: category });
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await TransactionCategoriesService.deleteCategory(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
