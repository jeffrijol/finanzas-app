# API Reference - Finanzas App

Documentación completa de la API RESTful del backend.

---

## 📍 Base URL

```
http://localhost:3001/api
```

**Producción**: TBD

---

## 🔐 Authentication

Actualmente la API no requiere autenticación. Futuras versiones implementarán JWT tokens.

---

## 📦 Endpoints

### Transactions

#### `GET /api/transactions`

Obtiene lista de transacciones con filtros y paginación.

**Query Parameters:**

| Parameter        | Type    | Required | Description                                        |
| ---------------- | ------- | -------- | -------------------------------------------------- |
| `page`           | number  | No       | Número de página (default: 1)                      |
| `limit`          | number  | No       | Items por página (default: 10)                     |
| `quarter`        | string  | No       | Trimestre: `'Q1'`, `'Q2'`, `'Q3'`, `'Q4'`, `'ALL'` |
| `year`           | number  | No       | Año (default: current year)                        |
| `category`       | string  | No       | Filtrar por categoría                              |
| `itemType`       | string  | No       | `'Ingreso'` o `'Gasto'`                            |
| `itemAsignadoId` | string  | No       | ID del item asignado                               |
| `search`         | string  | No       | Búsqueda en descripción                            |
| `unassignedOnly` | boolean | No       | Solo transacciones sin item asignado               |

**Response:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid-1234",
        "fechaValor": "2024-01-15T00:00:00.000Z",
        "descripcion": "Pago de servicios",
        "importe": -150.5,
        "categoria": "Servicios",
        "itemAsignadoId": "item-uuid",
        "categoryId": "cat-uuid",
        "item": {
          "id": "item-uuid",
          "nombre": "Electricidad",
          "tipo": "Gasto"
        },
        "category": {
          "id": "cat-uuid",
          "nombre": "Servicios",
          "tipo": "Gasto"
        },
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 125,
      "page": 1,
      "limit": 10,
      "totalPages": 13
    }
  }
}
```

**cURL Example:**

```bash
curl -X GET "http://localhost:3001/api/transactions?page=1&limit=10&quarter=Q1&year=2024"
```

---

#### `POST /api/transactions`

Crea una nueva transacción.

**Request Body:**

```json
{
  "fechaValor": "2024-01-15T00:00:00.000Z",
  "descripcion": "Compra de materiales",
  "importe": -75.3,
  "categoria": "Compras",
  "itemAsignadoId": "item-uuid", // opcional
  "categoryId": "cat-uuid", // opcional
  "excelUploadId": "upload-uuid" // opcional
}
```

**Validation Rules:**

- `fechaValor`: ISO 8601 datetime string (required)
- `descripcion`: String, min 1 char (required)
- `importe`: Number (required)
- `categoria`: String (required)
- `itemAsignadoId`: UUID string (optional)
- `categoryId`: UUID string (optional)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "fechaValor": "2024-01-15T00:00:00.000Z",
    "descripcion": "Compra de materiales",
    "importe": -75.3,
    "categoria": "Compras",
    "itemAsignadoId": "item-uuid",
    "categoryId": "cat-uuid",
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "fechaValor": "2024-01-15T00:00:00.000Z",
    "descripcion": "Compra de materiales",
    "importe": -75.30,
    "categoria": "Compras"
  }'
```

---

#### `PUT /api/transactions/:id`

Actualiza una transacción existente.

**URL Parameters:**

- `id`: UUID de la transacción

**Request Body:**

```json
{
  "itemAsignadoId": "new-item-uuid",
  "categoryId": "new-cat-uuid"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-1234",
    "itemAsignadoId": "new-item-uuid",
    "categoryId": "new-cat-uuid",
    "updatedAt": "2024-01-15T14:00:00.000Z"
  }
}
```

**cURL Example:**

```bash
curl -X PUT http://localhost:3001/api/transactions/uuid-1234 \
  -H "Content-Type: application/json" \
  -d '{"itemAsignadoId": "new-item-uuid"}'
```

---

#### `GET /api/transactions/stats`

Obtiene estadísticas agregadas de transacciones.

**Query Parameters:**

| Parameter | Type   | Required | Description              |
| --------- | ------ | -------- | ------------------------ |
| `year`    | number | No       | Año (default: current)   |
| `quarter` | string | No       | Trimestre (default: ALL) |

**Response:**

```json
{
  "success": true,
  "data": {
    "totalIngresos": 5000.0,
    "totalGastos": -3500.0,
    "balance": 1500.0,
    "itemStats": [
      {
        "itemId": "item-uuid",
        "itemNombre": "Salario",
        "tipo": "Ingreso",
        "total": 3000.0,
        "count": 1
      }
    ]
  }
}
```

---

### Upload

#### `POST /api/upload`

Sube y procesa un archivo Excel/CSV.

**Content-Type:** `multipart/form-data`

