# Dashboard Financiero - Guía de Implementación

## 🎯 Resumen de Cambios Implementados

Se ha completado la transformación del dashboard de estilo "Fintech" a un **área de trabajo limpia y profesional** con las siguientes mejoras:

### ✅ Cambios en la UI/UX

1. **Diseño Limpio**: Eliminado el tema oscuro y colores vibrantes. Nueva paleta neutral con grises y blancos.
2. **Dos Secciones Separadas**:
   - **HomePage (`/`)**: Carga y revisión de archivos
   - **DashboardPage (`/dashboard`)**: Consulta histórica con filtros
3. **FilePond**: Componente moderno para carga de archivos Excel/CSV
4. **Flujo Borrador-Confirmación**: Las transacciones no se guardan automáticamente

### ✅ Funcionalidades Nuevas

1. **Selector de Período**: Filtrar por trimestre (T1, T2, T3, T4) o año completo
2. **Estadísticas por Item**: Panel lateral sin balance total
3. **Tabla sin Paginación**: En HomePage para revisar todas las transacciones del archivo
4. **Tabla con Paginación**: En DashboardPage para consultar transacciones guardadas

---

## 🚀 Cómo Ejecutar la Aplicación

### Prerrequisitos

- Node.js 18+ instalado
- pnpm instalado globalmente: `npm install -g pnpm`

### 1. Instalar Dependencias

```bash
# Desde la raíz del proyecto
pnpm install
```

### 2. Configurar Variables de Entorno

#### Backend (.env en packages/backend/)

```env
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
```

#### Frontend (.env.local en packages/frontend/)

```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Inicializar Base de Datos

```bash
cd packages/backend
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
```

### 4. Ejecutar en Modo Desarrollo

```bash
# Desde la raíz del proyecto
pnpm dev
```

Esto ejecutará:
- Backend en `http://localhost:3001`
- Frontend en `http://localhost:5173`

---

## 📁 Estructura del Proyecto

```
finanzas-app/
├── packages/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── HomePage.tsx          ← Nueva página de carga
│   │   │   │   └── DashboardPage.tsx     ← Nueva página de consulta
│   │   │   ├── components/
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── FileUploadPond.tsx      ← FilePond
│   │   │   │   │   ├── TransactionReviewTable.tsx  ← Sin paginación
│   │   │   │   │   ├── ItemsStatsPanel.tsx         ← Estadísticas
│   │   │   │   │   └── PeriodSelector.tsx          ← Selector trimestre
│   │   │   │   └── ui/
│   │   │   │       └── select.tsx         ← Nuevo componente
│   │   │   ├── hooks/
│   │   │   │   └── useFileUploadFlow.ts   ← Hook flujo de carga
│   │   │   ├── stores/
│   │   │   │   └── period-store.ts        ← Zustand store
│   │   │   ├── lib/
│   │   │   │   └── api-client.ts          ← Actualizado con createTransaction
│   │   │   ├── types/
│   │   │   │   └── index.ts               ← Actualizado con transactions[]
│   │   │   ├── App.tsx                    ← Ahora es el Router
│   │   │   └── index.css                  ← Tema limpio
│   │   └── package.json                   ← Nuevas dependencias
│   └── backend/
│       ├── src/
│       │   ├── controllers/
│       │   │   └── transaction.controller.ts  ← createTransaction()
│       │   ├── services/
│       │   │   └── transactions.service.ts    ← createTransaction()
│       │   └── routes/
│       │       └── index.ts               ← Ruta POST /transactions
│       └── prisma/
│           └── schema.prisma
└── docs/
    └── FLUJO_USUARIO.md                   ← Documentación del flujo
```

---

## 🔄 Flujo de Usuario

### 1. Cargar Archivo (HomePage)

1. Ir a `http://localhost:5173/`
2. Arrastrar archivo Excel/CSV o hacer clic para buscar
3. El archivo se procesa y aparece la tabla de revisión
4. Asignar items a cada transacción usando el dropdown
5. Hacer clic en "Confirmar y Guardar"

### 2. Consultar Transacciones (DashboardPage)

1. Ir a `http://localhost:5173/dashboard`
2. Seleccionar trimestre y año
3. Usar filtros adicionales (búsqueda, categoría, etc.)
4. Ver transacciones con paginación
5. Editar items asignados directamente en la tabla

---

## ⚙️ Endpoints del Backend

### Transacciones

- `GET /api/transactions` - Listar transacciones con filtros y paginación
- `POST /api/transactions` - Crear una nueva transacción ✨ NUEVO
- `PUT /api/transactions/:id` - Actualizar una transacción
- `GET /api/transactions/stats` - Obtener estadísticas

### Items

- `GET /api/items` - Listar todos los items
- `POST /api/items` - Crear un nuevo item
- `PUT /api/items/:id` - Actualizar un item
- `DELETE /api/items/:id` - Eliminar un item

### Upload

- `POST /api/upload` - Procesar archivo Excel/CSV

---

## 📝 Notas Importantes

### Cambios de Comportamiento

1. **Carga de Archivos**:
   - ❌ Antes: Guardado automático en BD
   - ✅ Ahora: Revisión → Confirmación → Guardado

2. **Tabla de Revisión**:
   - ❌ Antes: Con paginación
   - ✅ Ahora: Sin paginación (muestra todas las filas del archivo)

3. **Estadísticas**:
   - ❌ Antes: Incluía balance total
   - ✅ Ahora: Solo por item, sin balance

### Pendiente (Backend)

El endpoint `/api/upload` actualmente guarda las transacciones automáticamente en la BD. Para completar el nuevo flujo, debería:

1. Parsear el archivo Excel/CSV
2. Retornar las transacciones en formato JSON
3. **NO guardar** en la base de datos

Formato de respuesta esperado:

```json
{
  "success": true,
  "data": {
    "filename": "extracto.xlsx",
    "fileSize": 15234,
    "totalRows": 25,
    "processed": true,
    "transactions": [
      {
        "fechaValor": "2024-01-15",
        "descripcion": "Compra...",
        "importe": -45.50,
        "categoria": "Compras",
        "saldo": 1500.00
      }
    ]
  }
}
```

---

## 🐛 Troubleshooting

### Error: "Module not found"

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules packages/*/node_modules
pnpm install
```

### Error: Base de datos no encontrada

```bash
cd packages/backend
pnpm prisma:migrate
pnpm prisma:seed
```

### FilePond no se muestra

Verifica que el CSS está importado en `index.css`:

```css
@import "filepond/dist/filepond.min.css";
```

---

## 📚 Documentación Adicional

- [Flujo de Usuario Completo](./FLUJO_USUARIO.md)
- [API Documentation](./API.md) (pendiente)
- [Componentes UI](./COMPONENTS.md) (pendiente)

---

## 🎨 Paleta de Colores

### Tema Limpio

- **Fondo**: `#FAFAFA` (Gris muy claro)
- **Textó**: `#262626` (Gris oscuro)
- **Tarjetas**: `#FFFFFF` (Blanco)
- **Bordes**: `#E5E5E5` (Gris claro)
- **Primary**: `#0078D4` (Azul profesional)
- **Success**: `#16A34A` (Verde)
- **Error**: `#DC2626` (Rojo)

---

## 👥 Contribuir

1. Crear una rama desde `main`
2. Hacer cambios
3. Crear Pull Request
4. Esperar revisión

---

## 📄 Licencia

MIT