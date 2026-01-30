# Introducción al Proyecto: Finanzas App

## 🎯 Propósito del Proyecto

**Finanzas App** es una aplicación web full-stack diseñada para la gestión financiera personal que automatiza el procesamiento de extractos bancarios y facilita el análisis de transacciones por períodos. El proyecto surge de la necesidad de tener un control detallado de ingresos y gastos, permitiendo a usuarios individuales o pequeños equipos:

1. **Procesar extractos bancarios** descargados en formato Excel/CSV sin necesidad de entrada manual de datos
2. **Categorizar transacciones** mediante un sistema de items y categorías personalizables
3. **Analizar patrones financieros** a través de gráficos y reportes trimestrales/anuales
4. **Generar reportes profesionales** en PDF para auditoría o planificación fiscal

## 🏗️ Arquitectura General

El proyecto está construido como un **monorepo** que contiene dos paquetes principales:

- **Frontend** (`packages/frontend/`): Aplicación React SPA (Single Page Application)
- **Backend** (`packages/backend/`): API RESTful con Express

### Stack Tecnológico Completo

**Frontend:**

- **React 19** con **TypeScript 5.9** - Framework UI con type safety
- **Vite 7** - Build tool ultra rápido con HMR (Hot Module Replacement)
- **React Router 7** - Routing client-side con data loading
- **TanStack Query v5** - Server state management con cache inteligente
- **Zustand** - Client state management (filtros de período, UI state)
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** + **Radix UI** - Component library accesible y customizable
- **Recharts** - Librería de gráficos declarativa
- **React Hook Form** + **Zod** - Gestión de formularios con validación
- **FilePond** - Upload de archivos con preview y validación
- **jsPDF** + **@react-pdf/renderer** - Generación de PDFs
- **@supabase/supabase-js** - Cliente de autenticación Supabase

**Backend:**

- **Node.js 20** LTS - Runtime JavaScript
- **Express** - Web framework minimalista
- **TypeScript 5.9** - Type safety en servidor
- **Prisma 5** - ORM type-safe con migrations
- **PostgreSQL (Supabase)** - Base de datos cloud (reemplaza a SQLite)
- **Zod** - Validación de schemas en runtime
- **Multer** - Middleware de upload de archivos
- **XLSX (SheetJS)** - Parser de archivos Excel
- **Helmet** + **CORS** - Security middleware
- **express-rate-limit** - Rate limiting y protección contra abuso
- **@supabase/supabase-js** - Verificación de JWT en backend

**Tooling:**

- **TurboRepo** - Gestor de monorepo con caching inteligente
- **pnpm 8** - Package manager rápido y eficiente
- **ESLint 9** - Linter con flat config
- **Vitest** - Testing framework (configurado, tests pendientes)

## 📂 Flujo de Trabajo del Usuario

1. **Autenticación** → Usuario se registra/loguea con Supabase Auth
2. **Selección de Organización** → Usuario ve sus organizaciones disponibles
3. **Carga de Archivo** → Usuario sube Excel/CSV del banco (datos asociados a la organización actual)
4. **Preview y Revisión** → Transacciones se muestran en tabla (sin guardar en BD)
5. **Asignación de Items** → Usuario asigna manualmente items a cada transacción
6. **Confirmación** → Usuario confirma y las transacciones se guardan en PostgreSQL
7. **Análisis Histórico** → Consulta transacciones guardadas con filtros (trimestre, año, categoría)
8. **Generación de Reportes** → Exporta PDFs con gráficos y tablas personalizadas

## 📚 Documentación Disponible

Para comenzar a trabajar en el proyecto, consulta los siguientes documentos **en orden**:

### 1. Documentación Esencial (Lectura Obligatoria)

#### `README.md` (Raíz del proyecto)

**Qué contiene:**

- Descripción general del proyecto
- Tech stack completo con links
- Quick start (5 pasos para ejecutar localmente)
- Estructura del proyecto (árbol de directorios)
- Tabla de scripts disponibles
- Roadmap de features implementadas y planificadas

**Cuándo leerlo:** Primer documento a revisar (15 min)

