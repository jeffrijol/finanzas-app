# API Documentation

## Endpoints

### Upload

- `POST /api/upload`: Uploads an Excel file.
  - Body: multipart/form-data, field `file`.

### Transactions

- `GET /api/transactions`: Get all transactions.
- `GET /api/transactions/:id`: Get a specific transaction.

### Analytics

- `GET /api/analytics`: Get category statistics.
