import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { useOrganization } from '@/providers/OrganizationProvider';

interface OrganizationQueryOptions<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> extends Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey'> {
  queryKey: TQueryKey;
  /**
   * Si es true, la query se ejecuta incluso si no hay organización seleccionada
   * Útil para datos globales (ej: ItemType que no es tenant-specific)
   * @default false
   */
  skipOrgDependency?: boolean;
}

/**
 * Organization-aware query hook with smart caching and auto org-id injection
 * 
 * Features:
 * - Waits for organization to load before executing (unless skipOrgDependency)
 * - Automatically includes orgId in query key for cache isolation
 * - Provides metadata for debugging
 * 
 * @example
 * // Org-dependent query
 * const { data } = useOrganizationQuery({
 *   queryKey: ['items'],
 *   queryFn: () => apiClient.getItems()
 * });
 * 
 * @example
 * // Global query (no org dependency)
 * const { data } = useOrganizationQuery({
 *   queryKey: ['item-types'],
 *   queryFn: () => apiClient.getItemTypes(),
 *   skipOrgDependency: true
 * });
 */
export function useOrganizationQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>({
  queryKey,
  skipOrgDependency = false,
  ...options
}: OrganizationQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  const { currentOrg } = useOrganization();

  // Determinar si la query debe habilitarse
  const shouldEnable = skipOrgDependency ? true : !!currentOrg;
  const enabled = shouldEnable && (options.enabled !== false);

  // Construir query key con o sin orgId
  // Insertamos orgId como SEGUNDO elemento para permitir invalidación jerárquica: ['key', orgId, ...rest]
  const finalQueryKey = skipOrgDependency
    ? queryKey
    : [queryKey[0], currentOrg?.id, ...queryKey.slice(1)].filter(Boolean) as unknown as TQueryKey;

  return useQuery({
    ...options,
    queryKey: finalQueryKey,
    enabled,
    // Metadata útil para debugging en React Query DevTools
    meta: {
      ...options.meta,
      organizationId: currentOrg?.id,
      requiresOrganization: !skipOrgDependency,
    },
  });
}

/**
 * Convenience hook for global queries that don't depend on organization
 * Alias for useOrganizationQuery with skipOrgDependency: true
 * 
 * @example
 * const { data: itemTypes } = useGlobalQuery({
 *   queryKey: ['itemTypes'],
 *   queryFn: () => apiClient.getItemTypes()
 * });
 */
export function useGlobalQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(options: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey'> & {
  queryKey: TQueryKey;
}) {
  return useOrganizationQuery({ ...options, skipOrgDependency: true });
}
