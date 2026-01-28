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

La API utiliza autenticación basada en **JWT Bearer Tokens** proporcionados por Supabase Auth.

**Headers Requeridos:**

```
Authorization: Bearer <your-access-token>
X-Organization-ID: <organization-uuid>
```

Todas las rutas (excepto `/health` y `/organizations`) están protegidas y requieren estos headers.

- Si no se proporciona token, la API responderá con `401 Unauthorized`
- Si no se proporciona organization ID o el usuario no es miembro, responderá con `403 Forbidden`

**Rutas sin Organization ID requerido:**

- `GET /api/health` - Health check
- `GET /api/organizations` - Listar organizaciones del usuario
- `POST /api/organizations` - Crear nueva organización

---

## 📦 Endpoints

### Organizations

#### `GET /api/organizations`

Obtiene lista de organizaciones del usuario actual.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "org-uuid-1",
      "name": "Avance",
      "slug": "avance",
      "ownerUserId": "user-uuid",
      "isActive": true,
      "role": {
        "id": "admin",
        "name": "Admin",
        "permissions": ["read", "write", "delete", "invite"]
      },
      "membership": {
        "joinedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ]
}
```

---

#### `POST /api/organizations`

Crea una nueva organización.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Mi Empresa",
  "slug": "mi-empresa"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "org-uuid-new",
    "name": "Mi Empresa",
    "slug": "mi-empresa",
    "ownerUserId": "user-uuid",
    "members": [
      {
        "userId": "user-uuid",
        "roleId": "admin"
      }
    ]
  }
}
```

---

#### `GET /api/organizations/:id/members`

Obtiene lista de miembros de una organización.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "member-uuid",
      "userId": "user-uuid",
      "organizationId": "org-uuid",
      "roleId": "admin",
      "joinedAt": "2024-01-01T00:00:00.000Z",
      "role": {
        "id": "admin",
        "name": "Admin"
      }
    }
  ]
}
```

---

### Transactions

#### `GET /api/transactions`

Obtiene lista de transacciones del usuario actual con filtros y paginación.

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
        "userId": "user-uuid-from-token",
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
curl -X GET "http://localhost:3001/api/transactions?page=1&limit=10" \
  -H "Authorization: Bearer <token>" \
  -H "X-Organization-ID: <org-uuid>"
```

---

#### `POST /api/transactions`

Crea una nueva transacción para el usuario autenticado.

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
    "userId": "user-uuid-from-token"
    // ...
  }
}
```

---

#### `PUT /api/transactions/:id`

Actualiza una transacción existente. Solo permite actualizar si la transacción pertenece al usuario.

**Response:** `200 OK` con objeto actualizado.

---

#### `GET /api/transactions/stats`

Obtiene estadísticas agregadas de transacciones del usuario.

**Query Parameters:** `year`, `quarter`, `taskId`, etc.

---

### Upload

#### `POST /api/upload`

Sube y procesa un archivo Excel/CSV asociado al usuario.

**Content-Type:** `multipart/form-data`
**Header:** `Authorization: Bearer <token>`

---

### Items

#### `GET /api/items`

Obtiene lista de items del usuario.

#### `POST /api/items`

Crea un nuevo item asociado al usuario. El nombre debe ser único para ese usuario.

**Request Body:**

```json
{
  "nombre": "Freelance",
  "tipo": "Ingreso"
}
```

---

### Categories

_(Las categorías de transacción pueden ser globales o por usuario, dependiendo de la implementación específica, pero los endpoints están protegidos)_

#### `GET /api/categories`

#### `POST /api/categories`

---

### Analytics

#### `GET /api/analytics`

Obtiene datos analíticos agregados personales.

---

## ❌ Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "error": "Not authorized. No token provided / Invalid token."
}
```

### 403 Forbidden

Si se intenta acceder a un recurso de otro usuario (aunque raro dado el diseño de filtrado por defecto).

### 400 Bad Request

Errores de validación.

### 500 Internal Server Error

Error del servidor.

---

## 📊 HTTP Status Codes

| Code  | Meaning                        |
| ----- | ------------------------------ |
| `200` | Success                        |
| `201` | Created                        |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (Auth Token fail) |
| `404` | Not Found                      |
| `500` | Internal Server Error          |
