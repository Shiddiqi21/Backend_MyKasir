# MyKasir API Documentation

Backend REST API untuk aplikasi MyKasir (Point of Sale)

## Base URL
```
http://localhost:3000/api
```

## Setup & Installation

### 1. Install Dependencies
```bash
cd BackEnd_MyKasir
npm install
```

### 2. Setup Database
- Buat database MySQL bernama `mykasir`
- Update file `.env` jika perlu:
```env
DB_HOST=localhost
DB_NAME=mykasir
DB_USER=root
DB_PASS=
PORT=3000
JWT_SECRET=mykasir_secret_key_2024_very_secure
```

### 3. Run Server
```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

---

## Authentication

### Register
**POST** `/api/auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "kasir"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User berhasil didaftarkan",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "kasir",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Get Profile
**GET** `/api/auth/profile`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "kasir"
  }
}
```

---

## Products

### Get All Products
**GET** `/api/products`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `search` (optional): Search by product name
- `category` (optional): Filter by category
- `lowStock` (optional): true/false

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Kopi Susu",
      "category": "Minuman",
      "price": 15000,
      "stock": 50,
      "minStock": 10,
      "imageUri": null,
      "createdAt": "2024-12-05T10:00:00.000Z",
      "updatedAt": "2024-12-05T10:00:00.000Z"
    }
  ]
}
```

### Get Product by ID
**GET** `/api/products/:id`

### Get Low Stock Products
**GET** `/api/products/low-stock`

### Create Product
**POST** `/api/products`

**Body:**
```json
{
  "name": "Kopi Susu",
  "category": "Minuman",
  "price": 15000,
  "stock": 50,
  "minStock": 10,
  "imageUri": null
}
```

### Update Product
**PUT** `/api/products/:id`

**Body:** (sama seperti create)

### Update Stock Only
**PATCH** `/api/products/:id/stock`

**Body:**
```json
{
  "stock": 100
}
```

### Delete Product
**DELETE** `/api/products/:id`

---

## Customers

### Get All Customers
**GET** `/api/customers`

### Get Customer by ID
**GET** `/api/customers/:id`

### Create Customer
**POST** `/api/customers`

**Body:**
```json
{
  "name": "John Doe"
}
```

### Update Customer
**PUT** `/api/customers/:id`

### Delete Customer
**DELETE** `/api/customers/:id`

---

## Transactions

### Get All Transactions
**GET** `/api/transactions`

**Query Parameters:**
- `startDate` (optional): Format ISO date
- `endDate` (optional): Format ISO date
- `customerId` (optional): Filter by customer

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "customerId": 1,
      "total": 45000,
      "userId": 1,
      "createdAt": "2024-12-05T10:00:00.000Z",
      "customer": {
        "id": 1,
        "name": "John Doe"
      },
      "items": [
        {
          "id": 1,
          "productName": "Kopi Susu",
          "unitPrice": 15000,
          "quantity": 3
        }
      ]
    }
  ]
}
```

### Get Transaction by ID
**GET** `/api/transactions/:id`

### Create Transaction
**POST** `/api/transactions`

**Body:**
```json
{
  "customerId": 1,
  "items": [
    {
      "productName": "Kopi Susu",
      "unitPrice": 15000,
      "quantity": 3
    },
    {
      "productName": "Nasi Goreng",
      "unitPrice": 20000,
      "quantity": 2
    }
  ]
}
```

**Note:** 
- Total akan dihitung otomatis
- Stock produk akan dikurangi otomatis
- Transaksi akan gagal jika stock tidak mencukupi

### Delete Transaction
**DELETE** `/api/transactions/:id`

**Note:** Stock produk akan dikembalikan

---

## Reports

### Get Sales Report
**GET** `/api/reports/sales`

**Query Parameters:**
- `period` (optional): "today", "week", "month"
- `startDate` (optional): Custom date range
- `endDate` (optional): Custom date range

**Response:**
```json
{
  "status": "success",
  "data": {
    "summary": {
      "totalSales": 500000,
      "totalTransactions": 25,
      "averageTransaction": 20000
    },
    "topProducts": [
      {
        "productName": "Kopi Susu",
        "totalQuantity": 50,
        "totalRevenue": 750000
      }
    ],
    "dailySales": [
      {
        "date": "2024-12-05",
        "count": 10,
        "total": 200000
      }
    ]
  }
}
```

### Get Detailed Report
**GET** `/api/reports/detailed`

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)

---

## Error Responses

All endpoints can return these error responses:

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": ["Field is required"]
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Token tidak valid atau sudah kadaluarsa"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Resource tidak ditemukan"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## Testing dengan Postman

1. Import collection dari folder `postman/` (jika ada)
2. Atau buat request manual sesuai dokumentasi di atas
3. Jangan lupa set Authorization header untuk endpoint yang memerlukan token:
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

---

## Database Schema

### Users
- id (PK, auto increment)
- email (unique)
- password (hashed)
- name
- role (enum: 'admin', 'kasir')
- createdAt
- updatedAt

### Products
- id (PK, auto increment)
- name
- category
- price
- stock
- minStock
- imageUri
- createdAt
- updatedAt

### Customers
- id (PK, auto increment)
- name
- createdAt
- updatedAt

### Transactions
- id (PK, auto increment)
- customerId (FK to customers)
- total
- userId (FK to users)
- createdAt
- updatedAt

### Transaction Items
- id (PK, auto increment)
- transactionId (FK to transactions)
- productName
- unitPrice
- quantity
- createdAt
- updatedAt

---

## Notes

- Semua endpoint kecuali `/api/auth/login` dan `/api/auth/register` memerlukan authentication token
- Token valid selama 7 hari
- Password di-hash menggunakan bcryptjs
- CORS sudah diaktifkan untuk semua origin
- Database akan auto-create tables saat pertama kali run
