export interface ExcelTransaction {
    fechaValor: string;
    categoria: string;
    descripcion: string;
    importe: number;
    saldo: number;
    fechaContable?: string;
    clave?: string;
    referencia?: string;
    ref16?: string;
    debe?: number;
    haber?: number;
}

export interface TransactionCreateInput {
    fechaValor: Date;
    categoria: string;
    descripcion: string;
    importe: number;
    saldo: number;
    itemAsignadoId?: string;
    metadata?: Record<string, any>;
}

export interface TransactionUpdateInput {
    itemAsignadoId?: string | null;
    categoria?: string;
    descripcion?: string;
}

export interface TransactionFilters {
    startDate?: Date;
    endDate?: Date;
    categoria?: string;
    itemAsignadoId?: string;
    tipoItem?: string;
    search?: string;
    minAmount?: number;
    maxAmount?: number;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface TransactionStats {
    totalIngresos: number;
    totalGastos: number;
    balance: number;
    transaccionesPorItem: {
        itemId: string;
        itemNombre: string;
        cantidad: number;
        total: number;
    }[];
    porTipoItem: {
        tipo: string;
        ingresos: number;
        gastos: number;
    }[];
    sinAsignar: {
        cantidad: number;
        total: number;
    };
    totalTransacciones: number;
    transaccionesConItem: number;
}