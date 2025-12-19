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
    search?: string;
    minAmount?: number;
    maxAmount?: number;
}