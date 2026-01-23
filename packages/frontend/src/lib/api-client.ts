import type {
    ApiResponse,
    PaginatedResponse,
    Transaction,
    Item,
    ItemType,
    TransactionCategory,
    TransactionStats,
    ExcelUpload,
} from '../types';
import { supabase } from './supabase';

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

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            if (response.status === 204) {
                return {} as any;
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

    async getItems(params?: { includeInactive?: boolean }): Promise<Item[]> {
        const queryParams = new URLSearchParams();
        if (params?.includeInactive) {
            queryParams.append('includeInactive', 'true');
        }
        const endpoint = params ? `/items?${queryParams.toString()}` : '/items';
        const response = await this.request<Item[]>(endpoint);
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

    // Transaction Category Endpoints
    async getCategories(): Promise<TransactionCategory[]> {
        const response = await this.request<TransactionCategory[]>('/transaction-categories');
        return response.data;
    }

    async createCategory(data: Omit<TransactionCategory, 'id'>): Promise<TransactionCategory> {
        const response = await this.request<TransactionCategory>('/transaction-categories', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.data;
    }

    async updateCategory(id: string, data: Partial<TransactionCategory>): Promise<TransactionCategory> {
        const response = await this.request<TransactionCategory>(`/transaction-categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response.data;
    }

    async deleteCategory(id: string): Promise<void> {
        await this.request<void>(`/transaction-categories/${id}`, {
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
        tier?: string;
        search?: string;
        quarter?: number;
        year?: number;
        categoryId?: string;
        excelUploadId?: string;
    } = {}): Promise<PaginatedResponse<Transaction>> {
        const params = new URLSearchParams();

        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.categoria) params.append('categoria', filters.categoria);
        if (filters.itemAsignadoId) params.append('itemAsignadoId', filters.itemAsignadoId);
        if (filters.excelUploadId) params.append('excelUploadId', filters.excelUploadId);
        if (filters.tipoItem) params.append('tipoItem', filters.tipoItem);
        if (filters.search) params.append('search', filters.search);
        if (filters.quarter) params.append('quarter', filters.quarter.toString());
        if (filters.year) params.append('year', filters.year.toString());
        if (filters.categoryId) params.append('categoryId', filters.categoryId);

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
        excelUploadId?: string | null;
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
        categoryId?: string;
    } = {}): Promise<TransactionStats> {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.year) params.append('year', filters.year.toString());
        if (filters.quarter) params.append('quarter', filters.quarter.toString());
        if (filters.tipoItem) params.append('tipoItem', filters.tipoItem);
        if (filters.itemAsignadoId) params.append('itemAsignadoId', filters.itemAsignadoId);
        if (filters.categoryId) params.append('categoryId', filters.categoryId);

        const queryString = params.toString();
        const response = await this.request<TransactionStats>(`/transactions/stats${queryString ? `?${queryString}` : ''}`);
        return response.data;
    }

    async getTypeStats(typeId: string, year: number, quarter?: number | 'all'): Promise<{
        monthlyTrend: { month: number; ingresos: number; gastos: number }[];
        categoryDistribution: { categoria: string; ingresos: number; gastos: number }[];
        topItems: { name: string; amount: number }[];
    }> {
        const response = await this.request<any>(`/analytics/type/${typeId}?year=${year}&quarter=${quarter || 'all'}`);
        return response.data;
    }


    async getItemStats(itemId: string, year: number, quarter?: number | 'all'): Promise<{
        monthlyTrend: { month: number; ingresos: number; gastos: number }[];
        categoryDistribution: { categoria: string; ingresos: number; gastos: number }[];
        totalIngresos: number;
        totalGastos: number;
        averageMonthlyExpense: number;
    }> {
        const response = await this.request<any>(`/analytics/item/${itemId}?year=${year}&quarter=${quarter || 'all'}`);
        return response.data;
    }

    async getCategoryStats(categoryId: string, year: number, quarter?: number | 'all'): Promise<{
        monthlyTrend: { month: number; ingresos: number; gastos: number }[];
        topItems: { name: string; amount: number }[];
    }> {
        const response = await this.request<any>(`/analytics/category/${categoryId}?year=${year}&quarter=${quarter || 'all'}`);
        return response.data;
    }

    async getQuarterlyReport(year: number, filters?: { tipoItem?: string; categoryId?: string; itemAsignadoId?: string; quarter?: number }): Promise<{
        quarter: number;
        ingresos: number;
        gastos: number;
        neto: number;
        count: number;
    }[]> {
        const params = new URLSearchParams();
        if (filters?.tipoItem) params.append('tipoItem', filters.tipoItem);
        if (filters?.categoryId) params.append('categoryId', filters.categoryId);
        if (filters?.itemAsignadoId) params.append('itemAsignadoId', filters.itemAsignadoId);
        // Quarter logic usually means we filter *within* the year, but quarterly report usually returns all 4 quarters? 
        // If we filter by Q1, it will just return Q1 data.
        if (filters?.quarter) params.append('quarter', filters.quarter.toString());

        const response = await this.request<any>(`/analytics/quarterly/${year}?${params.toString()}`);
        return response.data;
    }

    async getStackedTrend(year: number, filters?: { tipoItem?: string; categoryId?: string; itemAsignadoId?: string; quarter?: number }): Promise<{
        data: any[];
        keys: string[];
    }> {
        const params = new URLSearchParams();
        if (filters?.tipoItem) params.append('tipoItem', filters.tipoItem);
        if (filters?.categoryId) params.append('categoryId', filters.categoryId);
        if (filters?.itemAsignadoId) params.append('itemAsignadoId', filters.itemAsignadoId);
        if (filters?.quarter) params.append('quarter', filters.quarter.toString());

        const response = await this.request<any>(`/analytics/stacked-trend/${year}?${params.toString()}`);
        return response.data;
    }

    // Upload endpoint
    async uploadFile(file: File): Promise<ExcelUpload> {
        const formData = new FormData();
        formData.append('file', file);

        const url = `${this.baseURL}/upload`;

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers,
                // Don't set Content-Type header, let browser set it with boundary
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Upload failed with status: ${response.status}`);
            }

            const result: ApiResponse<ExcelUpload> = await response.json();
            return result.data;
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    }
    async finalizeUpload(id: string): Promise<void> {
        await this.request<void>(`/upload/${id}/finalize`, {
            method: 'PUT',
        });
    }
    async getExcelUploads(): Promise<ExcelUpload[]> {
        const response = await this.request<ExcelUpload[]>('/excel-uploads');
        return response.data;
    }

    async getExcelUploadDetails(id: string): Promise<ExcelUpload> {
        const response = await this.request<ExcelUpload>(`/excel-uploads/${id}`);
        return response.data;
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