**Form Data:**

- `file`: Archivo Excel (.xlsx, .xls) o CSV

**File Constraints:**

- Max size: 10MB
- Allowed types: `.xlsx`, `.xls`, `.csv`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "upload-uuid",
    "filename": "extracto_enero.xlsx",
    "fileSize": 15234,
    "totalRows": 25,
    "processed": true,
    "transactions": [
      {
        "fechaValor": "2024-01-15",
        "descripcion": "Pago de servicios",
        "importe": -150.5,
        "categoria": "Servicios",
        "saldo": 1500.0
      }
    ]
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@/path/to/extracto.xlsx"
```

**JavaScript Example:**

```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);

const response = await fetch("http://localhost:3001/api/upload", {
  method: "POST",
  body: formData,
});

const data = await response.json();
```

---

#### `POST /api/upload/:id/finalize`

Marca una carga de Excel como finalizada.

**URL Parameters:**

- `id`: UUID del upload

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "upload-uuid",
    "status": "completed"
  }
}
```

---

### Items

#### `GET /api/items`

Obtiene lista de todos los items.

**Query Parameters:**

| Parameter | Type   | Required | Description             |
| --------- | ------ | -------- | ----------------------- |
| `tipo`    | string | No       | `'Ingreso'` o `'Gasto'` |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "item-uuid",
      "nombre": "Salario",
      "tipo": "Ingreso",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/items`

Crea un nuevo item.

**Request Body:**

```json
{
  "nombre": "Freelance",
  "tipo": "Ingreso"
}
```

**Validation:**

- `nombre`: String, unique (required)
- `tipo`: `'Ingreso'` | `'Gasto'` (required)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "new-item-uuid",
    "nombre": "Freelance",
    "tipo": "Ingreso",
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

#### `PUT /api/items/:id`

Actualiza un item existente.

**URL Parameters:**

- `id`: UUID del item

**Request Body:**

```json
{
  "nombre": "Nuevo nombre"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "item-uuid",
    "nombre": "Nuevo nombre",
    "updatedAt": "2024-01-15T14:00:00.000Z"
  }
}
```

---

#### `DELETE /api/items/:id`

Elimina un item.

**URL Parameters:**

- `id`: UUID del item

**Response:**

```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

**Note:** No se puede eliminar un item que tiene transacciones asociadas.

---

### Categories

#### `GET /api/categories`

Obtiene lista de categorías.

**Query Parameters:**

| Parameter | Type   | Required | Description               |
| --------- | ------ | -------- | ------------------------- |
| `itemId`  | string | No       | Filtrar por item asociado |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cat-uuid",
      "nombre": "Servicios",
      "tipo": "Gasto",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/categories`

Crea una nueva categoría.

**Request Body:**

```json
{
  "nombre": "Transporte",
  "tipo": "Gasto",
  "itemId": "item-uuid" // opcional, para asociar con un item
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "new-cat-uuid",
    "nombre": "Transporte",
    "tipo": "Gasto",
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

#### `PUT /api/categories/:id`

Actualiza una categoría.

**URL Parameters:**

- `id`: UUID de la categoría

**Request Body:**

```json
{
  "nombre": "Nuevo nombre"
}
```

---

#### `DELETE /api/categories/:id`

Elimina una categoría.

---

### Analytics

#### `GET /api/analytics`

Obtiene datos analíticos agregados.

**Query Parameters:**

| Parameter | Type   | Required | Description                 |
| --------- | ------ | -------- | --------------------------- |
| `year`    | number | No       | Año (default: current)      |
| `quarter` | string | No       | Trimestre (default: ALL)    |
| `itemId`  | string | No       | Filtrar por item específico |

**Response:**

```json
{
  "success": true,
  "data": {
    "categoryDistribution": [
      {
        "categoria": "Servicios",
        "total": -500.0,
        "count": 5,
        "percentage": 14.3
      }
    ],
    "monthlyTrend": [
      {
        "month": "2024-01",
        "ingresos": 3000.0,
        "gastos": -1500.0,
        "balance": 1500.0
      }
    ],
    "topCategories": [
      {
        "categoria": "Salario",
        "total": 3000.0
      }
    ]
  }
}
```

---

##❌ Error Responses

Todos los endpoints pueden retornar los siguientes errores:

### 400 Bad Request

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "importe",
      "message": "Expected number, received string"
    }
  ]
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Transaction not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 📊 HTTP Status Codes

| Code  | Meaning                        |
| ----- | ------------------------------ |
| `200` | Success                        |
| `201` | Created                        |
| `400` | Bad Request (validation error) |
| `404` | Not Found                      |
| `500` | Internal Server Error          |

---

## 🔗 Additional Resources

- [Postman Collection](./postman_collection.json) (TBD)
- [OpenAPI Spec](./openapi.yaml) (TBD)
