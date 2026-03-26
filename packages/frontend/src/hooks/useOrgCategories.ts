import { useOrganizationQuery } from './useOrganizationQuery';
import { apiClient } from '@/lib/api-client';
import { TransactionCategory } from '@/types';

export function useOrgCategories() {
    return useOrganizationQuery<TransactionCategory[]>({
        queryKey: ['categories'],
        queryFn: () => apiClient.getCategories()
    });
}
