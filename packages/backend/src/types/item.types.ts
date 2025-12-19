export interface ItemCreateInput {
    nombre: string;
    descripcion?: string;
    color?: string;
}

export interface ItemUpdateInput {
    nombre?: string;
    descripcion?: string;
    color?: string;
    activo?: boolean;
}

import { Item } from '@prisma/client';

export interface ItemWithStats extends Item {
    transactionCount: number;
    totalAmount: number;
}