# Changelog

Historial de cambios del proyecto siguiendo [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Added

- **Multi-Tenant Organization System (95% complete)**
  - New database tables: `Organization`, `Role`, `Member` with UUID primary keys
  - Row Level Security (RLS) enabled on all data tables with 28+ policies
  - Auto-assignment trigger: new users automatically join "Avance" organization as admins
  - Composite indexes for performance: `org_date`, `org_name`, `org_type`
  - Backend: `/api/organizations` router with endpoints (list, get, create, members)
  - Backend: Updated `protect` middleware with organizationId validation and membership checks
  - Backend: New `permissions` middleware with `requireRole()` helper
  - Frontend: `OrganizationProvider` context with cross-tab synchronization
  - Frontend: TypeScript types for Organization, Role, Member models
  - Frontend: APIClient auto-injects `X-Organization-ID` header in requests

### Changed

- **Database Migration to Multi-Tenant**
  - Migrated 422 transactions, 10 items, 23 categories to "Avance" organization
  - Added `organizationId UUID` field to Transaction, Item, TransactionCategory, ExcelUpload tables
  - Updated Prisma schema with Organization, Role, Member models
  - Changed unique constraints: `Item.nombre` now unique per organization, not per user
  - ItemType table remains global (all users can view, only admins can modify)

- **userId Audit Trail Implementation**
  - Updated `TransactionsService.createTransaction()` to accept and save authenticated user's UUID
  - Updated `ItemsService.createItem()` to accept and save authenticated user's UUID
  - Updated `TransactionCategoriesService.createCategory()` to accept and save authenticated user's UUID
  - Updated all corresponding controllers to extract `userId` from `req.user.id` and pass to services
  - Migrated 455 legacy records and 7 NULL records to actual user UUID `83cc7d1a-eb61-49d8-bbef-7b33076f40d0`

### Fixed

### Fixed

- **CRITICAL: Dashboard Startup Fix**
  - Resolved "Organization ID is required" error blocking application startup
  - Backend `auth` middleware now explicitly excludes `/api/organizations` from strict organization validation headers
  - Updated frontend `useOrganizationQuery` to robustly handle organization loading states

- **CRITICAL: ExcelService Multi-Tenant Isolation**
  - Added missing `organizationId` and `userId` parameters to `ExcelService.processExcelFile()`
  - Fixed batch transaction creation to include `organizationId` and `userId` fields
  - **Impact**: Prevents data leaks between organizations during Excel imports
  - **Risk**: Without this fix, imported transactions could bypass RLS policies

- **ExcelUpload Isolation**
  - Added missing `organizationId` field to ExcelUpload record creation in `upload.controller.ts`
  - Ensures ExcelUpload records are properly tenant-isolated

- **Backend Compilation Errors**
  - Fixed prisma import path in `auth.ts` middleware (from `../config/database` to `../lib/prisma`)
  - Temporarily disabled `getGeneralStats` endpoint (returns HTTP 501) - endpoint not used by frontend

### Technical

- Regenerated Prisma Client v5.10.0 with new multi-tenant models
- Created SQL helper function `public.get_user_organizations()` for RLS policies
- Implemented ownership transfer function for organizations

### Breaking Changes

- ~~**PENDING**: Services and controllers need update to use `organizationId` instead of `userId`~~ ✅ **COMPLETED**
- ~~**PENDING**: Frontend integration of OrganizationProvider in App.tsx~~ ✅ **COMPLETED**
- ~~**PENDING**: UI components for organization switching~~ ✅ **COMPLETED**

### Security

### Security

- **CRITICAL**: Corrección de middleware de autenticación - eliminado fallback inseguro a ANON_KEY
- Implementación de fail-fast si SERVICE_ROLE_KEY no está configurada
- Añadido rate limiting global (100 req/min) y específico para autenticación (5 intentos/15min)
- Implementado sistema de logging de auditoría para trazabilidad de accesos
- **CRITICAL**: All new records now include authenticated userId for complete audit trail
- **CRITICAL**: Excel imports now properly enforce organizationId isolation (prevents data leaks)
- **Frontend Data Isolation Hardening**:
  - Implemented Level 2 Hook Architecture (`useOrgStats`, `useOrgTransactions`) to enforce strict organization scoping.
  - Added State Reset logic in Dashboard and Reports to clear stale data immediately on organization switch.
  - Implemented Targeted Cache Invalidation (`['key', orgId]`) to prevent cross-tenant cache leaks.

### Changed

- Migración de TransactionCategory a modelo multi-tenant (por usuario)
- Actualizado esquema Prisma: añadido campo `userId` a TransactionCategory
- Refactorizado TransactionCategoriesService para soportar aislamiento por usuario
- Refactorizado TransactionCategoriesController para extraer userId del token

- **Frontend Data Fetching Strategy**
  - Migrated `DashboardPage`, `ReportsPage`, `ExcelsPage`, `ItemsList`, `CategoriesList` to uses `useOrganizationQuery`
  - Replaced `useQuery` with `useGlobalQuery` / `useOrganizationQuery` in Forms to prevent race conditions
  - Centralized API header logic in `api-client.ts` to strictly enforce `X-Organization-ID` on protected endpoints

### Added

- Nuevo middleware: `rate-limit.ts` para prevención de abuso de API
- Nueva utilidad: `logger.ts` para logging estructurado
- Auditoría de eventos de autenticación (éxitos y fallos)
- **Página de autenticación unificada** (`/auth`) con diseño split-layout profesional
- Componente `DashboardSkeleton` para feedback visual durante carga de datos
- Componente `AuthCallback` para manejo de redirecciones post-autenticación
- Manejo global de errores en `ApiClient` con notificaciones toast (401, 429, errores genéricos)
- Sistema de gestión de sesión con opción "Mantener sesión iniciada"
- Protección mejorada de rutas: redirección automática basada en estado de autenticación
- **Logout Button**: Added "Cerrar Sesión" option in Sidebar with visual coherence and secure sign-out functionality

---

## [1.0.0] - 2025-01-20

### Added

- ✨ Sistema completo de carga y procesamiento de archivos Excel/CSV
- ✨ Dashboard analítico con filtros por período (trimestre/año)
- ✨ CRUD completo de transacciones, items y categorías
- ✨ Asignación manual y masiva de items a transacciones
- ✨ Gráficos de análisis con Recharts (distribución por categoría, tendencias temporales)
- ✨ Generación de reportes PDF personalizados
- ✨ Flujo de revisión borrador-confirmación para cargas
- ✨ Persistencia local de sesiones de carga (LocalStorage)
- ✨ Selector de período (trimestre/año)
- ✨ Búsqueda y filtrado avanzado de transacciones
- ✨ Panel de estadísticas por item
- ✨ UI moderna con shadcn/ui + Tailwind CSS 4

### Technical

- ⚙️ Monorepo con TurboRepo
- ⚙️ Frontend: React 19 + Vite 7 + TypeScript
- ⚙️ Backend: Express + Prisma 5 + SQLite
- ⚙️ State management: TanStack Query + Zustand
- ⚙️ ESLint 9 con flat config
- ⚙️ React Router 7 para routing client-side

---

## [0.1.0] - 2024-12-01

### Added

- 🎉 Inicialización del proyecto
- 🎉 Setup básico de monorepo
- 🎉 Configuración de Prisma con SQLite
- 🎉 API RESTful básica

---

## Formato

- `Added` para nuevas funcionalidades
- `Changed` para cambios en funcionalidades existentes
- `Deprecated` para funcionalidades que serán removidas
- `Removed` para funcionalidades removidas
- `Fixed` para correcciones de bugs
- `Security` para parches de seguridad
- `Technical` para cambios técnicos/infraestructura
