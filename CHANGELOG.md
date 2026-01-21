# Changelog

Historial de cambios del proyecto siguiendo [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Planned

- Tests automatizados
- CI/CD con GitHub Actions
- Autenticación y multi-usuario

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
