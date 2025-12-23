import type {
    ApiResponse,
    PaginatedResponse,
    Transaction,
    Item,
    ItemType,
    UploadResponse,
    TransactionStats,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Items endpoints
    async getItemTypes(): Promise<ItemType[]> {
        const response = await this.request<ItemType[]>('/item-types');
        return response.data;
    }

    async getItems(): Promise<Item[]> {
        const response = await this.request<Item[]>('/items');
        return response.data;
    }

    async createItem(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> {
        const response = await this.request<Item>('/items', {
            method: 'POST',
            body: JSON.stringify(item),
        });
        return response.data;
    }

    async updateItem(id: string, item: Partial<Item>): Promise<Item> {
        const response = await this.request<Item>(`/items/${id}`, {
            method: 'PUT',
            body: JSON.stringify(item),
        });
        return response.data;
    }

    async deleteItem(id: string): Promise<void> {
        await this.request<void>(`/items/${id}`, {
            method: 'DELETE',
        });
    }

    // Transactions endpoints
    async getTransactions(filters: {
        page?: number;
        limit?: number;
        categoria?: string;
        itemAsignadoId?: string;
        tipoItem?: string;
        search?: string;
        quarter?: number;
        year?: number;
    } = {}): Promise<PaginatedResponse<Transaction>> {
        const params = new URLSearchParams();

        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.categoria) params.append('categoria', filters.categoria);
        if (filters.itemAsignadoId) params.append('itemAsignadoId', filters.itemAsignadoId);
        if (filters.tipoItem) params.append('tipoItem', filters.tipoItem);
        if (filters.search) params.append('search', filters.search);
        if (filters.quarter) params.append('quarter', filters.quarter.toString());
        if (filters.year) params.append('year', filters.year.toString());

        const queryString = params.toString();
        const endpoint = `/transactions${queryString ? `?${queryString}` : ''}`;

        const response = await this.request<Transaction[]>(endpoint);

        return {
            items: response.data,
            total: response.meta?.total || 0,
            page: response.meta?.page || 1,
            limit: response.meta?.limit || 10,
            totalPages: response.meta?.totalPages || 1,
        };
    }

    async createTransaction(data: {
        fechaValor: string;
        descripcion: string;
        importe: number;
        categoria: string;
        itemAsignadoId?: string | null;
        categoryId?: string | null;
    }): Promise<Transaction> {
        const response = await this.request<Transaction>('/transactions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.data;
    }

    async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
        const response = await this.request<Transaction>(`/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response.data;
    }

    async getStats(filters: {
        startDate?: string;
        endDate?: string;
        year?: number;
        quarter?: number;
        tipoItem?: string;
        itemAsignadoId?: string;
    } = {}): Promise<TransactionStats> {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.year) params.append('year', filters.year.toString());
        if (filters.quarter) params.append('quarter', filters.quarter.toString());
        if (filters.tipoItem) params.append('tipoItem', filters.tipoItem);
        if (filters.itemAsignadoId) params.append('itemAsignadoId', filters.itemAsignadoId);

        const queryString = params.toString();
        const response = await this.request<TransactionStats>(`/transactions/stats${queryString ? `?${queryString}` : ''}`);
        return response.data;
    }

    // Upload endpoint
    async uploadFile(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const url = `${this.baseURL}/upload`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                // Don't set Content-Type header, let browser set it with boundary
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Upload failed with status: ${response.status}`);
            }

            const result: ApiResponse<UploadResponse> = await response.json();
            return result.data;
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
