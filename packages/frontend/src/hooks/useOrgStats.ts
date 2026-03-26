import { useOrganizationQuery } from './useOrganizationQuery';
import { apiClient } from '@/lib/api-client';
import { TransactionStats } from '@/types';

interface OrgStatsFilters {
    year: number;
    quarter?: number | 'all';
    tipoItem?: string;
    itemAsignadoId?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
}

export function useOrgStats(filters: OrgStatsFilters) {
    return useOrganizationQuery<TransactionStats>({
        queryKey: ['stats', filters],
        queryFn: () => apiClient.getStats({
            year: filters.year,
            quarter: filters.quarter === 'all' ? undefined : filters.quarter,
            tipoItem: filters.tipoItem,
            itemAsignadoId: filters.itemAsignadoId,
            categoryId: filters.categoryId,
            startDate: filters.startDate,
            endDate: filters.endDate,
        })
    });
}

export function useOrgCategoryStats(categoryId: string, year: number, quarter?: number | 'all') {
    return useOrganizationQuery({
        queryKey: ['categoryStats', categoryId, year, quarter],
        queryFn: () => apiClient.getCategoryStats(categoryId, year, quarter),
        enabled: !!categoryId && categoryId !== 'ALL'
    });
}

export function useOrgTypeStats(typeId: string, year: number, quarter?: number | 'all') {
    return useOrganizationQuery({
        queryKey: ['typeStats', typeId, year, quarter],
        queryFn: () => apiClient.getTypeStats(typeId, year, quarter),
        enabled: !!typeId && typeId !== 'ALL'
    });
}

export function useOrgItemStats(itemId: string, year: number, quarter?: number | 'all') {
    return useOrganizationQuery({
        queryKey: ['itemStats', itemId, year, quarter],
        queryFn: () => apiClient.getItemStats(itemId, year, quarter),
        enabled: !!itemId
    });
}
