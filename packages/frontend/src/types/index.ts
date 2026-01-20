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
export interface ItemType {
    id: string;
    name: string;
    code: string;
    description?: string;
    categories?: TransactionCategory[];
}

export interface TransactionCategory {
    id: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
    itemTypeId: string;
}

export interface Transaction {
    id: string;
    fechaValor: string;
    categoria: string;
    descripcion: string;
    importe: number;
    saldo: number;
    itemAsignadoId?: string | null;
    itemAsignado?: Item | null;
    categoryId?: string | null;
    categoryRel?: TransactionCategory | null;
    excelUploadId?: string | null;
    metadata?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Item {
    id: string;
    nombre: string;
    descripcion?: string;
    itemTypeId: string;
    itemType?: ItemType;
    color?: string;
    icono?: string;
    activo: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ExcelUpload {
    id: string;
    filename: string;
    fileSize: number;
    totalRows: number;
    processed: boolean;
    createdAt?: string;
    transactions?: Partial<Transaction>[];
    stats?: {
        minDate: string;
        maxDate: string;
        totalImporte: number;
    };
}

export interface TransactionStats {
    totalIngresos: number;
    totalGastos: number;
    balance: number;
    totalTransacciones: number;
    transaccionesConItem: number;
    transaccionesPorItem: {
        itemId: string;
        nombreItem: string;
        color?: string;
        totalTransacciones: number;
        total: number;
    }[];
    porTipoItem: {
        tipo: string;
        ingresos: number;
        gastos: number;
    }[];
    porCategoria: {
        categoria: string;
        ingresos: number;
        gastos: number;
    }[];
    porCategoryRel: {
        categoria: string;
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
