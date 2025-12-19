import { Item } from '@prisma/client';

export interface ItemCreateInput {
    nombre: string;
    descripcion?: string;
    color?: string;
    icono?: string;
}

export interface ItemUpdateInput {
    nombre?: string;
    descripcion?: string;
    color?: string;
    icono?: string;
    activo?: boolean;
}

export interface ItemWithStats extends Item {
    transactionCount: number;
    totalAmount: number;
}