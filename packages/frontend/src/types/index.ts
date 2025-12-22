// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    meta?: any;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Domain types
export interface Transaction {
    id: string;
    fechaValor: string;
    categoria: string;
    descripcion: string;
    importe: number;
    saldo: number;
    itemAsignadoId?: string | null;
    itemAsignado?: Item | null;
    metadata?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Item {
    id: string;
    nombre: string;
    descripcion?: string;
    tipo: 'BIENES_INMUEBLES' | 'INVERSIONES';
    color?: string;
    icono?: string;
    activo: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UploadResponse {
    filename: string;
    fileSize: number;
    totalRows: number;
    processed: boolean;
    transactions?: Partial<Transaction>[];
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
}

// Filter types
export interface TransactionFilters {
    page?: number;
    limit?: number;
    categoria?: string;
    sinAsignar?: boolean;
    search?: string;
}
