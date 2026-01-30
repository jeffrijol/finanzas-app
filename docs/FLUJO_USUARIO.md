# Flujo de Usuario - Finanzas App

## Resumen

Este documento describe el flujo de trabajo del usuario en la aplicación de gestión financiera, desde la carga de archivos hasta la consulta de transacciones históricas.

**Stack Frontend**: React 19 + Vite 7 + React Router 7

---

## 🎯 Navegación General

```mermaid
graph LR
    Auth[/auth - Login/Registro] -->|Autenticado| Home[/ Home - Excels]
    Auth -->|Sin confirmar email| Auth
    Home --> Dashboard[/dashboard]
    Home --> Items[/items - Mantenimiento]
    Home --> Analytics[/analytics]
    Home --> Reports[/reports]
    Dashboard --> Home
    Items --> Home
    Analytics --> Home
    Reports --> Home

    Root[/ Raíz] -->|No autenticado| Auth
    Root -->|Autenticado| Home (Upload)
    Dashboard --> Auth (Logout)
```

**Protección de Rutas:**

- **Rutas Públicas**: `/auth`, `/auth/callback`
- **Rutas Protegidas**: Todas las demás (requieren JWT válido)
- **Redirección Automática**:
  - Si usuario NO autenticado → Redirige a `/auth`
  - Si usuario autenticado y visita `/` → Redirige a `/dashboard`
  - Si usuario autenticado y visita `/auth` → Redirige a `/dashboard`

---

## 0. Autenticación (/auth)

### 0.1. Página de Autenticación Unificada

**Ubicación**: `/auth`

**Características Visuales**:

- **Diseño Split-Layout**:
  - Panel izquierdo: Decorativo con fondo oscuro, logo, y testimonial
  - Panel derecho: Formularios de login/registro con tabs
- **Componentes**:
  - Tabs para cambiar entre "Iniciar sesión" y "Registrarse"
  - Campos de email y contraseña con validación
  - Checkbox "Mantener sesión iniciada"
  - Botón de acción (Login/Registro)

---

### 0.2. Flujo de Registro

**Pasos**:

1. Usuario accede a `/auth?mode=register` (o selecciona tab "Registrarse")
2. Ingresa email y contraseña (mínimo 8 caracteres)
3. Al hacer clic en "Registrarse":
   - Se envía petición a Supabase Auth
   - Sistema envía email de confirmación
   - Muestra toast: "Registro exitoso. Revisa tu correo electrónico para verificar tu cuenta."
4. Usuario revisa su correo y hace clic en el link de confirmación
5. Link redirige a `/auth/callback` con token de sesión
6. Sistema verifica el token y redirige a `/dashboard`

**Validaciones**:

- Email debe ser válido
- Contraseña debe tener al menos 8 caracteres
- No permite registros duplicados

**Manejo de Errores**:

- Rate limit excedido → Toast "Demasiadas peticiones"
- Email ya registrado → Toast "Email ya existe"
- Error de red → Toast "Error del servidor"

---

### 0.3. Flujo de Login

**Pasos**:

1. Usuario accede a `/auth` (tab "Iniciar sesión" por defecto)
2. Ingresa email y contraseña
3. Al hacer clic en "Iniciar sesión":
   - Se validan credenciales con Supabase
   - Si tienen éxito, se obtiene JWT token
   - Sistema redirige a `/dashboard`

**Persistencia de Sesión**:

- **"Mantener sesión iniciada" ACTIVADO**:
  - Sesión se guarda en `localStorage` (predeterminado de Supabase)
  - Token se refresca automáticamente
  - Persiste al cerrar navegador
- **"Mantener sesión iniciada" DESACTIVADO**:
  - Sesión en memoria solamente
  - Se pierde al cerrar navegador (requiere configuración adicional de Supabase)

**Manejo de Errores**:

- Credenciales incorrectas → Toast "Credenciales incorrectas"
- Email no confirmado → Toast con indicación de confirmar email
- Rate limit → Toast "Demasiadas peticiones. Espera un momento."

---

### 0.4. Gestión de Sesión

**Auto-refresh de Token**:

- Supabase maneja automáticamente el refresh de tokens JWT
- El `ApiClient` obtiene el token actualizado en cada request

**Expiración de Sesión**:

- Si el token expira (401 Unauthorized):
  - `ApiClient` ejecuta `supabase.auth.signOut()` automáticamente
  - Muestra toast "Sesión expirada. Por favor, inicia sesión nuevamente."
  - Redirige a `/auth`

**Cierre de Sesión Manual**:

- **Implementado**: Botón "Cerrar Sesión" en el menú lateral de navegación
- Click en botón sidebar -> `signOut` -> Redirección a `/auth`
- Ejecuta `supabase.auth.signOut()`
- Redirige a `/auth`

---

### 0.5. Callback de Autenticación

**Ubicación**: `/auth/callback`

**Función**:

- Procesa redirecciones después de verificación de email
- Maneja parámetros de URL enviados por Supabase
- Verifica que hay una sesión válida
- Redirige al dashboard o muestra errores

**Casos de Uso**:

- ✅ Email confirmado → Redirige a `/dashboard`
- ❌ Error en confirmación → Redirige a `/auth` con mensaje de error

---

## 1. Página de Carga (/excels - HomePage)

**NOTA**: Esta página requiere autenticación. Si el usuario no está autenticado, será redirigido a `/auth`.

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