---

#### `docs/DEVELOPMENT.md`

**Qué contiene:**

- Setup detallado paso a paso
- Variables de entorno necesarias (`.env` templates)
- Workflow de desarrollo (cómo ejecutar frontend/backend)
- Debugging con VS Code (launch configs)
- Database management con Prisma (migrations, seed, studio)
- Troubleshooting de problemas comunes
- Herramientas y extensiones recomendadas

**Cuándo leerlo:** Después del README, antes de escribir código (20 min)

---

#### `docs/ARCHITECTURE.md`

**Qué contiene:**

- Diagrama de arquitectura del sistema (Mermaid)
- Explicación del monorepo con TurboRepo
- Arquitectura del frontend (componentes, state, routing)
- Arquitectura del backend (controllers, services, Prisma)
- Data models y relaciones de base de datos
- Decisiones de diseño justificadas (¿Por qué SQLite? ¿Por qué TanStack Query?)
- Security considerations

**Cuándo leerlo:** Antes de hacer cambios arquitectónicos (30 min)

---

### 2. Documentación de Referencia

#### `docs/API.md`

**Qué contiene:**

- Documentación completa de todos los endpoints REST
- Request/Response schemas con tipos
- Query parameters y validaciones
- Ejemplos de cURL y JavaScript fetch
- Códigos de error HTTP

**Cuándo usar:** Al trabajar con la API o crear nuevos endpoints

---

#### `docs/FLUJO_USUARIO.md`

**Qué contiene:**

- Flujos de usuario detallados (página por página)
- Diagrama de navegación (Mermaid)
- Estados de la aplicación
- Casos de uso comunes
- Diferencias con versiones anteriores

**Cuándo usar:** Al trabajar en features de UX o al hacer QA

---

### 3. Documentación Futura (Para Implementación)

#### `docs/CI_CD_PLAN.md`

**Qué contiene:**

- Plan completo de implementación de CI/CD
- GitHub Actions workflows (lint, build, test)
- Branch protection rules
- Templates de Pull Requests
- Workflow de release automático

**Cuándo usar:** Cuando se decida implementar CI/CD

---

### 4. Documentación de Gestión

#### `CHANGELOG.md`

**Qué contiene:**

