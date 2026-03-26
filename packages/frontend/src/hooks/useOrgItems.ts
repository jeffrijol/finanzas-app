import { useOrganizationQuery } from './useOrganizationQuery';
import { apiClient } from '@/lib/api-client';
import { Item } from '@/types';

interface OrgItemsFilters {
    includeInactive?: boolean;
}

export function useOrgItems(filters: OrgItemsFilters = {}) {
    return useOrganizationQuery<Item[]>({
        queryKey: ['items', filters],
        queryFn: () => apiClient.getItems(filters)
    });
}
