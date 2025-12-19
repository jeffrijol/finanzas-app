import { Request, Response } from 'express';
import { ItemsService } from '../services/items.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import { itemSchema } from '../utils/validators';

export const listItems = async (req: Request, res: Response) => {
    const includeInactive = req.query.includeInactive === 'true';
    const items = await ItemsService.getAllItems(includeInactive);
    res.json(ApiResponseHelper.success(items));
};

export const createItem = async (req: Request, res: Response) => {
    const validation = itemSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json(
            ApiResponseHelper.error('Datos del item inválidos', validation.error.issues)
        );
    }

    const item = await ItemsService.createItem(validation.data);
    res.status(201).json(ApiResponseHelper.success(item, 'Item created successfully'));
};

export const updateItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    const validation = itemSchema.partial().safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json(
            ApiResponseHelper.error('Datos de actualización inválidos', validation.error.issues)
        );
    }

    const item = await ItemsService.updateItem(id, validation.data);
    res.json(ApiResponseHelper.success(item));
};

export const deleteItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    await ItemsService.deleteItem(id);
    res.json(ApiResponseHelper.success(null, 'Item deleted successfully'));
};
