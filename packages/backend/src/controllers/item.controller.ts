import { Request, Response } from 'express';
import { ItemsService } from '../services/items.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import { validateItem } from '../utils/validationHelpers';

export const listItems = async (req: Request, res: Response) => {
    const includeInactive = req.query.includeInactive === 'true';
    const items = await ItemsService.getAllItems(includeInactive);
    res.json(ApiResponseHelper.success(items));
};

export const createItem = async (req: Request, res: Response) => {
    const validation = validateItem(req.body);
    if (!validation.success) {
        throw new Error(validation.error.message);
    }

    const item = await ItemsService.createItem(req.body);
    res.status(201).json(ApiResponseHelper.success(item, 'Item created successfully'));
};

export const updateItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    const item = await ItemsService.updateItem(id, req.body);
    res.json(ApiResponseHelper.success(item));
};

export const deleteItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    await ItemsService.deleteItem(id);
    res.json(ApiResponseHelper.success(null, 'Item deleted successfully'));
};
