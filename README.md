# Finanzas App

Dashboard financiero inteligente para gestión y análisis de movimientos bancarios.

## Características Principales

### 📊 Gestión de Transacciones
- **Upload inteligente de Excel**: Procesamiento automático de extractos bancarios en formato estándar
- **Asignación de Items**: Categorización personalizada de transacciones con sistema de items
- **Búsqueda avanzada**: Filtros por fecha, categoría, monto y texto en descripciones
- **Edición en línea**: Modificación de items asignados directamente desde la tabla

### 🏷️ Sistema de Items
- **CRUD completo**: Crear, leer, actualizar y desactivar items personalizados
- **Asignación masiva**: Aplicar items a múltiples transacciones simultáneamente
- **Estadísticas por Item**: Ver totales y distribución por categorías personalizadas

### 📈 Análisis y Reportes
- **Dashboard interactivo**: Estadísticas en tiempo real con gráficos animados
- **Análisis por categorías**: Distribución de gastos e ingresos
- **Tendencias temporales**: Evolución mensual y comparativas
- **Exportación flexible**: PDF, Excel y CSV con formatos personalizables

### 🎨 Interfaz Moderna
- **Drag & Drop**: Subida intuitiva de archivos con previsualización
- **Tabla interactiva**: Ordenamiento, filtros y agrupación avanzada
- **Responsive Design**: Optimizado para desktop, tablet y móvil
- **Modo claro/oscuro**: Soporte completo para preferencias de visualización

## Estructura del Excel Soportado

La aplicación procesa automáticamente archivos Excel con el siguiente formato:

### Encabezados requeridos:
- **FECHA VALOR**: Fecha de la transacción (formato: YYYY-MM-DD HH:MM:SS)
- **CATEGORÍA**: Categoría bancaria (Transferencias, Recibos, Otros)
- **DESCRIPCIÓN**: Descripción detallada del movimiento
- **IMPORTE**: Monto (negativo para débitos, positivo para créditos)
- **SALDO**: Saldo resultante después de la transacción

### Campos opcionales:
- FECHA CONTABLE
- CLAVE
- REFERENCIA
- REF. 16
- DEBE
- HABER

## Arquitectura Técnica

### Backend (Node.js + Express + PostgreSQL)
- API RESTful con TypeScript
- Prisma ORM para gestión de base de datos
- Procesamiento de Excel con XLSX
- Validaciones con Zod
- Sistema de logging estructurado
- Autenticación JWT (escalable)


### Frontend (Astro + React + shadcn/ui)
- Astro Islands para renderizado óptimo
- React para interactividad avanzada
- shadcn/ui para componentes de diseño
- Chart.js para visualizaciones
- Framer Motion para animaciones
- React Query para gestión de estado


### Base de Datos (PostgreSQL)

- Tabla transactions: Movimientos bancarios
- Tabla items: Categorías personalizadas
- Tabla excel_uploads: Historial de subidas
- Índices optimizados para búsqueda
- Relaciones con integridad referencial

### Flujo de Trabajo Típico

#### Subir extracto bancario

- Arrastrar archivo Excel a la zona de drop
- Sistema procesa y valida automáticamente
- Vista previa antes de confirmar importación

#### Revisar y categorizar

- Visualizar transacciones en tabla interactiva

- Asignar items personalizados a cada transacción

- Filtrar y buscar transacciones específicas

#### Analizar datos

- Ver dashboard con estadísticas clave

- Explorar gráficos por categorías

- Generar reportes personalizados

#### Mantener items

- Gestionar lista de items personalizados

- Activar/desactivar items según necesidad

- Ver estadísticas de uso por item