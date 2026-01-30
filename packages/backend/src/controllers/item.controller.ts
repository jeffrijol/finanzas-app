import { Request, Response } from 'express';
import { ItemsService } from '../services/items.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import { itemSchema } from '../utils/validators';

export const listItems = async (req: Request, res: Response) => {
    const organizationId = (req as any).organizationId;
    const includeInactive = req.query.includeInactive === 'true';
    const items = await ItemsService.getAllItems(organizationId, includeInactive);
    res.json(ApiResponseHelper.success(items));
};

export const getItemTypes = async (req: Request, res: Response) => {
    const types = await ItemsService.getItemTypes();
    res.json(ApiResponseHelper.success(types));
};

export const createItem = async (req: Request, res: Response) => {
    const validation = itemSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json(
            ApiResponseHelper.error('Datos del item inválidos', validation.error.issues)
        );
    }

    const organizationId = (req as any).organizationId;
    const userId = (req as any).user.id;
    const item = await ItemsService.createItem(organizationId, userId, validation.data);
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

    const organizationId = (req as any).organizationId;
    const item = await ItemsService.updateItem(organizationId, id, validation.data);
    res.json(ApiResponseHelper.success(item));
};

export const deleteItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    const organizationId = (req as any).organizationId;
    await ItemsService.deleteItem(organizationId, id);
    res.json(ApiResponseHelper.success(null, 'Item deleted successfully'));
};
