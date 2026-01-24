# Changelog

Historial de cambios del proyecto siguiendo [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Security

- **CRITICAL**: Corrección de middleware de autenticación - eliminado fallback inseguro a ANON_KEY
- Implementación de fail-fast si SERVICE_ROLE_KEY no está configurada
- Añadido rate limiting global (100 req/min) y específico para autenticación (5 intentos/15min)
- Implementado sistema de logging de auditoría para trazabilidad de accesos

### Changed

- Migración de TransactionCategory a modelo multi-tenant (por usuario)
- Actualizado esquema Prisma: añadido campo `userId` a TransactionCategory
- Refactorizado TransactionCategoriesService para soportar aislamiento por usuario
- Refactorizado TransactionCategoriesController para extraer userId del token

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
