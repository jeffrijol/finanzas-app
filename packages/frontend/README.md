# Finanzas App - Frontend

Frontend de la aplicación de gestión de transacciones financieras, construido con **Vite + React + TypeScript**.

## 🚀 Tecnologías

- **Vite** - Build tool ultrarrápido
- **React 19** - Librería UI
- **TypeScript** - Tipado estático
- **TailwindCSS** - Estilos utility-first
- **ShadCN UI** - Componentes accesibles con Radix UI
- **TanStack Query (React Query)** - Gestión de estado del servidor
- **React Dropzone** - Upload de archivos con drag & drop
- **Lucide React** - Iconos

## 📂 Estructura del Proyecto

```
src/
├── components/
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx       # Layout principal con sidebar
│   │   ├── FileUploadCard.tsx        # Componente de carga de archivos
│   │   ├── FiltersBar.tsx            # Barra de filtros
│   │   ├── ItemsPanel.tsx            # Panel lateral de items
│   │   ├── TransactionRow.tsx        # Fila de transacción
│   │   └── TransactionsTable.tsx     # Tabla de transacciones
│   └── ui/                            # Componentes ShadCN UI
├── lib/
│   ├── api-client.ts                  # Cliente HTTP para llamadas a la API
│   └── utils.ts                       # Utilidades (formateo, cn, etc.)
├── types/
│   └── index.ts                       # Tipos TypeScript
├── hooks/
│   └── use-toast.ts                   # Hook para notificaciones
├── App.tsx                            # Componente raíz
├── main.tsx                           # Punto de entrada
└── index.css                          # Estilos globales
```

## 🎨 Características de Diseño

### Diseño Dark Mode Fintech
- Fondo oscuro elegante (`bg-slate-950`)
- Sidebar fija de 70px con iconos
- Gradientes sutiles y efectos glassmorphism
- Animaciones suaves para transiciones

### Colores por Item
- **Casa 1**: `#3B82F6` (Azul)
- **Casa 2**: `#10B981` (Verde)
- **Inversión 3**: `#8B5CF6` (Morado)
- **Inversión 4**: `#F59E0B` (Ámbar)

### Indicadores Visuales
- **Importes positivos**: `text-emerald-400`
- **Importes negativos**: `text-rose-400`
- **Sin asignar**: `bg-slate-800/30`
- **Hover en filas**: `bg-slate-800/50`

## 🔌 Integración con Backend

### API Client
El `api-client.ts` proporciona métodos para:
- `getItems()` - Obtener lista de items
- `getTransactions(filters)` - Obtener transacciones paginadas
- `updateTransaction(id, data)` - Actualizar transacción (asignar item)
- `getTransactionStats()` - Obtener estadísticas
- `uploadFile(file)` - Subir archivo Excel/CSV

### Variables de Entorno
El archivo `.env.local` configura la URL del backend:
```
VITE_API_URL=http://localhost:3001/api
```

### React Query
Configurado para:
- No refetch en window focus
- 1 retry en errores
- 5 minutos de stale time
- Invalidación automática después de mutaciones

## 📊 Funcionalidades Principales

### 1. Carga de Archivos
- Drag & drop de archivos `.xlsx` y `.csv`
- Validación de tipos de archivo
- Feedback visual de progreso
- Notificaciones de éxito/error

### 2. Tabla de Transacciones
- Paginación del lado del servidor (10 items por página)
- Filtros:
  - Búsqueda por descripción
  - Filtro por categoría
  - "Solo sin asignar"
- Columnas:
  - Fecha (formato DD/MM/YYYY)
  - Categoría
  - Descripción (truncada con tooltip)
  - Importe (con color condicional)
  - Saldo
  - Asignar Item (dropdown)

### 3. Asignación de Items
- Dropdown menu en cada fila
- Actualización optimista
- Badge con color del item asignado
- Opción "Sin asignar"

### 4. Panel de Items
- Lista de items con:
  - Círculo de color
  - Icono
  - Nombre
  - Contador de transacciones
  - Total acumulado

### 5. Tarjetas de Estadísticas
- Total de ingresos (verde)
- Total de gastos (rojo)
- Balance (verde/rojo según signo)

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
pnpm dev

# Build para producción
pnpm build

# Preview del build
pnpm preview

# Lint
pnpm lint
```

## 🔧 Configuración

### TailwindCSS
Configurado con:
- Dark mode class-based
- Variables CSS para colores
- Path aliases (`@/*`)
- Border radius personalizado

### TypeScript
- Strict mode habilitado
- Path aliases configurados
- Sin verificación de módulos externos (`skipLibCheck`)

### Vite
- Puerto: `4321`
- Path alias: `@` → `./src`
- Plugin React con Fast Refresh

## 📝 Tipos TypeScript

### Transaction
```typescript
interface Transaction {
  id: string;
  fechaValor: string;
  categoria: string;
  descripcion: string;
  importe: number;
  saldo: number;
  itemAsignadoId?: string | null;
  itemAsignado?: Item | null;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Item
```typescript
interface Item {
  id: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  icono?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## 🎯 Flujo de Usuario

1. **Página inicial**: Muestra dropzone para subir archivo
2. **Subir archivo**: POST a `/api/upload`, luego GET a `/api/transactions`
3. **Visualizar transacciones**: Tabla con datos paginados y filtros
4. **Asignar items**: Dropdown → PUT a `/api/transactions/:id`
5. **Feedback inmediato**: UI se actualiza sin recargar página

## 🚨 Manejo de Errores

- Toast notifications para errores de API
- Mensajes amigables para el usuario
- Loading states en todas las operaciones async
- Validación de entrada de usuario

## 📱 Responsive Design

- **Desktop**: Layout completo con sidebar, tabla, y panel de items
- **Tablet**: Sidebar colapsada a iconos
- **Mobile**: Tabla se convierte en cards (fallback grid)

## 🔄 Estado de la Aplicación

### Local State (useState)
- Paginación (página actual)
- Filtros (búsqueda, categoría, solo sin asignar)
- ID de transacción en actualización

### Server State (React Query)
- Items (cache persistente)
- Transacciones (con filtros)
- Estadísticas

## 🎨 Componentes UI Incluidos

De ShadCN:
- Button
- Card
- Input
- Checkbox
- Badge
- Label
- Dropdown Menu
- Toast

## 📖 Notas de Desarrollo

- Todos los componentes son funcionales con hooks
- No se usa Redux/Zustand (solo React Query para server state)
- Código limpio y bien comentado
- Incluye skeletons/loaders para estados de carga
- Foco en experiencia de usuario fluida e intuitiva
