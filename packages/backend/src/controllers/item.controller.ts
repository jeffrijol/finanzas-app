import { Request, Response } from 'express';
import prisma from '../prisma';

export const listItems = async (req: Request, res: Response) => {
    const items = await prisma.item.findMany({
        where: { activo: true },
        orderBy: { nombre: 'asc' }
    });
    res.json({ success: true, data: items });
};

export const createItem = async (req: Request, res: Response) => {
    const { nombre, descripcion, color } = req.body;
    const item = await prisma.item.create({
        data: { nombre, descripcion, color }
    });
    res.status(201).json({ success: true, data: item });
};

export const updateItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const item = await prisma.item.update({
        where: { id },
        data
    });
    res.json({ success: true, data: item });
};

export const deleteItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    // Soft delete
    await prisma.item.update({
        where: { id },
        data: { activo: false }
    });
    res.json({ success: true, message: 'Item deleted' });
};
