# Auditoría de Aislamiento de Datos Multi-Tenant

**Fecha:** 28 de Enero de 2026
**Estatus:** Completado ✅

## Resumen Ejecutivo

Se realizó una auditoría exhaustiva y refactorización del frontend de `finanzas-app` para garantizar el estricto aislamiento de datos entre organizaciones (multi-tenancy). El objetivo principal fue prevenir fugas de datos (leakage), estados de interfaz obsoletos (stale UI) y asegurar que cada visualización corresponda unívocamente a la organización seleccionada.

## Hallazgos y Soluciones

### 1. Consultas sin Scope de Organización (Data Leakage Risk)

**Hallazgo:** Varios componentes utilizaban `useQuery` de forma directa sin incluir el `organizationId` en la `queryKey`. Esto permitía que datos de la Organización A persistieran en la caché y se mostraran brevemente al cambiar a la Organización B.
**Solución:** Se implementó una arquitectura de Hooks de Dos Niveles.

- **Nivel 1 (`useOrganizationQuery`):** Hook base que inyecta automáticamente el `organizationId` en la posición 1 de la `queryKey` (`['key', orgId, filters]`).
- **Nivel 2 (Hooks de Entidad):** `useOrgTransactions`, `useOrgStats`, `useOrgItems`, etc., que encapsulan la lógica y aseguran el uso correcto del Nivel 1.

### 2. Estado de UI Obsoleto (Stale State Risk)

**Hallazgo:** Al cambiar de organización, estados locales como la paginación (página 5) y filtros globales (Categoría seleccionada) se mantenían. Si la nueva organización no tenía datos en esa página o categoría, se mostraban estados vacíos o erróneos.
**Solución:** Se implementaron efectos de "State Reset" en `DashboardPage` y `ExcelsPage`.

- Al detectar cambio en `currentOrg.id`, se resetea la paginación a 1.
- Se limpian filtros globales y selecciones locales.

### 3. Invalidación de Caché Imprecisa (Performance/Integrity Risk)

**Hallazgo:** Las invalidaciones eran genéricas (`invalidateQueries(['items'])`), lo que provocaba la refectura de datos de todas las organizaciones cacheadas, o potenciales condiciones de carrera.
**Solución:** Se adoptó "Strict Invalidation".

- Las mutaciones ahora invalidan claves específicas: `queryClient.invalidateQueries({ queryKey: ['items', currentOrg.id] })`.
- Esto asegura que solo se refresquen los datos de la organización activa.

### 4. Sincronización de API Client

**Hallazgo:** Existía una latencia entre el cambio de estado en React y la actualización del header `X-Organization-ID` en el cliente API.
**Solución:** Se modificó `OrganizationProvider` para actualizar síncronamente el `apiClient` antes de disparar actualizaciones de estado de React.

## Componentes Auditaros y Refactorizados

El 100% de las vistas principales del Dashboard han sido migradas:

- `GeneralDashboard`
- `CategoryDashboard`, `ItemDashboard`, `TypeDashboard`
- `ItemsList`, `CategoriesList`
- `TransactionsTable` (y su contenedor `DashboardPage`)
- `ExcelsPage` (Gestión de Excels)

## Conclusión

El sistema frontend ahora cumple con los estándares de aislamiento de datos multi-tenant. La arquitectura de hooks implementada facilita que futuros desarrollos mantengan este estándar por defecto ("secure by default"), ya que `useOrganizationQuery` maneja la complejidad del scope automáticamente.
