# Arquitectura del Sistema - Finanzas App

Documentación técnica de la arquitectura, decisiones de diseño y estructura del proyecto.

---

## 🏗️ System Overview

```mermaid
graph TB
    User[👤 Usuario] -->|HTTP + Auth| Frontend[React Frontend]
    Frontend -->|REST API + JWT| Backend[Express Backend]
    Backend -->|Prisma ORM| DB[(PostgreSQL Database)]
    Frontend -->|File Upload| Backend
    Backend -->|XLSX Parse| Parser[Excel Parser]
    Parser -->|Transactions| Backend
    Backend -->|Auth Verification| Supabase[Supabase Auth]
```

**Finanzas App** es una aplicación web full-stack diseñada con arquitectura monorepo que separa claramente la capa de presentación (frontend) de la lógica de negocio (backend).

### Flujo de Datos General

1.  **Auth**: Usuario se registra/loguea vía Supabase Auth -> Obtiene JWT.
2.  **Upload**: Usuario carga archivo Excel → Backend valida JWT y parsea → Retorna JSON.
3.  **Review**: Frontend mantiene transacciones en memoria → Usuario asigna items.
4.  **Save**: Frontend envía transacciones confirmadas con JWT → Backend guarda en BD asignando `userId`.
5.  **Query**: Frontend consulta transacciones con filtros → Backend filtra por `userId` y retorna datos.

---

## 📦 Monorepo Structure

### TurboRepo

Utiliza **TurboRepo** para gestionar el monorepo con las siguientes ventajas:

- **Build caching**: Evita rebuilds innecesarios
- **Parallel execution**: Ejecuta tareas en paralelo
- **Pipeline orchestration**: Define dependencias entre tasks

**Configuración**: `turbo.json`

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false
    }
  }
}
```

### Package Organization

```
packages/
├── frontend/        # Cliente React
│   └── src/
│       ├── components/   # UI components
│       ├── pages/        # Route pages
│       ├── hooks/        # React hooks
│       ├── stores/       # Zustand state
│       ├── lib/          # Utilities
│       ├── providers/    # Context providers (Auth)
│       └── types/        # TypeScript types
│
└── backend/         # API Express
    └── src/
        ├── controllers/  # HTTP handlers
        ├── services/     # Business logic
        ├── routes/       # API routes
        ├── middleware/   # Express middleware (Auth)
        └── utils/        # Helpers
```

### Dependencies

- **Root level**: Tooling compartido (TypeScript, TurboRepo)
- **Frontend**: React ecosystem
- **Backend**: Node.js ecosystem

---

## ⚛️ Frontend Architecture

### Tech Stack

- **React 19** - UI library
- **Vite 7** - Build tool & dev server
- **TypeScript 5.9** - Type safety
- **React Router 7** - Client-side routing
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library
- **Supabase Client** - Authentication

### Component Structure

Sigue principios de **Atomic Design**:

```
components/
├── ui/                # Atoms (shadcn/ui base components)
│   ├── button.tsx
│   ├── dialog.tsx
│   └── ...
├── dashboard/         # Molecules/Organisms
│   ├── TransactionsTable.tsx
│   ├── DashboardChartsRenderer.tsx
│   └── PeriodSelector.tsx
├── items/            # Feature-specific components
│   ├── ItemForm.tsx
│   └── CategoriesList.tsx
└── ProtectedRoute.tsx # Route Guard
```

### State Management

**Server State (TanStack Query):**

- Transacciones
- Items
- Categorías
- Stats/Analytics

```typescript
const { data, isLoading } = useQuery({
  queryKey: ["transactions", filters],
  queryFn: () => apiClient.getTransactions(filters),
});
```

**Client State (Zustand):**

- Filtros de período (trimestre/año)
- UI state (modals, toasts)

```typescript
const usePeriodStore = create<PeriodStore>((set) => ({
  selectedQuarter: "ALL",
  selectedYear: new Date().getFullYear(),
  setQuarter: (quarter) => set({ selectedQuarter: quarter }),
}));
```

**Global Auth State (Context):**

- Provee el usuario y sesión de Supabase a toda la app.

### Routing

```typescript
<AuthProvider>
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    {/* ... otras rutas protegidas */}
  </Routes>
</AuthProvider>
```

### Styling Approach

- **Utility-first**: Tailwind CSS para la mayoría de estilos
- **Component variants**: `class-variance-authority` para variantes
- **Consistency**: Design tokens en `index.css`

---

## 🔧 Backend Architecture

### Tech Stack

- **Node.js 20** - Runtime
- **Express** - Web framework
- **Prisma 5** - ORM
- **PostgreSQL (Supabase)** - Database
- **Zod** - Schema validation
- **Multer** - File uploads
- **XLSX** - Excel parsing
- **Supabase JS** - Auth verification

### Layered Architecture

```
Request (JWT) → Middleware (Auth) → Router → Controller → Service → Prisma → Database
```

**1. Middleware (Auth)**

Verifica el token JWT en el header `Authorization` usando el cliente de Supabase.

**2. Controllers (HTTP Handlers)**

Extrae `userId` del request y lo pasa al servicio:

```typescript
export const getAll = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const filters = req.query;
  const result = await transactionService.getTransactions(userId, filters);
  res.json({ success: true, data: result });
};
```

**3. Services (Business Logic)**

Lógica de negocio pura, asegura aislamiento de datos con `where: { userId }`:

```typescript
export const getTransactions = async (userId: string, filters: Filters) => {
  return await prisma.transaction.findMany({
    where: {
      userId,
      ...buildWhereClause(filters),
    },
    include: { item: true, category: true },
  });
};
```

**4. Prisma (Data Access)**

ORM que abstrae SQL.

### Security Implementation

- **Authentication**: JWT vía Supabase Auth.
- **Authorization**: Row Level Security (simulado en capa de aplicación via `userId` filter).
- **API Security**:
  - Todas las rutas protegidas requieren Bearer Token.
  - `middleware/auth.ts` valida integridad del token.

### Database

**Prisma ORM** con PostgreSQL.

**Data Models Adicionales**:

Se agregó `userId` e índices para soportar multi-tenancy.

```prisma
model Transaction {
  // ... campos existentes
  userId         String   @default("legacy")
  @@index([userId])
}

model Item {
  // ... campos existentes
  userId      String       @default("legacy")
  nombre      String

  @@unique([nombre, userId]) // Nombres únicos por usuario, no globales
  @@index([userId])
}
```

---

## 🎯 Key Design Decisions

### ¿Por qué Supabase Auth + Middleware propio?

**Ventajas:**

- Desacopla la lógica de autenticación (frontend) de la verificación (backend).
- Permite usar el backend existente de Express sin reescribirlo como Edge Functions.
- Mantiene el control total sobre la lógica de negocio en el backend.

### ¿Por qué Multi-tenancy lógico (userId column)?

**Ventajas:**

- Facilidad de implementación sobre la base de datos existente.
- Permite querys eficientes con índices.
- Migración sencilla desde single-tenant.

---

## 🔗 Referencias

- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