- Historial de cambios siguiendo [Keep a Changelog](https://keepachangelog.com/)
- Versiones del proyecto
- Features añadidas, cambios, fixes

**Cuándo actualizar:** Cada vez que se hace un release o deploy significativo

---

#### `LICENSE`

**Qué contiene:**

- Licencia MIT del proyecto

**Cuándo revisar:** Al hacer fork o redistribuir el código

---

## 🚀 Primeros Pasos (Onboarding Rápido)

### Día 1: Setup Local (1-2 horas)

1. Leer `README.md` completo
2. Leer `docs/DEVELOPMENT.md`
3. Clonar repo y seguir Quick Start
4. Ejecutar `pnpm dev` y explorar la UI
5. Abrir Prisma Studio (`pnpm db:studio`) para ver los datos

### Día 2: Exploración de Código (2-3 horas)

1. Leer `docs/ARCHITECTURE.md`
2. Explorar estructura de `packages/frontend/src/`
3. Explorar estructura de `packages/backend/src/`
4. Hacer un cambio pequeño (ej: cambiar un texto en UI)
5. Probar el flujo completo: Cargar Excel → Asignar items → Consultar en Dashboard

### Día 3: Primera Contribución (4 horas)

1. Leer `docs/API.md` y `docs/FLUJO_USUARIO.md`
2. Revisar issues o features pendientes en el Roadmap
3. Crear una branch y trabajar en un bug fix o feature pequeña
4. Hacer commit siguiendo convenciones (ver `docs/CI_CD_PLAN.md` para formato)

---

## 🎓 Conceptos Clave a Entender

### 1. **Monorepo con TurboRepo**

- Un solo repositorio contiene frontend y backend
- Compartir tipos TypeScript entre ambos paquetes
- Builds coordinados y cacheados

### 2. **Estado en Frontend**

- **Server state** (TanStack Query): Datos del backend (transacciones, items)
- **Client state** (Zustand): UI state (filtros, modales)
- **Local state** (React hooks): Formularios, estados efímeros

### 3. **Flujo de Datos**

```
Usuario → Upload Excel → Backend parsea → JSON en memoria (frontend)
  ↓
Usuario asigna items → Confirma → Backend guarda en SQLite
  ↓
Usuario consulta Dashboard → Backend query con filtros → Frontend muestra
```

### 4. **Prisma ORM**

- Schema en `packages/backend/prisma/schema.prisma`
- Migraciones automáticas con `prisma migrate`
- Cliente type-safe generado

---

## 🔍 Estructura de Archivos Importante

```
finanzas-app/
├── README.md                    ← Comienza aquí
├── CHANGELOG.md                 ← Historial de cambios
├── LICENSE                      ← Licencia MIT
├── package.json                 ← Scripts del monorepo
├── turbo.json                   ← Config de TurboRepo
├── tsconfig.base.json           ← TypeScript compartido
│
├── docs/                        ← Toda la documentación
│   ├── DEVELOPMENT.md           ← Guía de desarrollo
│   ├── ARCHITECTURE.md          ← Arquitectura del sistema
│   ├── API.md                   ← Referencia de API
│   ├── FLUJO_USUARIO.md         ← Flujos de usuario
│   └── CI_CD_PLAN.md            ← Plan de CI/CD (futuro)
│
├── packages/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/      ← UI components
│   │   │   ├── pages/           ← Route pages
│   │   │   ├── hooks/           ← React hooks custom
│   │   │   ├── stores/          ← Zustand stores
│   │   │   ├── lib/             ← API client y utils
│   │   │   └── types/           ← TypeScript types
│   │   ├── public/              ← Static assets
│   │   ├── package.json
│   │   ├── vite.config.ts       ← Vite configuration
│   │   └── eslint.config.js     ← ESLint config
│   │
│   └── backend/
│       ├── src/
│       │   ├── controllers/     ← HTTP handlers
│       │   ├── services/        ← Business logic
│       │   ├── routes/          ← API routes
│       │   ├── middleware/      ← Express middleware
│       │   └── utils/           ← Helpers
│       ├── prisma/
│       │   ├── schema.prisma    ← BD schema
│       │   ├── migrations/      ← BD migrations
│       │   └── seed.ts          ← Seed data
│       ├── package.json
│       └── tsconfig.json
```

---

## 💡 Preguntas Frecuentes (FAQ)

**Q: ¿Por qué SQLite y no PostgreSQL?**  
A: Originalmente se usó SQLite por simplicidad. Ahora hemos migrado a **Supabase (PostgreSQL)** para facilitar el acceso remoto, la persistencia en la nube y preparar el proyecto para un despliegue real.

**Q: ¿Por qué TanStack Query en lugar de Redux?**  
A: Menos boilerplate, cache automático, revalidación inteligente. Redux es overkill para server state.

**Q: ¿Cuál es el flujo de trabajo con Git?**  
A: Actualmente: commits a `develop`, merge manual a `master`. Futuro: PRs con CI/CD (ver `docs/CI_CD_PLAN.md`).

**Q: ¿Dónde están los tests?**  
A: Vitest está configurado pero los tests están pendientes. Ver Roadmap en `README.md`.

---

## 📧 Contacto y Soporte

- **Issues**: Abrir en GitHub repo
- **Documentación**: Revisar carpeta `docs/`
- **Dudas de código**: Consultar `docs/ARCHITECTURE.md` o `docs/API.md`

---

**¡Bienvenido al equipo! 🚀**

---

## 📝 Última Actualización

**Fecha**: 2026-01-30  
**Cambios Principales**:

- ✅ Implementación completa de audit trail con userId en todas las operaciones de creación
- ✅ Corrección crítica de aislamiento multi-tenant en ExcelService
- ✅ Migración de 462 registros legacy a userId real
- 📚 Documentación actualizada: `CHANGELOG.md`, `docs/API.md`

Ver detalles completos en [`CHANGELOG.md`](../CHANGELOG.md).
