import { useOrganizationQuery } from './useOrganizationQuery';
import { apiClient } from '@/lib/api-client';
import { Transaction, PaginatedResponse } from '@/types';

interface OrgTransactionsFilters {
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
}

export function useOrgTransactions(filters: OrgTransactionsFilters = {}) {
    return useOrganizationQuery<PaginatedResponse<Transaction>>({
        queryKey: ['transactions', filters],
        queryFn: () => apiClient.getTransactions(filters)
    });
}
