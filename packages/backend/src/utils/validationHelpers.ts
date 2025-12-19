import { z } from 'zod';

export const transactionSchema = z.object({
    fechaValor: z.string().transform((str) => new Date(str)),
    categoria: z.string().min(1),
    descripcion: z.string().min(1),
    importe: z.number(),
    saldo: z.number(),
});

export const itemSchema = z.object({
    nombre: z.string().min(1).max(100),
    descripcion: z.string().optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    icono: z.string().optional(),
});

export const transactionUpdateSchema = z.object({
    itemAsignadoId: z.string().nullable().optional(),
    categoria: z.string().optional(),
    descripcion: z.string().optional(),
});

export function validateTransaction(data: any) {
    return transactionSchema.safeParse(data);
}

export function validateItem(data: any) {
    return itemSchema.safeParse(data);
}

export function validateTransactionUpdate(data: any) {
    return transactionUpdateSchema.safeParse(data);
}
