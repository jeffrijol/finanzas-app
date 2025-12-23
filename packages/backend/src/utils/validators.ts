import { z } from 'zod';

export const uploadSchema = z.object({
    file: z.object({
        originalname: z.string(),
        mimetype: z.enum([
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ]),
        size: z.number().max(10 * 1024 * 1024), // 10MB
    }),
});

export const transactionSchema = z.object({
    fechaValor: z.string().transform((str) => new Date(str)),
    categoria: z.string().min(1),
    descripcion: z.string().min(1),
    importe: z.number(),
    saldo: z.number(),
});

export const itemSchema = z.object({
    nombre: z.string().min(1).max(100),
    itemTypeId: z.string().cuid(),
    descripcion: z.string().optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    icono: z.string().optional(),
});

export const transactionUpdateSchema = z.object({
    itemAsignadoId: z.string().cuid().nullable().optional(),
    categoria: z.string().min(1).optional(),
    descripcion: z.string().min(1).optional(),
});
