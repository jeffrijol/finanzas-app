# Flujo de Usuario - Finanzas App

## Resumen

Este documento describe el flujo de trabajo del usuario en la aplicación de gestión financiera, desde la carga de archivos hasta la consulta de transacciones históricas.

**Stack Frontend**: React 19 + Vite 7 + React Router 7

---

## 🎯 Navegación General

```mermaid
graph LR
    Home[/ Home - Excels] --> Dashboard[/dashboard]
    Home --> Items[/items - Mantenimiento]
    Home --> Analytics[/analytics]
    Home --> Reports[/reports]
    Dashboard --> Home
```

---

## 1. Página de Carga (/excels - HomePage)

### 1.1. Carga de Archivo

**Ubicación**: HomePage (`/`)

**Pasos**:

1. El usuario accede a la página principal
2. Ve el componente FilePond con un área de arrastre
3. Puede arrastrar un archivo Excel/CSV o hacer clic para seleccionarlo
4. Tipos de archivo aceptados: `.xlsx`, `.xls`, `.csv`
5. El archivo se procesa automáticamente

**Resultado**:

- El archivo se parsea en el backend
- El frontend recibe un array de transacciones **en memoria** (no guardadas en BD)
- La tabla de revisión aparece en la pantalla

---

### 1.2. Revisión y Asignación de Items

**Estado**: Modo "borrador" - cambios solo en memoria

**Pasos**:

1. Aparece una tabla con TODAS las transacciones del archivo (sin paginación)
2. Cada fila tiene:
   - Fecha de la transacción
   - Descripción
   - Categoría
   - Importe (verde para ingresos, rojo para gastos)
   - Dropdown para asignar un Item

3. El usuario selecciona un Item para cada transacción usando el dropdown
4. Los cambios se reflejan inmediatamente en la UI pero **NO se guardan en BD**

**Indicadores visuales**:

- Contador de transacciones asignadas vs. totales
- Alertas si hay transacciones sin asignar
- Botón "Confirmar y Guardar" muestra el número de transacciones asignadas

---

### 1.3. Confirmación y Guardado

**Pasos**:

1. El usuario revisa las asignaciones
2. Puede cancelar y volver a cargar otro archivo (se pierde todo)
3. Al hacer clic en "Confirmar y Guardar":
   - Solo se guardan las transacciones con Item asignado
   - Las transacciones sin asignar se descartan
   - Se muestra un toast de confirmación
   - El estado se limpia y vuelve a mostrar el área de carga

**Validaciones**:

- No se puede confirmar si ninguna transacción tiene Item asignado
- El botón "Confirmar y Guardar" se deshabilita durante el guardado

---

### 1.4. Panel de Estadísticas (Sidebar)

**Ubicación**: Columna lateral de HomePage

**Contenido**:

- Título: "Estadísticas {AñoActual}"
- Lista de ítems con:
  - Nombre del item
  - Color identificador
  - Total (suma de importes)
  - Cantidad de transacciones
  - Indicador de "Ingresos" o "Gastos"

**Nota**:

- Se muestran solo estadísticas por Item
- **NO se muestra el balance total** (según requerimientos)
- Muestra contador de transacciones sin asignar

---

## 2. Dashboard de Consulta (/dashboard)

### 2.1. Selector de Período

**Ubicación**: Card superior en DashboardPage

**Controles**:

- **Dropdown de Trimestre**:
  - Todo el año
  - Trimestre 1 (Ene-Mar)
  - Trimestre 2 (Abr-Jun)
  - Trimestre 3 (Jul-Sep)
  - Trimestre 4 (Oct-Dic)
- **Dropdown de Año**:
  - Muestra los últimos 5 años
  - Por defecto: año actual

**Comportamiento**:

- Al cambiar el período, se actualizan automáticamente las transacciones mostradas
- Por defecto muestra: trimestre actual del año actual
- El estado del período se mantiene en Zustand store

---

### 2.2. Filtros Adicionales

**Ubicación**: Dentro del card de Transacciones

**Filtros disponibles**:

- Búsqueda por texto (descripción)
- Filtro por categoría
- Checkbox "Solo sin asignar"

**Comportamiento**:

- Los filtros se combinan con el filtro de período
- Al cambiar cualquier filtro, se resetea a la página 1
- Los filtros son acumulativos (AND)

---

### 2.3. Tabla de Transacciones (con paginación)

**Características**:

- Muestra transacciones guardadas en la base de datos
- **CON paginación** (10 transacciones por página)
- Columnas:
  - Fecha
  - Descripción
  - Categoría
  - Importe
  - Item asignado (editable)

**Funcionalidad**:

- El usuario puede cambiar el Item asignado directamente desde la tabla
- Los cambios se guardan **inmediatamente** en la BD (sin confirmación)
- Navegación por páginas
- Indicadorvisual mientras se actualiza una transacción

---

## 3. Navegación entre Páginas

### Desde HomePage:

- Link "Ver Dashboard Completo" → Lleva al DashboardPage

### Desde DashboardPage:

- Usar el navegador para volver a `/` (HomePage)
- (Futuro: agregar link de navegación en el layout)

---

## 4. Casos de Uso Comunes

### Caso 1: Primera carga del mes

1. Usuario accede a HomePage (`/`)
2. Carga archivo Excel del banco
3. Revisa transacciones y asigna items
4. Confirma y guarda
5. Navega a Dashboard para ver el resumen del trimestre

### Caso 2: Consultar transacciones anteriores

1. Usuario accede a DashboardPage (`/dashboard`)
2. Selecciona el trimestre y año deseado
3. Revisa las transacciones
4. Opcionalmente, corrige algún Item asignado

### Caso 3: Buscar una transacción específica

1. Usuario accede a DashboardPage
2. Usa la búsqueda por texto
3. Opcionalmente, filtra por categoría o trimestre
4. Encuentra la transacción y la edita si es necesario

---

## 5. Diferencias Clave con la Versión Anterior

| Aspecto                | Versión Anterior          | Nueva Versión                      |
| ---------------------- | ------------------------- | ---------------------------------- |
| **Carga de archivo**   | Guardado automático en BD | Revisión → Confirmación → Guardado |
| **Tabla de revisión**  | Con paginación            | Sin paginación (todas las filas)   |
| **Ubicación de tabla** | Una sola página           | Dos páginas separadas              |
| **Estadísticas**       | Incluía balance           | Solo por Item, sin balance         |
| **Filtros de período** | No existían               | Selector de trimestre/año          |
| **Estilo visual**      | Tema oscuro Fintech       | Diseño limpio tipo área de trabajo |

---

## 6. Flujo de Datos

### Carga de archivo:

```
Usuario → FilePond → Backend (parseo) → Frontend (estado local) → Tabla de revisión
```

### Guardado de transacciones:

```
Usuario confirma → Frontend (filtra asignadas) → Backend POST /transactions → BD → Actualiza queries
```

### Consulta histórica:

```
Usuario selecciona período → Zustand store → Backend GET /transactions?quarter=X → BD → Tabla paginada
```

---

## 7. Próximas Funcionalidades

- **Mantenimiento de Items** (`/items`): CRUD de items
- **Reportes** (`/reportes`): Generación de reportes personalizados
- **Exportación**: Descargar transacciones en Excel/PDF
